import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validate} from '../../../../../evals/research/runtime/prospective/docker-lease-drill.mjs';
const source=new URL('../observations/',import.meta.url);
const results=[];
for(const [name,change] of [
 ['removal timeout cannot count as successful cleanup',events=>{events.find(e=>e.type==='docker'&&e.result.argv[1]==='rm').result.reason='deadline';}],
 ['cleanup pending cannot count as completion',(_e,s)=>{s.phase='cleanup-pending';}],
 ['absolute completion facts cannot change identity',(_e,_s,c)=>{c.facts.id='f'.repeat(64);}],
 ['absence observation with truncated pipe rejected',events=>{events.filter(e=>e.type==='docker'&&e.result.argv[1]==='inspect').at(-1).result.closed=false;}],
 ['Docker command ending after event rejected',events=>{const e=events.find(e=>e.type==='docker'&&e.result.argv[1]==='rm');e.result.completed_at=new Date(e.at+1000).toISOString();}]
]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'lease-qa2-'));
 try{
 fs.cpSync(source,root,{recursive:true});const runFile=path.join(root,'run.json');const run=JSON.parse(fs.readFileSync(runFile));const c=run.results.find(x=>x.name==='absolute-deadline');const dir=path.join(root,c.name),stateFile=path.join(dir,`${c.facts.intent.token}.state.json`),eventsFile=path.join(dir,'events.jsonl');const state=JSON.parse(fs.readFileSync(stateFile));const events=fs.readFileSync(eventsFile,'utf8').trim().split('\n').map(JSON.parse);
 change(events,state,c);fs.writeFileSync(stateFile,JSON.stringify(state));fs.writeFileSync(eventsFile,events.map(x=>JSON.stringify(x)).join('\n')+'\n');fs.writeFileSync(runFile,JSON.stringify(run));fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(c));
 const invFile=path.join(root,'inventory.json'),inv=JSON.parse(fs.readFileSync(invFile));for(const f of Object.keys(inv))inv[f]=createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');fs.writeFileSync(invFile,JSON.stringify(inv));
 let rejected=false,error;try{validate(root)}catch(e){rejected=true;error=e.message}assert(rejected,name);results.push({name,rejected,error});
 }finally{fs.rmSync(root,{recursive:true,force:true})}
}
console.log(JSON.stringify({pass:true,probes:results},null,2));
