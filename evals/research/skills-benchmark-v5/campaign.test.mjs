import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {digest, freeze} from './suite.mjs';
import {
  assessRun, execute, loadRetainedProbe, packets, readRun, register,
  validateRegistration, verifyProbe, verifyProxy,
} from './campaign.mjs';

const fakeCli = fileURLToPath(new URL('../health-transport-v3/fake-cli.cjs', import.meta.url));
const frozen = freeze();
function simulation(mode, limits = {}) {
  return register({
    frozen, freezeAnchor: frozen.sha256, model: 'gpt-fixture', effort: 'low', cliVersion: '0.167.1',
    executable: process.execPath, assessor: 'Offline control', simulation: true,
    budget: {calls: 324, observedTokens: 100000, totalMs: 240000, turnMs: 2000, ...limits},
    offline: {fixtureEndpoint: 'http://127.0.0.1:1/v1', prefixArgs: [fakeCli, mode]},
  });
}
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brooks-v5-campaign-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  return dir;
}
test('retained real evidence verifies without reading the current proxy', t => {
  const probe = loadRetainedProbe();
  const proxy = verifyProbe(probe, probe.plan);
  const key = proxy.keys.find(name => !/no_proxy/i.test(name));
  const previous = process.env[key];
  t.after(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
  process.env[key] = 'http://127.0.0.1:1';
  assert.throws(() => verifyProxy(proxy), /Proxy environment changed/);
  assert.deepEqual(verifyProbe(probe, probe.plan), proxy);
});
test('a forged probe, edited receipt, resealed plan, or different identity is rejected', () => {
  const probe = loadRetainedProbe();
  const record = JSON.parse(probe.rawRecordBytes);
  const forged = JSON.stringify({...record, simulation: true});
  const result = JSON.parse(probe.rawResultBytes);
  assert.throws(() => verifyProbe({...probe, rawRecordBytes: forged,
    rawResultBytes: JSON.stringify({...result, rawRecordSha256: digest(forged)})}, probe.plan), /raw probe record/);
  assert.throws(() => verifyProbe({...probe, rawResultBytes: probe.rawResultBytes + ' '}, probe.plan), /probe verdict/);
  const {sha256, ...plan} = probe.plan;
  plan.transport = {...plan.transport, stopOnObservedRetry: false};
  assert.throws(() => verifyProbe({...probe, plan: {...plan, sha256: digest(JSON.stringify(plan))}}, probe.plan), /probe anchor/);
  assert.throws(() => verifyProbe(probe, {...probe.plan, effort: 'high'}), /identity differs/);
  assert.throws(() => verifyProbe(probe, {...probe.plan, toolchain: {}}), /deep-equal/);
});
test('registration anchor and explicit live mode are required', async t => {
  const sealed = simulation('success');
  assert.throws(() => validateRegistration(sealed, 'wrong'), /anchor/);
  const out = path.join(temp(t), 'never');
  await assert.rejects(execute(sealed, sealed.sha256, out, {live: true}), /Explicit live flag/);
  assert(!fs.existsSync(out));
});
test('full v5 simulation preserves 324 records, packets, and frozen-rubric reporting',
  {skip: process.platform !== 'darwin'}, async t => {
    const sealed = simulation('success');
    const out = path.join(temp(t), 'run');
    const summary = await execute(sealed, sealed.sha256, out);
    assert.equal(summary.completed, 324);
    assert.equal(summary.observedTokens, 32400);
    assert.equal(summary.notRun, 0);
    const run = readRun(out);
    assert(run.records.every(row => row.record.scope === 'health-transport-v3'));
    const reviewed = packets(run).packets.map(packet => ({
      responseId: packet.responseId,
      review: {
        answerSha256: packet.answerSha256, reviewer: 'Offline control', assessment: 'no-answer',
        labelBasis: 'Synthetic fixture has no semantic diagnosis', novelFindings: [], issues: [], criteria: [], evidence: [], falseDefectClaims: [], otherUnsupportedClaims: [], pendingClaims: [],
      },
    }));
    assert.equal(reviewed.length, 324);
    const report = assessRun(run, reviewed);
    assert.deepEqual(report.results.arms.map(arm => arm.reviewed), [108, 108, 108]);
    assert.equal(Object.keys(report.results.bySkill).length, 6);
    await assert.rejects(execute(sealed, sealed.sha256, out), /Fresh/);
    fs.appendFileSync(path.join(out, run.records[0].raw), ' ');
    assert.throws(() => readRun(out), /Raw record tampered/);
  });
for (const [mode, stop, failed, budget] of [
  ['retry', 'transport-retry', 1, {}],
  ['wrong-model', 'execution-failure', 1, {}],
  ['unknown-usage', 'usage-unavailable', 0, {}],
  ['success', 'budget', 0, {observedTokens: 100}],
]) {
  test(`v5 stops after one turn on ${stop}`, {skip: process.platform !== 'darwin'}, async t => {
    const sealed = simulation(mode, budget);
    const out = path.join(temp(t), 'run');
    const result = await execute(sealed, sealed.sha256, out);
    assert.equal(result.attempted, 1);
    assert.equal(result.failed, failed);
    assert.equal(result.stopped, stop);
    assert.equal(result.notRun, 323);
    const run = readRun(out);
    if (mode === 'retry') {
      assert.equal(run.records[0].record.transport_retry_observed, true);
      assert(run.records[0].record.cleanup.group_absent);
    }
  });
}

test('the new collector does not admit an arbitrary re-sealed live freeze or budget',()=>{const f=freeze();const probe=loadRetainedProbe();const base={frozen:f,freezeAnchor:'wrong',model:'gpt-6.1-terra',effort:'low',cliVersion:'0.167.1',executable:process.execPath,assessor:'offline admission only',budget:{calls:324,observedTokens:12000000,totalMs:43200000,turnMs:120000},probe};assert.throws(()=>register(base),/anchor/);});

test('execute-time validation rechecks guidance and fixture source bytes',()=>{const sealed=simulation('success');sealed.frozen.protocol.sourceHashes['public-contract.md']='0'.repeat(64);sealed.frozen.sha256=digest(JSON.stringify(sealed.frozen.protocol));const {sha256,...body}=sealed;sealed.sha256=digest(JSON.stringify(body));assert.throws(()=>validateRegistration(sealed,sealed.sha256),/Frozen guidance or fixture changed/);});
