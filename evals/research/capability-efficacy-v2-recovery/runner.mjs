import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {load} from './plan.mjs';
import {anchored,write,hash} from '../capability-efficacy-v2/suite.mjs';
import {execute,verify,summary} from '../capability-efficacy-v2/runner.mjs';
import {preflight} from '../health-sweep-capability-live/isolation.mjs';
export async function recover(out,{live=false,check=preflight,collect=execute}={}){
 assert.equal(live,true,'Explicit live authorization flag required');const p=load();assert(!fs.existsSync(out),'Fresh recovery envelope required');fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'recovery-plan.json'),p);
 const record={recoverySha256:p.sha256,startedAt:new Date().toISOString(),status:'preflight',modelSubmissionCount:null};const save=()=>fs.writeFileSync(path.join(out,'admission.json'),JSON.stringify(record,null,2)+'\n',{mode:0o600});save();
 try{record.docker=await check();load();record.status='admitted';save();const result=await collect(anchored(),path.join(out,'campaign'),{live:true,smokeDir:'_workspace/latest-receipt-live'});record.status='ended';record.result=result;record.modelSubmissionCount=result.attempted;record.completedAt=new Date().toISOString();save();return result;}
 catch(e){record.status='stopped';record.error=String(e.stack??e);record.completedAt=new Date().toISOString();record.modelSubmissionCount=fs.existsSync(path.join(out,'campaign'))?null:0;save();throw e;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[cmd,out,flag]=process.argv.slice(2);if(cmd==='execute'){assert.equal(flag,'--live');console.log(JSON.stringify(await recover(out,{live:true})));}else if(cmd==='verify'){load();assert.equal(hash(fs.readFileSync(path.join(out,'recovery-plan.json'))),hash(JSON.stringify(load(),null,2)+'\n'));console.log(JSON.stringify(summary(verify(path.join(out,'campaign')).state)));}else throw Error('execute FRESH_OUT --live | verify OUT');}
