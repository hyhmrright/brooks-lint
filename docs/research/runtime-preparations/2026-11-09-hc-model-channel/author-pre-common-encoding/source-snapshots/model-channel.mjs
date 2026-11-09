/** Offline-only parent-owned transport. No real credentials, external origin or model launch. */
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {performance} from 'node:perf_hooks';
export const CHANNEL_POLICY=Object.freeze({revision:1,mode:'offline-local-fixtures-only',upstream_attempts:1,retries:0,redirects:0,auth_refreshes:0,stream_reconnects:0,max_request_bytes:65536,max_response_bytes:262144,max_connections:8,timeout_ms:1500,live_ready:false});
export const hash=b=>createHash('sha256').update(b).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x));
const safeName=x=>typeof x==='string'&&/^[a-zA-Z0-9_.-]{1,100}$/.test(x);
function localUrl(value){const u=new URL(value);assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&Number(u.port)>0&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/v1/responses','Only exact numeric-loopback fixture response endpoints are supported');return u;}
export function pinRequest(body){
 assert(body&&typeof body==='object'&&!Array.isArray(body));
 assert.deepEqual(Object.keys(body).sort(),['input','model','reasoning','store','stream']);
 assert(safeName(body.model));assert.equal(typeof body.input,'string');assert(body.input.length>0);
 assert.deepEqual(Object.keys(body.reasoning),['effort']);assert(safeName(body.reasoning.effort));assert.equal(body.store,false);assert.equal(typeof body.stream,'boolean');
 const bytes=json(body);assert(bytes.length<=CHANNEL_POLICY.max_request_bytes);return bytes;
}
function secretEqual(a,b){if(typeof a!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function redact(bytes,secrets){let s=Buffer.isBuffer(bytes)?bytes.toString('utf8'):String(bytes);s=s.replace(/\\u00([0-9a-f]{2})/gi,(full,hex)=>{const n=parseInt(hex,16);return n>=32&&n!==34&&n!==92?String.fromCharCode(n):full;});for(const secret of secrets){s=s.split(secret).join('[REDACTED]');for(let n=secret.length-1;n>=8;n--)if(s.endsWith(secret.slice(0,n))){s=s.slice(0,-n)+'[REDACTED-PARTIAL]';break;}}return Buffer.from(s);}
/** Identity fields are source-specific observations, never proof of remote model execution. */
export function identityEvidence(intended,request,reported,{partial=false,format_error=null}={}){
 const upstream={model:null,reasoning:null,provider:null,reasoning_scope:'reported-request-level-setting-not-internal-compute-or-dynamic-selected-effort',source:'sanitized-upstream-response-fields'};
 if(reported&&typeof reported==='object'){
  if(typeof reported.model==='string'&&reported.model.trim())upstream.model=reported.model;
  if(typeof reported.reasoning?.effort==='string'&&reported.reasoning.effort.trim())upstream.reasoning=reported.reasoning.effort;
 }
 const issues=[];if(partial)issues.push('partial-response');if(format_error)issues.push(format_error);
 for(const k of ['model','reasoning'])if(upstream[k]===null)issues.push(`${k}-unreported`);else if(upstream[k]!==intended[k])issues.push(`${k}-mismatch`);
 return {intended:{...intended},request_observed:{model:request.model,reasoning:request.reasoning.effort,provider:null,source:'broker-observed-pinned-request'},upstream_reported:upstream,identity_status:issues.length?'unverified-or-mismatched':'reported-match-not-authenticated',issues,stop_subsequent:true,live_ready:false,limitations:['Request fields establish what was requested, not what executed','Provider identity remains unobserved; endpoint configuration is a separate route declaration','Even matching upstream fields are reports, not authenticated model/reasoning execution evidence']};
}
function parseReported(bytes,contentType){
 try{
  if(!contentType?.startsWith('text/event-stream'))return {reported:JSON.parse(bytes),format_error:null};
  const lines=new TextDecoder('utf-8',{fatal:true}).decode(bytes).split(/\r?\n/);let reported=null,completed=false;
  for(const line of lines){if(!line.startsWith('data:'))continue;const data=line.slice(5).trimStart();if(data==='[DONE]')continue;const e=JSON.parse(data);if(typeof e.type==='string'&&e.type.includes('configuration_update'))return {reported:null,format_error:'dynamic-configuration-unreviewed'};if(e.type==='response.completed'){assert(!completed);assert(e.response&&typeof e.response==='object');completed=true;reported=e.response;}}
  return {reported,format_error:completed?null:'sse-completion-unobserved'};
 }catch{return {reported:null,format_error:'response-format-unverified'};}
}
/** Private fake upstream owns the disposable dummy key. The broker never reads host auth state. */
export async function createOfflineChannel({upstream,body,intended,fixtureCredential,timeout_ms=CHANNEL_POLICY.timeout_ms,max_response_bytes=CHANNEL_POLICY.max_response_bytes}={}){
 intended=structuredClone(intended);Object.freeze(intended);
 const target=localUrl(upstream),expected=pinRequest(body),requestBody=JSON.parse(expected);
 assert(intended&&safeName(intended.model)&&safeName(intended.reasoning)&&safeName(intended.provider));assert.equal(intended.model,body.model);assert.equal(intended.reasoning,body.reasoning.effort);
 assert(typeof fixtureCredential==='string'&&/^fixture-only-[a-f0-9]{32}$/.test(fixtureCredential),'Only disposable fixture credentials are accepted');
 assert(Number.isSafeInteger(timeout_ms)&&timeout_ms>0&&timeout_ms<=10000);assert(Number.isSafeInteger(max_response_bytes)&&max_response_bytes>0&&max_response_bytes<=CHANNEL_POLICY.max_response_bytes);
 assert(!expected.includes(Buffer.from(fixtureCredential))&&!Object.values(intended).some(v=>v.includes(fixtureCredential)),'Credential must not be request/identity data');
 const capability=randomBytes(24).toString('hex'),secrets=[fixtureCredential,capability];
 let attempted=false,closing=false,dispatches=0,observation=null,active=null;const sockets=new Set(),connectionTimers=new Map(),start=performance.now();let resolveObservation;
 const completed=new Promise(resolve=>{resolveObservation=resolve;});
 const record=value=>{observation=value;resolveObservation(value);};
 const server=http.createServer(async(req,res)=>{
  req.on('error',()=>{});res.on('error',()=>{});
  const deny=(status,reason)=>{res.writeHead(status,{'content-type':'application/json','connection':'close'});res.end(JSON.stringify({error:reason}));req.resume();};
  if(closing)return deny(503,'channel-closed');
  if(req.method!=='POST'||req.url!=='/v1/responses')return deny(403,'route-denied');
  if(req.headers.host!==`127.0.0.1:${server.address().port}`)return deny(403,'host-denied');
  if(!secretEqual(req.headers['x-hc-capability'],capability))return deny(403,'capability-denied');
  if(req.headers.authorization||req.headers['proxy-authorization']||req.headers['transfer-encoding']||req.headers['content-encoding']||req.headers['content-type']!=='application/json')return deny(400,'headers-denied');
  if(attempted)return deny(409,'primary-already-consumed');
  let received=Buffer.alloc(0),requestEnded=false;
  const requestTimer=setTimeout(()=>{if(!requestEnded){res.destroy();req.destroy();}},timeout_ms);
  try{for await(const chunk of req){if(received.length+chunk.length>CHANNEL_POLICY.max_request_bytes){requestEnded=true;clearTimeout(requestTimer);return deny(413,'request-too-large');}received=Buffer.concat([received,chunk]);}}catch{requestEnded=true;clearTimeout(requestTimer);return;}
  requestEnded=true;clearTimeout(requestTimer);
  if(!received.equals(expected))return deny(400,'pinned-request-mismatch');
  if(attempted)return deny(409,'primary-already-consumed');
  // Charge synchronously, before any network operation. Nothing resets this budget.
  attempted=true;dispatches++;clearTimeout(connectionTimers.get(req.socket));
  let raw=Buffer.alloc(0),status=null,contentType=null,terminal=false,timer;
  const finish=(reason,partial)=>{
   if(terminal)return;terminal=true;clearTimeout(timer);
   const sanitized=redact(raw,secrets),parsed=parseReported(sanitized,contentType),identity=identityEvidence(intended,requestBody,parsed.reported,{partial,format_error:parsed.format_error});
   const obs={revision:1,fixture_only:true,elapsed_ms:performance.now()-start,upstream_attempts:dispatches,automatic_retries:0,redirect_followed:false,authentication_refreshes:0,stream_reconnects:0,status:reason?'failed':'transport-completed',reason,upstream_status:status,content_type:contentType,response_base64:sanitized.toString('base64'),response_sha256:hash(sanitized),retained_bytes:sanitized.length,partial,request_sha256:hash(expected),request_observed:JSON.parse(expected),configured_route:{provider_id:intended.provider,origin:target.origin,path:target.pathname,source:'parent-pinned-local-fixture-route'},identity,raw_capture_policy:'Known literal disposable credentials/capability redacted before client/evidence; arbitrary encodings and real-provider leakage unverified',live_ready:false};
   record(obs);
   if(!res.destroyed){res.writeHead(reason?502:200,{'content-type':contentType??'application/octet-stream','connection':'close'});res.end(sanitized);}
  };
  const headers={'authorization':`Bearer ${fixtureCredential}`,'content-type':'application/json','content-length':expected.length};
  active=http.request(target,{method:'POST',headers,agent:false},up=>{
   status=up.statusCode;const declaredType=typeof up.headers['content-type']==='string'?up.headers['content-type'].split(';')[0].trim().toLowerCase():null;contentType=['application/json','text/event-stream'].includes(declaredType)?declaredType:'application/octet-stream';
   up.on('error',()=>finish('upstream-response-error',true));up.on('aborted',()=>finish('upstream-aborted',true));
   up.on('data',chunk=>{if(terminal)return;if(raw.length+chunk.length>max_response_bytes){raw=Buffer.concat([raw,chunk.subarray(0,Math.max(0,max_response_bytes-raw.length))]);finish('response-byte-limit',true);up.destroy();active.destroy();return;}raw=Buffer.concat([raw,chunk]);});
   up.on('end',()=>finish(status>=200&&status<300?null:status>=300&&status<400?'redirect-refused':`upstream-http-${status}`,false));
  });
  active.on('error',()=>finish('upstream-transport-error',true));
  timer=setTimeout(()=>{finish('upstream-deadline',true);active.destroy();},timeout_ms);
  res.on('close',()=>{if(!terminal){finish('client-disconnected',true);active.destroy();}});
  active.end(expected);
 });
 server.requestTimeout=timeout_ms;server.headersTimeout=timeout_ms;server.keepAliveTimeout=1;
 server.maxConnections=CHANNEL_POLICY.max_connections;
 server.on('connection',socket=>{sockets.add(socket);const t=setTimeout(()=>socket.destroy(),timeout_ms);connectionTimers.set(socket,t);socket.on('close',()=>{sockets.delete(socket);clearTimeout(t);connectionTimers.delete(socket);});});
 server.on('clientError',(_error,socket)=>socket.destroy());
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const endpoint=`http://127.0.0.1:${server.address().port}/v1/responses`;
 return {endpoint,client:()=>({endpoint,capability,body:expected.toString('utf8')}),completed,observation:()=>observation,dispatches:()=>dispatches,async close(){closing=true;if(!attempted&&!observation)record({revision:1,fixture_only:true,status:'not-attempted',reason:'channel-closed-before-dispatch',request_observed:null,upstream_attempts:0,live_ready:false});active?.destroy();for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));},config:()=>codexChannelDeclaration(endpoint,intended),policy:CHANNEL_POLICY};
}
/** A no-auth custom provider declaration for a future reviewed local relay. Never launches Codex. */
export function codexChannelDeclaration(endpoint,intended){
 const u=localUrl(endpoint);for(const k of ['model','reasoning','provider'])assert(safeName(intended[k]));
 const id='hc_research_relay';
 return {provider_id:id,base_url:u.origin+'/v1',model:intended.model,reasoning:intended.reasoning,config_toml:`model = ${JSON.stringify(intended.model)}\nmodel_provider = "${id}"\nmodel_reasoning_effort = ${JSON.stringify(intended.reasoning)}\n[model_providers.${id}]\nname = "HC parent relay (offline preparation)"\nbase_url = ${JSON.stringify(u.origin+'/v1')}\nwire_api = "responses"\nrequires_openai_auth = false\nrequest_max_retries = 0\nstream_max_retries = 0\nsupports_websockets = false\n`,execution_enabled:false,contains_provider_credential:false,capability_delivery:'unimplemented-for-real-Codex; offline client sends an ephemeral x-hc-capability header',limitations:['Declaration only; no real Codex effective config, wire request, discovery or hidden retry behavior observed','A command sandbox network policy is not proof of client model/auth traffic control','Loopback-only fixtures do not verify HTTPS, production OAuth/session refresh or upstream internal retries']};
}
