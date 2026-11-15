import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {retainedScorer, restoreScorer, scorerPath, scorerSha256, selectedTest, root} from './archive-tests.mjs';
import {loadRetainedProbe, verifyProbe, register} from '../skills-benchmark-v2/campaign-v3.mjs';
import {freeze} from '../skills-benchmark-v2/suite.mjs';

test('historical scorer is byte-pinned; unknown hashes, corruption and checkout writes reject', t => {
  assert(retainedScorer().length > 1000);
  assert.throws(() => retainedScorer(Buffer.from('tampered')), /snapshot changed/);
  assert.throws(() => restoreScorer(root), /current checkout/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brooks-scorer-snapshot-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.mkdirSync(path.dirname(path.join(dir, scorerPath)), {recursive: true});
  fs.writeFileSync(path.join(dir, scorerPath), 'new implementation');
  assert.throws(() => restoreScorer(dir, 'unknown'), /Unknown historical scorer/);
  restoreScorer(dir);
  assert.deepEqual(fs.readFileSync(path.join(dir, scorerPath)), retainedScorer());
  assert.equal(scorerSha256, loadRetainedProbe().plan.sources[scorerPath]);
});
test('historical groups allow only fixed offline suites', () => {
  assert(selectedTest('v3').endsWith('/campaign-v3.test.mjs'));
  assert(selectedTest('scope').endsWith('/retest.test.mjs'));
  for (const value of ['../outside', '__proto__', 'constructor', '--live']) assert.throws(() => selectedTest(value));
});
test('current collector rejects historical proof while current simulation binds current scorer', () => {
  const probe = loadRetainedProbe();
  assert.throws(() => verifyProbe(probe, probe.plan), /Probe source changed/);
  const frozen = freeze();
  const registration = register({
    frozen, freezeAnchor: frozen.sha256, model: 'gpt-fixture', effort: 'low', cliVersion: '0.167.1',
    executable: process.execPath, assessor: 'Offline source-isolation regression', simulation: true,
    budget: {calls: 108, observedTokens: 100000, totalMs: 120000, turnMs: 2000},
    offline: {fixtureEndpoint: 'http://127.0.0.1:1/v1', prefixArgs: [path.join(root, 'evals/research/health-transport-v3/fake-cli.cjs'), 'success']},
  });
  assert.notEqual(registration.sourceHashes[scorerPath], scorerSha256);
});
