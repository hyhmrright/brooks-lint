import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {anchored as parent} from '../focused-skill-retest/suite.mjs';
import {packets} from '../focused-skill-retest/review.mjs';
import {verifyAccountProbe} from './account-probe.mjs';
import {terminate} from './cleanup.mjs';
import {runLoginTurn} from './login-turn.mjs';
import {execute, prompt, summary, verify} from './runner.mjs';
import {anchored, validate} from './suite.mjs';

const fake = fileURLToPath(new URL('./fake-cli.cjs', import.meta.url));
function workspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'focused-recovery-test-'));
  t.after(() => fs.rmSync(dir, {force: true, recursive: true}));
  return dir;
}
function fixture(plan, row, out, {mode = 'success', accountOnly = false, timeoutMs = 120000} = {}) {
  return runLoginTurn({
    model: plan.model, effort: plan.effort, cliVersion: plan.cliVersion,
    executable: process.execPath, prefixArgs: [fake, mode], fixtureEndpoint: 'http://127.0.0.1:1/v1',
    prompt: prompt(plan, row), fixtureAccount: true, accountOnly, out, timeoutMs,
  });
}

test('recovery binds history and preserves all 36 original prompts and grading cases', () => {
  const plan = anchored(), original = parent();
  assert.equal(plan.parentSha256, original.sha256);
  assert.deepEqual(plan.schedule, original.schedule);
  assert.deepEqual(plan.cases, original.cases);
  assert.deepEqual(plan.prior, {attempts: 1, modelTurnRequests: 0, observedTokens: 0, elapsedMs: 501});
  assert.equal(plan.budget.totalMs, 7199499);
  for (const key of ['cases', 'schedule', 'historicalFiles', 'recoverySources', 'budget']) {
    const changed = {...plan, [key]: null};
    assert.throws(() => validate(changed), /drift/);
  }
});

test('account-only succeeds, removes its home and never submits benchmark input', async t => {
  const plan = anchored();
  const raw = await fixture(plan, plan.schedule[0], path.join(workspace(t), 'account'), {accountOnly: true});
  assert.equal(verifyAccountProbe(raw).ready, true);
  assert.equal(raw.cleanup.observations.at(-1).status, 'ESRCH');
  assert(!JSON.stringify(raw).includes('PRIVATE_FIXTURE'));
});

test('routing failure records safe code, confirms cleanup and closes collector before any turn', async t => {
  const plan = anchored(), dir = workspace(t), out = path.join(dir, 'run');
  const result = await execute(plan, out, {inject: (f, row, {timeoutMs}) =>
    fixture(f, row, path.join(dir, 'transport-' + row.ordinal), {mode: 'routing-failure', timeoutMs})});
  assert.equal(result.attempted, 1);
  assert.equal(result.notRun, 35);
  assert.equal(result.stopped, 'execution-failure');
  const [first] = verify(out).records;
  assert.deepEqual(first.raw.requests.map(r => r.method), ['initialize', 'account/read']);
  assert.deepEqual(first.raw.account_rpc, {status: 'error', code: -32603});
  assert(first.raw.cleanup.private_home_removed);
  assert(!JSON.stringify(first.raw).includes('PRIVATE_FIXTURE'));
});

test('real detached group ignores SIGTERM and is killed within the cleanup budget', async () => {
  const child = spawn(process.execPath, ['-e',
    "process.on('SIGTERM',()=>{}); console.log('ready'); setInterval(()=>{},1000)"],
    {detached: true, stdio: ['ignore', 'pipe', 'ignore']});
  const closed = once(child, 'close').then(() => true);
  await once(child.stdout, 'data');
  const result = await terminate(child, closed, 1200);
  assert(result.closed && result.group_absent);
  assert(result.signals.some(x => x.signal === 'SIGKILL' && x.delivered));
  assert.equal(result.observations.at(-1).status, 'ESRCH');
});

test('leader exit alone and permission errors do not prove process group absence', async () => {
  const result = await terminate({pid: 123}, Promise.resolve(true), 30, {
    kill() { throw Object.assign(new Error(), {code: 'EPERM'}); },
  });
  assert(result.closed);
  assert.equal(result.group_absent, false);
  assert.deepEqual(result.observations, [{method: 'kill(-pgid,0)', status: 'EPERM'}]);
});

test('full 36-slot offline run verifies evidence and rejects simulation as live review input', async t => {
  const plan = anchored(), dir = workspace(t), out = path.join(dir, 'run');
  const result = await execute(plan, out, {inject: (f, row, {timeoutMs}) =>
    fixture(f, row, path.join(dir, 'transport-' + row.ordinal), {timeoutMs})});
  const run = verify(out);
  assert.deepEqual(result, summary(run.state));
  assert.equal(result.completed, 36);
  assert.equal(result.lifetimeAttempts, 37);
  assert.equal(result.observedTokens, 3600);
  assert.equal(result.stopped, null);
  assert.equal(packets(run, {simulation: true}).length, 36);
  assert.throws(() => packets(run), /Simulation/);
});

test('transport retry stops on the current slot with no automatic resubmission', async t => {
  const plan = anchored(), dir = workspace(t), out = path.join(dir, 'run');
  const result = await execute(plan, out, {inject: (f, row, {timeoutMs}) =>
    fixture(f, row, path.join(dir, 'transport-' + row.ordinal), {mode: 'retry', timeoutMs})});
  assert.equal(result.attempted, 1);
  assert.equal(result.stopped, 'transport-retry');
  assert.equal(verify(out).records.length, 1);
});

test('late account reply during timeout cleanup stays out of archived events', async t => {
  const plan = anchored();
  const raw = await fixture(plan, plan.schedule[0], path.join(workspace(t), 'late'), {
    mode: 'late-account', accountOnly: true, timeoutMs: 1000,
  });
  assert.equal(raw.status, 'failed');
  assert.equal(raw.error, 'Smoke deadline exceeded');
  assert.deepEqual(raw.requests.map(r => r.method), ['initialize', 'account/read']);
  assert.equal(raw.exit.code, 0, 'fixture exited after sending its late response');
  assert(raw.cleanup.private_home_removed);
  assert(!JSON.stringify(raw).includes('PRIVATE_FIXTURE'));
});

test('nonempty answer without usage is preserved but excluded from review packets', async t => {
  const plan = anchored(), dir = workspace(t), out = path.join(dir, 'run');
  const result = await execute(plan, out, {inject: (f, row, {timeoutMs}) =>
    fixture(f, row, path.join(dir, 'transport-' + row.ordinal), {mode: 'unknown-usage', timeoutMs})});
  const run = verify(out);
  assert.equal(result.stopped, 'usage-unavailable');
  assert.equal(result.completed, 0);
  assert.equal(result.failed, 1);
  assert.match(run.records[0].raw.answer, /Synthetic answer/);
  assert.deepEqual(packets(run, {simulation: true}), []);
});
