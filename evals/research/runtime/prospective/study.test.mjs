import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createPlan, validatePlan, responseTemplate, validateResponses, summarize, reviewPackets, turnInputs, digest } from './study.mjs';
import { sha256 } from '../candidate-holdouts/validate.mjs';
const options = { study_id: 'SYNTHETIC-OFFLINE-SELFTEST', intended_model: 'not-run-synthetic', reasoning: 'not-run', author: 'exposed author', exposure: 'Same development workflow; public labels', case_ids: ['HC-01','HC-02','HC-03'], repetitions: 2 };
const fresh = () => createPlan(options);
const copy = x => JSON.parse(JSON.stringify(x));
function response(plan) {
  const data = responseTemplate(plan, plan.study_sha256), r = data.records[0];
  r.execution_status = 'executed'; r.answer = 'SYNTHETIC selftest text; not model output.'; r.answer_sha256 = sha256(r.answer);
  r.model_report = { model: 'synthetic-not-a-model', reasoning: 'none', source: 'authored selftest only' };
  r.execution_evidence = { source: 'synthetic selftest; no real execution', artifact_sha256: sha256('synthetic'), status_basis: 'test branch selected deliberately' };
  return data;
}
function annotation(plan, data) {
  const r = data.records[0], rubric = JSON.parse(plan.study.cases[0].rubric.content);
  r.review = { reviewer: 'synthetic test author', method: 'test-injected labels, not semantic review', exposure: 'full public labels', rationale: 'Exercises arithmetic only', answer_sha256: r.answer_sha256,
    annotation: { completed: false, assessment: 'incomplete', unsupported_safety: false, unsolicited_audit: false, matched_issue_ids: [rubric.expectedFindings[0].id], unsupported_defect_claims: [], evidence: rubric.evidenceRequirements.map(x => ({ id:x.id, met:false })), severity: [], supplementary_concerns: [] } };
}
test('plan freezes exact candidate bytes and revision-2 guidance without live integration', () => {
  const p = fresh(); validatePlan(p, p.study_sha256); assert.equal(p.study.schedule.length, 6); assert.equal(p.study.independent, false); assert.equal(p.study.schema.prototype_revision, 2);
  assert.equal(JSON.parse(p.study.manifest.content).liveRunnerIntegration, false);
  assert.equal(p.study.cases[0].inputs.length, 4);
});
test('turn inputs preserve arm isolation and exclude all rubric/metadata bytes', () => {
  const p = fresh();
  for (const arm of ['A','B','C']) {
    const out = turnInputs(p, { case_id:'HC-01', repetition:1, arm }, p.study_sha256);
    assert.equal(out.inputs.length, 4); assert(out.inputs.every(x => !/rubric|cases.json|offline-evidence/.test(x.path)));
    assert.equal(out.guidance.length, arm === 'A' ? 0 : p.study.core.length + (arm === 'C' ? 2 : 0));
  }
});
test('each frozen snapshot rejects byte drift against trusted plan', () => {
  const p = fresh();
  for (const mutate of [x => x.study.cases[0].inputs[0].content += 'tamper', x => x.study.cases[0].rubric.content += ' ', x => x.study.protocol.content += ' ', x => x.study.core[0].content += ' ', x => x.study.prototype[0].content += ' ', x => x.study.scorer.content += ' ']) {
    const q = copy(p); mutate(q); assert.throws(() => validatePlan(q, p.study_sha256), /Plan drift/);
  }
});
test('frozen candidate/protocol/guidance snapshots need not match a newer checkout', () => {
  // Simulate an independently retained earlier snapshot; trust its own saved digest.
  // No repository files are mutated, and the scorer/adapter source remains exact.
  const p = fresh();
  for (const f of [p.study.cases[0].inputs[0], p.study.protocol, p.study.core[0], p.study.prototype[1]]) {
    f.content += '\nArchived snapshot revision marker\n'; f.sha256 = sha256(f.content);
  }
  const r = p.study.cases[0].rubric; const value = JSON.parse(r.content); value.sourceStatus += ' Archived snapshot.';
  r.content = JSON.stringify(value); r.sha256 = sha256(r.content); p.study_sha256 = digest(p.study);
  validatePlan(p,p.study_sha256);
  assert.match(turnInputs(p,{case_id:'HC-01',repetition:1,arm:'C'},p.study_sha256).inputs[0].content,/Archived snapshot/);
});
test('rehashed changed plan rejected by external trusted digest', () => { const p = fresh(), q = copy(p); q.study.intended_model = 'different'; q.study_sha256 = digest(q.study); assert.throws(() => validatePlan(q, p.study_sha256), /Trusted plan/); });
test('rehashing cannot promote independence or leak rubric to input', () => {
  for (const mutate of [p => p.study.independent = true, p => p.study.private_custody = true, p => p.study.cases[0].inputs.push(p.study.cases[0].rubric)]) {
    const p = fresh(); mutate(p); p.study_sha256 = digest(p.study); assert.throws(() => validatePlan(p, p.study_sha256));
  }
});
test('unknown cases, duplicate case and invalid repetitions rejected', () => {
  for (const change of [{ case_ids:['HC-10'] }, { case_ids:['HC-01','HC-01'] }, { repetitions:0 }]) assert.throws(() => createPlan({...options,...change}));
});
test('response template represents all 18 planned arms as not run', () => {
  const p = fresh(), d = responseTemplate(p, p.study_sha256), s = summarize(p,d,p.study_sha256);
  assert.equal(d.records.length,18); assert.equal(s.complete_triplets,0); assert.equal(s.individual.A.execution['not-run'],6); assert.equal(s.paired.A.assessment_correctness.rate,null);
});
test('wholly absent triplets remain explicit exclusions', () => {
  const p = fresh(), d = { plan_sha256:p.study_sha256, records:[] }, s = summarize(p,d,p.study_sha256);
  assert.equal(s.planned_turns,18); assert.equal(s.absent_turns,18); assert.equal(s.excluded_triplets.length,6); assert.deepEqual(s.excluded_triplets[0].reasons,['A: absent','B: absent','C: absent']);
});
test('pending executed review and failed partial remain separate', () => {
  const p = fresh(), d = response(p); let s = summarize(p,d,p.study_sha256);
  assert.equal(s.individual.A.review_coverage.denominator,1); assert.equal(s.individual.A.review_coverage.numerator,0);
  d.records[0].execution_status = 'failed'; s = summarize(p,d,p.study_sha256);
  assert.equal(s.individual.A.execution.failed,1); assert.equal(d.records[0].answer, 'SYNTHETIC selftest text; not model output.');
  annotation(p,d); assert.throws(() => summarize(p,d,p.study_sha256), /Only successful/);
});
test('executed incomplete answer remains paired and detected issue is not erased', () => {
  const p = fresh(), d = response(p); annotation(p,d);
  const first = d.records[0];
  for (const arm of ['B','C']) Object.assign(d.records.find(x => x.case_id === 'HC-01' && x.repetition === 1 && x.arm === arm), copy(first), {arm});
  const s = summarize(p,d,p.study_sha256); assert.equal(s.complete_triplets,1); assert.equal(s.paired.A.task_completion.numerator,0); assert.equal(s.paired.A.issue_recall.rate,1); assert.equal(s.paired.A.assessment_correctness.numerator,0);
});
test('evidenced successful empty and whitespace answers remain paired when annotated incomplete', () => {
  for (const answer of ['', ' \n\t ']) {
    const p = fresh(), d = response(p); annotation(p,d);
    const first = d.records[0]; first.answer = answer; first.answer_sha256 = sha256(answer);
    first.review.answer_sha256 = first.answer_sha256;
    first.review.annotation.matched_issue_ids = [];
    for (const arm of ['B','C']) Object.assign(d.records.find(x => x.case_id === 'HC-01' && x.repetition === 1 && x.arm === arm), copy(first), {arm});
    const s = summarize(p,d,p.study_sha256);
    assert.equal(s.complete_triplets,1); assert.equal(s.paired.A.execution.executed,1);
    assert.equal(s.paired.A.review_coverage.denominator,1); assert.equal(s.paired.A.task_completion.numerator,0);
    assert.equal(s.paired.A.task_completion.denominator,1); assert.equal(s.paired.A.assessment_correctness.numerator,0);
    assert.equal(s.paired.A.assessment_correctness.denominator,1); assert.equal(s.paired.A.issue_false_negatives.rate,1);
    assert.equal(d.records[0].answer,answer); assert.equal(d.records[0].answer_sha256,sha256(answer));
    assert.equal(d.records[0].execution_evidence.artifact_sha256,sha256('synthetic'));
  }
});
test('unknown/duplicate arm, unplanned repetition, status and extra fields rejected', () => {
  const p = fresh();
  for (const mutate of [d => d.records[0].arm = 'D', d => d.records.push(copy(d.records[0])), d => d.records[0].repetition = 8, d => d.records[0].execution_status = 'success', d => d.records[0].hidden = true]) {
    const d = response(p); mutate(d); assert.throws(() => validateResponses(p,d,p.study_sha256));
  }
});
test('plan, exact answer, review binding and provenance drift rejected', () => {
  const p = fresh();
  for (const mutate of [d => d.plan_sha256 = sha256('other'), d => d.records[0].answer += 'changed', d => d.records[0].review.answer_sha256 = sha256('wrong'), d => d.records[0].review.exposure = '', d => d.records[0].model_report.source = '', d => d.records[0].execution_evidence.status_basis = '']) {
    const d = response(p); annotation(p,d); mutate(d); assert.throws(() => validateResponses(p,d,p.study_sha256));
  }
  assert.throws(() => validateResponses(p,response(p)), /External trusted/);
});
test('review packets omit arm, guidance, expected labels, reviewer and partial failures', () => {
  const p = fresh(), d = response(p); annotation(p,d); const packets = reviewPackets(p,d,p.study_sha256);
  assert.equal(packets.packets.length,1); assert.deepEqual(Object.keys(packets.packets[0]).sort(), ['answer','answer_sha256','inputs','packet_id']);
  assert.equal(packets.packets[0].answer,d.records[0].answer); assert.equal(packets.packets[0].inputs.length,4);
  d.records[0].review=null; d.records[0].execution_status='interrupted'; assert.equal(reviewPackets(p,d,p.study_sha256).packets.length,0);
});
test('CLI creates offline artifacts exclusively and refuses overwrite', () => {
  const dir = mkdtempSync(path.join(tmpdir(),'candidate-adapter-'));
  try {
    const cli = path.join(import.meta.dirname, 'cli.mjs'), config = path.join(dir,'config.json'), planfile = path.join(dir,'plan.json'), outfile=path.join(dir,'responses.json');
    writeFileSync(config, JSON.stringify(options));
    let r = spawnSync(process.execPath,[cli,'plan',config,planfile], {encoding:'utf8'}); assert.equal(r.status,0,r.stderr);
    const p = JSON.parse(readFileSync(planfile)); r=spawnSync(process.execPath,[cli,'template',planfile,p.study_sha256,outfile],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr);
    assert.equal(JSON.parse(readFileSync(outfile)).records.length,18);
    r=spawnSync(process.execPath,[cli,'template',planfile,p.study_sha256,outfile],{encoding:'utf8'}); assert.notEqual(r.status,0); assert.match(r.stderr,/EEXIST/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
