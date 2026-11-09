/** Opt-in native CLI observations against owned fake services; no model inference. */
import assert from 'node:assert/strict';
import http from 'node:http';
import {performance} from 'node:perf_hooks';
import {realpathSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {cliDeclaration,cliProfile,launchIsolated,neutralSession,runtimeEnvironment,normalizedStubRoute,sseFixture,hash,STUB_AUTH,STUB_CAPABILITY} from './codex-channel.mjs';
import {destroySession} from './process-executor.mjs';
export const STREAM_POLICY=Object.freeze({revision:1,model_calls:0,real_credentials_used:0,external_network:false,live_ready:false,request_byte_limit:1048576,response_byte_limit:1048576,server_watchdog_ms:20000,cleanup_budget_ms:4000});
export const CASES=Object.freeze([
 {id:'success',behavior:'success',stream_retries:0,idle_ms:20000,deadline_ms:10000,budget:2,expected_cli:1,expected_upstream:1,expected:'completed'},
 {id:'interrupt-retry0',behavior:'interrupt',stream_retries:0,idle_ms:20000,deadline_ms:10000,budget:2,expected_cli:1,expected_upstream:1,expected:'failed'},
 {id:'interrupt-retry1',behavior:'interrupt',stream_retries:1,idle_ms:20000,deadline_ms:10000,budget:2,expected_cli:2,expected_upstream:2,expected:'failed'},
 {id:'interrupt-retry1-budget1',behavior:'interrupt',stream_retries:1,idle_ms:20000,deadline_ms:10000,budget:1,expected_cli:2,expected_upstream:1,expected:'failed'},
 {id:'idle-retry0',behavior:'idle',stream_retries:0,idle_ms:350,deadline_ms:10000,budget:2,expected_cli:1,expected_upstream:1,expected:'failed'},
 {id:'parent-deadline',behavior:'stall-first-byte',stream_retries:0,idle_ms:20000,deadline_ms:5000,budget:2,expected_cli:1,expected_upstream:1,expected:'deadline'}
].map(Object.freeze));
export function streamDeclaration(session,endpoint,spec){
 assert(CASES.some(c=>JSON.stringify(c)===JSON.stringify(spec)),'Only predeclared cases are executable');
 const d=cliDeclaration(session,endpoint,{requestRetries:0,streamRetries:spec.stream_retries});
 const setting=`model_providers.hc_cli_stub.stream_idle_timeout_ms=${spec.idle_ms}`;
 d.settings.push(setting);d.argv.splice(d.argv.indexOf('exec'),0,'-c',setting);
 return d;
}
export function validRequest(req,origin){
 return req.method==='POST'&&normalizedStubRoute(req.url,origin)==='/v1/responses'&&req.headers.host===new URL(origin).host&&req.headers['x-hc-capability']===STUB_CAPABILITY&&!req.headers.authorization&&!req.headers['proxy-authorization'];
}
function managedServer(handler){
 const server=http.createServer(handler),sockets=new Set();
 server.on('clientError',(_e,s)=>s.destroy());
 server.on('connection',s=>{sockets.add(s);s.setTimeout(STREAM_POLICY.server_watchdog_ms,()=>s.destroy());s.on('close',()=>sockets.delete(s));});
 return {server,listen:()=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);}),close:async()=>{for(const s of sockets)s.destroy();await new Promise(r=>server.close(r));return {listening:server.listening,open_sockets:sockets.size};}};
}
async function body(req){const chunks=[];let count=0;for await(const b of req){count+=b.length;assert(count<=STREAM_POLICY.request_byte_limit);chunks.push(b);}return Buffer.concat(chunks);}
function requestRow(req,bytes,start){return {method:req.method,url:req.url,headers:req.headers,raw_headers:req.rawHeaders,body_base64:bytes.toString('base64'),body_sha256:hash(bytes),elapsed_ms:performance.now()-start};}
/** Streaming relay keeps parent-only dummy auth separate and atomically spends its budget. */
export async function ownedStreamStub(spec){
 assert(CASES.some(c=>JSON.stringify(c)===JSON.stringify(spec)));const start=performance.now(),requests=[],upstreamRequests=[],responses=[],events=[],outgoing=new Set(),timers=new Set();let forwarded=0;
 const stamp=(type,extra={})=>events.push({type,...extra,elapsed_ms:performance.now()-start});
 const upstream=managedServer(async(req,res)=>{try{
  const bytes=await body(req);upstreamRequests.push(requestRow(req,bytes,start));stamp('upstream-request');
  res.on('close',()=>stamp('upstream-response-close',{ended:res.writableEnded}));
  if(spec.behavior==='stall-first-byte')return;
  res.writeHead(200,{'content-type':'text/event-stream','connection':'close'});res.flushHeaders();
  const all=sseFixture(),prefix=Buffer.from(all.toString().split('\n\n').slice(0,4).join('\n\n')+'\n\n');
  if(spec.behavior==='success'){res.end(all);return;}
  res.write(prefix);stamp('upstream-prefix-written',{bytes:prefix.length});
  if(spec.behavior==='interrupt'){const t=setTimeout(()=>{timers.delete(t);stamp('upstream-interrupted');res.destroy();},30);timers.add(t);}
 }catch{res.destroy();}});
 await upstream.listen();
 let origin;
 const broker=managedServer(async(req,res)=>{try{
  const bytes=await body(req),row=requestRow(req,bytes,start);requests.push(row);
  if(!validRequest(req,origin)){row.disposition='denied';res.writeHead(403);res.end('LOCAL_ROUTE_DENIED');return;}
  if(forwarded>=spec.budget){row.disposition='primary-budget-denied';res.writeHead(409,{'content-type':'application/json'});res.end(JSON.stringify({error:{message:'PRIMARY_BUDGET_CONSUMED',type:'fixture_error',code:'fixture_error'}}));return;}
  forwarded++;row.disposition='forwarded';
  const out=http.request({hostname:'127.0.0.1',port:upstream.server.address().port,path:'/v1/responses',method:'POST',agent:false,headers:{'content-type':'application/json','content-length':bytes.length,authorization:STUB_AUTH}},reply=>{
   const chunks=[];let size=0,finished=false;const response={status:reply.statusCode,body_base64:'',body_sha256:hash(Buffer.alloc(0)),partial:null,started_ms:performance.now()-start};responses.push(response);
   res.writeHead(reply.statusCode,{'content-type':'text/event-stream','connection':'close'});res.flushHeaders();
   const finish=partial=>{if(finished)return;finished=true;const b=Buffer.concat(chunks);Object.assign(response,{body_base64:b.toString('base64'),body_sha256:hash(b),partial,finished_ms:performance.now()-start});if(!res.destroyed){if(partial)res.destroy();else res.end();}};
   reply.on('data',b=>{size+=b.length;if(size>STREAM_POLICY.response_byte_limit){reply.destroy();return;}chunks.push(b);response.body_base64=Buffer.concat(chunks).toString('base64');response.body_sha256=hash(Buffer.concat(chunks));if(!res.destroyed)res.write(b);stamp('broker-stream-data',{bytes:b.length});});
   reply.on('end',()=>finish(false));reply.on('aborted',()=>finish(true));reply.on('error',()=>finish(true));
  });
  outgoing.add(out);out.on('close',()=>outgoing.delete(out));out.on('error',()=>{if(!res.destroyed){if(res.headersSent)res.destroy();else{res.writeHead(502);res.end('LOCAL_TRANSPORT_ERROR');}}});
  // Releasing a disconnected client must cancel its upstream socket, including idle/stalled cases.
  res.on('close',()=>{stamp('broker-client-close',{ended:res.writableEnded});out.destroy();});out.end(bytes);
 }catch{res.destroy();}});
 let closing;
 await broker.listen();origin=`http://127.0.0.1:${broker.server.address().port}`;
 return {endpoint:origin+'/v1',upstream_port:upstream.server.address().port,records:()=>({requests,upstreamRequests,responses,forwarded,events}),close:()=>closing??=(async()=>{for(const t of timers)clearTimeout(t);for(const o of outgoing)o.destroy();const b=await broker.close(),u=await upstream.close();await new Promise(r=>setImmediate(r));stamp('owned-services-closed');return {broker:b,upstream:u,outgoing_requests:outgoing.size};})()};
}
export async function runStreamCase(binary,spec){
 assert.equal(process.platform,'darwin');binary=realpathSync(binary);const session=neutralSession(),stub=await ownedStreamStub(spec);
 try{
  const declaration=streamDeclaration(session,stub.endpoint,spec),policy=cliProfile(session,binary,Number(new URL(stub.endpoint).port));
  const initial_state={home:readdirSync(session.home),codex_home:readdirSync(session.codex_home),auth_json_present:existsSync(path.join(session.codex_home,'auth.json'))};
  const execution=await launchIsolated(binary,session,declaration,policy,{timeout_ms:spec.deadline_ms});
  const services_cleanup=await stub.close();
  return {revision:1,case:spec,fixture_only:true,model_calls:0,real_credentials_used:0,live_ready:false,initial_state,declaration,launch:{binary,env:runtimeEnvironment(session,declaration.proxy_origin),policy_text:policy,policy_sha256:hash(policy),cwd:session.workspace},execution,http:stub.records(),services_cleanup,actual_responding_model:null};
 }finally{await stub.close();destroySession(session);}
}
