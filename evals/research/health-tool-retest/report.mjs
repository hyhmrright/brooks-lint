/** Semantic adjudication and independent mechanical workflow metrics. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readRun} from './runner.mjs';
import {summarize as semanticSummary} from '../skill-revision/report.mjs';
export function summarize(run,annotations){
 const semantic=semanticSummary(run,annotations),workflow={};
 for(const arm of ['A','B']){
  const rows=run.records.filter(r=>r.arm===arm&&r.status==='executed'),applicable=arm==='B';
  workflow[arm]={applicable,completed:rows.length,
   required:applicable?rows.filter(r=>r.workflow.required).length:null,
   requiredPassed:applicable?rows.filter(r=>r.workflow.required&&r.workflow.workflowPassed).length:null,
   prohibited:applicable?rows.filter(r=>r.workflow.prohibited).length:null,
   prohibitedPassed:applicable?rows.filter(r=>r.workflow.prohibited&&r.workflow.workflowPassed).length:null,
   observedCalls:rows.reduce((sum,r)=>sum+r.workflow.calls,0),
   rows:rows.map(({ordinal,caseId,repeat,workflow})=>({ordinal,caseId,repeat,...workflow}))};
 }

 return {...semantic,workflow,interpretation:'Semantic correctness and deterministic output consistency are separate. A tool can correctly score an incorrect model-authored ledger.'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [dir,annotations,out]=process.argv.slice(2);assert(dir&&annotations&&out);fs.writeFileSync(out,JSON.stringify(summarize(readRun(dir),JSON.parse(fs.readFileSync(annotations)).annotations),null,2)+'\n',{flag:'wx',mode:0o600});}
