import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createUpstreamTransport,parseCompletion,SMOKE_LIMITS} from './native-upstream-transport.mjs';
const key='fixture-only-public-upstream-key';
const input=()=>({model:'fixture-model',reasoning:{effort:'low'},stream:true,store:false,
  input:[{role:'user',content:'PUBLIC fixture'}],tools:[]});
const completed=(id='r1')=>({id,model:'fixture-model',status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'PUBLIC result'}]}],usage:{input_tokens:12,output_tokens:3,total_tokens:15}});
const sse=r=>`event: response.completed\ndata: ${JSON.stringify({type:'response.completed',response:r})}\n\n`;
const answer=(r,value=completed())=>{r.writeHead(200,{'content-type':'text/event-stream'});r.end(sse(value));};
let dir,tls,openssl=true,fixtureSequence=0;
const archive=process.env.BROOKS_OFFLINE_TLS_RECORD_DIR;
if(archive){assert(path.isAbsolute(archive));fs.mkdirSync(archive,{recursive:false});}
try{execFileSync('openssl',['version'],{stdio:'ignore'});}catch{openssl=false;}
before(()=>{if(!openssl)return;dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-public-tls-'));
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',path.join(dir,'key.pem'),'-out',path.join(dir,'cert.pem'),'-days','1','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});
  tls={key:fs.readFileSync(path.join(dir,'key.pem')),cert:fs.readFileSync(path.join(dir,'cert.pem'))};});
after(()=>{if(dir)fs.rmSync(dir,{recursive:true,force:true});});
async function fixture(t,handler,options={}){
  const observed=[],terminals=[],sequence=++fixtureSequence;
  const server=https.createServer(tls,async(q,r)=>{let chunks=[];for await(const b of q)chunks.push(b);const bytes=Buffer.concat(chunks);
    const entry={path:q.url,auth_matches:q.headers.authorization===`Bearer ${key}`,body:JSON.parse(bytes.toString()),request_base64:bytes.toString('base64'),response_chunks:[],response_bytes:0,response_sha256:null,response_terminal:false};observed.push(entry);
    const hash=createHash('sha256');const write=r.write.bind(r),end=r.end.bind(r);
    function capture(chunk,encoding){if(entry.response_terminal||chunk===undefined||chunk===null)return;const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk,typeof encoding==='string'?encoding:undefined);hash.update(b);entry.response_bytes+=b.length;entry.response_chunks.push(b.toString('base64'));}
    r.write=(chunk,encoding,callback)=>{capture(chunk,encoding);return write(chunk,encoding,callback);};r.end=(chunk,encoding,callback)=>{capture(chunk,encoding);return end(chunk,encoding,callback);};
    terminals.push(new Promise(resolve=>r.on('close',()=>{entry.response_status=r.statusCode;entry.response_terminal=true;entry.response_sha256=hash.digest('hex');resolve();})));const scheduled=handler(q,r,observed.length);if(scheduled&&typeof scheduled.hasRef==='function')r.on('close',()=>clearTimeout(scheduled));});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));let timeout;try{await Promise.race([Promise.all(terminals),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('fixture response closure unconfirmed')),1000);})]);}finally{clearTimeout(timeout);}
    if(archive)fs.writeFileSync(path.join(archive,`${String(sequence).padStart(3,'0')}.json`),JSON.stringify({test:t.name,simulation:true,real_model_calls:0,credential_policy:'Only public fixture keys; authentication header omitted, match boolean retained',observed},null,2)+'\n',{flag:'wx'});
  });
  const transport=createUpstreamTransport({endpoint:`https://127.0.0.1:${server.address().port}/v1/responses`,credential:key,ca:tls.cert,countInput:()=>12,...options});
  t.after(()=>transport.close());return {transport,observed};
}
const local={skip:!openssl&&'OpenSSL unavailable: local TLS controls not executed'};
test('real transport cannot start without explicit live authorization and reviewed counter',()=>{
 const base={endpoint:'https://api.openai.com/v1/responses',credential:'nonfixture-public-dummy',model:'gpt-6-luna',countInput:()=>12};
 assert.throws(()=>createUpstreamTransport(base));
 assert.throws(()=>createUpstreamTransport({...base,mode:'live',countInput:'provider'}),/authorization/);
 assert.throws(()=>createUpstreamTransport({...base,mode:'live',authorization:{enabled:true,user_reference:'',registration_sha256:'a'.repeat(64),budget_nano_usd:100000000}}));
 for(const endpoint of ['http://127.0.0.1:1/v1/responses','https://example.com/v1/responses','https://127.0.0.1:1/v1/responses?q=1','https://a:b@127.0.0.1/v1/responses'])assert.throws(()=>createUpstreamTransport({endpoint,credential:key,countInput:()=>12}));
 assert.throws(()=>createUpstreamTransport({endpoint:'https://127.0.0.1:1/v1/responses',credential:key}));
});
test('local TLS success retains safe evidence, enforces output cap/tier and reserves before dispatch',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r));
 const result=await transport.dispatch(input());
 assert.equal(result.completion.model,'fixture-model');assert.equal(observed.length,1);assert(observed[0].auth_matches);
 assert.equal(observed[0].body.max_output_tokens,4096);assert.equal(observed[0].body.service_tier,'default');
 const state=transport.snapshot();assert.equal(state.attempts,1);assert.equal(state.reserved_nano_usd,13516800);assert.equal(state.provider_billed_cost,null);
 assert(!JSON.stringify(state).includes(key));assert.equal(state.observations[0].usage.total_tokens,15);
});
for(const status of [301,302,307,308,401,403,429,503])test(`TLS HTTP${status} never redirects/retries/refunds`,local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>{r.writeHead(status,{location:'https://127.0.0.1:1/v1/responses','retry-after':'0'});r.end(key);});
 await assert.rejects(transport.dispatch(input()),new RegExp('http-'+status));
 await assert.rejects(transport.dispatch(input()));assert.equal(observed.length,1);
 assert.equal(transport.snapshot().reserved_nano_usd,13516800);assert(!JSON.stringify(transport.snapshot()).includes(key));
});
test('untrusted TLS certificate never reaches HTTP handler and consumes one reservation',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r),{ca:undefined});
 await assert.rejects(transport.dispatch(input()),/tls-or-transport/);assert.equal(observed.length,0);assert.equal(transport.snapshot().attempts,1);
});
for(const [name,change] of [
 ['model',x=>x.model='other'],['effort',x=>x.reasoning.effort='high'],['tier',x=>x.service_tier='priority'],
 ['output cap',x=>x.max_output_tokens=9000],['unknown field',x=>x.callback_url='https://example.com'],
 ['unknown tool',x=>x.tools=[{type:'function',name:'local_shell'}]],['duplicate tool',x=>x.tools=[{type:'function',name:'exec_command'},{type:'function',name:'exec_command'}]],
 ['secret in prompt',x=>x.input=[{role:'user',content:key}]],['oversized input',x=>x.input=[{role:'user',content:'x'.repeat(300001)}]]
])test('reject '+name+' before network',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r));const x=input();change(x);
 await assert.rejects(transport.dispatch(x));assert.equal(observed.length,0);assert.equal(transport.snapshot().attempts,0);assert(transport.snapshot().closed);
});
for(const count of [undefined,NaN,-1,32769,Promise.resolve(1)])test('unverified/out-of-budget counter '+String(count),local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r),{countInput:()=>count});
 await assert.rejects(transport.dispatch(input()),/input-count/);assert.equal(observed.length,0);
});
test('six sequential reservations exhaust the run without a seventh request',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r,n)=>answer(r,completed('r'+n)));
 for(let n=0;n<6;n++)await transport.dispatch(input());
 await assert.rejects(transport.dispatch(input()),/reservation-limit/);assert.equal(observed.length,6);assert.equal(transport.snapshot().reserved_nano_usd,81100800);
});
test('parallel dispatch fails closed without a second HTTP attempt',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>setTimeout(()=>answer(r),100));
 const first=transport.dispatch(input());const checked=assert.rejects(first);
 await assert.rejects(transport.dispatch(input()),/concurrent/);await checked;assert(observed.length<=1);assert.equal(transport.snapshot().attempts,1);
});
test('absolute timer interrupts response drips',local,async t=>{
 const {transport}=await fixture(t,(_q,r)=>{r.writeHead(200,{'content-type':'text/event-stream'});const timer=setInterval(()=>r.write(': keepalive\n\n'),5);r.on('close',()=>clearInterval(timer));},{exchangeMs:70});
 await assert.rejects(transport.dispatch(input()),/absolute-deadline/);assert(transport.snapshot().closed);
});
test('explicit cancellation closes active response without retry',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>{r.writeHead(200,{'content-type':'text/event-stream'});r.write(': waiting\n\n');setTimeout(()=>transport.close(),15);});
 await assert.rejects(transport.dispatch(input()));assert.equal(observed.length,1);assert.equal(transport.snapshot().attempts,1);
});
test('one run deadline spans both TLS exchanges',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r,n)=>setTimeout(()=>answer(r,completed('r'+n)),60),{totalMs:100,exchangeMs:100});
 await transport.dispatch(input());await assert.rejects(transport.dispatch(input()),/deadline|expired/);assert.equal(observed.length,2);
});
test('response cap, malformed body and missing terminal are rejected',local,async t=>{
 for(const body of ['x'.repeat(SMOKE_LIMITS.response_bytes+1),'data: nope\n\n','data: {"type":"response.created"}\n\n']){
  const {transport}=await fixture(t,(_q,r)=>{r.writeHead(200,{'content-type':'text/event-stream'});r.end(body);});
  await assert.rejects(transport.dispatch(input()));assert(transport.snapshot().closed);
 }
});
for(const [name,mutate] of [['identity',r=>r.model='other'],['missing usage',r=>delete r.usage],['usage sum',r=>r.usage.total_tokens=100],['excess output',r=>{r.usage.output_tokens=4097;r.usage.total_tokens=4109;}],['unexpected tool',r=>r.output=[{type:'function_call',name:'local_shell'}]]])test('reported '+name+' closes the run',local,async t=>{
 const {transport}=await fixture(t,(_q,res)=>{const r=completed();mutate(r);answer(res,r);});
 await assert.rejects(transport.dispatch(input()));assert(transport.snapshot().closed);
});
test('duplicate completions and terminal suffix are rejected by the SSE parser',()=>{
 for(const body of [sse(completed())+sse(completed()),sse(completed())+'data: {"type":"response.created"}\n\n'])assert.throws(()=>parseCompletion(Buffer.from(body),'fixture-model'));
});
test('duplicate response identity across exchanges stops continuation',local,async t=>{
 const {transport}=await fixture(t,(_q,r)=>answer(r));await transport.dispatch(input());
 await assert.rejects(transport.dispatch(input()),/duplicate-response-id/);
});
for(const encoding of ['literal','unicode','base64','hex'])test('credential echo '+encoding+' is excluded from returned data and evidence',local,async t=>{
 const {transport}=await fixture(t,(_q,res)=>{const r=completed();r.output[0].content[0].text=encoding==='base64'?Buffer.from(key).toString('base64'):encoding==='hex'?Buffer.from(key).toString('hex'):key;let body=sse(r);if(encoding==='unicode')body=body.replace(key,[...key].map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join(''));res.writeHead(200,{'content-type':'text/event-stream'});res.end(body);});
 await assert.rejects(transport.dispatch(input()),/credential-echo/);assert(!JSON.stringify(transport.snapshot()).includes(key));
});

test('provider token-count preflight binds the complete text/tool input before inference',local,async t=>{
 const {transport,observed}=await fixture(t,(q,r)=>{if(q.url.endsWith('/input_tokens')){r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify({object:'response.input_tokens',input_tokens:12}));}else answer(r);},{countInput:'provider'});
 const x=input();x.tools=[{type:'function',name:'exec_command',parameters:{type:'object'}}];
 await transport.dispatch(x);assert.equal(observed.length,2);assert.equal(observed[0].path,'/v1/responses/input_tokens');
 assert.deepEqual(observed[0].body.input,observed[1].body.input);assert.deepEqual(observed[0].body.tools,observed[1].body.tools);
 assert.equal(transport.snapshot().count_attempts,1);assert.equal(transport.snapshot().attempts,1);
});
for(const receipt of [{object:'wrong',input_tokens:12},{object:'response.input_tokens',input_tokens:32769},{object:'response.input_tokens',input_tokens:key},{}])test('invalid count receipt prevents inference '+JSON.stringify(receipt),local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>{r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify(receipt));},{countInput:'provider'});
 await assert.rejects(transport.dispatch(input()));assert.equal(observed.length,1);assert.equal(transport.snapshot().attempts,0);assert(!JSON.stringify(transport.snapshot()).includes(key));
});
test('token-count redirect is refused before inference',local,async t=>{
 const {transport,observed}=await fixture(t,(_q,r)=>{r.writeHead(307,{location:'https://api.openai.com/v1/responses/input_tokens'});r.end();},{countInput:'provider'});
 await assert.rejects(transport.dispatch(input()),/http-307/);assert.equal(observed.length,1);assert.equal(transport.snapshot().attempts,0);
});
test('token-count drip is bounded by shared deadline',local,async t=>{
 const {transport}=await fixture(t,(_q,r)=>{r.writeHead(200,{'content-type':'application/json'});const timer=setInterval(()=>r.write(' '),5);r.on('close',()=>clearInterval(timer));},{countInput:'provider',totalMs:70});
 await assert.rejects(transport.dispatch(input()),/deadline/);assert.equal(transport.snapshot().attempts,0);
});
test('unknown counter error never leaks arbitrary diagnostic text',local,async t=>{
 const {transport}=await fixture(t,(_q,r)=>answer(r),{countInput:()=>{throw Error(key);}});
 await assert.rejects(transport.dispatch(input()),/^Error: contract-rejected$/);assert(!JSON.stringify(transport.snapshot()).includes(key));
});
test('configuration changes and image inputs are refused before network',local,async t=>{
 for(const item of [{type:'configuration_update',reasoning:{effort:'high'}},{type:'message',role:'user',content:[{type:'input_image',image_url:'https://example.com/image.png'}]}]){
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r));const x=input();x.input=[item];await assert.rejects(transport.dispatch(x),/input-profile/);assert.equal(observed.length,0);
 }
});
test('unadvertised streamed tool cannot hide behind a valid final message',()=>{
 const body='data: '+JSON.stringify({type:'response.output_item.done',item:{type:'function_call',name:'view_image'}})+'\n\n'+sse(completed());
 assert.throws(()=>parseCompletion(Buffer.from(body),'fixture-model'),/event-tool-profile/);
});
test('actual native packet uses the same parent gateway and local TLS transport seam',local,async t=>{
 const {createBroker}=await import('./native-remote-broker.mjs');
 const source=JSON.parse(fs.readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-09-native-remote/cases/allowed/record.json',import.meta.url)));
 const packet=source.broker.requests[0].packet;
 const {transport,observed}=await fixture(t,(_q,r)=>answer(r),{effort:'medium'});
 const record={};const broker=await createBroker('allowed','',record,{transport});t.after(()=>broker.close());
 const response=await broker.request(packet);assert.equal(response.status,200);assert.equal(observed.length,1);
 assert.equal(observed[0].body.reasoning.effort,'medium');assert.equal(observed[0].body.max_output_tokens,2048);
 assert(record.broker.transport);assert(!JSON.stringify(record).includes(key));
});
