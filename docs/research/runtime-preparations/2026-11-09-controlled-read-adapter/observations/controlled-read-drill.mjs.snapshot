/** Record/validate owned HTTP controls only. Never starts a CLI or a model. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {fixtureRun} from './controlled-read-fixture.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const root=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-09-controlled-read-adapter/',import.meta.url));
const answer={model:'fixture-cheap',reasoning:'low',type:'answer',text:'SYNTHETIC answer'};
const tool={model:'fixture-cheap',reasoning:'low',type:'tool',call:{name:'read_file',path:'case/code.js'}};
export async function record(directory){
 assert(!existsSync(directory),'New evidence directory required');mkdirSync(directory,{recursive:true});
 const controls=[
  ['read-continuation',{},(_,r,n)=>r.end(JSON.stringify(n===1?tool:answer)),'fixture-completed'],
  ['shell-denied',{},(_,r)=>r.end(JSON.stringify({...tool,call:{name:'shell',path:'case/code.js'}})),'tool-or-envelope-denied'],
  ['identity-mismatch',{},(_,r)=>r.end(JSON.stringify({...answer,model:'fixture-expensive'})),'identity-mismatch'],
  ['auth-expired',{},(_,r)=>{r.writeHead(401);r.end('{}');},'http-401'],
  ['rotated-fixture-auth',{fixtureCredential:'fixture-only-'+'2'.repeat(32)},(_,r)=>r.end(JSON.stringify(answer)),'fixture-completed'],
  ['budget-stop',{budget_microunits:1},(_,r)=>r.end(JSON.stringify(tool)),'budget-cap'],
  ['request-stop',{max_requests:1},(_,r)=>r.end(JSON.stringify(tool)),'request-cap'],
  ['deadline',{timeout_ms:50},(_,r)=>{const t=setInterval(()=>r.write(' '),5);r.on('close',()=>clearInterval(t));},'deadline'],
 ];
 const inventory={};const put=(name,bytes)=>{writeFileSync(path.join(directory,name),bytes,{flag:'wx'});inventory[name]=hash(bytes);};
 for(const [name,options,handler,expected] of controls){const start=new Date().toISOString();const evidence=await fixtureRun(handler,options);assert.equal(evidence.result.reason??evidence.result.status,expected);put(`${name}.json`,JSON.stringify({started_at:start,completed_at:new Date().toISOString(),expected,...evidence},null,2)+'\n');}
 for(const name of ['controlled-read-adapter.mjs','controlled-read-fixture.mjs','controlled-read-drill.mjs','controlled-read-adapter.test.mjs'])put(name+'.snapshot',readFileSync(new URL(name,import.meta.url)));
 put('run.json',JSON.stringify({simulation:true,model_calls:0,real_credentials:0,live_ready:false,study_eligible:false,controls:controls.map(([name])=>name),source:'current local custom adapter; no Codex or OpenAI API compatibility claim'},null,2)+'\n');
 writeFileSync(path.join(directory,'inventory.json'),JSON.stringify(inventory,null,2)+'\n',{flag:'wx'});return validate(directory);
}
function bytes64(value){assert.equal(typeof value,'string','Required raw body missing');const bytes=Buffer.from(value,'base64');assert.equal(bytes.toString('base64'),value,'Noncanonical base64');return bytes;}
export function validateEvidence(e){
 assert.equal(e.capture_cleanup?.confirmed,true,'Terminal capture cleanup unconfirmed');
 assert.equal(e.result.reason??e.result.status,e.expected);assert.equal(e.result.live_ready,false);assert.equal(e.result.study_eligible,false);assert.equal(e.result.actual_responding_model,null);
 assert.equal(e.result.ledger.requests,e.observed.length);assert.equal(e.result.exchanges.length,e.observed.length);assert(e.observed.every(x=>x.auth_matches));assert(e.result.ledger.requests<=e.result.ledger.config.max_requests);assert(e.result.ledger.reserved_microunits<=e.result.ledger.config.budget_microunits);
 for(let i=0;i<e.observed.length;i++){
  const o=e.observed[i],x=e.result.exchanges[i],r=o.response;assert(r&&r.capture_terminal===true,'Response capture missing');assert(Number.isInteger(r.status)&&r.status>=100&&r.status<=599);assert.equal(typeof r.headers_sent,'boolean');assert.equal(typeof r.writable_finished,'boolean');
  assert.equal(r.scope,'server-authored-write-calls-not-client-receipt');assert.equal(x.response_scope,'client-observed-retained-prefix');
  const request=bytes64(o.request_bytes_base64),server=bytes64(r.bytes_base64),client=bytes64(x.response_base64);
  assert.deepEqual(JSON.parse(request),o.body);assert.equal(hash(request),x.request_sha256);assert.equal(o.body.model,x.requested.model);assert.equal(o.body.reasoning,x.requested.reasoning);
  assert.equal(server.length,r.retained_bytes);assert.equal(hash(server),r.retained_sha256);assert(Number.isSafeInteger(r.written_bytes)&&r.written_bytes>=server.length);assert.equal(r.truncated,r.written_bytes>server.length);assert(/^[a-f0-9]{64}$/.test(r.written_sha256));if(!r.truncated)assert.equal(r.written_sha256,r.retained_sha256);
  assert.equal(client.length,x.response_bytes);assert.equal(hash(client),x.response_sha256);
  // A failed stream can leave server-written suffixes that the client never saw.
  // Compare the common prefix, never claim write-call bytes prove delivery.
  const common=Math.min(server.length,client.length);assert(server.subarray(0,common).equals(client.subarray(0,common)),'Server/client prefix mismatch');assert(client.length<=r.written_bytes);
  if(x.http_status!==null){assert.equal(x.http_status,r.status);assert.equal(r.headers_sent,true);}
  if(x.transport_error===null){assert.equal(r.writable_finished,true);assert.equal(x.http_status,r.status);assert.equal(client.length,r.written_bytes);assert.equal(hash(client),r.written_sha256);}
 }
 return true;
}
export function validate(directory){const inventory=JSON.parse(readFileSync(path.join(directory,'inventory.json')));for(const [name,digest] of Object.entries(inventory)){assert(/^[a-zA-Z0-9_.-]+$/.test(name));assert.equal(hash(readFileSync(path.join(directory,name))),digest);}
 const expected={'read-continuation':'fixture-completed','shell-denied':'tool-or-envelope-denied','identity-mismatch':'identity-mismatch','auth-expired':'http-401','rotated-fixture-auth':'fixture-completed','budget-stop':'budget-cap','request-stop':'request-cap','deadline':'deadline'};
 const run=JSON.parse(readFileSync(path.join(directory,'run.json')));assert.deepEqual(run.controls,Object.keys(expected));assert.equal(run.simulation,true);assert.equal(run.model_calls,0);assert.equal(run.live_ready,false);
 const required=[...run.controls.map(n=>n+'.json'),'run.json',...['controlled-read-adapter.mjs','controlled-read-fixture.mjs','controlled-read-drill.mjs','controlled-read-adapter.test.mjs'].map(n=>n+'.snapshot')];assert.deepEqual(Object.keys(inventory).sort(),required.sort());
 for(const name of run.controls){const e=JSON.parse(readFileSync(path.join(directory,name+'.json')));assert.equal(e.expected,expected[name]);validateEvidence(e);}
 return {controls:8,files:Object.keys(inventory).length,model_calls:0,live_ready:false};}

if(process.argv[1]===fileURLToPath(import.meta.url)){const [command='validate',directory=path.join(root,'observations')]=process.argv.slice(2);assert(['record','validate'].includes(command));console.log(JSON.stringify(command==='record'?await record(directory):validate(directory)));}
