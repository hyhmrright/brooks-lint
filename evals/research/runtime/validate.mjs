import assert from 'node:assert/strict';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const fixtureRoot = dirname(fileURLToPath(import.meta.url));
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;

/** Structural validation only; does not judge semantic correctness of a report. */
export function validateManifest(root = fixtureRoot) {
  root = realpathSync(root);
  const read = (name) => {
    assert(nonempty(name) && !isAbsolute(name) && !name.split('/').includes('..'), `Unsafe input path: ${name}`);
    const path = realpathSync(resolve(root, name));
    const rel = relative(root, path);
    assert(rel && !rel.startsWith('..') && !isAbsolute(rel), `Path escapes fixture root: ${name}`);
    assert(statSync(path).isFile(), `Not a file: ${name}`);
    return readFileSync(path, 'utf8');
  };
  const manifest = JSON.parse(read('cases.json'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.revision, 6);
  assert(nonempty(manifest.provenance));
  assert.deepEqual(manifest.cases.map((c) => c.id), ['RT-01', 'RT-02', 'RT-03', 'RT-04', 'RT-05', 'RT-06', 'RT-07', 'RT-08', 'RT-09', 'RT-10', 'RT-11', 'RT-12', 'RT-13', 'RT-14', 'RT-15', 'RT-16']);
  for (const entry of manifest.cases) {
    assert.equal(entry.revision, 1);
    const unresolved = ['RT-07', 'RT-08', 'RT-13', 'RT-16'].includes(entry.id);
    const deadline = ['RT-11', 'RT-12', 'RT-13'].includes(entry.id);
    const expiry = ['RT-14', 'RT-15', 'RT-16'].includes(entry.id);
    const batch = entry.id === 'RT-09';
    const syntax = entry.id === 'RT-10';
    assert.equal(entry.kind, syntax ? 'non-trigger' : unresolved ? 'unresolved' : ['RT-01', 'RT-03', 'RT-05', 'RT-11', 'RT-14'].includes(entry.id) ? 'defect' : 'protected');
    assert.equal(entry.task, `${entry.id}/task.md`);
    assert.equal(entry.context, `${entry.id}/context.md`);
    assert.equal(entry.rubric, `${entry.id}/rubric.json`);
    const isolation = ['RT-05', 'RT-06'].includes(entry.id);
    const retries = ['RT-03', 'RT-04'].includes(entry.id);
    assert.deepEqual(entry.inputs, deadline ? [entry.task, entry.context, `${entry.id}/service.mjs`, 'shared/clock.mjs', 'shared/deadline-stages.mjs'] : expiry ? [entry.task, entry.context, `${entry.id}/service.mjs`, ...(entry.id === 'RT-16' ? [] : ['shared/clock.mjs', 'shared/expiring-queue.mjs']), 'shared/worker-pool.mjs', 'shared/optional-work.mjs'] : batch || syntax ? [entry.task, entry.context, `${entry.id}/service.mjs`, ...(batch ? ['shared/clock.mjs'] : [])] : unresolved ? [entry.task, entry.context, `${entry.id}/service.mjs`, ...(entry.id === 'RT-08' ? ['shared/retry.mjs'] : [])] : [entry.task, entry.context, `${entry.id}/service.mjs`,
      ...(isolation ? ['shared/worker-pool.mjs', 'shared/optional-work.mjs'] : [
        'shared/clock.mjs', 'shared/request-boundary.mjs',
        ...(retries ? ['shared/retry.mjs', 'shared/retry-transport.mjs'] : ['shared/transport.mjs'])])]);
    // This whitelist deliberately excludes answer rubrics, tests, and the manifest.
    for (const input of entry.inputs) assert(nonempty(read(input)), `Empty input: ${input}`);
    if (deadline || expiry) {
      const expected = {
        'RT-11': {"atTotalBoundary": {"response": "pending", "active": 1, "timers": 2, "time": 100}, "settled": {"response": "ok", "time": 140, "active": 0, "timers": 0}},
        'RT-12': {"atTotalBoundary": {"response": "timed-out", "active": 0, "timers": 0, "time": 100}, "settled": {"response": "timed-out", "time": 100, "active": 0, "timers": 0}},
        'RT-13': {"assessment": "unresolved", "countermodels": {"uncovered": {"response": "timed-out", "time": 140, "withinBudget": false}, "permitted": {"response": "timed-out", "time": 140, "withinBudget": true}, "outerBounded": {"response": "timed-out", "time": 100, "withinBudget": true}}},
        'RT-14': {"afterExpiry": {"queued": 2, "started": 1}, "afterRelease": {"started": 2, "expiredStarted": true, "next": "B"}},
        'RT-15': {"afterExpiry": {"queued": 1, "started": 1}, "afterRelease": {"started": 2, "expiredStarted": false, "next": "C"}},
        'RT-16': {"assessment": "unresolved", "countermodels": {"requestOwned": {"started": 2, "lateStart": true, "withinContract": false}, "durableJob": {"started": 2, "lateStart": true, "withinContract": true}}},
      };
      assert.deepEqual(entry.expected, expected[entry.id]);
    } else if (batch) {
      assert.deepEqual(entry.expected, { finiteBatch: {
        response: 'completed', processed: 5, failed: 0, maxActive: 2, active: 0, timers: 0, logicalTime: 3000,
      } });
    } else if (syntax) {
      assert.deepEqual(entry.expected, { assessment: 'task-only', examples: { priced: 17, missing: 0, undefined: 0, null: null }, rejection: 'propagated' });
    } else if (unresolved) {
      assert.deepEqual(entry.expected, { assessment: 'unresolved', countermodels: entry.id === 'RT-07' ? {
        cancellable: { response: 'timed-out', active: 0 }, ignoresAbort: { response: 'timed-out', active: 1 },
      } : {
        singleOwner: { started: 3, budget: 3, withinBudget: true },
        nestedOwners: { started: 9, budget: 3, withinBudget: false },
        permittedNestedOwners: { started: 9, budget: 9, withinBudget: true },
      } });
    } else if (isolation) {
      const shared = entry.id === 'RT-05';
      assert.deepEqual(entry.expected, { saturated: {
        optionalStarted: shared ? 2 : 1, optionalActive: shared ? 2 : 1,
        optionalQueued: shared ? 2 : 1, optionalOverloaded: shared ? 1 : 3,
        essential: shared ? 'overloaded' : 'ok',
      } });
    } else if (retries) {
      const attempts = entry.id === 'RT-03' ? 9 : 3;
      assert.deepEqual(entry.expected, {
        allTransientFailures: { response: 'error', started: attempts, failed: attempts, active: 0, timers: 0, listeners: 0 },
        deadlineAfterTwoFailures: { response: 'timed-out', started: 3, failed: 2, aborted: 1, active: 0, timers: 0, listeners: 0 },
      });
    } else {
      assert.deepEqual(entry.expected.beforeDeadline, {
        response: 'pending', active: 1, aborted: false, timers: 1,
        listeners: entry.id === 'RT-01' ? 0 : 1,
      });
      assert.deepEqual(entry.expected.atDeadline, {
        response: 'timed-out', active: entry.id === 'RT-01' ? 1 : 0,
        aborted: true, timers: 0, listeners: 0,
      });
    }
    const rubric = JSON.parse(read(entry.rubric));
    assert.equal(rubric.caseId, entry.id);
    assert.equal(rubric.revision, entry.revision);
    assert(nonempty(rubric.assessment) && nonempty(rubric.coreOverlap));
    for (const field of ['human', 'agent', 'bookMapping']) assert(nonempty(rubric.reviewStatus[field]));
    assert(Array.isArray(rubric.forbiddenClaims) && rubric.forbiddenClaims.length > 0);
    assert(rubric.forbiddenClaims.every(nonempty));
    assert(Array.isArray(rubric.evidence) && rubric.evidence.length > 0);
    for (const ref of rubric.evidence) {
      assert(entry.inputs.includes(ref.file), `Evidence outside visible inputs: ${ref.file}`);
      assert(nonempty(ref.anchor) && read(ref.file).includes(ref.anchor), `Missing anchor: ${ref.file}`);
    }
    assert(Array.isArray(rubric.expectedFindings));
    assert(Array.isArray(rubric.protectedReasoning));
    if (entry.kind === 'defect') {
      assert.equal(rubric.expectedFindings.length, 1);
      const finding = rubric.expectedFindings[0];
      assert.equal(finding.id, deadline ? 'RT-11-deadline-coverage' : expiry ? 'RT-14-expired-queue-work' : isolation ? 'RT-05-shared-capacity-contention' : retries ? 'RT-03-retry-amplification' : 'RT-01-cancellation-gap');
      assert.deepEqual(finding.allowedSeverities, ['Warning']);
      for (const field of ['symptom', 'source', 'consequence', 'remedy', 'grading']) assert(nonempty(finding[field]));
      assert(Array.isArray(finding.requiredEvidence) && finding.requiredEvidence.length > 0);
      assert(finding.requiredEvidence.every(nonempty));
    } else if (syntax) {
      assert.equal(rubric.assessment, 'task-only');
      assert.equal(rubric.routing, 'do-not-activate');
      assert.deepEqual(rubric.expectedFindings, []);
      assert.deepEqual(rubric.protectedReasoning, []);
      assert(Array.isArray(rubric.completionReasoning) && rubric.completionReasoning.length >= 4);
      assert(rubric.completionReasoning.every(nonempty));
    } else if (unresolved) {
      assert.equal(rubric.assessment, 'unresolved');
      assert.deepEqual(rubric.expectedFindings, []);
      assert.deepEqual(rubric.protectedReasoning, []);
      assert(Array.isArray(rubric.unresolvedReasoning) && rubric.unresolvedReasoning.length >= 3);
      assert(rubric.unresolvedReasoning.every(nonempty));
      assert.deepEqual(rubric.missingContext.map((item) => item.id), entry.id === 'RT-13' ? ['caller-budget', 'outer-boundary', 'usefulness-contract'] : entry.id === 'RT-16' ? ['work-ownership', 'expiry-policy', 'runtime-trace'] : entry.id === 'RT-07'
        ? ['caller-contract', 'transport-semantics', 'runtime-evidence']
        : ['outer-owners', 'transport-attempts', 'request-budget']);
      for (const item of rubric.missingContext) {
        assert(nonempty(item.artifact) && nonempty(item.whyItMatters));
      }
    } else {
      assert.equal(rubric.expectedFindings.length, 0);
      assert(rubric.protectedReasoning.length > 0 && rubric.protectedReasoning.every(nonempty));
    }
  }
  return manifest;
}
