import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scoreExample, summarizeExamples, compareTriplets, validateExample } from './scoring.mjs';
import { validateCalibration } from './validate.mjs';
const data = JSON.parse(readFileSync(new URL('./examples.json', import.meta.url)));
const copy = n => structuredClone(data.examples[n - 1]);
const triplet = n => ['A', 'B', 'C'].map(arm => ({ ...copy(n), id: `${arm}-${n}`, arm, case_id: 'sample', repetition: 1 }));
test('all public authored calibration counters reproduce without semantic classification', () => {
  assert.equal(data.examples.length, 21); validateCalibration(data);
  assert.equal(scoreExample(copy(1)).assessment_correct, scoreExample(copy(2)).assessment_correct);
  assert.notEqual(scoreExample(copy(1)).evidence_met, scoreExample(copy(2)).evidence_met);
  assert.equal(scoreExample(copy(6)).assessment_correct, scoreExample(copy(7)).assessment_correct);
  assert.notEqual(scoreExample(copy(6)).evidence_met, scoreExample(copy(7)).evidence_met);
});
test('issue misses, response misses, extra assertions and supplementary concerns remain distinct', () => {
  const multiple = copy(15); multiple.annotation.matched_issue_ids = [];
  assert.equal(scoreExample(multiple).missed_issues, 2); assert.equal(scoreExample(multiple).missed_defect_response, true);
  const score = summarizeExamples([copy(15)]);
  assert.deepEqual(score.issue_false_negatives, { numerator: 1, denominator: 2, rate: 0.5 });
  assert.deepEqual(score.defect_response_misses, { numerator: 1, denominator: 1, rate: 1 });
  assert.equal(scoreExample(copy(19)).missed_issues, 0); assert.equal(scoreExample(copy(19)).unsupported_defect_count, 1);
  assert.equal(scoreExample(copy(12)).protected_false_positive, false);
  assert.equal(scoreExample(copy(5)).protected_false_positive, true);
  assert.equal(scoreExample(copy(8)).unresolved_unsupported_certainty, true);
  assert.equal(scoreExample(copy(9)).unresolved_unsupported_certainty, true);
  assert.equal(scoreExample(copy(10)).unsupported_defect_count, 0);
});
test('absence and noncanonical severity are separate, uncertain concerns do not become definite', () => {
  const summary = summarizeExamples([copy(13), copy(14), copy(20), copy(21)]);
  assert.deepEqual(summary.severity_calibration, { numerator: 0, denominator: 1, rate: 0 });
  assert.equal(summary.noncanonical_severity_concerns, 1);
  assert.equal(summary.severity_absent_supported_issues, 2);
  assert.deepEqual(summary.supplementary_concerns, { total: 2, definite: 1, uncertain: 1 });
});
test('empty denominators are null and failed partials are not semantically graded', () => {
  const empty = summarizeExamples([]);
  for (const k of ['issue_recall', 'protected_false_defects', 'evidence_requirements', 'severity_calibration']) assert.equal(empty[k].rate, null);
  const failed = copy(16); failed.answer = 'A plausible-looking partial defect diagnosis';
  assert.equal(scoreExample(failed).eligible, false);
  failed.annotation = copy(1).annotation; assert.throws(() => validateExample(failed), /ungraded/);
});
test('incomplete successful response remains paired while failure/pending/absent arms exclude triplets', () => {
  const rows = triplet(18), paired = compareTriplets(rows);
  assert.equal(paired.complete_triplets, 1); assert.equal(paired.paired.A.task_completion.denominator, 1);
  assert.equal(paired.paired.A.task_completion.numerator, 0); assert.equal(paired.paired.A.assessment_correctness.numerator, 0);
  for (const status of ['failed', 'interrupted', 'not-run', 'pending']) {
    const changed = triplet(1); changed[1].annotation = null;
    if (status !== 'pending') changed[1].execution_status = status;
    const result = compareTriplets(changed);
    assert.equal(result.complete_triplets, 0); assert.equal(result.excluded_triplets.length, 1);
    assert.equal(result.individual.A.assessment_correctness.denominator, 1);
    assert.equal(result.individual.B.assessment_correctness.denominator, 0);
  }
  assert.equal(compareTriplets(rows.slice(0,2)).complete_triplets, 0);
  const schedule = [{ case_id: 'sample', repetition: 1 }, { case_id: 'never-run', repetition: 1 }];
  const result = compareTriplets(rows, schedule);
  assert.equal(result.planned_triplets, 2); assert.deepEqual(result.excluded_triplets[0].reasons, ['A: absent', 'B: absent', 'C: absent']);
  assert.throws(() => compareTriplets(rows, []), /Unplanned/);
});
test('malformed/duplicate annotations, quote drift and rubric drift are rejected', () => {
  const mutations = [
    e => e.annotation.matched_issue_ids.push('slot-release'),
    e => e.annotation.matched_issue_ids.push('unknown'),
    e => e.annotation.evidence.pop(),
    e => e.annotation.evidence[0].met = 'yes',
    e => e.annotation.unsupported_defect_claims.push('not an answer excerpt'),
    e => e.annotation.severity.push({ issue_id: 'slot-release', label: 'Critical', allowed: ['Critical'] }),
  ];
  for (const mutate of mutations) { const e = copy(1); mutate(e); assert.throws(() => validateExample(e)); }
  assert.throws(() => summarizeExamples([copy(1),copy(1)]), /Duplicate/);
  const noncanonical = copy(20); delete noncanonical.annotation.supplementary_concerns[0].issue_id;
  assert.throws(() => validateExample(noncanonical), /requires supported issue/);
  for (const key of ['case_facts', 'evidence_requirements', 'allowed_severities']) {
    const rows = triplet(1); rows[1][key] = key === 'case_facts' ? 'Different contract' : key === 'evidence_requirements' ? [] : { 'slot-release': ['Critical'] };
    if (key === 'evidence_requirements') rows[1].annotation.evidence = [];
    assert.throws(() => compareTriplets(rows), /drift/);
  }
  const contradiction = copy(20); contradiction.annotation.severity.push({ issue_id: 'slot-release', label: 'unspecified', allowed: ['Warning'] });
  assert.throws(() => validateExample(contradiction), /Contradictory/);
  const rows = triplet(1); rows[1].arm = 'A'; assert.throws(() => compareTriplets(rows), /Duplicate arm/);
});

test('saved calibration summary reproduces from authored annotations', () => {
  assert.deepEqual(validateCalibration(data),JSON.parse(readFileSync(new URL('./summary.json',import.meta.url))));
});

test('review packets retain exact answers/rubrics but omit authored ratings and rationale', async () => {
  const {calibrationPackets}=await import('./packets.mjs');
  const {createHash}=await import('node:crypto');
  const packets=calibrationPackets(data);
  assert.deepEqual(packets,JSON.parse(readFileSync(new URL('./review-packets.json',import.meta.url))));
  assert.equal(packets.packets.length,21);
  for(const packet of packets.packets) {
    assert.deepEqual(Object.keys(packet).sort(),['id','case_kind','case_facts','expected_issue_ids','evidence_requirements','allowed_severities','execution_status','answer','answer_sha256','instruction'].sort());
    assert.equal(packet.answer_sha256,createHash('sha256').update(packet.answer).digest('hex'));
    assert.equal(packet.answer,data.examples.find(e=>e.id===packet.id).answer);
    for(const key of ['annotation','expected','rationale'])assert.equal(key in packet,false);
  }
});

test('CAL-03 false safety counts globally alongside its miss, outside unresolved-only certainty', () => {
  const defect=copy(3), summary=summarizeExamples([defect]);
  assert.equal(defect.annotation.unsupported_safety,true);
  assert(defect.answer.includes(defect.annotation.unsupported_safety_quote));
  assert.equal(summary.unsupported_safety_responses,1);
  assert.deepEqual(summary.issue_false_negatives,{numerator:1,denominator:1,rate:1});
  assert.deepEqual(summary.unresolved_certainty_errors,{numerator:0,denominator:0,rate:null});
  assert.equal(scoreExample(defect).unresolved_unsupported_certainty,false);
});
