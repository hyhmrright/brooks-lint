import assert from 'node:assert/strict';
import { readFileSync, lstatSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
export const root = path.dirname(fileURLToPath(import.meta.url));
export const sha256 = text => createHash('sha256').update(text).digest('hex');
export function readSafe(relative, directory = root) {
  assert(typeof relative === 'string' && relative && !path.isAbsolute(relative) && !relative.includes('\\'), 'Relative path required');
  const parts = relative.split('/'); assert(parts.every(p => p && p !== '.' && p !== '..'), 'Unsafe path component');
  let current = directory;
  for (const part of parts) { current = path.join(current, part); assert(!lstatSync(current).isSymbolicLink(), 'Symlink prohibited'); }
  assert(lstatSync(current).isFile(), 'Regular file required');
  assert(realpathSync(current).startsWith(`${realpathSync(directory)}${path.sep}`), 'Path escapes candidate root');
  return readFileSync(current);
}
export function validateCandidates(manifest = JSON.parse(readSafe('cases.json')), digests = JSON.parse(readSafe('digests.json'))) {
  assert.equal(manifest.revision, 1); assert.equal(manifest.status, 'exposed-development-candidates');
  assert.equal(manifest.independent, false); assert.equal(manifest.privateCustody, false); assert.equal(manifest.liveRunnerIntegration, false);
  assert.equal(manifest.humanReview, 'pending'); assert.equal(manifest.bookMapping, 'unverified');
  assert(typeof manifest.authorship === 'string' && manifest.authorship.length > 40);
  assert.deepEqual(manifest.cases.map(c => c.id), Array.from({length:9}, (_,i) => `HC-${String(i+1).padStart(2,'0')}`));
  const expectedFiles = new Set(['cases.json', 'shared/controls.mjs']);
  for (const [i, c] of manifest.cases.entries()) {
    assert.equal(c.revision, 1); assert.equal(c.kind, ['defect','protected','unresolved'][i % 3]);
    assert.equal(c.family, ['setup-cancellation','async-rejection','generation-release'][Math.floor(i / 3)]);
    const inputs = [`${c.id}/service.mjs`, `${c.id}/context.md`, `${c.id}/task.md`, 'shared/controls.mjs'];
    assert.deepEqual(c.inputs, inputs, 'Visible input whitelist changed'); assert.equal(c.rubric, `${c.id}/rubric.json`);
    const rubric = JSON.parse(readSafe(c.rubric));
    assert.equal(rubric.revision, 1); assert.equal(rubric.caseId, c.id); assert.equal(rubric.assessment, c.kind);
    assert.equal(rubric.expectedFindings.length, c.kind === 'defect' ? 1 : 0);
    assert.equal(new Set(rubric.evidenceRequirements.map(r => r.id)).size, 2); assert.equal(rubric.evidenceRequirements.length, 2);
    assert(rubric.evidenceRequirements.every(r => typeof r.description === 'string' && r.description.length > 20));
    if (c.kind === 'defect') for (const f of rubric.expectedFindings) {
      for (const key of ['id','symptom','source','consequence','remedy']) assert(typeof f[key] === 'string' && f[key]);
      assert.deepEqual(f.allowedSeverity, ['Warning']);
    }
    if (c.kind === 'unresolved') assert(rubric.missingContext.length > 0);
    for (const file of [...inputs, c.rubric]) { readSafe(file); expectedFiles.add(file); }
  }
  assert.deepEqual(Object.keys(digests).sort(), [...expectedFiles].sort(), 'Digest inventory mismatch');
  for (const [file, digest] of Object.entries(digests)) assert.equal(sha256(readSafe(file)), digest, `Digest mismatch: ${file}`);
  return manifest;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const manifest = validateCandidates(); console.log(`Validated ${manifest.cases.length} non-independent offline candidates; live integration disabled.`);
}
