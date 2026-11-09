/** Bind every saved boundary; rehashing a contradictory archive must not make it valid. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DIR,checkRegistration,ensureCleanup,validateCleanup,bindRawClient} from './native-smoke.mjs';
import {hash} from './native-remote.mjs';
import {parseCompletion,SMOKE_LIMITS} from './native-upstream-transport.mjs';
const read=file=>JSON.parse(fs.readFileSync(file));
const stamp=value=>{const n=typeof value==='number'?value:Date.parse(value);assert(Number.isFinite(n),'finite timestamp');return n;};
const projection=body=>Object.fromEntries(['model','input','tools','tool_choice','parallel_tool_calls','reasoning'].filter(k=>body[k]!==undefined).map(k=>[k,body[k]]));
const reservation=SMOKE_LIMITS.input_tokens*SMOKE_LIMITS.input_nano_usd_per_token+SMOKE_LIMITS.output_tokens*SMOKE_LIMITS.output_nano_usd_per_token;
function ledger(snapshot,count,expected){
 assert.equal(snapshot.mode,'offline');assert.equal(snapshot.requested_model,'fixture-model');assert.equal(snapshot.requested_effort,'low');
 assert.equal(snapshot.attempts,count);assert.equal(snapshot.count_attempts,count);assert(count<=SMOKE_LIMITS.requests);
 assert.equal(snapshot.budget_nano_usd,SMOKE_LIMITS.budget_nano_usd);assert.equal(snapshot.reserved_nano_usd,count*reservation);assert(snapshot.reserved_nano_usd<=snapshot.budget_nano_usd);
 assert.equal(snapshot.provider_billed_cost,null);assert.equal(snapshot.identity_scope,'provider-reported-not-independent-attestation');
 assert.deepEqual(snapshot.observations,expected,'cumulative ledger must be exact prefix');
}
export function validateSmoke(dir=path.join(DIR,'smoke-offline')){
 const reg=checkRegistration();
 for(const [f,sha]of Object.entries(reg.value.sources))assert.equal(hash(fs.readFileSync(path.join(DIR,'smoke-sources',f))),sha);
 const j=read(path.join(dir,'journal.json'));
 assert.equal(j.registration_sha256,reg.sha256);assert.equal(j.status,'completed');assert.equal(j.mode,'offline');assert.equal(j.simulation,true);assert.equal(j.actual_model,null);assert.equal(j.requested_model,'fixture-model');assert.equal(j.effort,'low');assert.equal(j.live_ready,false);assert.equal(j.sessions.length,3);assert.deepEqual(j.provider_reported_models,['fixture-model']);
 const begin=stamp(j.started_at),end=stamp(j.completed_at);assert(end>=begin);
 const receipts=read(path.join(dir,'upstream.json'));assert.equal(receipts.length,12);
 const all=j.transport.observations;assert.equal(all.length,12);ledger(j.transport,6,all);assert.equal(j.transport.closed,true);
 const responseIds=new Set();let previousImport=begin;
 for(let n=1;n<=3;n++){
  const session=j.sessions[n-1];assert.equal(session.session,n);assert.equal(session.accepted,true);assert.equal(session.requests,2);
  const raw=fs.readFileSync(path.join(dir,'session-'+n,'record.json'));assert.equal(hash(raw),session.record_sha256);
  const r=JSON.parse(raw);assert(Buffer.from(r.result.stdout_base64,'base64').length<=1048576);ensureCleanup(r);for(const [f,sha]of Object.entries(r.sources))assert.equal(sha,reg.value.sources[f]);assert.deepEqual(r.result.argv.slice(0,6),['docker','exec','-i',r.client_id,'node','-e']);assert.equal(hash(r.result.argv[6]),reg.value.sources['native-remote-client.cjs']);assert.deepEqual(JSON.parse(Buffer.from(r.result.argv[10],'base64')),r.client.client_config);assert.equal(r.simulation,true);assert.equal(r.real_model_calls,0);assert.equal(r.actual_model,null);
  const imported=stamp(session.imported_at);assert(r.started_at>=previousImport&&imported>=r.completed_at&&imported<=end,'cleanup before import before next session');previousImport=imported;
  const c=r.client;assert.equal(c.client_config.require_ready,true);assert.equal(c.client_config.model,'fixture-model');assert.equal(c.client_config.effort,'low');assert.equal(c.client_config.live,false);assert.equal(c.client_config.prompt,reg.value.prompts[n-1]);
  assert.equal(c.requests.length,2);assert.equal(c.responses.length,2);assert.equal(r.broker.requests.length,2);
  ledger(r.broker.transport,n*2,all.slice(0,n*4));assert.equal(r.broker.transport.closed,false);
  const completions=[];
  for(let k=0;k<2;k++){
   const index=(n-1)*2+k,offset=index*2,p=c.requests[k],native=JSON.parse(p.body),b=r.broker.requests[k],pair=receipts.slice(offset,offset+2);
   assert.equal(p.headers.authorization,'Bearer PUBLIC_MODEL_TOKEN');assert.equal(p.method,'POST');assert.equal(p.url,'/v1/responses');assert.equal(hash(p.body),b.request_sha256);assert.equal(Buffer.byteLength(p.body),b.request_bytes);
   assert.equal(native.model,'fixture-model');assert.equal(native.reasoning.effort,'low');assert.equal(native.stream,true);assert.equal(native.store,false);assert.equal(hash(JSON.stringify(native.tools)),reg.value.tool_schema_sha256);
   assert.deepEqual(pair.map(x=>x.path),['/v1/responses/input_tokens','/v1/responses']);assert(pair.every(x=>x.auth_matches===true&&x.response_status===200));
   const inference={...native,max_output_tokens:4096,service_tier:'default'};
   assert.deepEqual(pair[1].body,inference,'inference must equal native request plus frozen caps');
   assert.deepEqual(pair[0].body,projection(inference),'count must cover this exact inference');
   const countEntry=all[offset],entry=all[offset+1],requestBytes=Buffer.from(JSON.stringify(inference));
   assert.equal(countEntry.kind,'provider-input-count');assert.equal(countEntry.request_sha256,hash(Buffer.from(JSON.stringify(pair[0].body))));assert.equal(countEntry.inference_request_sha256,hash(requestBytes));
   const countRaw=Buffer.from(pair[0].response_body_base64,'base64');assert(countRaw.length<=4096);const counted=JSON.parse(countRaw);assert.deepEqual(counted,{object:'response.input_tokens',input_tokens:countEntry.input_tokens});assert(Number.isSafeInteger(countEntry.input_tokens)&&countEntry.input_tokens>=0&&countEntry.input_tokens<=SMOKE_LIMITS.input_tokens);
   assert.equal(entry.attempt,index+1);assert.equal(entry.request_sha256,hash(requestBytes));assert.equal(entry.request_bytes,requestBytes.length);assert(requestBytes.length<=SMOKE_LIMITS.request_bytes);assert.equal(entry.counted_input_tokens,countEntry.input_tokens);assert.equal(entry.reserved_nano_usd,reservation);assert.equal(entry.status,'completed');
   const response=c.responses[k];assert.equal(response.status,200);assert.equal(response.id,k+1);assert.equal(response.body_base64,pair[1].response_body_base64,'client raw SSE must equal upstream raw SSE');const bytes=Buffer.from(response.body_base64,'base64');assert.equal(bytes.toString('base64'),response.body_base64);assert.equal(hash(bytes),entry.response_sha256);assert.equal(bytes.length,entry.response_bytes);assert(bytes.length<=SMOKE_LIMITS.response_bytes);
   const completion=parseCompletion(bytes,'fixture-model');assert(!responseIds.has(completion.id),'unique provider response IDs');responseIds.add(completion.id);assert.equal(entry.reported_model,completion.model);assert.deepEqual(entry.usage,completion.usage);assert.equal(entry.usage.input_tokens,countEntry.input_tokens);assert(entry.usage.output_tokens<=4096);completions.push(completion);
  }
  const first=completions[0].response.output;assert.equal(first.length,1);const call=first[0];assert.equal(call.type,'function_call');assert.equal(call.name,'exec_command');
  const continuation=JSON.parse(c.requests[1].body).input;assert(continuation.some(x=>JSON.stringify(x)===JSON.stringify(call)||JSON.stringify(Object.fromEntries(Object.keys(call).map(k=>[k,x[k]])))===JSON.stringify(call)),'native continuation must contain upstream call');
  const outputs=continuation.filter(x=>x.type==='function_call_output'&&x.call_id===call.call_id);assert.equal(outputs.length,1);
  const commands=c.events.filter(e=>e.method==='item/completed'&&e.params.item.type==='commandExecution'&&e.params.item.id===call.call_id).map(e=>e.params.item);assert.equal(commands.length,1);const command=commands[0];assert.equal(command.exitCode,0);assert.equal(command.status,'completed');assert.equal(command.aggregatedOutput,'WORKER\n');assert(outputs[0].output.includes('Process exited with code 0')&&outputs[0].output.endsWith('Output:\n'+command.aggregatedOutput));assert(command.commandActions.some(x=>x.command===JSON.parse(call.arguments).cmd));
  const final=completions[1].response.output;assert.equal(final.length,1);assert.equal(final[0].type,'message');const text=final[0].content.filter(x=>x.type==='output_text').map(x=>x.text).join('');const messages=c.events.filter(e=>e.method==='item/completed'&&e.params.item.type==='agentMessage').map(e=>e.params.item);assert.equal(messages.length,1);assert.equal(messages[0].id,final[0].id);assert.equal(messages[0].text,text);
 }
 const negative=read(path.join(DIR,'smoke-preflight-negative/record.json'));validateCleanup(negative);bindRawClient(negative);assert.equal(negative.client.preflight_rejected,true);assert.equal(negative.client.requests.length,0);assert.equal(negative.client.responses.length,0);assert.deepEqual(negative.broker.requests,[]);assert.equal(negative.real_model_calls,0);
 return {sessions:3,count_requests:6,inference_requests:6,real_model_calls:0,live_ready:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(validateSmoke()));
