import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {validateSmoke} from '../../../../../evals/research/runtime/prospective/native-smoke-validate.mjs';
const original=path.resolve('docs/research/runtime-preparations/2026-11-09-native-remote/smoke-offline'),hash=x=>createHash('sha256').update(x).digest('hex');
const cases={
 'count-hash-rebound-wrong-input':x=>{x.receipts[0].body.input=[];for(const ledger of [x.j.transport,...x.records.map(r=>r.broker.transport)])ledger.observations[0].request_sha256=hash(JSON.stringify(x.receipts[0].body));},
 'raw-sse-rebound-wrong-model':x=>{const bytes=Buffer.from(x.records[0].client.responses[0].body_base64,'base64').toString().replaceAll('fixture-model','different-model');x.records[0].client.responses[0].body_base64=Buffer.from(bytes).toString('base64');x.receipts[1].response_body_base64=x.records[0].client.responses[0].body_base64;for(const ledger of [x.j.transport,...x.records.map(r=>r.broker.transport)]){ledger.observations[1].response_sha256=hash(bytes);ledger.observations[1].response_bytes=Buffer.byteLength(bytes);}},
 'native-final-message-disagrees':x=>{x.records[0].client.events.find(e=>e.method==='item/completed'&&e.params.item.type==='agentMessage').params.item.text='Contradicts raw provider completion';},
 'zero-reservations-rebound':x=>{for(const ledger of [x.j.transport,...x.records.map(r=>r.broker.transport)])ledger.reserved_nano_usd=0;},
 'import-before-cleanup':x=>{x.j.sessions[0].imported_at=x.records[0].started_at;},
 'unclosed-successful-removal':x=>{let events=x.records[0].lease_events.trim().split('\n').map(JSON.parse);events.find(e=>e.type==='docker'&&e.result.argv[1]==='rm').result.closed=false;x.records[0].lease_events=events.map(e=>JSON.stringify(e)).join('\n')+'\n';},
 'duplicate-completion-event':x=>{let events=x.records[0].lease_events.trim().split('\n').map(JSON.parse);const index=events.findIndex(e=>e.type==='complete');events.splice(index+1,0,structuredClone(events[index]));x.records[0].lease_events=events.map(e=>JSON.stringify(e)).join('\n')+'\n';},
 'native-source-digest-drift':x=>{x.records[0].sources['native-remote-client.cjs']='0'.repeat(64);}
};
const results=[];
for(const [name,mutate]of Object.entries(cases)){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-qa2-adjacent-'));fs.cpSync(original,dir,{recursive:true});
 const x={j:JSON.parse(fs.readFileSync(path.join(dir,'journal.json'))),receipts:JSON.parse(fs.readFileSync(path.join(dir,'upstream.json'))),records:[1,2,3].map(n=>JSON.parse(fs.readFileSync(path.join(dir,`session-${n}/record.json`))))};mutate(x);
 for(let n=0;n<3;n++){const r=x.records[n],lines=Buffer.from(r.result.stdout_base64,'base64').toString().trimEnd().split('\n');lines[lines.length-1]='FINAL '+Buffer.from(JSON.stringify(r.client)).toString('base64');r.result.stdout_base64=Buffer.from(lines.join('\n')+'\n').toString('base64');const raw=JSON.stringify(r);fs.writeFileSync(path.join(dir,`session-${n+1}/record.json`),raw);x.j.sessions[n].record_sha256=hash(raw);}
 fs.writeFileSync(path.join(dir,'journal.json'),JSON.stringify(x.j));fs.writeFileSync(path.join(dir,'upstream.json'),JSON.stringify(x.receipts));
 let accepted=false,error=null;try{validateSmoke(dir);accepted=true}catch(e){error=e.message.split('\n')[0]};results.push({name,accepted,error,archive:dir});
}
fs.writeFileSync(new URL('./adjacent-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(results.map(({archive,...r})=>r));
