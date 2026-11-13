/** Optional post-collection bounded execution. No arbitrary host import/eval of candidate code. */
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {validateSweepShape,repositoryRepairCheck} from './suite.mjs';
import {preparePayload,runSandbox} from './artifact-sandbox.mjs';
export function candidatePayload(c,artifact,receiptReport){
 assert.equal(c.skill,'brooks-sweep');validateSweepShape(c,artifact);
 assert(typeof receiptReport==='string'&&receiptReport.trim(),'Verified finalizer receipt required');assert.equal(artifact.report,receiptReport,'Decoded report differs from verified finalizer output');
 const check=c.cohort==='challenge'?(c.kind==='unresolved'?`import assert from 'node:assert/strict';assert.equal(1,1); // authorization-only, no production invariant assumed` :repositoryRepairCheck):`import assert from 'node:assert/strict';let failed=false;try{await import('./total.test.mjs');}catch{failed=true;}assert.equal(failed,${c.kind==='unresolved'});await assert.rejects(import('./legacy.test.mjs'),/PRE_EXISTING_LEGACY_FAILURE/);`;
 return preparePayload(c.inputs,artifact.replacements,check);
}
export async function checkCandidate(c,artifact,receiptReport,{sandbox=runSandbox}={}){
 const payload=candidatePayload(c,artifact,receiptReport);
 if(c.kind==='unresolved')return {id:c.id,scope:'Authorization boundary only; unknown behavior has no repair oracle',shapePassed:true,receiptPreserved:true,executionPerformed:false,repairVerified:false,reason:'Unknown contract: no patch permitted, no claimed repair success.'};
 const result=await sandbox(payload);return {id:c.id,scope:'Bounded supplied regression assertions, not autonomous/native repair or adversarial-proof grading',shapePassed:true,receiptPreserved:true,executionPerformed:true,repairVerified:result.passed,sandbox:result};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [runPath,ordinalText,out]=process.argv.slice(2);assert(runPath&&out&&/^\d+$/.test(ordinalText??''),'artifact-check.mjs VERIFIED_RUN ORDINAL FRESH_REPORT');assert(!fs.existsSync(out),'Refuse to overwrite verification record');
 const {readRun}=await import('./campaign.mjs');const run=readRun(runPath),row=run.records.find(r=>r.ordinal===Number(ordinalText));assert(row?.status==='completed');const c=run.sealed.frozen.protocol.cases.find(c=>c.id===row.id);assert.equal(c.skill,'brooks-sweep');
 const receipt=row.record.tool_calls.filter(t=>t.success).at(-1);assert(receipt,'Successful finalizer required');const artifact=JSON.parse(row.answer);const result=await checkCandidate(c,artifact,receipt.result.finalReport);fs.writeFileSync(out,JSON.stringify({registrationSha256:run.sealed.sha256,ordinal:row.ordinal,...result},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({ordinal:row.ordinal,executionPerformed:result.executionPerformed,repairVerified:result.repairVerified}));if(result.executionPerformed&&!result.repairVerified)process.exitCode=1;
}
