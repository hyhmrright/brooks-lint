/** Offline archive verification; checks evidence integrity/arithmetic, not semantic truth. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { summarize, digest } from '../../../../../evals/research/runtime/prospective/study.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../../..');
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const plan = read(path.join(root, 'docs/research/runtime-preparations/2026-11-06-hc-human-review/plan.json'));
const trusted = 'bade5c6cc86db0ea02dd32d6f22adb970374db427d757a4a3535258eb912996b';
const sourcePath = path.resolve(here, '../run/responses.json');
const source = read(sourcePath);
const reviewed = read(path.join(here, 'responses.json'));
assert.equal(reviewed.records.length, 81);
assert.equal(source.records.length, 81);
assert.equal(reviewed.plan_sha256, source.plan_sha256);
const key = r => `${r.case_id}/${r.repetition}/${r.arm}`;
const originals = new Map(source.records.map(r => [key(r), r]));
const usage = Object.fromEntries(['A','B','C'].map(a => [a, {input:0, output:0, total:0, reasoning_output:0}]));
for (const row of reviewed.records) {
  const original = originals.get(key(row));
  assert(original, 'Unexpected turn');
  assert.equal(original.review, null);
  assert(row.review, 'Pending review');
  assert.deepEqual({...row, review: null}, original, 'Execution/answer mutation');
  const rawPath = path.resolve(here, '../run', row.execution_evidence.source);
  assert.equal(sha(readFileSync(rawPath)), row.execution_evidence.artifact_sha256);
  const raw = read(rawPath);
  const answer = readFileSync(path.join(path.dirname(rawPath), 'answer.txt'), 'utf8');
  assert.equal(answer, row.answer);
  assert.equal(raw.answer, answer);
  assert.equal(sha(answer), row.answer_sha256);
  assert.equal(row.review.answer_sha256, row.answer_sha256);
  assert.equal(raw.cli_selected_model, 'gpt-6.1-terra');
  assert.equal(raw.cli_selected_effort, 'medium');
  assert.equal(raw.cleanup.group_absent, true);
  assert.equal(raw.cleanup.private_home_removed, true);
  const u = raw.usage.total;
  usage[row.arm].input += u.inputTokens;
  usage[row.arm].output += u.outputTokens;
  usage[row.arm].total += u.totalTokens;
  usage[row.arm].reasoning_output += u.reasoningOutputTokens;
}
const summary = summarize(plan, reviewed, trusted);
assert.deepEqual(summary, read(path.join(here, 'summary.json')), 'Summary drift');
const first = read(path.join(here, 'first-pass-reviews.json'));
assert.equal(first.source_responses_file_sha256, sha(readFileSync(sourcePath)));
assert.equal(first.plan_sha256, trusted);
assert.deepEqual(first.records, reviewed.records.map(r => ({response_id:key(r), review:r.review})));
const notes = read(path.join(here, 'notes.json'));
assert.equal(notes.records.length, 81);
assert.equal(new Set(notes.records.map(n => n.response_id)).size, 81);
const byId = new Map(reviewed.records.map(r => [key(r), r]));
for (const note of notes.records) {
  const row = byId.get(note.response_id);
  assert(row);
  assert.equal(note.answer_sha256, row.answer_sha256);
  assert(row.answer.includes(note.opening_excerpt));
  assert.equal(note.rationale, row.review.rationale);
  assert.deepEqual(note.evidence, row.review.annotation.evidence);
}
const sensitivity = read(path.join(here, 'sensitivity.json'));
assert.equal(sensitivity.primary_responses_sha256, digest(reviewed));
const alternativeMisses = reviewed.records.filter(r => r.review.annotation.evidence.some(e => e.id === 'alternative-judgments' && !e.met)).map(key);
const contrastMisses = reviewed.records.filter(r => r.review.annotation.evidence.some(e => e.id === 'contrast-control' && !e.met)).map(key);
assert.deepEqual(sensitivity.changed_evidence_only, alternativeMisses);
assert.deepEqual(sensitivity.unchanged_contrast_omissions, contrastMisses);
const relaxed = structuredClone(reviewed);
for (const row of relaxed.records) for (const e of row.review.annotation.evidence) {
  if (e.id === 'alternative-judgments') e.met = true;
}
const relaxedSummary = summarize(plan, relaxed, trusted);
for (const arm of ['A','B','C']) {
  for (const axis of ['evidence_requirements','evidence_complete_responses']) {
    assert.deepEqual(sensitivity.primary[arm][axis], summary.paired[arm][axis]);
    assert.deepEqual(sensitivity.permissive[arm][axis], relaxedSummary.paired[arm][axis]);
  }
  const stripEvidence = ({evidence_requirements, evidence_complete_responses, ...rest}) => rest;
  assert.deepEqual(stripEvidence(summary.paired[arm]), stripEvidence(relaxedSummary.paired[arm]));
  assert.deepEqual(summary.paired[arm], summary.individual[arm]);
}
assert.equal(summary.complete_triplets, 27);
assert.deepEqual(summary.excluded_triplets, []);
console.log(JSON.stringify({status:'PASS', model_calls:0, raw_answers_verified:81,
  original_responses_sha256:sha(readFileSync(sourcePath)),
  reviewed_responses_sha256:sha(readFileSync(path.join(here, 'responses.json'))),
  summary_sha256:sha(readFileSync(path.join(here, 'summary.json'))),
  usage_by_arm:usage,
  scope:'Exact execution preservation, hashes, frozen schema, quote substrings and deterministic summary; not independent semantic validation.'}, null, 2));
