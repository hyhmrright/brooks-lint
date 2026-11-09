/** No native Codex launch: pure/saved-byte tests and owned HTTP fixture tests only. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {CASES,STREAM_POLICY,streamDeclaration,validRequest,ownedStreamStub} from './codex-stream.mjs';
import {STUB_CAPABILITY,hash} from './codex-channel.mjs';
import {ARCHIVE,validateArchive,assessment} from './codex-stream-drill.mjs';
test('stream controls are frozen, distinct and retain parent deadline above cleanup separately',()=>{
 assert(Object.isFrozen(CASES));assert(CASES.every(Object.isFrozen));assert.equal(CASES.length,6);assert.equal(STREAM_POLICY.model_calls,0);
 const idle=CASES.find(c=>c.id==='idle-retry0'),parent=CASES.find(c=>c.id==='parent-deadline');assert(idle.idle_ms<idle.deadline_ms);assert(parent.idle_ms>parent.deadline_ms);assert.equal(CASES.find(c=>c.id==='interrupt-retry1-budget1').expected_upstream,1);
});
test('CLI declarations pin both retry layers and idle setting without mutating inherited declarations',()=>{
 for(const c of CASES){const d=streamDeclaration({workspace:'/tmp/fake'},'http://127.0.0.1:1234/v1',c);assert(d.settings.includes('model_providers.hc_cli_stub.request_max_retries=0'));assert(d.settings.includes(`model_providers.hc_cli_stub.stream_max_retries=${c.stream_retries}`));assert.equal(d.argv.filter(x=>x===`model_providers.hc_cli_stub.stream_idle_timeout_ms=${c.idle_ms}`).length,1);}
 assert.throws(()=>streamDeclaration({},'http://127.0.0.1:1234/v1',{...CASES[0],deadline_ms:999}));
});
test('relay admission binds method, exact origin, route, host and public capability; rejects auth',()=>{
 const origin='http://127.0.0.1:1234',q={method:'POST',url:origin+'/v1/responses',headers:{host:'127.0.0.1:1234','x-hc-capability':STUB_CAPABILITY}};assert(validRequest(q,origin));
 for(const changed of [{method:'CONNECT'},{url:'http://external.invalid/v1/responses'},{url:origin+'/v1/responses?x=1'},{headers:{...q.headers,host:'external.invalid'}},{headers:{...q.headers,authorization:'Bearer fake'}},{headers:{...q.headers,'proxy-authorization':'fake'}},{headers:{host:q.headers.host}}])assert(!validRequest({...q,...changed},origin));
});
test('actual owned relay spends its one-forward budget atomically and close is idempotent',async()=>{
 const stub=await ownedStreamStub(CASES.find(c=>c.id==='interrupt-retry1-budget1'));
 try{const options={method:'POST',headers:{'x-hc-capability':STUB_CAPABILITY,'content-type':'application/json'},body:'{}'};const results=await Promise.all([fetch(stub.endpoint+'/responses',options),fetch(stub.endpoint+'/responses',options)]);await Promise.all(results.map(r=>r.arrayBuffer().catch(()=>null)));assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);const records=stub.records();assert.equal(records.forwarded,1);assert.equal(records.upstreamRequests.length,1);assert.equal(records.requests.length,2);const a=await stub.close(),b=await stub.close();assert.deepEqual(a,b);assert.equal(stub.records().events.filter(e=>e.type==='owned-services-closed').length,1);assert.equal(a.outgoing_requests,0);}finally{await stub.close();}
});
test('saved actual native CLI observations match their predeclared criteria without invoking CLI',()=>{
 const r=validateArchive();assert.equal(r.real_cli_cases,6);assert.equal(r.model_calls,0);assert.equal(r.live_ready,false);assert(r.cases.every(c=>c.pass));
});
test('deadline assessment remains distinct from failed or completed CLI turns',()=>{
 const r=JSON.parse(readFileSync(path.join(ARCHIVE,'observations','parent-deadline','record.json')));assert.equal(assessment(r).actual,'deadline');r.execution.reason=null;assert.notEqual(assessment(r).actual,'deadline');assert.equal(assessment(r).pass,false);
});
test('archive rejects changed summaries, plan, byte captures and source pin removal',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'codex-stream-validate-'));try{cpSync(ARCHIVE,dir,{recursive:true});validateArchive(dir);const runFile=path.join(dir,'run.json'),original=readFileSync(runFile),run=JSON.parse(original);run.cases[0].assessment.cli_requests=0;writeFileSync(runFile,JSON.stringify(run));assert.throws(()=>validateArchive(dir));writeFileSync(runFile,original);delete run.source_sha256['codex-stream.mjs'];writeFileSync(runFile,JSON.stringify(run));assert.throws(()=>validateArchive(dir));writeFileSync(runFile,original);const planFile=path.join(dir,'plan.json'),plan=readFileSync(planFile);writeFileSync(planFile,Buffer.concat([plan,Buffer.from(' ')]));assert.throws(()=>validateArchive(dir));writeFileSync(planFile,plan);writeFileSync(path.join(dir,'observations','success','stdout.bin'),'modified');assert.throws(()=>validateArchive(dir));}finally{rmSync(dir,{recursive:true,force:true});}
});
test('rehashing a tampered record cannot turn missing retries or credentials into passing evidence',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'codex-stream-record-'));try{cpSync(ARCHIVE,dir,{recursive:true});const runFile=path.join(dir,'run.json'),originalRun=readFileSync(runFile),recordFile=path.join(dir,'observations','interrupt-retry1','record.json'),original=readFileSync(recordFile);for(const mutate of [r=>r.http.requests.pop(),r=>{r.http.requests[0].headers.authorization='Bearer fake';},r=>{r.launch.env.OPENAI_API_KEY='fake';},r=>{r.execution.cleanup.confirmed=false;}]){const r=JSON.parse(original);mutate(r);writeFileSync(recordFile,JSON.stringify(r));const run=JSON.parse(originalRun);run.cases.find(c=>c.id==='interrupt-retry1').record_sha256=hash(readFileSync(recordFile));writeFileSync(runFile,JSON.stringify(run));assert.throws(()=>validateArchive(dir));}}finally{rmSync(dir,{recursive:true,force:true});}
});
test('idle attribution and service cleanup fail when timeout error, close ordering or sockets contradict evidence',()=>{
 const original=JSON.parse(readFileSync(path.join(ARCHIVE,'observations','idle-retry0','record.json')));
 for(const mutate of [r=>{r.execution.stdout_base64=Buffer.from(Buffer.from(r.execution.stdout_base64,'base64').toString().replaceAll('idle timeout waiting for SSE','unrelated error')).toString('base64');},r=>{r.services_cleanup.upstream.open_sockets=1;},r=>{r.http.events.find(e=>e.type==='upstream-response-close').elapsed_ms=0;}]){const r=structuredClone(original);mutate(r);assert.equal(assessment(r).pass,false);}
});
