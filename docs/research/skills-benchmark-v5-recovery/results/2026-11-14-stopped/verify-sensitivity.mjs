/** Replay explicit counterfactual edits only; never write primary or historical judgments. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {combine,read,preserveJudgments} from '../../../../../evals/research/skills-benchmark-v5-recovery/recovery.mjs';
import {assessRun} from '../../../../../evals/research/skills-benchmark-v5/review.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(directory,'../../../../..');
const original=path.resolve(process.argv[2]??path.join(root,'_workspace/campaign-v5-live'));
const recovery=path.resolve(process.argv[3]??path.join(root,'_workspace/campaign-v5-recovery-live'));
const run=combine(read(path.join(root,'docs/research/skills-benchmark-v5-recovery/plan.json')),original,recovery);
const file=path.join(directory,'annotations-combined199.json');
const before=fs.readFileSync(file);
const annotations=preserveJudgments(JSON.parse(before));
const sensitivity=read(path.join(directory,'sensitivity.json'));
for(const variant of sensitivity.variants){
 const altered=structuredClone(annotations), edits=variant.counterfactualEdits;
 for(const responseId of variant.changes){
  const a=altered.find(a=>a.responseId===responseId);assert(a);
  const r=a.review,quote=r.novelFindings[0].quote;
  if(edits.setNovelSupportedToPending)for(const f of r.novelFindings)if(f.verdict==='supported')f.verdict='pending';
  if(edits.clearPendingClaims)r.pendingClaims=[];
  if(edits.setFirstNovelVerdict)r.novelFindings[0].verdict=edits.setFirstNovelVerdict;
  if(edits.appendPendingClaim)r.pendingClaims.push({quote,reason:edits.appendPendingClaim.reason});
  if(edits.appendFalseDefectClaim)r.falseDefectClaims.push({quote,reason:edits.appendFalseDefectClaim.reason});
  for(const [key,items] of [['criteria',edits.restoreCriteria],['evidence',edits.restoreEvidence]])for(const item of items??[]){
   assert(!r[key].some(x=>x.id===item.id),'Counterfactual restoration would duplicate a primary credit');
   r[key].push({id:item.id,quote,reason:item.reason});
  }
 }
 const result=assessRun(run,altered);
 assert.deepEqual(result.primaryOutcome.byArm,variant.primaryOutcome,variant.name);
 assert.deepEqual(result.claimMetrics.arms,variant.claimMetrics,variant.name);
 console.log('PASS: '+variant.name);
}
assert.deepEqual(fs.readFileSync(file),before,'Primary annotation bytes changed');
preserveJudgments(read(file));
console.log('PASS: primary annotations and original 78 preserved; no model or candidate execution');
