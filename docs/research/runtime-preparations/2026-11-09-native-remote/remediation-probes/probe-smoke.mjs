import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {validateSmoke} from '../../../../../evals/research/runtime/prospective/native-smoke-validate.mjs';
const original=path.resolve('docs/research/runtime-preparations/2026-11-09-native-remote/smoke-offline');
const hash=x=>createHash('sha256').update(x).digest('hex');
const cases={
 'count-body-other-model':dir=>{const p=path.join(dir,'upstream.json'),x=JSON.parse(fs.readFileSync(p));x[0].body={model:'DIFFERENT-MODEL',input:'different uncounted prompt'};fs.writeFileSync(p,JSON.stringify(x));},
 'raw-response-deleted':dir=>{editRecord(dir,r=>{r.client.responses=[];});},
 'cleanup-before-launch':dir=>{editRecord(dir,r=>{for(const s of r.states)s.completed_at=r.started_at-1000;});},
 'raw-child-output-deleted':dir=>{editRecord(dir,r=>{r.result.stdout_base64='';});}
};
function editRecord(dir,fn){const f=path.join(dir,'session-1/record.json'),r=JSON.parse(fs.readFileSync(f));fn(r);const b=JSON.stringify(r);fs.writeFileSync(f,b);const jfile=path.join(dir,'journal.json'),j=JSON.parse(fs.readFileSync(jfile));j.sessions[0].record_sha256=hash(b);fs.writeFileSync(jfile,JSON.stringify(j));}
const results=[];
for(const [name,mutate]of Object.entries(cases)){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-qa-smoke-'));fs.cpSync(original,dir,{recursive:true});mutate(dir);let accepted=false,error=null;try{validateSmoke(dir);accepted=true;}catch(e){error=e.message;}results.push({name,accepted,error,modified_archive:dir});}
fs.writeFileSync(new URL('./smoke-mutations.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(results);
