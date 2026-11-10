import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog, inputBundle, prepare } from './plan.mjs';

test('combined catalog preserves both frozen suites without admitting external labels', () => {
  const cases = catalog();
  assert.equal(cases.length, 54);
  assert.equal(new Set(cases.map(c => c.id)).size, 54);
  assert.equal(new Set(cases.map(c => c.family)).size, 18);
  assert.throws(() => inputBundle('grafana-1'), /not admitted/);
  assert.throws(() => inputBundle('BV-99'));
});
test('canonical input interface contains no evaluator envelope', () => {
  for (const id of ['HB-01', 'BV-01']) {
    const bundle = inputBundle(id);
    assert.deepEqual(Object.keys(bundle), ['files']);
    assert.equal(bundle.files.length, 5);
    for (const file of bundle.files) {
      assert.deepEqual(Object.keys(file), ['path', 'content']);
      assert.ok(!file.path.includes('/'));
      assert.ok(!file.content.includes('expectedFindings'));
    }
  }
});
test('schedule is reproducible, fully paired, randomized and explicitly not executable', () => {
  const plan = prepare();
  assert.deepEqual(prepare(), plan);
  assert.equal(plan.liveAuthorized, false);
  assert.equal(plan.model, null);
  assert.equal(plan.budget, null);
  assert.equal(plan.runnerAdapter, null);
  assert.ok(plan.cases.every(c => c.split === 'calibration'));
  assert.equal(plan.turnCount, plan.cases.length * 3);
  const identities = plan.turns.map(t => JSON.stringify(t));
  assert.equal(new Set(identities).size, identities.length);
  assert.notDeepEqual(prepare({ seed: 17 }).turns, plan.turns);
  const full = prepare({ split: 'all', repetitions: 3 });
  assert.equal(full.turnCount, 486);
  for (const c of full.cases) for (const arm of ['A', 'B', 'C']) {
    assert.equal(full.turns.filter(t => t.caseId === c.id && t.arm === arm).length, 3);
  }
  assert.throws(() => prepare({ repetitions: 0 }));
  assert.throws(() => prepare({ seed: 0 }));
  assert.throws(() => prepare({ split: 'external' }));
});
