import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isolatedEnv, runProcess, materialize as materializeRepo, session, discoveredSkills } from './run-codex-evals.mjs';
import { validateCases, analyzeTrace, judgePrompt, validateJudgment, summarize, renderSummary, digest } from './codex-eval.mjs';

const corpus = JSON.parse(readFileSync(new URL('../evals/codex/cases.json', import.meta.url), 'utf8'));
const judgeSchema = JSON.parse(readFileSync(new URL('../evals/codex/judge-schema.json', import.meta.url), 'utf8'));

function materialize(t, id) {
  const scenario = corpus.cases.find(item => item.id === id);
  assert.ok(scenario, `Missing case ${id}`);
  const dir = mkdtempSync(path.join(tmpdir(), 'brooks-codex-case-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const file of scenario.files) {
    const target = path.join(dir, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
  return { dir, load: relative => import(pathToFileURL(path.join(dir, relative)).href) };
}

test('behavioral corpus keeps task prompts blind to skill selection and judgment', () => {
  assert.equal(corpus.version, 1);
  assert.equal(new Set(corpus.cases.map(item => item.id)).size, corpus.cases.length);
  assert.deepEqual(new Set(corpus.cases.map(item => item.expected_skill)), new Set(['brooks-review', 'brooks-audit', 'brooks-test', null]));
  for (const item of corpus.cases) {
    assert.doesNotMatch(item.prompt, /brooks-|rubric|must_find|SKILL\.md/i);
    for (const file of item.files) {
      assert.ok(!path.isAbsolute(file.path) && !file.path.split('/').includes('..'));
      assert.doesNotMatch(file.path, /(^|\/)(AGENTS\.md|\.agents|\.codex|\.brooks-lint\.yaml)(\/|$)/);
    }
    for (const finding of item.rubric.must_find) {
      assert.ok(finding.evidence_files.every(file => item.files.some(candidate => candidate.path === file)));
    }
  }
});

test('judge output contract requires every field and rejects extra keys at every object', () => {
  function check(schema) {
    if (schema.type === 'object') {
      assert.equal(schema.additionalProperties, false);
      assert.deepEqual(new Set(schema.required), new Set(Object.keys(schema.properties)));
      Object.values(schema.properties).forEach(check);
    }
    if (schema.items) check(schema.items);
  }
  check(judgeSchema);
  assert.ok(judgeSchema.properties.findings.items.properties.severity.enum.includes('unspecified'));
  assert.ok(judgeSchema.properties.findings.items.properties.classification.enum.includes('uncertain'));
});

test('rule-drift ground truth is executable and confined to the documented interval', async t => {
  const fixture = materialize(t, 'review-rule-drift');
  const { checkoutTotal } = await fixture.load('src/checkout.mjs');
  const { previewTotal } = await fixture.load('src/preview.mjs');
  for (const points of [0, 99, 120, 500]) assert.equal(checkoutTotal(10000, points), previewTotal(10000, points));
  for (const points of [100, 110, 119]) {
    assert.equal(checkoutTotal(10000, points), 9000);
    assert.equal(previewTotal(10000, points), 10000);
  }
});

test('coverage fixture has correct new behavior but its tests miss a removed branch', async t => {
  const fixture = materialize(t, 'review-new-behavior-coverage');
  const { shippingCents } = await fixture.load('src/shipping.mjs');
  assert.equal(shippingCents(4999), 500);
  assert.equal(shippingCents(5000), 0);
  assert.equal(shippingCents(5001), 0);
  let result = spawnSync(process.execPath, ['--test'], { cwd: fixture.dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  writeFileSync(path.join(fixture.dir, 'src/shipping.mjs'), 'export function shippingCents() { return 500; }\n');
  result = spawnSync(process.execPath, ['--test'], { cwd: fixture.dir, encoding: 'utf8' });
  assert.equal(result.status, 0, 'The deliberately incomplete tests should survive removal of free shipping');
});

test('mocked-subject fixture passes even if the real calculation throws', t => {
  const fixture = materialize(t, 'test-mocked-subject');
  let result = spawnSync(process.execPath, ['--test'], { cwd: fixture.dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  writeFileSync(path.join(fixture.dir, 'src/discount.mjs'), "export class DiscountCalculator { total() { throw new Error('broken'); } }\n");
  result = spawnSync(process.execPath, ['--test'], { cwd: fixture.dir, encoding: 'utf8' });
  assert.equal(result.status, 0, 'The mock should hide even complete failure of the subject');
});

test('clean architecture and local severity fixtures satisfy their functional contracts', async t => {
  const architecture = materialize(t, 'audit-composition-root');
  const result = spawnSync(process.execPath, ['src/main.mjs'], { cwd: architecture.dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Tea, Coffee\n');
  const { createMemoryRepository } = await architecture.load('src/adapters/memory-repository.mjs');
  const names = ['Tea'];
  const repository = createMemoryRepository(names);
  names.push('Coffee');
  repository.list().push('Other');
  assert.deepEqual(repository.list(), ['Tea']);
  const local = materialize(t, 'review-local-severity');
  const { formatLabel } = await local.load('src/label.mjs');
  assert.equal(formatLabel(''), 'Unknown');
  assert.equal(formatLabel('  '), 'Unknown');
  assert.equal(formatLabel(' tea '), 'TEA');
});

const clone = value => structuredClone(value);
const sampleCase = corpus.cases.find(item => item.id === 'review-rule-drift');
const sampleAnswer = 'The preview threshold is 120 but checkout uses 100. This creates inconsistent prices. Share the loyalty policy.';
function judgment(overrides = {}) {
  return {
    completed: true,
    completion_evidence: 'The preview threshold is 120 but checkout uses 100.',
    findings: [{ claim: 'Divergent loyalty policy', quote: 'The preview threshold is 120 but checkout uses 100.', match_id: 'loyalty-policy-drift', classification: 'supported', severity: 'unspecified', severity_ok: null, reason: 'Both implementation thresholds are identified.' }],
    missed_expected_ids: [],
    unexpected_review: false,
    rationale: 'The answer diagnoses the known issue and supplies a concrete remedy.',
    ...overrides,
  };
}
function traceEvent(command, output, exitCode = 0) {
  return { type: 'item.completed', item: { type: 'command_execution', command, aggregated_output: output, exit_code: exitCode } };
}
const skillContent = '---\nname: brooks-review\ndescription: Code review\n---\n## Setup\nRead common.md.\n';
const finished = { type: 'turn.completed', usage: { input_tokens: 20, output_tokens: 10 } };
const jsonl = events => events.map(event => JSON.stringify(event)).join('\n');

function result(caseId, arm, repetition = 1, changes = {}) {
  return { case_id: caseId, arm, repetition, status: 'ok', trace: { skill_reads: [] }, judgment: judgment(), ...changes };
}

test('case validation rejects traversal and instruction injection fixture paths', () => {
  assert.equal(validateCases(corpus).length, 7);
  for (const unsafe of ['../outside.mjs', '/tmp/outside.mjs', 'src/../../outside.mjs', '.agents/skills/evil/SKILL.md', '.codex/config.toml', '.git/config', 'AGENTS.md', 'src/AGENTS.md', 'src\\..\\AGENTS.md']) {
    const modified = clone(corpus);
    modified.cases[0].files[0].path = unsafe;
    assert.throws(() => validateCases(modified), /fixture path/, unsafe);
  }
  const duplicates = clone(corpus);
  duplicates.cases.push(clone(duplicates.cases[0]));
  assert.throws(() => validateCases(duplicates), /duplicate case/);
  const forced = clone(corpus);
  forced.cases[0].prompt = 'Use $brooks-review to review this';
  assert.throws(() => validateCases(forced), /forced-trigger/);
  const noEvidence = clone(corpus);
  noEvidence.cases[0].rubric.must_find[0].evidence_files = ['missing.js'];
  assert.throws(() => validateCases(noEvidence), /expected finding/);
});

test('observed trigger requires successful content-read evidence rather than claims or mentions', () => {
  const read = traceEvent("/bin/zsh -lc 'cat .agents/skills/brooks-review/SKILL.md'", skillContent);
  const actual = analyzeTrace(jsonl([read, finished]));
  assert.equal(actual.turn_completed, true);
  assert.deepEqual(actual.skill_reads.map(item => item.skill), ['brooks-review']);
  assert.deepEqual(actual.usage, finished.usage);
  for (const misleading of [
    { type: 'item.completed', item: { type: 'agent_message', text: 'I used brooks-review and read its SKILL.md.' } },
    traceEvent('cat .agents/skills/brooks-review/SKILL.md', skillContent, 1),
    traceEvent('ls .agents/skills/brooks-review/SKILL.md', '.agents/skills/brooks-review/SKILL.md'),
    traceEvent("rg 'name:|## Setup' .agents/skills/brooks-review/SKILL.md", '2:name: brooks-review\n10:## Setup'),
    traceEvent("rg 'name:|## Setup|^---' .agents/skills/brooks-review/SKILL.md", '---\nname: brooks-review\n---\n## Setup'),
    traceEvent("rg -A 2 'name:|## Setup|^---' .agents/skills/brooks-review/SKILL.md", skillContent),
    traceEvent('cat README.md', 'Use .agents/skills/brooks-review/SKILL.md\n' + skillContent),
  ]) {
    assert.deepEqual(analyzeTrace(jsonl([misleading, finished])).skill_reads, [], JSON.stringify(misleading));
  }
});

test('trace records failed turns and malformed logs instead of treating them as completed', () => {
  const failed = analyzeTrace(jsonl([finished, { type: 'turn.failed', error: { message: 'stream disconnected' } }]));
  assert.equal(failed.turn_completed, false);
  assert.deepEqual(failed.errors, ['stream disconnected']);
  assert.equal(analyzeTrace(jsonl([{ type: 'error', message: 'transport failed' }])).turn_completed, false);
  assert.equal(analyzeTrace('').turn_completed, false);
  assert.throws(() => analyzeTrace('{not-json}'));
});

test('judge accepts substantively complete baseline prose without Brooks labels', () => {
  assert.equal(validateJudgment(judgment(), sampleCase, sampleAnswer).completed, true);
  const prompt = judgePrompt(sampleCase, sampleAnswer);
  assert.match(prompt, /ordinary prose review can fully complete/);
  const payload = JSON.parse(prompt.slice(prompt.indexOf('{"task":')));
  assert.deepEqual(Object.keys(payload), ['task', 'files', 'rubric', 'answer']);
  assert.equal(payload.answer, sampleAnswer);
  assert.equal(payload.arm, undefined);
  assert.equal(payload.expected_skill, undefined);
  assert.equal(payload.trace, undefined);
});

test('judge evidence and matched/missed IDs must be grounded and internally consistent', () => {
  for (const change of [
    j => { j.completion_evidence = 'invented completion'; },
    j => { j.findings[0].quote = 'invented finding quote'; },
    j => { j.findings[0].match_id = 'unknown-expected-id'; },
    j => { j.findings[0].classification = 'false_positive'; },
    j => { j.missed_expected_ids = ['loyalty-policy-drift']; },
    j => { j.findings = []; },
    j => { j.findings[0].severity_ok = true; },
    j => { j.findings[0].severity = 'warning'; },
    j => { j.extra = true; },
    j => { j.findings[0].extra = true; },
  ]) {
    const invalid = judgment();
    change(invalid);
    assert.throws(() => validateJudgment(invalid, sampleCase, sampleAnswer), /Invalid judgment/);
  }
  const missed = judgment({ findings: [], missed_expected_ids: ['loyalty-policy-drift'] });
  assert.equal(validateJudgment(missed, sampleCase, sampleAnswer).missed_expected_ids.length, 1);
  missed.missed_expected_ids.push('loyalty-policy-drift');
  assert.throws(() => validateJudgment(missed, sampleCase, sampleAnswer), /missed ids/);
});

test('paired summaries exclude missing or failed arms and reject duplicate pair records', () => {
  const records = [
    result(sampleCase.id, 'with'), result(sampleCase.id, 'without'),
    result(sampleCase.id, 'with', 2), result(sampleCase.id, 'without', 2, { status: 'failed', judgment: null }),
    result(sampleCase.id, 'with', 3),
  ];
  const summary = summarize(records, corpus.cases);
  assert.equal(summary.attempted_pairs, 3);
  assert.equal(summary.valid_pairs, 1);
  assert.equal(summary.excluded_pairs, 2);
  assert.equal(summary.metrics.with.samples, 1);
  assert.equal(summary.metrics.without.samples, 1);
  assert.equal(summary.delta.completion_rate, 0);
  assert.throws(() => summarize([...records, records[0]], corpus.cases), /Duplicate/);
  assert.throws(() => summarize([result('unknown-case', 'with')], corpus.cases), /Unknown/);
  const empty = summarize([result(sampleCase.id, 'with')], corpus.cases);
  assert.equal(empty.metrics.with.recall, null);
  assert.equal(empty.metrics.with.completion_rate, null);
  assert.equal(empty.delta.completion_rate, null);
});

test('metrics distinguish unlabeled severity, uncertain findings, and nontrigger denominators', () => {
  const negative = corpus.cases.find(item => item.id === 'nontrigger-nullish-syntax');
  const falsePositive = { ...judgment().findings[0], match_id: null, classification: 'false_positive', severity: 'warning', severity_ok: false };
  const uncertain = { ...judgment().findings[0], match_id: null, classification: 'uncertain' };
  const rows = [
    result(sampleCase.id, 'with', 1, { trace: { skill_reads: [{ skill: 'brooks-review' }] }, judgment: judgment({ findings: [...judgment().findings, falsePositive, uncertain] }) }),
    result(sampleCase.id, 'without'),
    result(negative.id, 'with', 1, { judgment: judgment({ findings: [], missed_expected_ids: [] }) }),
    result(negative.id, 'without', 1, { judgment: judgment({ findings: [], missed_expected_ids: [] }) }),
  ];
  const summary = summarize(rows, corpus.cases);
  const withSkills = summary.metrics.with;
  assert.equal(withSkills.recall, 1);
  assert.equal(withSkills.expected_findings, 1);
  assert.equal(withSkills.false_positives, 1);
  assert.equal(withSkills.uncertain_findings, 1);
  assert.equal(withSkills.false_positive_fraction, 1 / 3);
  assert.equal(withSkills.unlabeled_findings, 2);
  assert.equal(withSkills.labeled_findings, 1);
  assert.equal(withSkills.severity_accuracy, 0);
  assert.equal(summary.metrics.without.severity_accuracy, null);
  assert.equal(summary.delta.severity_accuracy, null);
  assert.equal(withSkills.trigger_rate, 1);
  assert.equal(withSkills.negative_trigger_rate, 0);
  const report = renderSummary({ model: 'test-model', reasoning: 'high', cli_version: 'fixture', repetitions: 1, summary });
  assert.match(report, /N\/A/);
  assert.match(report, /not human-validated accuracy or statistical significance/);
});

function temporaryDirectory(t, prefix = 'brooks-codex-runner-') {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('runner environment retains transport settings while isolating identity and configuration', () => {
  const source = {
    PATH: '/test/bin', HOME: '/personal/home', CODEX_HOME: '/personal/codex',
    HTTP_PROXY: 'http://proxy.test:8080', HTTPS_PROXY: 'http://secure-proxy.test:8080',
    no_proxy: 'localhost', NODE_EXTRA_CA_CERTS: '/certs/ca.pem',
    OPENAI_API_KEY: 'must-not-inherit', ANTHROPIC_API_KEY: 'must-not-inherit',
    GITHUB_TOKEN: 'must-not-inherit', CODEX_MODEL: 'personal-model',
    CODEX_CONFIG: '/personal/config.toml', NODE_OPTIONS: '--require=personal.js',
    BASH_ENV: '/personal/startup.sh', ZDOTDIR: '/personal/zsh',
  };
  const env = isolatedEnv('/isolated/home', '/isolated/codex', source);
  assert.equal(env.HOME, '/isolated/home');
  assert.equal(env.CODEX_HOME, '/isolated/codex');
  for (const key of ['PATH', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NODE_EXTRA_CA_CERTS']) assert.equal(env[key], source[key]);
  for (const key of ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GITHUB_TOKEN', 'CODEX_MODEL', 'CODEX_CONFIG', 'NODE_OPTIONS', 'BASH_ENV', 'ZDOTDIR']) assert.equal(env[key], undefined, key);
  assert.equal(source.HOME, '/personal/home', 'Source environment must not be mutated');
});

test('runner materializes identical committed fixtures and installs skills only in treatment', t => {
  const dir = temporaryDirectory(t);
  for (const arm of ['with', 'without']) {
    const repo = path.join(dir, arm);
    mkdirSync(repo);
    materializeRepo(repo, sampleCase, arm);
    for (const file of sampleCase.files) assert.equal(readFileSync(path.join(repo, file.path), 'utf8'), file.content);
    assert.equal(existsSync(path.join(repo, 'AGENTS.md')), false);
    assert.equal(existsSync(path.join(repo, '.agents/skills/brooks-review/SKILL.md')), arm === 'with');
    if (arm === 'with') {
      for (const skill of ['review', 'audit', 'debt', 'test', 'health', 'sweep']) assert.ok(existsSync(path.join(repo, `.agents/skills/brooks-${skill}/SKILL.md`)));
      assert.ok(existsSync(path.join(repo, '.agents/skills/_shared/common.md')));
    } else assert.equal(existsSync(path.join(repo, '.agents')), false);
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: repo, encoding: 'utf8' });
    assert.equal(status.status, 0, status.stderr);
    assert.equal(status.stdout, '');
    const head = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: repo, encoding: 'utf8' });
    assert.equal(head.status, 0, head.stderr);
  }
});

test('process execution captures input/output and reports timeout, exit failures, and missing binary', async () => {
  const normal = await runProcess(process.execPath, ['-e', "process.stdin.on('data', d => process.stdout.write(d)); process.stderr.write('diagnostic');"], { input: 'fixture input', timeout: 3000 });
  assert.equal(normal.code, 0);
  assert.equal(normal.stdout, 'fixture input');
  assert.equal(normal.stderr, 'diagnostic');
  assert.equal(normal.timedOut, false);
  const failure = await runProcess(process.execPath, ['-e', 'process.exit(7)'], { timeout: 3000 });
  assert.equal(failure.code, 7);
  const timeout = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { timeout: 100 });
  assert.equal(timeout.timedOut, true);
  assert.notEqual(timeout.code, 0);
  await assert.rejects(runProcess('/nonexistent/brooks-codex-fixture-binary', [], { timeout: 1000 }), /ENOENT/);
});

test('CLI offline validation does not need Codex binary, auth, or live model settings', t => {
  const dir = temporaryDirectory(t);
  const executable = new URL('./run-codex-evals.mjs', import.meta.url);
  const result = spawnSync(process.execPath, [executable.pathname, '--validate', '--auth-file', path.join(dir, 'missing-auth.json'), '--codex', '/nonexistent/codex'], {
    env: isolatedEnv(dir, path.join(dir, 'missing-codex-home'), {}), encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /7 valid \(offline; no model calls\)/);
});

test('offline fake Codex exercises isolated treatment, baseline, and blind judge sessions', async t => {
  const dir = temporaryDirectory(t);
  const binary = path.join(dir, 'fake-codex.mjs');
  const capture = path.join(dir, 'capture.jsonl');
  const auth = path.join(dir, 'auth.json');
  writeFileSync(auth, JSON.stringify({ fixture: 'not-a-real-credential' }));
  writeFileSync(binary, `#!${process.execPath}
import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const skillDir = path.join(process.cwd(), '.agents/skills');
const skills = existsSync(skillDir) ? readdirSync(skillDir).filter(name => name.startsWith('brooks-')) : [];
const record = { args, cwd: process.cwd(), home: process.env.HOME, codexHome: process.env.CODEX_HOME, skills, authPresent: existsSync(path.join(process.env.CODEX_HOME, 'auth.json')), files: readdirSync(process.cwd()) };
appendFileSync(${JSON.stringify(capture)}, JSON.stringify(record) + '\\n');
if (args.includes('debug')) {
  process.stdout.write(JSON.stringify([{ role: 'developer', content: [{ type: 'input_text', text: '<skills_instructions>\\n### Available skills\\n' + skills.map(name => '- ' + name + ': fixture (file: /fixture/' + name + '/SKILL.md)').join('\\n') + '\\n</skills_instructions>' }] }]));
} else {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  appendFileSync(${JSON.stringify(capture)}, JSON.stringify({ input }) + '\\n');
  const output = args[args.indexOf('--output-last-message') + 1];
  writeFileSync(output, 'Fixture completed.');
  process.stdout.write(JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } }) + '\\n');
}
`);
  chmodSync(binary, 0o700);
  const options = { codex: binary, auth, model: 'fixture-model', reasoning: 'high', timeout: 3000 };
  for (const [name, arm, judge] of [['treatment', 'with', false], ['baseline', 'without', false], ['judge', 'with', true]]) {
    const destination = path.join(dir, name);
    mkdirSync(destination);
    const completed = await session({ c: sampleCase, arm, judge, prompt: `Fixture prompt ${name}`, options, destination });
    assert.equal(completed.answer, 'Fixture completed.');
    assert.equal(completed.trace.turn_completed, true);
    assert.equal(completed.discovered_skills.length, name === 'treatment' ? 6 : 0);
    assert.ok(existsSync(path.join(destination, 'events.jsonl')));
    assert.equal(readFileSync(path.join(destination, 'answer.txt'), 'utf8'), 'Fixture completed.');
  }
  const captures = readFileSync(capture, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  const executions = captures.filter(row => row.args?.includes('exec'));
  assert.equal(executions.length, 3);
  assert.equal(new Set(executions.map(row => row.home)).size, 3);
  for (const row of executions) {
    assert.equal(row.authPresent, true);
    assert.equal(existsSync(row.home), false, 'Temporary home must be removed after execution');
    assert.equal(existsSync(row.codexHome), false, 'Temporary credentials must be removed after execution');
    for (const flag of ['--ignore-user-config', '--ignore-rules', '--ephemeral', '--json', 'read-only']) assert.ok(row.args.includes(flag), flag);
    for (const setting of ['features.plugins=false', 'features.apps=false', 'features.hooks=false', 'skills.bundled.enabled=false', 'project_doc_max_bytes=0']) assert.ok(row.args.includes(setting), setting);
  }
  assert.deepEqual(executions.map(row => row.skills.length), [6, 0, 0]);
  assert.ok(executions[2].args.includes('--output-schema'));
  assert.ok(executions[2].args.includes('features.shell_tool=false'));
  assert.deepEqual(executions[2].files, ['.git'], 'Judge must not inherit task files or local skills');
  assert.deepEqual(captures.filter(row => row.input).map(row => row.input), ['Fixture prompt treatment', 'Fixture prompt baseline', 'Fixture prompt judge']);
});

test('session rejects preflight skill mismatch before execution and removes temporary credentials', async t => {
  const dir = temporaryDirectory(t);
  const binary = path.join(dir, 'mismatched-codex.mjs');
  const capture = path.join(dir, 'capture.json');
  const auth = path.join(dir, 'auth.json');
  writeFileSync(auth, '{}');
  writeFileSync(binary, `#!${process.execPath}
import { writeFileSync } from 'node:fs';
writeFileSync(${JSON.stringify(capture)}, JSON.stringify({ args: process.argv.slice(2), home: process.env.HOME, codexHome: process.env.CODEX_HOME }));
process.stdout.write(JSON.stringify([{ role: 'developer', content: [{ type: 'input_text', text: '<skills_instructions>\\n### Available skills\\n- foreign-skill: unexpected (file: /foreign/SKILL.md)\\n</skills_instructions>' }] }]));
`);
  chmodSync(binary, 0o700);
  const destination = path.join(dir, 'result');
  mkdirSync(destination);
  await assert.rejects(session({ c: sampleCase, arm: 'without', prompt: sampleCase.prompt, destination, options: { codex: binary, auth, model: 'fixture', reasoning: 'high', timeout: 3000 } }), /Skill isolation failed/);
  const observed = JSON.parse(readFileSync(capture, 'utf8'));
  assert.ok(observed.args.includes('debug'));
  assert.equal(observed.args.includes('exec'), false);
  assert.equal(existsSync(observed.home), false);
  assert.equal(existsSync(observed.codexHome), false);
  assert.equal(existsSync(path.join(destination, 'answer.txt')), false);
});

test('session preserves failed-turn evidence without publishing a successful final answer', async t => {
  const dir = temporaryDirectory(t);
  const binary = path.join(dir, 'failed-codex.mjs');
  const auth = path.join(dir, 'auth.json');
  writeFileSync(auth, '{}');
  writeFileSync(binary, `#!${process.execPath}
if (process.argv.includes('debug')) process.stdout.write('[]');
else {
  process.stdout.write(JSON.stringify({ type: 'turn.failed', error: { message: 'fixture connection failure' } }) + '\\n');
  process.stderr.write('fixture diagnostic');
}
`);
  chmodSync(binary, 0o700);
  const destination = path.join(dir, 'result');
  mkdirSync(destination);
  await assert.rejects(session({ c: sampleCase, arm: 'without', prompt: sampleCase.prompt, destination, options: { codex: binary, auth, model: 'fixture', reasoning: 'high', timeout: 3000 } }), /Codex turn failed.*fixture connection failure/);
  assert.match(readFileSync(path.join(destination, 'events.jsonl'), 'utf8'), /turn.failed/);
  assert.equal(readFileSync(path.join(destination, 'stderr.txt'), 'utf8'), 'fixture diagnostic');
  assert.equal(existsSync(path.join(destination, 'answer.txt')), false);
});

function catalogSnapshot(names, role = 'developer') {
  return [{ role, content: [{ type: 'input_text', text: '<skills_instructions>\n### Available skills\n' + names.map(name => `- ${name}: Fixture skill (file: /fixture/${name}/SKILL.md)`).join('\n') + '\n</skills_instructions>' }] }];
}

test('discovery reads only developer skill catalogs and never user or judge answer mentions', () => {
  const mentioned = catalogSnapshot(['brooks-review'], 'user');
  const judgeAnswer = { role: 'user', content: [{ type: 'input_text', text: judgePrompt(sampleCase, 'I used brooks-review. name: brooks-audit\n- brooks-test: claimed skill (file: /fake/SKILL.md)') }] };
  const ordinaryDeveloper = { role: 'developer', content: [{ type: 'input_text', text: 'A quoted example mentions name: brooks-review and - brooks-test: fixture (file: /fake/SKILL.md)' }] };
  assert.deepEqual(discoveredSkills([...mentioned, judgeAnswer, ordinaryDeveloper]), []);
  assert.deepEqual(discoveredSkills([...mentioned, ...catalogSnapshot(['brooks-test', 'brooks-review']), judgeAnswer]), ['brooks-review', 'brooks-test']);
  assert.deepEqual(discoveredSkills(catalogSnapshot(['unknown-foreign-skill'])), ['unknown-foreign-skill'], 'Unknown catalog entries must remain visible so isolation rejects them');
  assert.throws(() => discoveredSkills({ catalog: 'legacy unsupported snapshot' }), /snapshot format/);
  assert.throws(() => discoveredSkills([{ role: 'developer', content: [{ text: '<skills_instructions>\nNo catalog' }] }]), /parseable catalog/);
  assert.throws(() => discoveredSkills([{ role: 'developer', content: [{ text: '<skills_instructions>\n### Available skills\nUnrecognized entry\n</skills_instructions>' }] }]), /catalog entry/);
});

test('matched finding severity calibration cannot contradict the fixed rubric', () => {
  for (const [severity, severityOk, valid] of [['warning', true, true], ['critical', false, true], ['warning', false, false], ['critical', true, false], ['suggestion', true, false]]) {
    const candidate = judgment();
    candidate.findings[0].severity = severity;
    candidate.findings[0].severity_ok = severityOk;
    if (valid) assert.equal(validateJudgment(candidate, sampleCase, sampleAnswer), candidate);
    else assert.throws(() => validateJudgment(candidate, sampleCase, sampleAnswer), /severity disagrees with rubric/);
  }
});

test('process cancellation terminates an active process and rejects a pre-aborted launch', async () => {
  const controller = new AbortController();
  const running = runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { signal: controller.signal, timeout: 5000 });
  controller.abort();
  const aborted = await running;
  assert.equal(aborted.aborted, true);
  assert.equal(aborted.timedOut, false);
  assert.notEqual(aborted.code, 0);
  await assert.rejects(runProcess('/nonexistent/not-launched', [], { signal: controller.signal }), /Evaluation interrupted/);
});

test('aborted session removes temporary credentials and never writes a completed answer', async t => {
  const dir = temporaryDirectory(t);
  const binary = path.join(dir, 'abortable-codex.mjs');
  const auth = path.join(dir, 'auth.json');
  const capture = path.join(dir, 'running.json');
  writeFileSync(auth, '{}');
  writeFileSync(binary, `#!${process.execPath}
import { writeFileSync } from 'node:fs';
if (process.argv.includes('debug')) process.stdout.write('[]');
else {
  writeFileSync(${JSON.stringify(capture)}, JSON.stringify({ home: process.env.HOME, codexHome: process.env.CODEX_HOME }));
  setInterval(() => {}, 1000);
}
`);
  chmodSync(binary, 0o700);
  const destination = path.join(dir, 'result');
  mkdirSync(destination);
  const controller = new AbortController();
  t.after(() => controller.abort());
  const pending = session({ c: sampleCase, arm: 'without', prompt: sampleCase.prompt, destination, options: { signal: controller.signal, codex: binary, auth, model: 'fixture', reasoning: 'high', timeout: 5000 } });
  const rejected = assert.rejects(pending, /interrupted=true/);
  const deadline = Date.now() + 4000;
  while (!existsSync(capture) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(capture), 'Fake Codex execution must start before interruption');
  const observed = JSON.parse(readFileSync(capture, 'utf8'));
  assert.ok(existsSync(path.join(observed.codexHome, 'auth.json')));
  controller.abort();
  await rejected;
  assert.equal(existsSync(observed.home), false);
  assert.equal(existsSync(observed.codexHome), false);
  assert.equal(existsSync(path.join(destination, 'answer.txt')), false);
});

for (const archive of ['pilot-2026-11-04', 'calibration-2026-11-04']) test(`frozen Codex ${archive} judgments, paired summary, and observed reads remain reproducible`, () => {
  const pilot = JSON.parse(readFileSync(new URL(`../evals/codex/${archive}.json`, import.meta.url), 'utf8'));
  const frozenCases = validateCases(pilot.fixture_snapshot);
  const caseById = new Map(frozenCases.map(item => [item.id, item]));
  assert.equal(pilot.records.length, 14, 'This frozen pilot contains seven complete with/without pairs');
  for (const record of pilot.records) {
    const scenario = caseById.get(record.case_id);
    assert.ok(scenario, `Unknown frozen case: ${record.case_id}`);
    assert.equal(record.status, 'ok');
    assert.equal(record.trace.turn_completed, true);
    assert.deepEqual(record.trace.errors, []);
    assert.equal(Object.hasOwn(record, 'error'), false, 'Successful frozen records must not hide an execution error');
    assert.deepEqual(validateJudgment(record.judgment, scenario, record.answer), record.judgment);
    assert.ok(Array.isArray(record.read_evidence), 'Observed reads need archived command evidence');
    const indexes = new Set();
    const events = [];
    for (const evidence of record.read_evidence) {
      const { event_index: eventIndex, ...item } = evidence;
      assert.ok(Number.isSafeInteger(eventIndex) && eventIndex >= 0);
      assert.equal(indexes.has(eventIndex), false, 'An archived event must not appear twice');
      indexes.add(eventIndex);
      assert.equal(item.type, 'command_execution');
      events[eventIndex] = { type: 'item.completed', item };
    }
    const replay = Array.from({ length: events.length }, (_, index) => events[index] ?? { type: 'fixture.unrecorded' });
    replay.push({ type: 'turn.completed' });
    assert.deepEqual(analyzeTrace(jsonl(replay)).skill_reads, record.trace.skill_reads, `Read evidence disagrees for ${record.case_id}/${record.arm}`);
  }
  const summary = summarize(pilot.records, frozenCases);
  assert.deepEqual(summary, pilot.summary);
  assert.equal(summary.valid_pairs, 7);
  assert.equal(summary.excluded_pairs, 0);
  assert.equal(summary.attempted_pairs, 7);
});

test('severity calibration rerun preserves the original evaluation criteria and controls', () => {
  const original = JSON.parse(readFileSync(new URL('../evals/codex/pilot-2026-11-04.json', import.meta.url), 'utf8'));
  const rerun = JSON.parse(readFileSync(new URL('../evals/codex/calibration-2026-11-04.json', import.meta.url), 'utf8'));
  assert.deepEqual(rerun.fixture_snapshot, original.fixture_snapshot, 'Tasks, ground truth, allowed severities, and completion criteria must remain fixed');
  for (const field of ['model', 'reasoning', 'repetitions', 'cases_sha256', 'judge_schema_sha256', 'timeout_seconds']) {
    assert.equal(rerun[field], original[field], `Comparison control changed: ${field}`);
  }
  assert.equal(rerun.evaluator_sha256, original.revalidation_source_sha256['scripts/codex-eval.mjs'], 'Judge instructions and metric logic must remain unchanged');
  assert.equal(rerun.runner_sha256, original.revalidation_source_sha256['scripts/run-codex-evals.mjs'], 'Runner isolation and execution contract must remain unchanged');
  assert.equal(rerun.initial_attempt.summary.valid_pairs, 6);
  assert.equal(rerun.initial_attempt.summary.excluded_pairs, 1);
  assert.equal(rerun.initial_attempt.failed_records.length, 2);
  assert.ok(rerun.initial_attempt.failed_records.every(r => r.status === 'failed' && /timeout=true/.test(r.error)));
  const failedCases = new Set(rerun.initial_attempt.failed_records.map(r => r.case_id));
  const primary = rerun.records.filter(r => !failedCases.has(r.case_id)).concat(rerun.initial_attempt.failed_records);
  assert.deepEqual(summarize(primary, rerun.fixture_snapshot.cases), rerun.initial_attempt.summary);
  assert.deepEqual(summarize(rerun.records.filter(r => r.case_id === rerun.recovery.case_id), rerun.fixture_snapshot.cases), rerun.recovery.summary);
  assert.equal(rerun.recovery.summary.valid_pairs, 1);
  assert.equal(rerun.recovery.summary.excluded_pairs, 0);
  assert.notEqual(rerun.skills_sha256, original.skills_sha256, 'The treatment must contain the revised skill rules');
});

test('three-run severity archive preserves fixed criteria, complete attempts, and recovery provenance', () => {
  const original = JSON.parse(readFileSync(new URL('../evals/codex/pilot-2026-11-04.json', import.meta.url), 'utf8'));
  const prior = JSON.parse(readFileSync(new URL('../evals/codex/calibration-2026-11-04.json', import.meta.url), 'utf8'));
  const archive = JSON.parse(readFileSync(new URL('../evals/codex/stability-2026-11-05.json', import.meta.url), 'utf8'));
  assert.deepEqual(archive.fixture_snapshot, original.fixture_snapshot);
  assert.deepEqual(archive.fixture_snapshot, corpus, 'The frozen tasks and authored severity targets cannot drift');
  for (const field of ['model', 'reasoning', 'cli_version', 'cases_sha256', 'judge_schema_sha256', 'timeout_seconds']) assert.equal(archive[field], prior[field], field);
  assert.equal(archive.repetitions, 3);
  assert.equal(archive.planned_pairs, corpus.cases.length * 3);
  for (const [field, file] of [['runner_sha256', 'scripts/run-codex-evals.mjs'], ['evaluator_sha256', 'scripts/codex-eval.mjs']]) {
    assert.equal(archive[field], prior[field], 'Judging, metrics and runner isolation must remain fixed');
    assert.equal(archive[field], digest(readFileSync(new URL(`../${file}`, import.meta.url))), 'Archive must identify the actual unchanged evaluator source');
  }
  assert.equal(archive.cases_sha256, digest(readFileSync(new URL('../evals/codex/cases.json', import.meta.url))));
  assert.equal(archive.judge_schema_sha256, digest(readFileSync(new URL('../evals/codex/judge-schema.json', import.meta.url))));
  assert.notEqual(archive.skills_sha256, prior.skills_sha256);
  assert.equal(digest(JSON.stringify(archive.skill_inventory)), archive.skills_sha256, 'Archived source inventory identifies the exact frozen skill treatment');
  const primary = archive.primary_attempt.records;
  assert.equal(primary.length, archive.planned_pairs * 2);
  assert.equal(new Set(primary.map(r => `${r.case_id}/${r.repetition}/${r.arm}`)).size, primary.length);
  for (const scenario of corpus.cases) for (const repetition of [1,2,3]) for (const arm of ['with','without']) assert.ok(primary.some(r => r.case_id === scenario.id && r.repetition === repetition && r.arm === arm));
  assert.deepEqual(summarize(primary, corpus.cases), archive.primary_attempt.summary);
  let finalRecords = [...primary];
  const recovered = new Map();
  for (const recovery of archive.recoveries) {
    const key = `${recovery.case_id}/${recovery.repetition}`;
    const previous = recovered.get(key);
    assert.ok(recovery.attempt === 1 || recovery.attempt === 2, 'At most two disclosed operational recovery attempts');
    assert.equal(recovery.attempt, previous ? previous.attempt + 1 : 1, 'Attempts must remain ordered');
    if (previous) assert.equal(previous.accepted, false, 'Successful recovery pairs may never be retried');
    recovered.set(key, recovery);
    const initial = primary.filter(r => r.case_id === recovery.case_id && r.repetition === recovery.repetition);
    assert.equal(initial.length, 2);
    assert.ok(initial.some(r => r.status === 'failed'), 'Successful pairs may not be selected for retries');
    assert.equal(recovery.records.length, 2, 'Retry the whole pair');
    assert.deepEqual(new Set(recovery.records.map(r => r.arm)), new Set(['with','without']));
    assert.ok(recovery.records.every(r => r.case_id === recovery.case_id && r.repetition === recovery.repetition));
    assert.equal(recovery.accepted, recovery.records.every(r => r.status === 'ok'));
    assert.deepEqual(summarize(recovery.records, corpus.cases), recovery.summary);
    if (recovery.accepted) finalRecords = finalRecords.filter(r => !(r.case_id === recovery.case_id && r.repetition === recovery.repetition)).concat(recovery.records);
  }
  assert.equal(archive.recovery_policy.initially_planned_attempts_per_failed_pair, 1);
  assert.equal(archive.recovery_policy.maximum_disclosed_attempts_per_failed_pair, 2);
  assert.equal(archive.recovery_policy.deviation_used, archive.recoveries.some(r => r.attempt === 2));
  assert.deepEqual(finalRecords, archive.records, 'Final metrics must preserve primary grades and disclose all replacements');
  assert.deepEqual(summarize(archive.records, corpus.cases), archive.summary);
  assert.equal(archive.summary.attempted_pairs, archive.planned_pairs);
  assert.equal(archive.per_repetition.length, 3);
  for (const repeat of archive.per_repetition) assert.deepEqual(summarize(archive.records.filter(r => r.repetition === repeat.repetition), corpus.cases), repeat.summary);
  assert.equal(archive.per_case.length, corpus.cases.length);
  for (const item of archive.per_case) assert.deepEqual(summarize(archive.records.filter(r => r.case_id === item.case_id), corpus.cases), item.summary);
});

test('three-run archive keeps grounded grades and replayable skill-read evidence', () => {
  const archive = JSON.parse(readFileSync(new URL('../evals/codex/stability-2026-11-05.json', import.meta.url), 'utf8'));
  const attempts = [...archive.primary_attempt.records, ...archive.recoveries.flatMap(r => r.records)];
  assert.deepEqual(archive.all_attempts_execution_accounting, {
    attempted_arms: attempts.length,
    successful_arms: attempts.filter(r => r.status === 'ok').length,
    answer_failed_arms: attempts.filter(r => r.failure_stage === 'answer').length,
    judge_failed_arms: attempts.filter(r => r.failure_stage === 'judge').length,
    successful_arms_excluded_by_whole_pair_policy: attempts.filter(r => r.status === 'ok').length - archive.records.filter(r => r.status === 'ok').length,
  });
  for (const batch of [archive.primary_attempt, ...archive.recoveries]) {
    assert.deepEqual(batch.execution_accounting, {
      attempted_arms: batch.records.length,
      successful_arms: batch.records.filter(r => r.status === 'ok').length,
      answer_failed_arms: batch.records.filter(r => r.status === 'failed' && r.failure_stage === 'answer').length,
      judge_failed_arms: batch.records.filter(r => r.status === 'failed' && r.failure_stage === 'judge').length,
    });
    for (const record of batch.records.filter(r => r.status === 'failed')) assert.equal(record.failure_stage, record.answer !== undefined ? 'judge' : 'answer');
  }
  for (const record of attempts) {
    if (record.status === 'failed') { assert.ok(record.error); continue; }
    assert.equal(record.status, 'ok');
    const scenario = corpus.cases.find(c => c.id === record.case_id);
    assert.deepEqual(validateJudgment(record.judgment, scenario, record.answer), record.judgment);
    assert.equal(record.trace.turn_completed, true);
    assert.deepEqual(record.trace.errors, []);
    assert.equal(Object.hasOwn(record, 'error'), false);
    assert.equal(record.raw_trace_sha256, record.trace_sha256);
    assert.equal(record.raw_judge_trace_sha256, record.judge_trace_sha256);
    assert.equal(record.judge_trace.turn_completed, true);
    assert.deepEqual(record.judge_trace.errors, []);
    const events = [];
    for (const evidence of record.read_evidence) {
      const { event_index: eventIndex, ...item } = evidence;
      assert.ok(Number.isSafeInteger(eventIndex) && eventIndex >= 0);
      assert.equal(events[eventIndex], undefined);
      assert.equal(item.type, 'command_execution');
      events[eventIndex] = { type: 'item.completed', item };
    }
    const replay = Array.from({ length: events.length }, (_, i) => events[i] ?? { type: 'fixture.unrecorded' });
    replay.push({ type: 'turn.completed' });
    assert.deepEqual(analyzeTrace(jsonl(replay)).skill_reads, record.trace.skill_reads);
  }
  for (const group of [archive, ...archive.per_repetition, ...archive.per_case]) for (const arm of ['with','without']) {
    const breakdown = group.severity_breakdown[arm];
    const metric = group.summary.metrics[arm];
    assert.equal(breakdown.findings, metric.findings);
    assert.equal(breakdown.unlabeled, metric.unlabeled_findings);
    assert.equal(breakdown.calibrated, Math.round((metric.severity_accuracy ?? 0) * metric.labeled_findings));
    assert.equal(breakdown.calibrated + breakdown.unlabeled + breakdown.matched_overgraded + breakdown.matched_undergraded + breakdown.other_miscalibrated, breakdown.findings);
  }
});
