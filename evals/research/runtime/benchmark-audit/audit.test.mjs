import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { audit } from './audit.mjs';

test('saved inventory matches every frozen local case and pinned external source', () => {
  const actual = audit();
  assert.deepEqual(actual, JSON.parse(readFileSync(new URL('./inventory.json', import.meta.url))));
  assert.equal(actual.existing.totals.cases, 36);
  assert.equal(actual.existing.familyCount, 12);
  assert.equal(new Set(actual.existing.cases.map(c => c.id)).size, 36);
  assert.equal(actual.external.admittedCount, 0);
  assert.ok(actual.external.candidateCount > 0);
  for (const c of actual.external.candidates) {
    assert.equal(c.runnable, false);
    assert.equal(c.status, 'quarantined-candidate');
    assert.ok(c.missing.includes('verified-reviewed-revision'));
  }
});
