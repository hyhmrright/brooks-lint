#!/usr/bin/env node
/** Separate research runner. Default and planning modes never start Codex. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, copyFileSync, existsSync, readdirSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { digest } from './codex-eval.mjs';
import { runProcess, isolatedEnv, discoveredSkills } from './run-codex-evals.mjs';
import { createPlan, validatePlan, schedule, expectedCatalog, researchTrace, reviewPackets, judgmentTemplate, summarize, contentDigest, PROTOTYPE } from './runtime-research.mjs';

const SETTINGS = ['skills.bundled.enabled=false', 'project_doc_max_bytes=0',
  'features.plugins=false', 'features.apps=false', 'features.hooks=false',
  'features.multi_agent=false', 'web_search="disabled"'];
const save = (file, value) => writeFileSync(file, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
function newOutput(out) {
  const target = path.resolve(out);
  mkdirSync(path.dirname(target), { recursive: true });
  mkdirSync(target, { mode: 0o700 }); // Existing output is always an error, never overwritten.
  return target;
}
function materialize(repo, c, arm, study, env) {
  const write = (prefix, files) => {
    for (const file of files) {
      assert(typeof file.path === 'string' && /^[\w./-]+$/.test(file.path) &&
        !file.path.startsWith('/') && !file.path.split('/').some(p => ['..', '.', '.git', '.agents', '.codex', 'AGENTS.md'].includes(p)), 'Unsafe frozen input path');
      const target = path.join(repo, prefix, file.path);
      mkdirSync(path.dirname(target), { recursive: true }); save(target, file.content);
    }
  };
  write('', c.inputs);
  if (arm !== 'A') write('.agents/skills', study.core);
  if (arm === 'C') write(`.agents/skills/${PROTOTYPE}`, study.prototype);
  for (const args of [['init', '-q'], ['add', '.'], ['-c', 'user.name=Runtime Research', '-c', 'user.email=research@example.invalid', 'commit', '--allow-empty', '-qm', 'Isolated research inputs']]) {
    const result = spawnSync('git', args, { cwd: repo, env: { PATH: env.PATH, HOME: env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }, encoding: 'utf8' });
    assert.equal(result.status, 0, 'Fixture git initialization failed');
  }
}

export async function executeSession({ plan, key, destination, codex, auth, signal }) {
  const temp = mkdtempSync(path.join(tmpdir(), 'brooks-runtime-study-'));
  chmodSync(temp, 0o700);
  try {
    const home = path.join(temp, 'home'), codexHome = path.join(temp, 'codex'), repo = path.join(temp, 'repo');
    for (const dir of [home, codexHome, repo]) mkdirSync(dir);
    copyFileSync(auth, path.join(codexHome, 'auth.json')); chmodSync(path.join(codexHome, 'auth.json'), 0o600);
    const env = isolatedEnv(home, codexHome);
    const c = plan.study.cases.find(c => c.id === key.case_id);
    materialize(repo, c, key.arm, plan.study, env);
    const settings = [...SETTINGS, `model_reasoning_effort=${JSON.stringify(plan.study.reasoning)}`];
    const base = ['--no-daemon', '-a', 'never', '-C', repo, '-m', plan.study.model, ...settings.flatMap(s => ['-c', s])];
    const options = { env, cwd: repo, timeout: plan.study.timeout * 1000, signal };
    save(path.join(destination, 'prompt.txt'), c.prompt);
    const snapshot = await runProcess(codex, [...base, 'debug', 'prompt-input', c.prompt], options);
    // Persist even invalid/mismatched preflight evidence before rejecting it.
    save(path.join(destination, 'prompt-input.json'), snapshot.stdout);
    save(path.join(destination, 'preflight-stderr.txt'), snapshot.stderr);
    assert(snapshot.code === 0 && !snapshot.timedOut && !snapshot.aborted, 'Prompt isolation preflight failed');
    const catalog = discoveredSkills(JSON.parse(snapshot.stdout));
    assert.deepEqual(catalog, expectedCatalog(key.arm), 'Research skill catalog mismatch');
    const last = path.join(temp, 'answer.txt');
    const execution = await runProcess(codex, [...base, 'exec', '--json', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '-s', 'read-only', '--output-last-message', last, '-'], { ...options, input: c.prompt });
    save(path.join(destination, 'events.jsonl'), execution.stdout);
    save(path.join(destination, 'stderr.txt'), execution.stderr);
    const answer = existsSync(last) ? readFileSync(last, 'utf8').trim() : '';
    if (answer) save(path.join(destination, 'answer.txt'), answer);
    const processEvidence = { exit_code: execution.code, timed_out: execution.timedOut, aborted: execution.aborted,
      discovered_skills: catalog, trace_sha256: digest(execution.stdout), prompt_sha256: digest(c.prompt) };
    save(path.join(destination, 'process.json'), processEvidence);
    const trace = researchTrace(execution.stdout);
    if (execution.code !== 0 || execution.timedOut || execution.aborted || !trace.turn_completed || !answer) {
      const error = new Error('Research turn failed; inspect preserved process/events/answer evidence');
      error.evidence = { ...processEvidence, trace, ...(answer ? { answer } : {}) }; throw error;
    }
    return { ...processEvidence, answer, answer_sha256: digest(answer), trace };
  } finally { rmSync(temp, { recursive: true, force: true }); }
}

/** Caller must explicitly select live mode. Tests supply a local fake executable. */
export async function executePlan({ plan, out, codex = 'codex', auth, signal }) {
  validatePlan(plan);
  if (existsSync('/etc/codex/skills') && readdirSync('/etc/codex/skills').length) throw new Error('Admin skills found; use a clean study host');
  assert(auth && existsSync(auth), 'File-backed Codex authentication required for live mode');
  const output = newOutput(out);
  const result = { version: 1, plan, started_at: new Date().toISOString(), cli_version: null, records: [] };
  const persist = () => {
    save(path.join(output, 'results.json'), result);
    const packets = reviewPackets(plan, result.records);
    save(path.join(output, 'review-packets.json'), packets);
    save(path.join(output, 'judgments-template.json'), packets.map(judgmentTemplate));
    save(path.join(output, 'summary.json'), summarize(plan, result.records, []));
  };
  persist();
  try {
    const version = await runProcess(codex, ['--version'], { signal, timeout: 10000 });
    save(path.join(output, 'cli-version-stdout.txt'), version.stdout);
    save(path.join(output, 'cli-version-stderr.txt'), version.stderr);
    assert(version.code === 0 && !version.timedOut && !version.aborted, 'Cannot read Codex version');
    result.cli_version = version.stdout.trim();
    for (const key of schedule(plan)) {
      if (signal?.aborted) break;
      const record = { ...key, status: 'running' }, start = performance.now();
      result.records.push(record); persist();
      const destination = path.join(output, `${key.case_id}-${key.repetition}-${key.arm}`);
      mkdirSync(destination, { mode: 0o700 });
      try {
        Object.assign(record, await executeSession({ plan, key, destination, codex, auth, signal }));
        record.status = 'executed';
      } catch (error) {
        Object.assign(record, error.evidence ?? {});
        record.status = 'failed'; record.error = error.message;
      }
      record.elapsed_ms = Math.round(performance.now() - start); persist();
    }
  } catch (error) {
    result.run_error = error.message;
  } finally {
    result.finished_at = new Date().toISOString(); result.interrupted = Boolean(signal?.aborted); persist();
  }
  return result;
}

export async function main(argv = process.argv.slice(2), { signal } = {}) {
  const { values } = parseArgs({ args: argv, options: {
    validate: { type: 'boolean' }, plan: { type: 'boolean' }, live: { type: 'boolean' }, summarize: { type: 'boolean' },
    model: { type: 'string' }, runs: { type: 'string', default: '3' }, reasoning: { type: 'string', default: 'high' },
    timeout: { type: 'string', default: '240' }, case: { type: 'string' }, out: { type: 'string' },
    'plan-file': { type: 'string' }, results: { type: 'string' }, judgments: { type: 'string' },
    codex: { type: 'string', default: 'codex' }, 'auth-file': { type: 'string' } } });
  const modes = ['validate', 'plan', 'live', 'summarize'].filter(k => values[k]);
  assert(modes.length <= 1, 'Choose one mode');
  const mode = modes[0] ?? 'validate';
  if (mode === 'validate') {
    const plan = createPlan({ model: 'offline-validation', runs: 1 });
    validatePlan(plan);
    console.log(`Runtime research: ${plan.study.cases.length} cases, A/B/C plan valid (offline; no model calls).`); return;
  }
  if (mode === 'plan') {
    assert(values.out, '--out required');
    const plan = createPlan({ model: values.model, runs: Number(values.runs), reasoning: values.reasoning, timeout: Number(values.timeout), caseId: values.case });
    const output = newOutput(values.out);
    save(path.join(output, 'plan.json'), plan);
    console.log(`Frozen ${schedule(plan).length} planned turns, digest ${plan.study_sha256} (offline; nothing executed).`); return;
  }
  if (mode === 'summarize') {
    assert(values.results && values.judgments && values.out, '--results, --judgments and --out required');
    const result = JSON.parse(readFileSync(values.results, 'utf8'));
    assert.equal(result.version, 1);
    assert.equal(contentDigest(result.plan.study), result.plan.study_sha256);
    const judgments = JSON.parse(readFileSync(values.judgments, 'utf8'));
    const summary = summarize(result.plan, result.records, judgments);
    const output = newOutput(values.out); save(path.join(output, 'summary.json'), summary);
    save(path.join(output, 'judgments.json'), judgments);
    save(path.join(output, 'source-digests.json'), { results_sha256: digest(readFileSync(values.results)), judgments_sha256: digest(readFileSync(values.judgments)) });
    console.log(`Complete judged triplets: ${summary.complete_triplets}/${summary.planned_triplets} (offline).`); return;
  }
  assert(values['plan-file'] && values.out, '--live requires --plan-file and --out');
  // Model/settings must come from the frozen plan, never silently override it.
  assert(!['model', 'case'].some(k => values[k]) && !argv.some(a => /^--(runs|reasoning|timeout)(=|$)/.test(a)), 'Live settings come only from the frozen plan');
  const plan = JSON.parse(readFileSync(values['plan-file'], 'utf8'));
  const auth = path.resolve(values['auth-file'] ?? path.join(process.env.CODEX_HOME ?? path.join(homedir(), '.codex'), 'auth.json'));
  const result = await executePlan({ plan, out: values.out, codex: values.codex, auth, signal });
  console.log('Research execution saved. Semantic judgments and human review remain separate.');
  if (result.interrupted) process.exitCode = 130;
  else if (result.run_error || result.records.some(r => r.status !== 'executed')) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const controller = new AbortController(), stop = () => controller.abort();
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  main(process.argv.slice(2), { signal: controller.signal }).catch(error => { console.error(error.message); process.exitCode = controller.signal.aborted ? 130 : 1; })
    .finally(() => { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); });
}
