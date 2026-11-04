#!/usr/bin/env node
/** Opt-in real CLI comparison. Offline validation never starts Codex. */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, cpSync, existsSync, readdirSync, chmodSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ARMS, SKILLS, digest, validateCases, analyzeTrace, judgePrompt, validateJudgment, summarize, renderSummary } from './codex-eval.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(ROOT, 'evals/codex/cases.json');
const SCHEMA = path.join(ROOT, 'evals/codex/judge-schema.json');
const SETTINGS = ['skills.bundled.enabled=false', 'project_doc_max_bytes=0', 'features.plugins=false', 'features.apps=false', 'features.hooks=false', 'features.multi_agent=false', 'web_search="disabled"'];
export function isolatedEnv(home, codexHome, source = process.env) {
  const keys = ['PATH', 'ALL_PROXY', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'all_proxy', 'http_proxy', 'https_proxy', 'no_proxy', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'NODE_EXTRA_CA_CERTS', 'SYSTEMROOT'];
  return { ...Object.fromEntries(keys.filter(k => source[k]).map(k => [k, source[k]])), HOME: home, CODEX_HOME: codexHome, TMPDIR: tmpdir(), LANG: 'en_US.UTF-8' };
}
export function runProcess(executable, args, { env, cwd, input = '', timeout = 240000, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('Evaluation interrupted')); return; }
    const child = spawn(executable, args, { env, cwd, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
    let stdout = '', stderr = '', timedOut = false, escalation;
    const kill = signal => { try { if (process.platform !== 'win32') process.kill(-child.pid, signal); else child.kill(signal); } catch {} };
    const timer = setTimeout(() => { timedOut = true; kill('SIGTERM'); escalation = setTimeout(() => kill('SIGKILL'), 2000); }, timeout);
    const abort = () => { kill('SIGTERM'); escalation = setTimeout(() => kill('SIGKILL'), 2000); };
    signal?.addEventListener('abort', abort, { once: true });
    const cleanup = () => { clearTimeout(timer); clearTimeout(escalation); signal?.removeEventListener('abort', abort); };
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.stdin.on('error', () => {});
    child.on('error', error => { cleanup(); reject(error); });
    child.on('close', code => { cleanup(); resolve({ code, timedOut, aborted: signal?.aborted ?? false, stdout, stderr }); });
    child.stdin.end(input);
  });
}
export function discoveredSkills(context) {
  if (!Array.isArray(context)) throw new Error('Unsupported Codex prompt snapshot format');
  const names = [];
  for (const message of context) {
    if (message.role !== 'developer') continue;
    for (const content of message.content ?? []) {
      if (!content.text?.startsWith('<skills_instructions>')) continue;
      const catalog = content.text.match(/(?:^|\n)### Available skills\r?\n([\s\S]*?)(?:\n<\/skills_instructions>|$)/);
      if (!catalog) throw new Error('Skill instructions have no parseable catalog');
      for (const line of catalog[1].split('\n').filter(line => line.trim())) {
        const entry = line.match(/^- ([^:]+): .*\(file: .+\)$/);
        if (!entry) throw new Error('Unsupported skill catalog entry');
        names.push(entry[1]);
      }
    }
  }
  return names.sort();
}
export function materialize(dir, c, arm) {
  for (const f of c.files) { const target = path.join(dir, f.path); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, f.content); }
  if (arm === 'with') cpSync(path.join(ROOT, 'skills'), path.join(dir, '.agents/skills'), { recursive: true });
  for (const args of [['init', '-q'], ['add', '.'], ['-c', 'user.name=Behavior Eval', '-c', 'user.email=eval@example.invalid', 'commit', '--allow-empty', '-qm', 'Fixture']]) {
    const result = spawnSync('git', args, { cwd: dir, env: { PATH: process.env.PATH, HOME: dir, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`Fixture git failed: ${result.stderr}`);
  }
}
function skillDigest(dir = path.join(ROOT, 'skills')) {
  const inventory = [];
  function visit(folder) { for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) { const p = path.join(folder, entry.name); if (entry.isDirectory()) visit(p); else inventory.push([path.relative(dir, p), digest(readFileSync(p))]); } }
  visit(dir); return digest(JSON.stringify(inventory));
}
export async function session({ c, arm, prompt, judge = false, options, destination }) {
  const temp = mkdtempSync(path.join(tmpdir(), 'brooks-codex-eval-'));
  chmodSync(temp, 0o700);
  try {
    const home = path.join(temp, 'home'), codexHome = path.join(temp, 'codex'), repo = path.join(temp, 'repo');
    for (const dir of [home, codexHome, repo]) mkdirSync(dir);
    cpSync(options.auth, path.join(codexHome, 'auth.json')); chmodSync(path.join(codexHome, 'auth.json'), 0o600);
    materialize(repo, judge ? { files: [] } : c, judge ? 'without' : arm);
    const env = isolatedEnv(home, codexHome);
    const settings = [...SETTINGS, `model_reasoning_effort=${JSON.stringify(options.reasoning)}`];
    if (judge) settings.push('features.shell_tool=false');
    const overrides = settings.flatMap(s => ['-c', s]);
    const base = ['--no-daemon', '-a', 'never', '-C', repo, '-m', options.model, ...overrides];
    const snapshot = await runProcess(options.codex, [...base, 'debug', 'prompt-input', prompt], { env, cwd: repo, timeout: options.timeout, signal: options.signal });
    if (snapshot.code !== 0 || snapshot.timedOut) throw new Error('Prompt isolation preflight failed');
    const context = JSON.parse(snapshot.stdout);
    const discovered = discoveredSkills(context);
    const wanted = !judge && arm === 'with' ? [...SKILLS].sort() : [];
    if (JSON.stringify(discovered) !== JSON.stringify(wanted)) throw new Error(`Skill isolation failed: wanted ${wanted.join(',')}; discovered ${discovered.join(',')}`);
    writeFileSync(path.join(destination, 'prompt-input.json'), snapshot.stdout);
    const last = path.join(temp, 'answer.txt');
    const args = [...base, 'exec', '--json', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '-s', 'read-only', '--output-last-message', last];
    if (judge) args.push('--output-schema', SCHEMA);
    args.push('-');
    const execution = await runProcess(options.codex, args, { env, cwd: repo, input: prompt, timeout: options.timeout, signal: options.signal });
    writeFileSync(path.join(destination, 'events.jsonl'), execution.stdout);
    writeFileSync(path.join(destination, 'stderr.txt'), execution.stderr);
    const trace = analyzeTrace(execution.stdout);
    if (execution.code !== 0 || execution.timedOut || execution.aborted || !trace.turn_completed) throw new Error(`Codex turn failed (exit=${execution.code}, timeout=${execution.timedOut}, interrupted=${execution.aborted}): ${trace.errors.join('; ')}`);
    const answer = readFileSync(last, 'utf8').trim();
    if (!answer) throw new Error('Empty final answer');
    writeFileSync(path.join(destination, 'answer.txt'), answer);
    return { answer, trace, trace_sha256: digest(execution.stdout), prompt_sha256: digest(prompt), discovered_skills: discovered };
  } finally { rmSync(temp, { recursive: true, force: true }); }
}

export async function main(argv = process.argv.slice(2), { signal } = {}) {
  const { values } = parseArgs({ args: argv, options: { validate: { type: 'boolean' }, model: { type: 'string' }, reasoning: { type: 'string', default: 'high' }, runs: { type: 'string', default: '3' }, case: { type: 'string' }, out: { type: 'string' }, codex: { type: 'string', default: 'codex' }, 'auth-file': { type: 'string' }, timeout: { type: 'string', default: '240' } } });
  const raw = readFileSync(FIXTURE, 'utf8');
  let cases = validateCases(JSON.parse(raw));
  if (values.validate) { console.log(`Codex behavioral cases: ${cases.length} valid (offline; no model calls).`); return; }
  if (values.case) { cases = cases.filter(c => c.id === values.case); if (!cases.length) throw new Error('Unknown case'); }
  if (!values.model) throw new Error('--model is required for reproducible live evaluation');
  if (!/^[1-9]\d*$/.test(values.runs) || !/^[1-9]\d*$/.test(values.timeout) || !['low','medium','high','xhigh'].includes(values.reasoning)) throw new Error('Invalid runs, timeout, or reasoning');
  if (existsSync('/etc/codex/skills') && readdirSync('/etc/codex/skills').length) throw new Error('Admin skills found in /etc/codex/skills; use a clean host for isolation');
  const options = { signal, model: values.model, reasoning: values.reasoning, timeout: Number(values.timeout) * 1000, codex: values.codex, auth: path.resolve(values['auth-file'] ?? path.join(process.env.CODEX_HOME ?? path.join(homedir(), '.codex'), 'auth.json')) };
  if (!existsSync(options.auth)) throw new Error('File-backed Codex login required; use codex login or --auth-file');
  const output = path.resolve(values.out ?? path.join(ROOT, 'evals/codex/runs', new Date().toISOString().replaceAll(':','-')));
  if (existsSync(output)) throw new Error('Output directory already exists; choose a new run directory');
  mkdirSync(output, { recursive: true, mode: 0o700 });
  const version = await runProcess(options.codex, ['--version'], { signal });
  if (version.code !== 0) throw new Error('Cannot read Codex version');
  const result = { version: 1, started_at: new Date().toISOString(), model: options.model, reasoning: options.reasoning, cli_version: version.stdout.trim(), repetitions: Number(values.runs), cases_sha256: digest(raw), skills_sha256: skillDigest(), judge_schema_sha256: digest(readFileSync(SCHEMA)), records: [] };
  result.runner_sha256 = digest(readFileSync(fileURLToPath(import.meta.url)));
  result.evaluator_sha256 = digest(readFileSync(new URL('./codex-eval.mjs', import.meta.url)));
  result.planned_pairs = cases.length * result.repetitions;
  result.timeout_seconds = Number(values.timeout);
  function save() { result.summary = summarize(result.records, cases); writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n'); writeFileSync(path.join(output, 'summary.md'), renderSummary(result)); }
  run: for (let repetition = 1; repetition <= result.repetitions; repetition++) for (const [index, c] of cases.entries()) {
    const order = (repetition + index) % 2 ? ARMS : [...ARMS].reverse();
    for (const arm of order) {
      if (signal?.aborted) break run;
      const record = { case_id: c.id, repetition, arm, status: 'failed' };
      const destination = path.join(output, `${c.id}-${repetition}-${arm}`); mkdirSync(destination);
      console.log(`Running ${c.id} ${repetition}/${result.repetitions} ${arm}`);
      try {
        Object.assign(record, await session({ c, arm, prompt: c.prompt, options, destination }));
        const judgeDir = path.join(destination, 'judge'); mkdirSync(judgeDir);
        const graded = await session({ c, arm: 'without', prompt: judgePrompt(c, record.answer), judge: true, options, destination: judgeDir });
        record.judgment = validateJudgment(JSON.parse(graded.answer), c, record.answer);
        record.judge_trace_sha256 = graded.trace_sha256;
        record.judge_prompt_sha256 = graded.prompt_sha256;
        record.status = 'ok';
      } catch (error) { record.error = error.message; console.error(`Failed: ${record.error}`); }
      result.records.push(record); save();
    }
  }
  result.finished_at = new Date().toISOString(); save(); console.log(renderSummary(result));
  if (signal?.aborted) process.exitCode = 130;
  else if (result.records.some(r => r.status !== 'ok')) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  main(process.argv.slice(2), { signal: controller.signal }).catch(error => { console.error(error.message); process.exitCode = controller.signal.aborted ? 130 : 1; })
    .finally(() => { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); });
}
