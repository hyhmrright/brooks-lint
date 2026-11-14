import fs from 'node:fs';
import {combine} from '../../../../../evals/research/skills-benchmark-v5-recovery2/recovery.mjs';
import {assessRun} from '../../../../../evals/research/skills-benchmark-v5/review.mjs';
const dir='docs/research/skills-benchmark-v5-recovery2/results/2026-11-14-completed';
const annotations=JSON.parse(fs.readFileSync(dir+'/annotations-combined324.json'));
const run=combine(JSON.parse(fs.readFileSync('docs/research/skills-benchmark-v5-recovery2/plan.json')),'_workspace/campaign-v5-live','_workspace/campaign-v5-recovery-live','_workspace/campaign-v5-recovery2-live');
const result={method:'Post-collection sensitivity copies; never replaces primary or historical annotations.',variants:{}};
for(const mode of ['smoke-duty-pending','pagination-duty-supported','pagination-duty-rejected']){
 const copy=structuredClone(annotations);let edits=[];
 for(const x of copy){const r=x.review;
 if(mode==='smoke-duty-pending'&&x.caseId==='BV5-24'&&r.assessment==='defect'){
 r.pendingClaims.push({quote:r.evidence[0].quote,reason:'Sensitivity: accepted test-failure signaling obligation is unavailable.'});
 r.novelFindings=r.novelFindings.map(f=>({...f,verdict:'pending'}));edits.push(x.responseId);
 }
 if(x.responseId.startsWith('3bf0b4')&&mode.startsWith('pagination-duty-')){
 r.pendingClaims=[];
 if(mode==='pagination-duty-supported'){r.novelFindings[0].verdict='supported';r.criteria.push({id:'task-outcome',quote:r.novelFindings[0].quote,reason:'Counterfactual acceptance of arbitrary-order/duplicate input obligation establishes scoped diagnosis and remedy.'});}
 else{r.novelFindings[0].verdict='unsupported';r.falseDefectClaims.push({quote:r.novelFindings[0].quote,reason:'Counterfactual interpretation treats unique ascending rows as input precondition.'});}
 edits.push(x.responseId);
 }
 }
 const a=assessRun(run,copy);result.variants[mode]={editedResponseIds:edits,primary:a.primaryOutcome.byArm,claims:a.claimMetrics.arms};
}
fs.writeFileSync(dir+'/sensitivity.json',JSON.stringify(result,null,2)+'\n');
