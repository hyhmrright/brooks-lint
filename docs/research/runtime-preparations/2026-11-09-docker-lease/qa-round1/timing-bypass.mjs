import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validate} from '../../../../../evals/research/runtime/prospective/docker-lease-drill.mjs';
const source=new URL('../observations/',import.meta.url);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'lease-qa-timing-'));
try {
 fs.cpSync(source,root,{recursive:true});
 const run=JSON.parse(fs.readFileSync(path.join(root,'run.json')));
 const c=run.results.find(x=>x.name==='absolute-deadline');
 const stateFile=path.join(root,c.name,`${c.facts.intent.token}.state.json`);
 const state=JSON.parse(fs.readFileSync(stateFile));
 const original=state.completed_at;
 state.completed_at=c.facts.intent.issued_at+1;
 fs.writeFileSync(stateFile,JSON.stringify(state));
 const eventsFile=path.join(root,c.name,'events.jsonl');
 const events=fs.readFileSync(eventsFile,'utf8').trim().split('\n').map(JSON.parse);
 events.find(x=>x.type==='complete').at=state.completed_at;
 fs.writeFileSync(eventsFile,events.map(x=>JSON.stringify(x)).join('\n')+'\n');
 const inventoryFile=path.join(root,'inventory.json');
 const inv=JSON.parse(fs.readFileSync(inventoryFile));
 for(const f of Object.keys(inv))inv[f]=createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
 fs.writeFileSync(inventoryFile,JSON.stringify(inv));
 let result;try{result={accepted:true,result:validate(root)}}catch(e){result={accepted:false,error:e.message}}
 console.log(JSON.stringify({mutation:'State and completion event now claim cleanup before absolute lease deadline and before Docker cleanup evidence; original facts timestamp stays intact',original_state_completed_at:original,mutated_state_completed_at:state.completed_at,deadline:c.facts.intent.deadline,result},null,2));
} finally {fs.rmSync(root,{recursive:true,force:true})}
