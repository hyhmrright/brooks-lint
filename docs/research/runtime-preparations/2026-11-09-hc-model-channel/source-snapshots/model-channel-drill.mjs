#!/usr/bin/env node
/** Local fixtures and offline archive checks only. No external provider transport. */
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createOfflineChannel,hash,CHANNEL_POLICY} from './model-channel.mjs';
import {runSandboxChannelProbe} from './model-channel-probe.mjs';
import {createSession,destroySession} from './process-executor.mjs';
import {frozenDesign} from './executor-preparation.mjs';
const ROOT=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-model-channel/',import.meta.url));
const modules=['model-channel.mjs','model-channel-probe.mjs','model-channel.test.mjs','model-channel-drill.mjs'];
const encode=x=>JSON.stringify(x,null,2)+'\n';
const sources=()=>Object.fromEntries(modules.map(n=>[n,hash(readFileSync(new URL(n,import.meta.url)))]));
const intended={model:'fixture-model',reasoning:'medium',provider:'fixture-provider'};
const requestBody=stream=>({model:intended.model,input:'SYNTHETIC local channel archive marker',reasoning:{effort:'medium'},store:false,stream});
const response={model:'fixture-model',reasoning:{effort:'medium'},output:[{type:'message',content:[{type:'output_text',text:'SYNTHETIC local upstream marker'}]}]};
export const CASES=['json-report-match','http401-no-refresh','http503-no-retry','redirect-credential-redaction','sse-partial-no-reconnect','model-report-mismatch','total-drip-deadline','sandbox-channel-only'];
function call(client){return new Promise(resolve=>{const req=http.request(client.endpoint,{method:'POST',agent:false,headers:{'content-type':'application/json','x-hc-capability':client.capability}},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,body:Buffer.concat(chunks)}));res.on('error',()=>resolve({status:null,body:Buffer.concat(chunks)}));});req.on('error',()=>resolve({status:null,body:Buffer.alloc(0)}));req.end(client.body);});}
function noSecret(value,secrets){const text=typeof value==='string'?value:JSON.stringify(value);for(const secret of secrets)for(const representation of [secret,Buffer.from(secret).toString('base64'),Buffer.from(secret).toString('hex')])assert(!text.includes(representation),'Credential/capability escaped evidence redaction');}
export async function recordArchive(root=ROOT){
 assert.equal(process.platform,'darwin','This complete archive includes a real Seatbelt probe');assert(!existsSync(path.join(root,'observations')),'Archive already exists');mkdirSync(path.join(root,'observations'),{recursive:true});mkdirSync(path.join(root,'source-snapshots'));
 const observations=[];
 for(const id of CASES){
  const credential=`fixture-only-${randomBytes(16).toString('hex')}`;let calls=0,authenticated=0;const sockets=new Set();
  const upstream=http.createServer((req,res)=>{calls++;if(req.headers.authorization===`Bearer ${credential}`)authenticated++;
   if(id==='http401-no-refresh'||id==='http503-no-retry'){res.writeHead(id.startsWith('http401')?401:503,{'content-type':'application/json','retry-after':'0'});res.end('{"error":"SYNTHETIC fixture rejection"}');}
   else if(id==='redirect-credential-redaction'){res.writeHead(302,{'location':'https://external.invalid/','x-fixture-echo':credential,'content-type':'application/json'});res.end(JSON.stringify({error:credential}));}
   else if(id==='sse-partial-no-reconnect'){res.writeHead(200,{'content-type':'text/event-stream'});res.write('data: {"type":"response.output_text.delta","delta":"SYNTHETIC partial"}\n\n');setTimeout(()=>res.destroy(),20);}
   else if(id==='total-drip-deadline'){res.writeHead(200,{'content-type':'text/event-stream'});const t=setInterval(()=>res.write('data: {}\n\n'),10);res.on('close',()=>clearInterval(t));}
   else {res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(id==='model-report-mismatch'?{...response,model:'different-fixture-model'}:response));}
  });
  upstream.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  const endpoint=`http://127.0.0.1:${upstream.address().port}/v1/responses`,channel=await createOfflineChannel({upstream:endpoint,body:requestBody(id.startsWith('sse')||id==='total-drip-deadline'),intended,fixtureCredential:credential,timeout_ms:id==='total-drip-deadline'?120:1500});
  try{
   const client=channel.client();let probe=null,reply;
   if(id==='sandbox-channel-only'){const d=frozenDesign(),session=createSession(d,d.order.turns[0]);try{probe=await runSandboxChannelProbe(session,client,endpoint);assert.equal(probe.code,0);const outcome=JSON.parse(Buffer.from(probe.stdout_base64,'base64'));assert(['EPERM','EACCES'].includes(outcome.denied.error));assert.equal(outcome.allowed.status,200);assert.equal(outcome.has_provider_credential,false);reply={status:outcome.allowed.status,body:Buffer.from(outcome.allowed.response_base64,'base64')};}finally{destroySession(session);}}
   else reply=await call(client);
   const evidence=await channel.completed;assert.equal(calls,1);assert.equal(authenticated,1);assert.equal(evidence.automatic_retries,0);assert.equal(evidence.live_ready,false);
   const saved={id,fixture_only:true,model_calls:0,upstream_fixture_calls:calls,dummy_auth_matches:authenticated,client_reply:{status:reply.status,body_base64:reply.body.toString('base64'),sha256:hash(reply.body)},evidence,config_declaration:channel.config(),sandbox_probe:probe};
   noSecret(saved,[credential,client.capability]);writeFileSync(path.join(root,'observations',id+'.json'),encode(saved),{flag:'wx'});observations.push({id,sha256:hash(readFileSync(path.join(root,'observations',id+'.json')))});
  }finally{await channel.close();for(const s of sockets)s.destroy();await new Promise(resolve=>upstream.close(resolve));}
 }
 for(const n of modules)writeFileSync(path.join(root,'source-snapshots',n),readFileSync(new URL(n,import.meta.url)),{flag:'wx'});
 const run={revision:1,recorded_at:new Date().toISOString(),host:{platform:process.platform,node:process.version,arch:process.arch},source_sha256:sources(),policy:CHANNEL_POLICY,observations,model_calls:0,real_credentials_used:0,semantic_reviews:0,live_ready:false,kind:'actual-local-HTTP-and-Seatbelt-observations-with-authored-synthetic-payloads',limitations:['Fake loopback upstream only; no real provider or Codex turn','Known literal dummy credential redaction is not arbitrary real-provider secret nonleakage proof','Buffered bounded relay, not faithful real-time streaming','Whole-process endpoint grant does not separate Codex model client from agent tools','Upstream reasoning.effort is request-level report, not actual internal/dynamic effort','Reported model/endpoint do not authenticate executed model/provider; provider remains unobserved','Effective CLI config, capability delivery, HTTPS/OAuth/refresh, provider-internal retries and full executor integration unverified']};
 writeFileSync(path.join(root,'run.json'),encode(run),{flag:'wx'});return run;
}
export function validateArchive(root=ROOT){
 const run=JSON.parse(readFileSync(path.join(root,'run.json')));assert.equal(run.model_calls,0);assert.equal(run.real_credentials_used,0);assert.equal(run.semantic_reviews,0);assert.equal(run.live_ready,false);assert.equal(run.host.platform,'darwin');assert.deepEqual(run.source_sha256,sources());assert.deepEqual(run.policy,CHANNEL_POLICY);assert.deepEqual(run.observations.map(x=>x.id),CASES);
 for(const [n,h]of Object.entries(run.source_sha256))assert.equal(hash(readFileSync(path.join(root,'source-snapshots',n))),h);
 assert.deepEqual(readdirSync(path.join(root,'observations')).sort(),CASES.map(x=>x+'.json').sort());
 for(const item of run.observations){const bytes=readFileSync(path.join(root,'observations',item.id+'.json'));assert.equal(hash(bytes),item.sha256);const r=JSON.parse(bytes),e=r.evidence;assert.equal(r.fixture_only,true);assert.equal(r.model_calls,0);assert.equal(r.upstream_fixture_calls,1);assert.equal(r.dummy_auth_matches,1);assert.equal(e.upstream_attempts,1);assert.equal(e.automatic_retries,0);assert.equal(e.authentication_refreshes,0);assert.equal(e.stream_reconnects,0);assert.equal(e.identity.stop_subsequent,true);assert.equal(e.identity.upstream_reported.provider,null);assert.equal(e.live_ready,false);assert.equal(hash(Buffer.from(e.response_base64,'base64')),e.response_sha256);assert.equal(hash(Buffer.from(r.client_reply.body_base64,'base64')),r.client_reply.sha256);assert.equal(r.config_declaration.contains_provider_credential,false);assert.equal(r.config_declaration.execution_enabled,false);assert(!/fixture-only-[a-f0-9]{32}/.test(bytes.toString()));
  if(item.id==='json-report-match')assert.equal(e.identity.identity_status,'reported-match-not-authenticated');
  if(item.id.startsWith('http'))assert.equal(e.reason,item.id==='http401-no-refresh'?'upstream-http-401':'upstream-http-503');
  if(item.id==='redirect-credential-redaction'){assert.equal(e.reason,'redirect-refused');assert(Buffer.from(e.response_base64,'base64').toString().includes('[REDACTED]'));}
  if(item.id==='sse-partial-no-reconnect'){assert.equal(e.partial,true);assert(Buffer.from(e.response_base64,'base64').toString().includes('SYNTHETIC partial'));}
  if(item.id==='model-report-mismatch')assert(e.identity.issues.includes('model-mismatch'));
  if(item.id==='total-drip-deadline')assert.equal(e.reason,'upstream-deadline');
  if(item.id==='sandbox-channel-only'){const p=r.sandbox_probe,o=JSON.parse(Buffer.from(p.stdout_base64,'base64'));assert.equal(p.policy_sha256,hash(p.policy_text));assert.equal(p.code,0);assert(['EPERM','EACCES'].includes(o.denied.error));assert.equal(o.allowed.status,200);assert.equal(o.has_provider_credential,false);}
 }
 return {offline:true,local_observations:run.observations.length,model_calls:0,live_ready:false,source_bound:true};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [command='validate',root]=process.argv.slice(2);assert(['record','validate'].includes(command));console.log(JSON.stringify(command==='record'?{observations:(await recordArchive(root)).observations.length,model_calls:0}:validateArchive(root)));}
