/** Supplemental QA: verifies review artifacts against the source and frozen scorer. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {summarize,digest} from '../../../../../../evals/research/runtime/prospective/study.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)), dir=path.resolve(here,'..');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const reviews=read(path.join(dir,'responses.json'));
const first=read(path.join(dir,'first-pass-reviews.json'));
const notes=read(path.join(dir,'notes.json'));
const sens=read(path.join(dir,'sensitivity.json'));
const plan=read(path.resolve(dir,'../../../runtime-preparations/2026-11-06-hc-human-review/plan.json'));
const key=r=>`${r.case_id}/${r.repetition}/${r.arm}`;
const records=new Map(reviews.records.map(r=>[key(r),r]));
assert.equal(first.records.length,81);assert.equal(notes.records.length,81);
assert.equal(new Set(first.records.map(r=>r.response_id)).size,81);
assert.equal(new Set(notes.records.map(r=>r.response_id)).size,81);
const source=readFileSync(path.resolve(dir,first.source_responses_file));
assert.equal(createHash('sha256').update(source).digest('hex'),first.source_responses_file_sha256);
for(const r of first.records) assert.deepEqual(r.review,records.get(r.response_id).review);
for(const r of notes.records){
 const response=records.get(r.response_id);assert(response);
 assert.equal(r.answer_sha256,response.answer_sha256);
 assert.equal(r.rationale,response.review.rationale);
 assert.deepEqual(r.evidence,response.review.annotation.evidence);
 assert(response.answer.includes(r.opening_excerpt));
 if(r.omission_excerpt) assert(response.answer.includes(r.omission_excerpt));
}
assert.equal(sens.primary_responses_sha256,digest(reviews));
const primary=summarize(plan,reviews,reviews.plan_sha256);
const relaxed=structuredClone(reviews);
assert.equal(new Set(sens.changed_evidence_only).size,8);
for(const id of sens.changed_evidence_only){
 const row=relaxed.records.find(r=>key(r)===id);assert(row);
 const evidence=row.review.annotation.evidence.find(e=>e.id==='alternative-judgments');
 assert.equal(evidence.met,false);evidence.met=true;
}
const permissive=summarize(plan,relaxed,reviews.plan_sha256);
for(const arm of ['A','B','C']){
 for(const axis of ['evidence_requirements','evidence_complete_responses']){
  assert.deepEqual(sens.primary[arm][axis],primary.paired[arm][axis]);
  assert.deepEqual(sens.permissive[arm][axis],permissive.paired[arm][axis]);
 }
 for(const axis of ['assessment_correctness','issue_recall','issue_false_negatives','protected_false_defects','unresolved_certainty_errors'])assert.deepEqual(primary.paired[arm][axis],permissive.paired[arm][axis]);
 assert.deepEqual(primary.paired[arm],primary.individual[arm]);
}
const remaining=relaxed.records.filter(r=>r.review.annotation.evidence.some(e=>!e.met)).map(key);
assert.deepEqual(remaining.sort(),[...sens.unchanged_contrast_omissions].sort());
console.log(JSON.stringify({status:'PASS',reviews:81,notes:81,exact_excerpts:true,first_pass_matches:true,sensitivity_reproduced:true,relaxed_rows:8,remaining_omissions:3,live_model_calls:0},null,2));
