/** Exploratory local-fixture adapter. Not Codex CLI and never study eligible. */
import assert from 'node:assert/strict';
import http from 'node:http';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const copy=x=>structuredClone(x);
const label=x=>typeof x==='string'&&/^[a-zA-Z0-9_.-]{1,100}$/.test(x);
export const ADAPTER_POLICY=Object.freeze({id:'controlled-read-fixture-v1',live_ready:false,study_eligible:false,max_requests:4,max_bytes:262144,timeout_ms:1500,automatic_retries:0,tools:['read_file'],native_cli_equivalent:false});
/** No path resolution or OS access: tool calls can only retrieve pre-exported bytes. */
export function createReadCapability(packet){
 assert(packet&&Array.isArray(packet.files)&&packet.files.length<=64);const files=new Map();let total=0;
 for(const f of packet.files){assert(typeof f.path==='string'&&/^[a-zA-Z0-9_./-]+$/.test(f.path)&&!f.path.startsWith('/')&&!f.path.split('/').some(p=>!p||p==='.'||p==='..'));assert(!/(?:rubric|\.test\.|cases\.json|AGENTS\.md)/.test(f.path),'Evaluation material forbidden');assert(typeof f.content==='string'&&Buffer.byteLength(f.content)<=ADAPTER_POLICY.max_bytes);total+=Buffer.byteLength(f.content);assert(total<=ADAPTER_POLICY.max_bytes,'Packet byte cap');assert.equal(hash(f.content),f.sha256);assert(!files.has(f.path));files.set(f.path,f.content);}
 return call=>{assert(call&&typeof call==='object'&&!Array.isArray(call));assert.deepEqual(Object.keys(call).sort(),['name','path']);assert.equal(call.name,'read_file','Unsupported tool');assert(files.has(call.path),'Path outside frozen packet');return {path:call.path,content:files.get(call.path),sha256:hash(files.get(call.path))};};
}
/** Integer micro-units are fixture reservations, not price estimates or billing evidence. */
export function createRunLedger(config){
 const c=copy(config);assert(label(c.model)&&label(c.reasoning));
 for(const k of ['max_requests','budget_microunits','reservation_microunits'])assert(Number.isSafeInteger(c[k])&&c[k]>0);
 assert(c.max_requests<=ADAPTER_POLICY.max_requests);assert(c.reservation_microunits<=c.budget_microunits);
 let requests=0,reserved=0,stopped=null;const events=[];
 return {reserve(model,reasoning){assert(!stopped,'Run stopped');assert.equal(model,c.model,'Model change requires new run');assert.equal(reasoning,c.reasoning,'Reasoning change requires new run');assert(requests<c.max_requests,'Request cap');assert(reserved<=c.budget_microunits-c.reservation_microunits,'Budget cap');requests++;reserved+=c.reservation_microunits;events.push({type:'reserved',request:requests,reserved_microunits:reserved});return requests;},stop(reason){if(!stopped){stopped=reason;events.push({type:'stopped',reason});}},snapshot(){return copy({config:c,requests,reserved_microunits:reserved,stopped,events,actual_cost:null,billing_verified:false});}};
}
function origin(value){const u=new URL(value);assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&u.pathname==='/fixture'&&!u.username&&!u.password&&!u.search&&!u.hash,'Owned loopback fixture only');return u;}
async function exchange(target,payload,key,{timeout_ms,max_bytes}){
 const body=Buffer.from(JSON.stringify(payload));assert(body.length<=max_bytes,'Request byte cap');
 return new Promise(resolve=>{let done=false,raw=Buffer.alloc(0),timer,req;const finish=(reason,status=null)=>{if(done)return;done=true;clearTimeout(timer);req?.destroy();resolve({reason,status,raw});};
 req=http.request(target,{method:'POST',agent:false,headers:{'authorization':`Bearer ${key}`,'content-type':'application/json','content-length':body.length}},res=>{res.on('error',()=>finish('response-error',res.statusCode));res.on('aborted',()=>finish('response-aborted',res.statusCode));res.on('data',b=>{if(done)return;if(raw.length+b.length>max_bytes){raw=Buffer.concat([raw,b.subarray(0,Math.max(0,max_bytes-raw.length))]);finish('response-byte-cap',res.statusCode);res.destroy();return;}raw=Buffer.concat([raw,b]);});res.on('end',()=>finish(res.statusCode===200?null:`http-${res.statusCode}`,res.statusCode));});
 req.on('error',()=>finish('transport-error'));timer=setTimeout(()=>finish('deadline'),timeout_ms);req.end(body);
 });
}
/** Auth never enters model-visible payload or read capability; only fixture keys accepted. */
export async function runControlledFixture({endpoint,fixtureCredential,packet,model='fixture-cheap',reasoning='low',max_requests=2,budget_microunits=2,reservation_microunits=1,timeout_ms=ADAPTER_POLICY.timeout_ms,max_bytes=ADAPTER_POLICY.max_bytes}){
 const target=origin(endpoint);assert(/^fixture-only-[a-f0-9]{32}$/.test(fixtureCredential));assert(Number.isSafeInteger(timeout_ms)&&timeout_ms>0&&timeout_ms<=1500);assert(Number.isSafeInteger(max_bytes)&&max_bytes>0&&max_bytes<=ADAPTER_POLICY.max_bytes);
 createReadCapability(packet);assert(Array.isArray(packet.messages)&&packet.messages.length<=8);for(const m of packet.messages){assert.deepEqual(Object.keys(m).sort(),['content','role']);assert.equal(m.role,'user');assert(typeof m.content==='string'&&Buffer.byteLength(m.content)<=ADAPTER_POLICY.max_bytes);}assert(Buffer.byteLength(JSON.stringify(packet))<=2*ADAPTER_POLICY.max_bytes,'Packet envelope cap');
 const started=performance.now(),deadline=started+timeout_ms;
 const frozen=copy(packet),read=createReadCapability(frozen);assert(!JSON.stringify(frozen).includes(fixtureCredential));
 const ledger=createRunLedger({model,reasoning,max_requests,budget_microunits,reservation_microunits});const exchanges=[],reads=[];let answer=null,reason=null,previous=null;
 // This fixture-only adapter retains exact client-observed body prefixes. Keys
 // and endpoints are restricted to public authored fixtures; never real auth.
 while(!reason&&answer===null){
  const remaining=Math.floor(deadline-performance.now());if(remaining<=0){reason='deadline';break;}
  const payload={model,reasoning,prompt:frozen.messages,files:frozen.files.map(f=>({path:f.path,sha256:f.sha256})),tool_result:previous};
  const bytes=Buffer.from(JSON.stringify(payload));if(bytes.length>max_bytes){reason='request-byte-cap';break;}
  try{ledger.reserve(model,reasoning);}catch(e){reason=e.message.includes('Budget')?'budget-cap':'request-cap';break;}
  const response=await exchange(target,payload,fixtureCredential,{timeout_ms:remaining,max_bytes});
  const evidence={request_sha256:hash(bytes),response_base64:response.raw.toString('base64'),response_sha256:hash(response.raw),response_scope:'client-observed-retained-prefix',response_bytes:response.raw.length,http_status:response.status,transport_error:response.reason,requested:{model,reasoning},reported:{model:null,reasoning:null},identity_status:'unobserved'};exchanges.push(evidence);
  if(response.reason){reason=response.reason;break;}
  if(performance.now()>deadline){reason='deadline';break;}
  let value;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(response.raw));}catch{reason='invalid-json';break;}
  if(!value||typeof value!=='object'||Array.isArray(value)){reason='invalid-envelope';break;}
  // Refuse echoes rather than attempting general-purpose secret redaction.
  if(response.raw.includes(Buffer.from(fixtureCredential))){reason='credential-echo';break;}
  if(!label(value.model)||!label(value.reasoning)){reason='identity-unreported';break;}
  evidence.reported={model:value.model,reasoning:value.reasoning};evidence.identity_status=value.model===model&&value.reasoning===reasoning?'reported-match-not-authenticated':'mismatch';
  if(evidence.identity_status==='mismatch'){reason='identity-mismatch';break;}
  try{
   if(value.type==='tool'){assert.deepEqual(Object.keys(value).sort(),['call','model','reasoning','type']);previous=read(value.call);reads.push({path:previous.path,sha256:previous.sha256});}
   else{assert.equal(value.type,'answer');assert.deepEqual(Object.keys(value).sort(),['model','reasoning','text','type']);assert.equal(typeof value.text,'string');answer=value.text;}
  }catch{reason='tool-or-envelope-denied';}
 }
 if(reason)ledger.stop(reason);
 return {adapter:ADAPTER_POLICY.id,simulation:true,live_ready:false,study_eligible:false,native_cli_equivalent:false,status:reason?'failed':'fixture-completed',reason,deadline_ms:timeout_ms,elapsed_ms:performance.now()-started,answer,reads,exchanges,ledger:ledger.snapshot(),actual_responding_model:null,provider_internal_retries:null,model_switches:[],limitations:['Authored fixture responses only','No arbitrary tools, shell, subprocesses, filesystem or network exposed by tool dispatch','Trusted parent and Node runtime are outside adversarial tool containment claim','Not a Codex CLI execution or frozen-study result','Reservations bound fixture dispatch, not production token cost or billing','Credential-echo rejection checks literal fixture key only; arbitrary encodings not detected']};
}
