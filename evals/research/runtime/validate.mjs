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
  assert.equal(manifest.revision, 2);
  assert(nonempty(manifest.provenance));
  assert.deepEqual(manifest.cases.map((c) => c.id), ['RT-01', 'RT-02', 'RT-03', 'RT-04']);
  for (const entry of manifest.cases) {
    assert.equal(entry.revision, 1);
    assert.equal(entry.kind, ['RT-01', 'RT-03'].includes(entry.id) ? 'defect' : 'protected');
    assert.equal(entry.task, `${entry.id}/task.md`);
    assert.equal(entry.context, `${entry.id}/context.md`);
    assert.equal(entry.rubric, `${entry.id}/rubric.json`);
    const retries = ['RT-03', 'RT-04'].includes(entry.id);
    assert.deepEqual(entry.inputs, [entry.task, entry.context, `${entry.id}/service.mjs`,
      'shared/clock.mjs', 'shared/request-boundary.mjs',
      ...(retries ? ['shared/retry.mjs', 'shared/retry-transport.mjs'] : ['shared/transport.mjs'])]);
    // This whitelist deliberately excludes answer rubrics, tests, and the manifest.
    for (const input of entry.inputs) assert(nonempty(read(input)), `Empty input: ${input}`);
    if (retries) {
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
      assert.equal(finding.id, retries ? 'RT-03-retry-amplification' : 'RT-01-cancellation-gap');
      assert.deepEqual(finding.allowedSeverities, ['Warning']);
      for (const field of ['symptom', 'source', 'consequence', 'remedy', 'grading']) assert(nonempty(finding[field]));
      assert(Array.isArray(finding.requiredEvidence) && finding.requiredEvidence.length > 0);
      assert(finding.requiredEvidence.every(nonempty));
    } else {
      assert.equal(rubric.expectedFindings.length, 0);
      assert(rubric.protectedReasoning.length > 0 && rubric.protectedReasoning.every(nonempty));
    }
  }
  return manifest;
}
