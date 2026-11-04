import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, cpSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCiDiff } from './ci-diff.mjs';
import { loadProjectConfig } from './ci-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const envelope = '**Mode:** PR Review\n**Scope:** src/a.js\n';
const finding = (code = 'R1') => `**${code} — Mixed concerns**\nSymptom: src/a.js:3 mixes unrelated concerns.\nSource: Code Complete — High-Quality Routines.\nConsequence: Changes require understanding unrelated paths.\nRemedy: Separate persistence from calculation.`;
const report = `${envelope}**Health Score:** 95/100\n### 🟡 Warning\n${finding()}`;
const clean = `${envelope}**Health Score:** 100/100\nNo findings.`;

function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'brooks-runner-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^(GITHUB_|GIT_)/.test(key)) delete env[key];
  env.ANTHROPIC_API_KEY = 'offline-fixture';
  const git = (...args) => execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  git('init', '--initial-branch=develop');
  writeFileSync(path.join(dir, 'a.js'), 'export const value = 1;\n');
  writeFileSync(path.join(dir, '.brooks-lint.yaml'), 'strictness: strict\n');
  git('add', '.'); git('commit', '-m', 'base');
  const base = git('rev-parse', 'HEAD');
  const capture = path.join(dir, 'requests.jsonl');
  const sdk = `import { appendFileSync } from 'node:fs';
export default class Anthropic {
  messages = { create: async (request) => {
    appendFileSync(process.env.BROOKS_TEST_CAPTURE, JSON.stringify(request) + '\\n');
    return JSON.parse(process.env.BROOKS_TEST_RESPONSE);
  } };
}`;
  const moduleUrl = `data:text/javascript,${encodeURIComponent(sdk)}`;
  const loader = path.join(dir, 'sdk-loader.mjs');
  writeFileSync(loader, `export async function resolve(specifier, context, nextResolve) {
    if (specifier === '@anthropic-ai/sdk') return { url: ${JSON.stringify(moduleUrl)}, shortCircuit: true };
    return nextResolve(specifier, context);
  }`);
  const run = (script, args = [], response = { content: [{ type: 'text', text: clean }], stop_reason: 'end_turn' }, extra = {}) => spawnSync(process.execPath, ['--no-warnings', '--experimental-loader', loader, path.join(root, 'scripts', script), ...args], {
    cwd: dir, encoding: 'utf8', timeout: 20000,
    env: { ...env, BROOKS_TEST_CAPTURE: capture, BROOKS_TEST_RESPONSE: JSON.stringify(response), ...extra },
  });
  const change = () => { writeFileSync(path.join(dir, 'a.js'), 'export const value = 2;\n'); git('add', 'a.js'); git('commit', '-m', 'change'); return git('rev-parse', 'HEAD'); };
  return { dir, env, git, base, run, capture, change };
}

test('PR event SHAs select a non-main merge-base diff and trusted base policy', t => {
  const f = fixture(t);
  f.git('checkout', '-b', 'topic');
  writeFileSync(path.join(f.dir, 'a.js'), 'export const value = 2;\n');
  writeFileSync(path.join(f.dir, '.brooks-lint.yaml'), 'disable: [T5]\n');
  f.git('add', 'a.js', '.brooks-lint.yaml'); f.git('commit', '-m', 'topic');
  const head = f.git('rev-parse', 'HEAD');
  f.git('checkout', 'develop');
  writeFileSync(path.join(f.dir, 'base-only.js'), 'export const baseOnly = true;\n');
  f.git('add', 'base-only.js'); f.git('commit', '-m', 'base update');
  const base = f.git('rev-parse', 'HEAD');
  f.git('merge', '--no-ff', 'topic', '-m', 'synthetic checkout merge');
  const event = path.join(f.dir, 'event.json');
  writeFileSync(event, JSON.stringify({ pull_request: { base: { sha: base }, head: { sha: head } } }));
  const env = { GITHUB_EVENT_NAME: 'pull_request', GITHUB_BASE_REF: 'develop', GITHUB_EVENT_PATH: event };
  const input = readCiDiff({ projectDir: f.dir, env });
  assert.equal(input.status, 'ready');
  assert.equal(input.baseRef, base);
  assert.match(input.diff, /value = 2/);
  assert.doesNotMatch(input.diff, /baseOnly/);
  assert.equal(loadProjectConfig({ projectDir: f.dir, baseRef: input.baseRef, env }).content, 'strictness: strict\n');
  const result = f.run('ci-review.mjs', ['--project-dir', f.dir], undefined, env);
  assert.equal(result.status, 0, result.stderr);
  const request = JSON.parse(readFileSync(f.capture, 'utf8').trim());
  assert.match(request.system[1].text, /strictness: strict/);
  assert.doesNotMatch(request.system[1].text, /disable: \[T5\]/);
  assert.doesNotMatch(request.messages[0].content, /baseOnly/);
});

test('explicit refs, staged and unstaged inputs are honored without a main branch', t => {
  const f = fixture(t);
  const head = f.change();
  assert.equal(readCiDiff({ projectDir: f.dir, baseRef: f.base, headRef: head, env: {} }).status, 'ready');
  writeFileSync(path.join(f.dir, 'a.js'), 'export const value = 3;\n');
  assert.match(readCiDiff({ projectDir: f.dir, env: {} }).scope, /unstaged/);
  f.git('add', 'a.js');
  assert.match(readCiDiff({ projectDir: f.dir, env: {} }).scope, /staged/);
});

test('missing refs, merge bases and Git repositories fail instead of pretending to scan', t => {
  const f = fixture(t);
  assert.throws(() => readCiDiff({ projectDir: f.dir, baseRef: 'missing', env: {} }), /Cannot resolve/);
  assert.throws(() => readCiDiff({ projectDir: f.dir, env: {} }), /No comparison base/);
  f.git('checkout', '--orphan', 'unrelated');
  f.git('commit', '-m', 'unrelated root');
  assert.throws(() => readCiDiff({ projectDir: f.dir, baseRef: f.base, env: {} }), /common ancestor/);
  assert.throws(() => readCiDiff({ projectDir: path.join(f.dir, 'absent'), env: {} }));
});

test('empty diff is skipped without loading SDK or writing SARIF; unsupported modes fail before API', t => {
  const f = fixture(t);
  const sarif = path.join(f.dir, 'review.sarif');
  const skipped = f.run('ci-review.mjs', ['--base-ref', f.base, '--sarif-out', sarif]);
  assert.equal(skipped.status, 0, skipped.stderr);
  assert.equal(JSON.parse(skipped.stdout).status, 'skipped');
  assert.equal(JSON.parse(skipped.stdout).score, null);
  assert.equal(existsSync(sarif), false);
  for (const mode of ['audit', 'debt', 'test', 'health', 'sweep']) {
    const result = f.run('ci-review.mjs', ['--mode', mode]);
    assert.notEqual(result.status, 0, mode);
    assert.match(result.stderr, /not supported/);
  }
  const missing = f.run('ci-review.mjs', ['--base-ref', 'missing']);
  assert.notEqual(missing.status, 0);
  assert.equal(existsSync(f.capture), false);
});

test('CI emits complete structured results, but malformed and truncated responses fail closed', t => {
  const f = fixture(t); f.change();
  const args = ['--base-ref', f.base];
  const response = text => ({ content: [{ type: 'text', text }], stop_reason: 'end_turn' });
  const success = f.run('ci-review.mjs', args, response(report));
  assert.equal(success.status, 0, success.stderr);
  const result = JSON.parse(success.stdout);
  assert.equal(result.status, 'complete'); assert.equal(result.score, 95);
  assert.deepEqual(result.findings, { critical: 0, warning: 1, suggestion: 0 });
  for (const bad of [response(''), response('Health Score: 999'), response(report.replace(/\nRemedy:.*$/, '')), { ...response(report), stop_reason: 'max_tokens' }]) {
    const failed = f.run('ci-review.mjs', args, bad);
    assert.notEqual(failed.status, 0, failed.stdout);
    assert.equal(failed.stdout.trim(), '');
    assert.match(failed.stderr, /incomplete/);
  }
});

test('gate recomputes custom severities and rejects invalid report envelopes', t => {
  const f = fixture(t);
  const custom = `${envelope}Health Score: 85/100\n### Project-Specific Risks\n#### 🔴 Critical\n${finding('C1')}`;
  const file = path.join(f.dir, 'report.json');
  writeFileSync(file, JSON.stringify({ status: 'complete', mode: 'review', report: custom, score: 85, findings: { critical: 0 }, delta: null }));
  const failed = f.run('ci-gate.mjs', ['--report', file, '--fail-on', 'critical']);
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /Severity gate failed/);
  for (const malformed of [{ status: 'complete', report: '', score: 100 }, { status: 'complete', report: clean, score: 90 }, { status: 'complete', report: clean, score: 100, truncated: true }]) {
    writeFileSync(file, JSON.stringify(malformed));
    assert.notEqual(f.run('ci-gate.mjs', ['--report', file]).status, 0);
  }
});

test('API eval rejects explicit sweep and reports excluded sweep scenarios without API calls for them', t => {
  const f = fixture(t);
  for (const args of [['--mode', 'sweep'], ['--id', '50']]) {
    const result = f.run('run-evals-live.mjs', args);
    assert.notEqual(result.status, 0); assert.match(result.stderr, /not supported/);
  }
  assert.equal(existsSync(f.capture), false);
  const result = f.run('run-evals-live.mjs');
  assert.match(result.stdout, /Skipped #50 \(sweep\)/);
  assert.match(result.stdout, /Skipped #51 \(sweep\)/);
  const cases = JSON.parse(readFileSync(path.join(root, 'evals/evals.json'))).evals;
  const supported = cases.filter(c => c.mode !== 'sweep').length;
  assert.match(result.stdout, new RegExp(`Total\\s+: ${supported}`));
  assert.match(result.stdout, /Skipped\s+: 2/);
  const requests = readFileSync(f.capture, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(requests.length, supported);
  assert(requests.every(request => !request.system.includes('### Step 0 — Pre-flight consent gate')));
});

test('API eval fails the process for partial and truncated results', t => {
  const f = fixture(t);
  const response = { content: [{ type: 'text', text: report }], stop_reason: 'end_turn' };
  const partial = f.run('run-evals-live.mjs', ['--id', '1'], response);
  assert.notEqual(partial.status, 0); assert.match(partial.stdout, /Partial\s+: 1/);
  const truncated = f.run('run-evals-live.mjs', ['--id', '5'], { ...response, stop_reason: 'max_tokens' });
  assert.notEqual(truncated.status, 0); assert.match(truncated.stdout, /Fail\s+: 1/);
});


test('scenario schema accepts review test risks and rejects conflicting or malformed boundaries', t => {
  const f = fixture(t);
  const isolated = path.join(f.dir, 'schema');
  mkdirSync(path.join(isolated, 'evals'), { recursive: true });
  cpSync(path.join(root, 'scripts'), path.join(isolated, 'scripts'), { recursive: true });
  const original = JSON.parse(readFileSync(path.join(root, 'evals/evals.json'), 'utf8'));
  const check = (mutate = () => {}) => {
    const data = structuredClone(original);
    mutate(data.evals);
    writeFileSync(path.join(isolated, 'evals/evals.json'), JSON.stringify(data));
    return spawnSync(process.execPath, [path.join(isolated, 'scripts/run-evals.mjs')], { cwd: isolated, env: f.env, encoding: 'utf8' });
  };
  assert.equal(check().status, 0);
  for (const mutate of [
    cases => { cases[0].no_risk_codes = true; cases[0].forbidden_risk_codes = ['R1']; },
    cases => { cases[0].forbidden_risk_codes = []; },
    cases => { cases[0].forbidden_risk_codes = ['R99']; },
    cases => { cases[0].mode = 'audit'; cases[0].forbidden_risk_codes = ['T5']; },
    cases => { cases[0].mode = 7; },
    cases => { cases[0].files = [{ path: 'a.js', content: 7 }]; },
  ]) {
    const result = check(mutate);
    assert.notEqual(result.status, 0, result.stdout);
  }
});

test('critical gate accepts suppressed-only reports but rejects ambiguous or malformed severity boundaries', t => {
  const f = fixture(t);
  const file = path.join(f.dir, 'report.json');
  const suppressed = `<details><summary>Suppressed</summary>\n### 🔴 Critical\n${finding('R5')}\n</details>`;
  const check = (text, score) => {
    writeFileSync(file, JSON.stringify({ status: 'complete', mode: 'review', report: text, score, findings: { critical: 0, warning: 0, suggestion: 0 }, delta: null }));
    return f.run('ci-gate.mjs', ['--report', file, '--fail-on', 'critical']);
  };
  const accepted = check(`${clean}\n${suppressed}`, 100);
  assert.equal(accepted.status, 0, accepted.stderr);
  const malformed = [
    report.replace('🟡 Warning', '🔴 Warning'),
    report.replace('**R1 —', '🟢 **R1 —'),
    `${report}\n${suppressed.replace('</details>', '')}\n### 🔴 Critical\n${finding('R2')}`,
  ];
  for (const text of malformed) {
    const rejected = check(text, 95);
    assert.notEqual(rejected.status, 0, text);
    assert.match(rejected.stderr, /complete, valid report/);
  }
});
