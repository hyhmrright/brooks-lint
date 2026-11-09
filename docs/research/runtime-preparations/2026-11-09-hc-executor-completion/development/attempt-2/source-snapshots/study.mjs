/** Offline frozen-candidate adapter. Never executes a model or imported code. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sha256, readSafe, validateCandidates } from '../candidate-holdouts/validate.mjs';
import { compareTriplets, validateExample } from '../calibration/scoring.mjs';
export const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arms = ['A', 'B', 'C'];
const statuses = ['executed', 'failed', 'interrupted', 'not-run'];
const text = x => typeof x === 'string' && x.trim().length > 0;
const json = x => JSON.stringify(x);
const clone = x => JSON.parse(json(x));
export const digest = x => sha256(json(x));
const exact = (o, keys) => assert.deepEqual(Object.keys(o).sort(), keys.sort(), 'Unexpected or missing fields');
const unique = xs => assert.equal(new Set(xs).size, xs.length, 'Duplicate identity');
const blob = (name, content) => ({ path: name, content, sha256: sha256(content) });
const snapshot = name => blob(name, readFileSync(path.join(repo, name), 'utf8'));
function blobs(files) { unique(files.map(f => f.path)); for (const f of files) { exact(f, ['path', 'content', 'sha256']); assert(text(f.path) && typeof f.content === 'string'); assert.equal(f.sha256, sha256(f.content), `Snapshot drift: ${f.path}`); } }
function coreNames(dir = 'skills') {
  return readdirSync(path.join(repo, dir)).sort().flatMap(name => {
    const rel = `${dir}/${name}`, st = lstatSync(path.join(repo, rel));
    assert(!st.isSymbolicLink(), 'Guidance symlink forbidden');
    return st.isDirectory() ? coreNames(rel) : name.endsWith('.md') ? [rel] : [];
  });
}
export const schema = {
  revision: 1, protocol: 'runtime-scoring-protocol-v1', prototype_revision: 2,
  arms: { A: 'supplied case only; no skills', B: 'supplied case plus core skills', C: 'supplied case plus core skills and runtime prototype revision 2' },
  execution_statuses: statuses,
  annotation_schema: 'calibration/scoring.mjs validateExample; semantic labels supplied by reviewer, not inferred',
  safety_boundary: 'offline-only; no live execution or authorization; exposed non-independent candidates',
};
function seal(study) { return { study, study_sha256: digest(study) }; }
/** Fresh plan freezes bytes; no current model identity is assumed or tested. */
export function createPlan({ case_ids = ['HC-01','HC-02','HC-03','HC-04','HC-05','HC-06','HC-07','HC-08','HC-09'], repetitions = 3, study_id, intended_model, reasoning, author, exposure } = {}) {
  assert(text(study_id) && text(intended_model) && text(reasoning) && text(author) && text(exposure), 'Plan provenance required');
  assert(Number.isSafeInteger(repetitions) && repetitions > 0 && repetitions <= 100);
  assert(Array.isArray(case_ids) && case_ids.length); unique(case_ids);
  const manifest = validateCandidates();
  const cases = case_ids.map(id => {
    const c = manifest.cases.find(c => c.id === id); assert(c, 'Unknown candidate');
    return { id, kind: c.kind, inputs: c.inputs.map(p => blob(p, readSafe(p).toString())), rubric: blob(c.rubric, readSafe(c.rubric).toString()) };
  });
  const study = {
    revision: 1, adapter: 'offline-candidate-study-v1', study_id, intended_model, reasoning, author, exposure,
    status: 'prepared-offline-only', independent: false, private_custody: false, human_review: 'pending', book_mapping: 'unverified',
    schema: clone(schema), manifest: snapshot('evals/research/runtime/candidate-holdouts/cases.json'),
    protocol: snapshot('docs/research/runtime-scoring-protocol.md'), scorer: snapshot('evals/research/runtime/calibration/scoring.mjs'),
    adapter_source: snapshot('evals/research/runtime/prospective/study.mjs'),
    core: coreNames().map(snapshot),
    prototype: ['SKILL.md', 'runtime-guide.md'].map(p => snapshot(`evals/research/runtime/prototype/${p}`)),
    cases, schedule: cases.flatMap(c => Array.from({ length: repetitions }, (_, i) => ({ case_id: c.id, repetition: i + 1 }))),
  };
  return validatePlan(seal(study));
}
/** trustedDigest is an out-of-band anchor, not a signature or authenticity proof. */
export function validatePlan(plan, trustedDigest = plan.study_sha256) {
  exact(plan, ['study', 'study_sha256']); assert.equal(plan.study_sha256, trustedDigest, 'Trusted plan mismatch');
  assert.equal(digest(plan.study), plan.study_sha256, 'Plan drift');
  const s = plan.study;
  exact(s, ['revision','adapter','study_id','intended_model','reasoning','author','exposure','status','independent','private_custody','human_review','book_mapping','schema','manifest','protocol','scorer','adapter_source','core','prototype','cases','schedule']);
  assert.equal(s.revision, 1); assert.equal(s.adapter, 'offline-candidate-study-v1');
  assert.equal(s.status, 'prepared-offline-only'); assert.equal(s.independent, false); assert.equal(s.private_custody, false);
  assert.equal(s.human_review, 'pending'); assert.equal(s.book_mapping, 'unverified'); assert.deepEqual(s.schema, schema);
  for (const key of ['study_id','intended_model','reasoning','author','exposure']) assert(text(s[key]));
  blobs([s.manifest, s.protocol, s.scorer, s.adapter_source]); blobs(s.core); blobs(s.prototype);
  assert.equal(s.protocol.path, 'docs/research/runtime-scoring-protocol.md');
  assert.equal(s.scorer.path, 'evals/research/runtime/calibration/scoring.mjs');
  assert.equal(s.adapter_source.path, 'evals/research/runtime/prospective/study.mjs');
  // The local arithmetic implementation must be the one frozen, never eval imported code.
  assert.equal(s.scorer.sha256, snapshot(s.scorer.path).sha256, 'Scorer implementation changed; use versioned adapter');
  assert.equal(s.adapter_source.sha256, snapshot(s.adapter_source.path).sha256, 'Adapter implementation changed; use versioned adapter');
  assert.equal(s.manifest.path, 'evals/research/runtime/candidate-holdouts/cases.json');
  const m = JSON.parse(s.manifest.content);
  assert.equal(m.independent, false); assert.equal(m.privateCustody, false); assert.equal(m.liveRunnerIntegration, false);
  assert.equal(m.status, 'exposed-development-candidates'); assert.equal(m.humanReview, 'pending'); assert.equal(m.bookMapping, 'unverified');
  assert.equal(s.prototype.length, 2); assert.deepEqual(s.prototype.map(f => f.path), ['SKILL.md','runtime-guide.md'].map(p => `evals/research/runtime/prototype/${p}`));
  assert(s.prototype[0].content.includes('research/revision: "2"'));
  assert(s.core.length > 0 && s.core.every(f => /^skills\/(?:brooks-(?:review|audit|debt|test|health|sweep)|_shared)\/[\w-]+\.md$/.test(f.path)), 'Unexpected core snapshot');
  unique(s.cases.map(c => c.id)); assert(s.cases.length > 0);
  for (const c of s.cases) {
    exact(c, ['id','kind','inputs','rubric']); const entry = m.cases.find(x => x.id === c.id); assert(entry, 'Unknown frozen case');
    assert(/^HC-0[1-9]$/.test(c.id)); assert.equal(c.kind, ['defect','protected','unresolved'][(Number(c.id.slice(3))-1)%3]);
    const whitelist = [`${c.id}/service.mjs`, `${c.id}/context.md`, `${c.id}/task.md`, 'shared/controls.mjs'];
    assert.deepEqual(c.inputs.map(f => f.path), whitelist); assert.deepEqual(entry.inputs, whitelist); assert.equal(entry.kind, c.kind);
    assert.equal(c.rubric.path, `${c.id}/rubric.json`); blobs([...c.inputs, c.rubric]);
    const r = JSON.parse(c.rubric.content); assert.equal(r.caseId, c.id); assert.equal(r.assessment, c.kind);
    rubricExample(c, '', 'not-run', null);
  }
  assert(s.schedule.length > 0); unique(s.schedule.map(p => `${p.case_id}/${p.repetition}`));
  for (const p of s.schedule) { exact(p, ['case_id','repetition']); assert(s.cases.some(c => c.id === p.case_id)); assert(Number.isSafeInteger(p.repetition) && p.repetition > 0); }
  assert(s.cases.every(c => s.schedule.some(p => p.case_id === c.id)), 'Unscheduled case');
  return plan;
}
function rubricExample(c, answer, execution_status, annotation) {
  const rubric = JSON.parse(c.rubric.content);
  return validateExample({ id: c.id, case_kind: c.kind, case_facts: json(c.inputs), expected_issue_ids: rubric.expectedFindings.map(f => f.id), evidence_requirements: rubric.evidenceRequirements,
    allowed_severities: Object.fromEntries(rubric.expectedFindings.map(f => [f.id, f.allowedSeverity])), answer, execution_status, annotation, rationale: 'Frozen candidate rubric; semantic review provenance stored separately.' });
}
const key = r => `${r.case_id}/${r.repetition}/${r.arm}`;
export function responseTemplate(plan, trustedDigest) {
  validatePlan(plan, trustedDigest);
  return { plan_sha256: plan.study_sha256, records: plan.study.schedule.flatMap(p => arms.map(arm => ({ ...p, arm, execution_status: 'not-run', answer: '', answer_sha256: sha256(''), model_report: null, execution_evidence: null, review: null }))) };
}
export function validateResponses(plan, data, trustedDigest) {
  assert(text(trustedDigest), 'External trusted plan digest required'); validatePlan(plan, trustedDigest);
  exact(data, ['plan_sha256','records']); assert.equal(data.plan_sha256, trustedDigest, 'Response plan mismatch');
  assert(Array.isArray(data.records)); unique(data.records.map(key));
  for (const r of data.records) {
    exact(r, ['case_id','repetition','arm','execution_status','answer','answer_sha256','model_report','execution_evidence','review']);
    assert(arms.includes(r.arm) && plan.study.schedule.some(p => p.case_id === r.case_id && p.repetition === r.repetition), 'Unplanned response');
    assert(statuses.includes(r.execution_status), 'Unsupported execution status'); assert.equal(typeof r.answer, 'string'); assert.equal(r.answer_sha256, sha256(r.answer), 'Answer drift');
    if (r.execution_status === 'not-run') { assert.equal(r.answer, ''); assert.equal(r.model_report, null); assert.equal(r.execution_evidence, null); }
    else {
      assert(r.model_report); exact(r.model_report, ['model','reasoning','source']); assert(Object.values(r.model_report).every(text), 'Reported model provenance required');
      assert(r.execution_evidence); exact(r.execution_evidence, ['source','artifact_sha256','status_basis']); assert(text(r.execution_evidence.source) && /^[a-f0-9]{64}$/.test(r.execution_evidence.artifact_sha256) && text(r.execution_evidence.status_basis), 'Execution evidence required');
    }
    let annotation = null;
    if (r.review !== null) {
      assert.equal(r.execution_status, 'executed', 'Only successful turns may be reviewed');
      exact(r.review, ['reviewer','method','exposure','rationale','answer_sha256','annotation']);
      for (const field of ['reviewer','method','exposure','rationale']) assert(text(r.review[field]), 'Reviewer provenance required');
      assert.equal(r.review.answer_sha256, r.answer_sha256, 'Review answer mismatch'); annotation = r.review.annotation; assert(annotation, 'Review annotation required');
    }
    rubricExample(plan.study.cases.find(c => c.id === r.case_id), r.answer, r.execution_status, annotation);
  }
  return data;
}
/** Only whitelisted case bytes and arm-specific guidance; never rubric/metadata. */
export function turnInputs(plan, turn, trustedDigest) {
  validatePlan(plan, trustedDigest); exact(turn, ['case_id','repetition','arm']);
  assert(arms.includes(turn.arm) && plan.study.schedule.some(p => p.case_id === turn.case_id && p.repetition === turn.repetition), 'Unplanned turn');
  const c = plan.study.cases.find(c => c.id === turn.case_id);
  return clone({ inputs: c.inputs, guidance: turn.arm === 'A' ? [] : [...plan.study.core, ...(turn.arm === 'C' ? plan.study.prototype : [])] });
}
export function summarize(plan, responses, trustedDigest) {
  validateResponses(plan, responses, trustedDigest);
  const records = responses.records.map(r => ({ ...rubricExample(plan.study.cases.find(c => c.id === r.case_id), r.answer, r.execution_status, r.review?.annotation ?? null), id: key(r), case_id: r.case_id, repetition: r.repetition, arm: r.arm }));
  return { plan_sha256: trustedDigest, responses_sha256: digest(responses), status: 'annotation-based-offline-summary', independent: false, limitations: 'Reported execution/model provenance and reviewer annotations are not independently verified; repetitions are not independent cases.', ...compareTriplets(records, plan.study.schedule) };
}
/** Partial masking only: public source data, case text and guidance may reveal arm. */
export function reviewPackets(plan, responses, trustedDigest) {
  validateResponses(plan, responses, trustedDigest);
  const rows = responses.records.filter(r => r.execution_status === 'executed');
  // Hash sorting removes schedule order; deterministic IDs are not secret or truly blind.
  return { plan_sha256: trustedDigest, masking: 'partial; public answers/mapping accessible; no independence claim', packets: rows.map(r => ({ packet_id: sha256(`${trustedDigest}/${key(r)}`).slice(0, 24), answer: r.answer, answer_sha256: r.answer_sha256, inputs: plan.study.cases.find(c => c.id === r.case_id).inputs })).sort((a,b) => a.packet_id.localeCompare(b.packet_id)) };
}
