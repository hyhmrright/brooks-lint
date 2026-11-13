/** Explicit authored Docker controls. Never uses a model or credentials. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';import {loadCase} from './suite.mjs';import {checkCandidate} from './artifact-check.mjs';
export function controlPassed(r){
 if(r.id.endsWith('33')||r.id.endsWith('36'))return !r.executionPerformed&&!r.repairVerified;
 if(r.control==='authored-valid')return r.repairVerified===true;
 const s=r.sandbox,e=s?.execution;return Boolean(r.control==='unrepaired-defect-must-fail'&&r.executionPerformed===true&&r.repairVerified===false&&s?.admitted===true&&s.cleanupConfirmed===true&&!s.failure&&e?.closed===true&&Number.isInteger(e.code)&&e.code>0&&!e.reason&&!e.error&&/ERR_ASSERTION|AssertionError/.test(Buffer.from(e.stderr_base64??'','base64').toString()));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
const [output,flag]=process.argv.slice(2);assert(output&&flag==='--offline-docker','artifact-drill.mjs FRESH_OUTPUT --offline-docker');assert(!fs.existsSync(output),'Fresh record required');
const records=[];const artifact=(replacements)=>({report:'Authored synthetic report; no model inference',phases:['review','test','debt','audit','health'],replacements,rounds:1,stopReason:'verification-blocked'});
for(const id of ['BV5-31','BV5-32','BV5-33','BV5-34','BV5-35','BV5-36']){const c=loadCase(id),a=artifact(c.oracle.repair),r=await checkCandidate(c,a,a.report);records.push({control:'authored-valid',...r});}
for(const id of ['BV5-31','BV5-34']){const c=loadCase(id),a=artifact({}),r=await checkCandidate(c,a,a.report);records.push({control:'unrepaired-defect-must-fail',...r});}
const passed=records.every(controlPassed);
fs.writeFileSync(output,JSON.stringify({simulation:true,modelCalls:0,source:'Authored controls; not actual model patch results',passed,records},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed,controls:records.length}));if(!passed)process.exitCode=1;

}
