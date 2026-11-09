import {createHash} from 'node:crypto';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {registration,checkRegistration,checkAuthorization,executeSmoke,REGISTRATION,ensureCleanup,DIR} from './native-smoke.mjs';import {validateSmoke} from './native-smoke-validate.mjs';import {createIntent,leaseArgs,NATIVE_SESSION_SOURCE,verifyIdentity} from './docker-lease.mjs';import {IMAGE} from './native-remote.mjs';
test('three-session real native offline smoke validates',()=>assert.equal(validateSmoke().inference_requests,6));
test('smoke registration unchanged and hash frozen',()=>assert.deepEqual(checkRegistration().value,registration()));
for(const key of ['enabled','registration_sha256','budget_nano_usd','user_reference','model','effort'])test('live refuses missing '+key,()=>{const r=checkRegistration();const a={enabled:true,registration_sha256:r.sha256,budget_nano_usd:100000000,user_reference:'test-only-no-authorization',model:'gpt-6-luna',effort:'low'};delete a[key];assert.throws(()=>checkAuthorization(a,r))});
test('live missing approval fails before transport or Docker',async()=>{await assert.rejects(executeSmoke({mode:'live',out:'/should-not-exist',transport:null}),/authorization/)});
test('registration source mutation fails before execution',()=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),'smoke-reg-'));try{const r=JSON.parse(fs.readFileSync(REGISTRATION));r.model='other';fs.writeFileSync(path.join(d,'r.json'),JSON.stringify(r));assert.throws(()=>checkRegistration(path.join(d,'r.json')))}finally{fs.rmSync(d,{recursive:true,force:true})}});
test('native idle workload is fixed and unknown workloads rejected',()=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),'smoke-lease-'));fs.chmodSync(d,0o700);try{const i=createIntent(d,IMAGE,{workload:'native-session'});const args=leaseArgs(i);assert.equal(args[args.indexOf('--entrypoint')+1],'node');assert.deepEqual(args.slice(-2),['-e',NATIVE_SESSION_SOURCE]);assert.throws(()=>createIntent(d,IMAGE,{workload:'arbitrary'}))}finally{fs.rmSync(d,{recursive:true,force:true})}});
test('native idle workload inspection rejects command drift',()=>{const r=JSON.parse(fs.readFileSync(path.join(DIR,'smoke-offline/session-1/record.json')));const state=r.states[0];const inspect=r.commands.find(x=>x.argv[1]==='inspect'&&x.argv[2]===state.identity.id);const info=JSON.parse(Buffer.from(inspect.stdout_base64,'base64'))[0];info.Config.Cmd=['-e','process.exit(0)'];assert.throws(()=>verifyIdentity(info,state.intent,state.identity))});
test('smoke cannot accept pending cleanup',()=>{const r=JSON.parse(fs.readFileSync(path.join(DIR,'smoke-offline/session-1/record.json')));r.states[0].phase='cleanup-pending';assert.throws(()=>ensureCleanup(r))});
test('smoke cannot accept missing remote read',()=>{const r=JSON.parse(fs.readFileSync(path.join(DIR,'smoke-offline/session-1/record.json')));r.client.events=r.client.events.filter(e=>e.params?.item?.type!=='commandExecution');assert.throws(()=>ensureCleanup(r))});

// Every edited session digest is recomputed: these test semantic binding, not hash mismatch.
const sha=b=>createHash('sha256').update(b).digest('hex');
function rewrittenArchive(edit){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'smoke-mutated-'));fs.cpSync(path.join(DIR,'smoke-offline'),dir,{recursive:true});try{const journal=JSON.parse(fs.readFileSync(path.join(dir,'journal.json')));const receipts=JSON.parse(fs.readFileSync(path.join(dir,'upstream.json')));const records=[1,2,3].map(n=>JSON.parse(fs.readFileSync(path.join(dir,'session-'+n,'record.json'))));edit({journal,receipts,records});for(let i=0;i<3;i++){const raw=JSON.stringify(records[i]);fs.writeFileSync(path.join(dir,'session-'+(i+1),'record.json'),raw);journal.sessions[i].record_sha256=sha(raw)}fs.writeFileSync(path.join(dir,'journal.json'),JSON.stringify(journal));fs.writeFileSync(path.join(dir,'upstream.json'),JSON.stringify(receipts));assert.throws(()=>validateSmoke(dir));}finally{fs.rmSync(dir,{recursive:true,force:true})}}
function syncFinal(r){const lines=Buffer.from(r.result.stdout_base64,'base64').toString().trimEnd().split('\n');lines[lines.length-1]='FINAL '+Buffer.from(JSON.stringify(r.client)).toString('base64');r.result.stdout_base64=Buffer.from(lines.join('\n')+'\n').toString('base64')}
function eventEdit(r,fn){const es=r.lease_events.trim().split('\n').map(JSON.parse);fn(es);r.lease_events=es.map(JSON.stringify).join('\n')+'\n'}
const mutations={
 'QA1 count body different model':x=>x.receipts[0].body={model:'DIFFERENT-MODEL',input:'different uncounted prompt'},
 'QA1 all raw SSE deleted':x=>{x.records[0].client.responses=[];syncFinal(x.records[0])},
 'QA1 raw child stdout deleted':x=>x.records[0].result.stdout_base64='',
 'QA1 cleanup before launch':x=>{for(const s of x.records[0].states)s.completed_at=x.records[0].started_at-1000},
 'count body different prompt':x=>x.receipts[0].body.input=[],
 'count ledger hash unrelated':x=>x.journal.transport.observations[0].request_sha256='0'.repeat(64),
 'count raw receipt missing':x=>delete x.receipts[0].response_body_base64,
 'count raw receipt inconsistent usage':x=>x.receipts[0].response_body_base64=Buffer.from('{"object":"response.input_tokens","input_tokens":999}').toString('base64'),
 'raw FINAL parsed state mismatch':x=>x.records[0].client.responses[0].status=503,
 'raw SSE reversed':x=>{x.records[0].client.responses.reverse();syncFinal(x.records[0])},
 'cross-session raw SSE':x=>{x.records[0].client.responses[0]=x.records[1].client.responses[0];syncFinal(x.records[0])},
 'response bytes missing from ledger':x=>delete x.records[0].broker.transport.observations[1].response_bytes,
 'response identity contradiction':x=>x.records[0].broker.transport.observations[1].reported_model='different',
 'cumulative prefix corrupted':x=>x.records[1].broker.transport.observations[0]=x.records[1].broker.transport.observations[2],
 'cumulative requests oversized':x=>x.journal.transport.attempts=7,
 'reservation underreported':x=>x.journal.transport.reserved_nano_usd=0,
 'import before cleanup':x=>x.journal.sessions[0].imported_at=x.records[0].started_at,
 'import after journal close':x=>x.journal.sessions[2].imported_at=Date.parse(x.journal.completed_at)+1000,
 'nonfinite cleanup time':x=>x.records[0].states[0].completed_at=null,
 'completion after session close':x=>x.records[0].states[0].completed_at=x.records[0].completed_at+1,
 'duplicate complete event':x=>eventEdit(x.records[0],es=>{const i=es.findIndex(e=>e.type==='complete');es.splice(i,0,structuredClone(es[i]))}),
 'missing complete event':x=>eventEdit(x.records[0],es=>{es.splice(es.findIndex(e=>e.type==='complete'),1)}),
 'failed exact removal':x=>eventEdit(x.records[0],es=>{es.find(e=>e.result?.argv[1]==='rm').result.code=1}),
 'unclosed exact removal':x=>eventEdit(x.records[0],es=>{es.find(e=>e.result?.argv[1]==='rm').result.closed=false}),
 'wrong removal identity':x=>eventEdit(x.records[0],es=>{es.find(e=>e.result?.argv[1]==='rm').result.argv[2]='0'.repeat(64)}),
 'absence before removal':x=>eventEdit(x.records[0],es=>{const i=es.findIndex(e=>e.result?.argv[1]==='rm');const a=es[i+1];a.result.started_at=new Date(x.records[0].started_at).toISOString()}),
 'state before final absence':x=>{const r=x.records[0];const es=r.lease_events.trim().split('\n').map(JSON.parse);const rm=es.find(e=>e.result?.argv[1]==='rm'&&e.result.argv[2]===r.states[0].identity.id);r.states[0].completed_at=rm.at},
 'cross-session journal records':x=>{[x.records[0],x.records[1]]=[x.records[1],x.records[0]]},
 'native final missing after valid SSE':x=>{x.records[0].client.events=x.records[0].client.events.filter(e=>e.params?.item?.type!=='agentMessage');syncFinal(x.records[0])}
};
for(const [name,edit]of Object.entries(mutations))test('rehashed smoke rejects '+name,()=>rewrittenArchive(edit));
