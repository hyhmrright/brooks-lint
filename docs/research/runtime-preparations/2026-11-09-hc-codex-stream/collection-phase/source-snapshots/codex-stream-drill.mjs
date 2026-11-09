#!/usr/bin/env node
/** Saved-byte validation is offline. Explicit record invokes only owned protocol fixtures. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,realpathSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CASES,STREAM_POLICY,runStreamCase,validRequest} from './codex-stream.mjs';
import {hash,STUB_AUTH,STUB_CAPABILITY} from './codex-channel.mjs';
export const ARCHIVE=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-codex-stream/',import.meta.url));
const MODULES=['codex-stream.mjs','codex-stream-drill.mjs','codex-stream.test.mjs'];
const DEPENDENCIES=['codex-channel.mjs','process-executor.mjs','process-executor-guardian.mjs','executor-preparation.mjs'];
const json=x=>JSON.stringify(x,null,2)+'\n',bytes=n=>readFileSync(new URL(n,import.meta.url));
function write(p,b){writeFileSync(p,b,{flag:'wx'});}
export function assessment(r){
 const e=r.execution,c=r.case,events=Buffer.from(e.stdout_base64,'base64').toString().trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
 const actual=e.reason==='cli-deadline'?'deadline':e.fixture_exit?.code===0&&events.some(x=>x.type==='turn.completed')?'completed':e.fixture_exit?.code===1&&events.some(x=>x.type==='turn.failed')?'failed':'unresolved';
 const checks={cli_count:r.http.requests.length===c.expected_cli,upstream_count:r.http.forwarded===c.expected_upstream,terminal:actual===c.expected,cleanup:e.cleanup.confirmed&&['absent','zombie-only'].includes(e.cleanup.final_state)&&e.closed_stdio===true,services_closed:!r.services_cleanup.broker.listening&&!r.services_cleanup.upstream.listening&&r.services_cleanup.outgoing_requests===0};
 if(c.behavior==='idle'){checks.partial_delivered=r.http.events.some(x=>x.type==='broker-stream-data');checks.before_parent_deadline=e.reason===null&&e.elapsed_ms<c.deadline_ms;checks.no_synthetic_interrupt=!r.http.events.some(x=>x.type==='upstream-interrupted');}
 if(c.expected==='deadline'){checks.deadline_signal=e.signals.includes('SIGTERM');checks.bounded=e.elapsed_ms<=c.deadline_ms+STREAM_POLICY.cleanup_budget_ms;}
 return {actual,cli_requests:r.http.requests.length,upstream_requests:r.http.forwarded,checks,pass:Object.values(checks).every(Boolean)};
}
function safeHeaders(r){for(const q of r.http.requests){assert.equal(q.headers.authorization,undefined);assert.equal(q.headers['proxy-authorization'],undefined);assert.equal(q.headers['x-hc-capability'],STUB_CAPABILITY);for(const key of Object.keys(q.headers))assert(!/api[-_]key|access[-_]token|refresh[-_]token/i.test(key));}}
export async function recordArchive(binary,root=ARCHIVE){
 assert.equal(process.platform,'darwin');assert(binary);binary=realpathSync(binary);mkdirSync(root,{recursive:true});assert(!existsSync(path.join(root,'plan.json')),'Never overwrite a run');
 // Published before launch. Expectation failures are preserved, never rewritten to observed counts.
 const plan={revision:1,created_at:new Date().toISOString(),policy:STREAM_POLICY,cases:CASES,scope:'real native CLI to owned local fake services only; no inference'};
 write(path.join(root,'plan.json'),json(plan));mkdirSync(path.join(root,'source-snapshots'));for(const n of MODULES)write(path.join(root,'source-snapshots',n),bytes(n));
 const source_sha256=Object.fromEntries(MODULES.map(n=>[n,hash(bytes(n))])),dependency_sha256=Object.fromEntries(DEPENDENCIES.map(n=>[n,hash(bytes(n))]));
 const version=spawnSync(binary,['--version'],{env:{PATH:'/usr/bin:/bin',HOME:'/nonexistent',CODEX_HOME:'/nonexistent'},timeout:2000});assert.equal(version.status,0);write(path.join(root,'codex-version.bin'),version.stdout);
 mkdirSync(path.join(root,'observations'));const cases=[];
 for(const spec of CASES){const r=await runStreamCase(binary,spec);safeHeaders(r);const folder=path.join(root,'observations',spec.id);mkdirSync(folder);write(path.join(folder,'record.json'),json(r));for(const name of ['stdout','stderr'])write(path.join(folder,name+'.bin'),Buffer.from(r.execution[name+'_base64'],'base64'));for(const [kind,rows]of [['cli-request',r.http.requests],['upstream-request',r.http.upstreamRequests],['response',r.http.responses]])for(const [i,row]of rows.entries())write(path.join(folder,`${kind}-${i}.body.bin`),Buffer.from(row.body_base64,'base64'));cases.push({id:spec.id,record_sha256:hash(readFileSync(path.join(folder,'record.json'))),assessment:assessment(r)});}
 const run={revision:1,recorded_at:new Date().toISOString(),plan_sha256:hash(readFileSync(path.join(root,'plan.json'))),source_sha256,dependency_sha256,binary:{path:binary,version:version.stdout.toString().trim(),sha256:hash(readFileSync(binary)),version_stdout_sha256:hash(version.stdout)},host:{platform:process.platform,arch:process.arch,node:process.version},cases,real_cli_cases:cases.length,model_calls:0,real_credentials_used:0,semantic_reviews:0,live_ready:false};write(path.join(root,'run.json'),json(run));return run;
}
export function validateArchive(root=ARCHIVE){
 const run=JSON.parse(readFileSync(path.join(root,'run.json'))),plan=JSON.parse(readFileSync(path.join(root,'plan.json')));
 assert.equal(run.revision,1);assert.equal(plan.revision,1);assert.equal(run.plan_sha256,hash(readFileSync(path.join(root,'plan.json'))));assert.deepEqual(plan.cases,CASES);assert.deepEqual(plan.policy,STREAM_POLICY);assert.equal(run.host.platform,'darwin');
 for(const field of ['model_calls','real_credentials_used','semantic_reviews'])assert.equal(run[field],0);assert.equal(run.live_ready,false);assert.equal(run.real_cli_cases,CASES.length);assert.deepEqual(run.cases.map(c=>c.id),CASES.map(c=>c.id));
 assert.equal(run.binary.version_stdout_sha256,hash(readFileSync(path.join(root,'codex-version.bin'))));assert.equal(run.binary.version,readFileSync(path.join(root,'codex-version.bin'),'utf8').trim());assert(/^[a-f0-9]{64}$/.test(run.binary.sha256));
 assert.deepEqual(Object.keys(run.source_sha256).sort(),MODULES.toSorted());assert.deepEqual(Object.keys(run.dependency_sha256).sort(),DEPENDENCIES.toSorted());
 for(const [n,h]of Object.entries(run.source_sha256)){assert.equal(hash(bytes(n)),h);assert.equal(hash(readFileSync(path.join(root,'source-snapshots',n))),h);}
 for(const [n,h]of Object.entries(run.dependency_sha256))assert.equal(hash(bytes(n)),h);
 for(const item of run.cases){const folder=path.join(root,'observations',item.id),record=readFileSync(path.join(folder,'record.json')),r=JSON.parse(record),spec=CASES.find(c=>c.id===item.id);assert.equal(hash(record),item.record_sha256);assert.deepEqual(r.case,spec);safeHeaders(r);
  assert.equal(r.model_calls,0);assert.equal(r.real_credentials_used,0);assert.equal(r.live_ready,false);assert.equal(r.actual_responding_model,null);assert.deepEqual(r.initial_state,{home:[],codex_home:[],auth_json_present:false});assert.equal(r.launch.policy_sha256,hash(r.launch.policy_text));
  const origin=r.declaration.proxy_origin;assert.equal(r.launch.env.HTTP_PROXY,origin);assert.equal(r.launch.env.CODEX_HOME.startsWith('/'),true);assert.equal(r.launch.env.__CFPREFERENCES_AVOID_DAEMON,'1');for(const key of ['OPENAI_API_KEY','CODEX_API_KEY','ANTHROPIC_API_KEY','NODE_OPTIONS'])assert.equal(r.launch.env[key],undefined);
  assert(r.declaration.settings.includes('model_providers.hc_cli_stub.request_max_retries=0'));assert(r.declaration.settings.includes(`model_providers.hc_cli_stub.stream_max_retries=${spec.stream_retries}`));assert(r.declaration.settings.includes(`model_providers.hc_cli_stub.stream_idle_timeout_ms=${spec.idle_ms}`));assert(r.declaration.settings.includes('cli_auth_credentials_store="file"'));assert(r.declaration.settings.includes('model_providers.hc_cli_stub.requires_openai_auth=false'));
  assert(r.launch.policy_text.includes('(deny default)'));assert(!r.launch.policy_text.includes('(allow network*)'));const network=r.launch.policy_text.split('\n').filter(l=>l.includes('allow network'));assert.deepEqual(network,[`(allow network-outbound (remote ip "localhost:${new URL(origin).port}"))`]);
  assert.equal(r.http.forwarded,r.http.upstreamRequests.length);const names=['record.json','stdout.bin','stderr.bin'];
  for(const name of ['stdout','stderr']){const b=readFileSync(path.join(folder,name+'.bin'));assert.equal(b.toString('base64'),r.execution[name+'_base64']);assert.equal(hash(b),r.execution[name+'_sha256']);}
  for(const [kind,rows]of [['cli-request',r.http.requests],['upstream-request',r.http.upstreamRequests],['response',r.http.responses]])for(const [i,row]of rows.entries()){const name=`${kind}-${i}.body.bin`;names.push(name);const b=readFileSync(path.join(folder,name));assert.equal(b.toString('base64'),row.body_base64);assert.equal(hash(b),row.body_sha256);}
  assert.deepEqual(readdirSync(folder).sort(),names.sort());
  for(const q of r.http.requests){assert(validRequest(q,origin));const b=JSON.parse(Buffer.from(q.body_base64,'base64'));assert.equal(b.model,'fixture-model');assert.equal(b.reasoning.effort,'medium');assert.equal(b.store,false);assert.equal(b.stream,true);}
  for(const q of r.http.upstreamRequests)assert.equal(q.headers.authorization,STUB_AUTH);
  assert.deepEqual(item.assessment,assessment(r));assert.equal(item.assessment.pass,true,`Predeclared criteria not met for ${item.id}; retain and investigate observations`);
 }
 return {offline:true,real_cli_cases:run.real_cli_cases,model_calls:0,live_ready:false,cases:run.cases.map(c=>({id:c.id,...c.assessment}))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [command='validate',binary,root]=process.argv.slice(2);assert(['validate','record'].includes(command));console.log(JSON.stringify(command==='record'?await recordArchive(binary,root):validateArchive(binary)));}
