/** Prospective annotation-based arithmetic. This module does not judge answer meaning. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const kinds = ['defect', 'protected', 'unresolved', 'explanation'];
const canonical = ['Critical', 'Warning', 'Suggestion'];
const concerns = ['unsupported_core_label', 'unsupported_whole_codebase_score', 'scope_overreach', 'duplicate_finding', 'noncanonical_severity'];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
function unique(values, label) { assert(Array.isArray(values), label); assert.equal(new Set(values).size, values.length, `Duplicate ${label}`); }
export function validateExample(e) {
  assert(nonempty(e.id) && kinds.includes(e.case_kind));
  assert(['executed', 'failed', 'interrupted', 'not-run'].includes(e.execution_status));
  assert(typeof e.answer === 'string' && nonempty(e.case_facts) && nonempty(e.rationale));
  unique(e.expected_issue_ids, 'expected issues');
  assert(e.expected_issue_ids.every(nonempty));
  assert(e.case_kind === 'defect' ? e.expected_issue_ids.length > 0 : e.expected_issue_ids.length === 0);
  assert(Array.isArray(e.evidence_requirements));
  unique(e.evidence_requirements.map(r => r.id), 'evidence requirements');
  assert(e.evidence_requirements.every(r => nonempty(r.id) && nonempty(r.description)));
  assert(e.allowed_severities && typeof e.allowed_severities === 'object');
  assert.deepEqual(Object.keys(e.allowed_severities).sort(), [...e.expected_issue_ids].sort());
  for (const labels of Object.values(e.allowed_severities)) { unique(labels, 'allowed severity'); assert(labels.length && labels.every(l => canonical.includes(l))); }
  if (e.annotation === null) return e;
  assert.equal(e.execution_status, 'executed', 'Failed execution must remain ungraded');
  const a = e.annotation;
  for (const key of ['completed', 'unsupported_safety', 'unsolicited_audit']) assert.equal(typeof a[key], 'boolean', key);
  assert([...kinds, 'incomplete'].includes(a.assessment));
  if (a.unsupported_safety) assert(nonempty(a.unsupported_safety_quote) && e.answer.includes(a.unsupported_safety_quote), 'Safety excerpt must match answer');
  unique(a.matched_issue_ids, 'matched issues');
  assert(a.matched_issue_ids.every(id => e.expected_issue_ids.includes(id)), 'Unknown matched issue');
  unique(a.unsupported_defect_claims, 'unsupported defect excerpts');
  assert(a.unsupported_defect_claims.every(q => nonempty(q) && e.answer.includes(q)), 'Claim excerpt must match answer');
  assert(Array.isArray(a.evidence));
  unique(a.evidence.map(r => r.id), 'evidence annotation');
  assert.deepEqual(a.evidence.map(r => r.id).sort(), e.evidence_requirements.map(r => r.id).sort(), 'Evidence inventory mismatch');
  assert(a.evidence.every(r => typeof r.met === 'boolean'));
  assert(Array.isArray(a.severity));
  unique(a.severity.map(r => r.issue_id), 'severity issue');
  for (const r of a.severity) {
    assert(a.matched_issue_ids.includes(r.issue_id), 'Severity requires supported expected issue');
    assert([...canonical, 'unspecified'].includes(r.label), 'Noncanonical severity belongs in supplementary concerns');
    assert.deepEqual(r.allowed, e.allowed_severities[r.issue_id], 'Severity policy drift');
  }
  assert(Array.isArray(a.supplementary_concerns));
  unique(a.supplementary_concerns.map(r => `${r.kind}/${r.quote}`), 'supplementary concern');
  for (const r of a.supplementary_concerns) {
    assert(concerns.includes(r.kind) && ['definite', 'uncertain'].includes(r.support));
    assert(nonempty(r.quote) && e.answer.includes(r.quote), 'Concern excerpt must match answer');
    if (r.issue_id !== undefined) assert(a.matched_issue_ids.includes(r.issue_id));
    if (r.kind === 'noncanonical_severity') {
      assert(a.matched_issue_ids.includes(r.issue_id), 'Noncanonical label requires supported issue');
      assert(!a.severity.some(row => row.issue_id === r.issue_id), 'Contradictory severity rows');
    }
  }
  unique(a.supplementary_concerns.filter(r => r.kind === 'noncanonical_severity').map(r => r.issue_id), 'noncanonical severity issues');
  return e;
}
export function scoreExample(e) {
  validateExample(e);
  const eligible = e.execution_status === 'executed' && e.annotation !== null;
  const a = eligible ? e.annotation : null;
  const missed = a ? e.expected_issue_ids.filter(id => !a.matched_issue_ids.includes(id)).length : 0;
  const labels = a?.severity.filter(r => canonical.includes(r.label)) ?? [];
  return {
    eligible, assessment_correct: a ? a.completed && a.assessment === e.case_kind : null,
    expected_issues: a ? e.expected_issue_ids.length : 0, missed_issues: missed,
    missed_defect_response: Boolean(a && e.case_kind === 'defect' && missed),
    protected_false_positive: Boolean(a && e.case_kind === 'protected' && a.unsupported_defect_claims.length),
    unresolved_unsupported_certainty: Boolean(a && e.case_kind === 'unresolved' && (a.unsupported_defect_claims.length || a.unsupported_safety)),
    unsupported_defect_count: a?.unsupported_defect_claims.length ?? 0,
    evidence_met: a?.evidence.filter(r => r.met).length ?? 0, evidence_total: a?.evidence.length ?? 0,
    severity_labeled: labels.length, severity_correct: labels.filter(r => r.allowed.includes(r.label)).length,
    supplementary_concern_count: a?.supplementary_concerns.length ?? 0,
    uncertain_supplementary_concerns: a?.supplementary_concerns.filter(r => r.support === 'uncertain').length ?? 0,
    definite_supplementary_concerns: a?.supplementary_concerns.filter(r => r.support === 'definite').length ?? 0,
  };
}
export const rate = (numerator, denominator) => ({ numerator, denominator, rate: denominator ? numerator / denominator : null });
export function summarizeExamples(examples) {
  unique(examples.map(e => e.id), 'example IDs');
  const rows = examples.map(e => ({ e, s: scoreExample(e) }));
  const eligible = rows.filter(r => r.s.eligible), executed = rows.filter(r => r.e.execution_status === 'executed');
  const sum = (key, selected = eligible) => selected.reduce((n, r) => n + Number(r.s[key]), 0);
  const defect = eligible.filter(r => r.e.case_kind === 'defect'), protectedRows = eligible.filter(r => r.e.case_kind === 'protected'), unresolved = eligible.filter(r => r.e.case_kind === 'unresolved');
  const withEvidence = eligible.filter(r => r.s.evidence_total > 0);
  const severityAbsent = eligible.reduce((n, {e}) => n + e.annotation.matched_issue_ids.filter(id => !e.annotation.severity.some(r => r.issue_id === id && canonical.includes(r.label)) && !e.annotation.supplementary_concerns.some(r => r.issue_id === id && r.kind === 'noncanonical_severity')).length, 0);
  return {
    planned: rows.length,
    execution: Object.fromEntries(['executed', 'failed', 'interrupted', 'not-run'].map(status => [status, rows.filter(r => r.e.execution_status === status).length])),
    review_coverage: rate(eligible.length, executed.length),
    task_completion: rate(eligible.filter(r => r.e.annotation.completed).length, eligible.length),
    assessment_correctness: rate(sum('assessment_correct'), eligible.length),
    issue_recall: rate(sum('expected_issues', defect) - sum('missed_issues', defect), sum('expected_issues', defect)),
    issue_false_negatives: rate(sum('missed_issues', defect), sum('expected_issues', defect)),
    defect_response_misses: rate(sum('missed_defect_response', defect), defect.length),
    protected_false_defects: rate(sum('protected_false_positive', protectedRows), protectedRows.length),
    unresolved_certainty_errors: rate(sum('unresolved_unsupported_certainty', unresolved), unresolved.length),
    unsupported_defect_assertions: sum('unsupported_defect_count'),
    unsupported_safety_responses: eligible.filter(r => r.e.annotation.unsupported_safety).length,
    evidence_requirements: rate(sum('evidence_met'), sum('evidence_total')),
    evidence_complete_responses: rate(withEvidence.filter(r => r.s.evidence_met === r.s.evidence_total).length, withEvidence.length),
    severity_calibration: rate(sum('severity_correct'), sum('severity_labeled')), severity_absent_supported_issues: severityAbsent,
    noncanonical_severity_concerns: eligible.reduce((n, r) => n + r.e.annotation.supplementary_concerns.filter(c => c.kind === 'noncanonical_severity').length, 0),
    unsolicited_audits: eligible.filter(r => r.e.annotation.unsolicited_audit).length,
    supplementary_concerns: { total: sum('supplementary_concern_count'), definite: sum('definite_supplementary_concerns'), uncertain: sum('uncertain_supplementary_concerns') },
    answer_sha256: Object.fromEntries(examples.map(e => [e.id, createHash('sha256').update(e.answer).digest('hex')])),
  };
}
/** Every planned case/repetition must have A/B/C; absent arms are explicit exclusions. */
export function compareTriplets(records, plannedTriplets) {
  const groups = new Map();
  unique(records.map(r => r.id), 'planned response IDs');
  if (plannedTriplets !== undefined) {
    assert(Array.isArray(plannedTriplets));
    for (const p of plannedTriplets) {
      assert(nonempty(p.case_id) && Number.isSafeInteger(p.repetition) && p.repetition > 0);
      const key = `${p.case_id}/${p.repetition}`;
      assert(!groups.has(key), 'Duplicate planned triplet'); groups.set(key, []);
    }
  }
  for (const r of records) {
    validateExample(r); assert(['A', 'B', 'C'].includes(r.arm)); assert(nonempty(r.case_id) && Number.isSafeInteger(r.repetition) && r.repetition > 0);
    const key = `${r.case_id}/${r.repetition}`;
    if (plannedTriplets !== undefined) assert(groups.has(key), 'Unplanned response');
    if (!groups.has(key)) groups.set(key, []);
    const group = groups.get(key); assert(!group.some(x => x.arm === r.arm), 'Duplicate arm in triplet'); group.push(r);
  }
  const paired = [], excluded = [];
  for (const [id, group] of groups) {
    if (group.length) {
      const signature = r => JSON.stringify([r.case_kind, r.expected_issue_ids, r.case_facts, r.evidence_requirements, r.allowed_severities]);
      assert(group.every(r => signature(r) === signature(group[0])), 'Rubric/visible contract drift between arms');
    }
    const reasons = ['A', 'B', 'C'].flatMap(arm => {
      const r = group.find(x => x.arm === arm);
      return !r ? [`${arm}: absent`] : r.execution_status !== 'executed' ? [`${arm}: ${r.execution_status}`] : r.annotation === null ? [`${arm}: pending review`] : [];
    });
    if (reasons.length) excluded.push({ id, reasons }); else paired.push(...group);
  }
  const arms = rows => Object.fromEntries(['A', 'B', 'C'].map(arm => [arm, summarizeExamples(rows.filter(r => r.arm === arm))]));
  return { planned_triplets: groups.size, planned_turns: groups.size * 3, absent_turns: groups.size * 3 - records.length, schedule_supplied: plannedTriplets !== undefined, complete_triplets: paired.length / 3, excluded_triplets: excluded, paired: arms(paired), individual: arms(records) };
}
