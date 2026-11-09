import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {argumentsFor,loginCredential,proxyEnvironment,runLoginSmoke,scrub} from './codex-login-smoke.mjs';
const fixtureEndpoint='http://127.0.0.1:1/v1';
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'brooks-login-test-'));
const fake=String.raw`
const fs=require('node:fs'),readline=require('node:readline');let mode=process.argv[2];
readline.createInterface({input:process.stdin}).on('line',l=>{const q=JSON.parse(l);if(!q.id)return;let result={};
if(q.method==='thread/start')result={model:mode==='wrong-model'?'gpt-wrong':q.params.model,reasoningEffort:'low',thread:{id:'fixture-thread'}};
if(q.method==='account/read'){const a=JSON.parse(fs.readFileSync(process.env.CODEX_HOME+'/auth.json','utf8'));if(a.tokens.refresh_token!==''||a.OPENAI_API_KEY)throw Error('unexpected private credential copied');}
if(q.method==='account/read')result={account:{type:mode==='api'?'apiKey':'chatgpt',email:'PRIVATE_EMAIL'}};
if(q.method==='initialize'){if(mode==='proxy'&&process.env.https_proxy!=='http://proxyuser:proxypass@127.0.0.1:1234')throw Error('proxy missing');if(mode==='no-proxy'&&process.env.https_proxy)throw Error('unexpected proxy');result={userAgent:'fixture-cli/1'};if(mode==='proxy')console.error('proxy secret '+process.env.https_proxy+' proxypass');}
if(mode==='hang')return;
if(mode==='invalid'){console.log('not-json');return;}
console.log(JSON.stringify({id:q.id,result}));
if(q.method==='turn/start'){
 if(mode==='hang-turn'){console.log(JSON.stringify({method:'item/completed',params:{item:{type:'userMessage'}}}));return;}
 if(mode==='completed-tool')console.log(JSON.stringify({method:'item/completed',params:{item:{type:'commandExecution'}}}));
 if(mode==='tool')console.log(JSON.stringify({method:'item/started',params:{item:{type:'commandExecution'}}}));
 if(mode==='server-request')console.log(JSON.stringify({id:901,method:'account/chatgptAuthTokens/refresh',params:{}}));
 console.log(JSON.stringify({method:'item/completed',params:{item:{type:'agentMessage',text:mode==='wrong-answer'?'BAD':'BROOKS_LOGIN_OK'}}}));
 console.log(JSON.stringify({method:'thread/tokenUsage/updated',params:{tokenUsage:{total:{inputTokens:8,outputTokens:4}}}}));
 console.log(JSON.stringify({method:'turn/completed',params:{turn:{status:mode==='failed-turn'?'failed':'completed'}}}));
}
});
`;
async function run(mode,options={}){const root=temp();fs.writeFileSync(path.join(root,'fake.cjs'),fake);try{return await runLoginSmoke({model:'gpt-fixture',out:path.join(root,'out'),fixtureEndpoint,executable:process.execPath,prefixArgs:[path.join(root,'fake.cjs'),mode],timeoutMs:2000,...options})}finally{fs.rmSync(root,{recursive:true,force:true})}}
test('explicit live gate, endpoint and model validation',async()=>{
 await assert.rejects(runLoginSmoke({model:'gpt-fixture'}),/Explicit/);
 assert.throws(()=>argumentsFor(''),/Explicit/);assert.throws(()=>argumentsFor('gpt-x',{fixtureEndpoint:'https://example.com/v1'}),/local/);
 await assert.rejects(runLoginSmoke({model:'gpt-fixture',live:true,fixtureEndpoint}),/mix/);
 const a=argumentsFor('gpt-6-luna');assert(a.includes('forced_login_method="chatgpt"'));assert(a.includes('features.shell_tool=false'));assert(!a.some(x=>x.includes('catalog')));
});
test('only ChatGPT tokens admitted; API credentials excluded',()=>{
 assert.throws(()=>loginCredential('{"auth_mode":"apikey"}'),/ChatGPT/);
 const p=loginCredential(JSON.stringify({auth_mode:'chatgpt',OPENAI_API_KEY:'secret-api',tokens:{access_token:'secret-token',account_id:'account'},last_refresh:'today'}));assert.equal(p.auth.OPENAI_API_KEY,undefined);assert.equal(p.auth.tokens.refresh_token,'');assert(p.secrets.includes('secret-token'));
 assert.deepEqual(scrub({a:'secret-token',b:'Bearer abc.def',c:'/tmp/private/foo'},p.secrets,'/tmp/private'),{a:'[redacted]',b:'Bearer [redacted]',c:'[redacted]/foo'});
});
test('successful fake CLI records response, usage, selection, private home cleanup',async()=>{
 const r=await run('ok');assert.equal(r.status,'completed');assert.equal(r.simulation,true);assert.equal(r.cli_selected_model,'gpt-fixture');assert.equal(r.answer,'BROOKS_LOGIN_OK');assert.deepEqual(r.cleanup,{closed:true,group_absent:true,private_home_removed:true});assert.equal(r.usage.total.outputTokens,4);assert.deepEqual(r.requests.find(q=>q.method==='thread/start').params.environments,[]);
});
for(const mode of ['wrong-model','wrong-answer','failed-turn','tool','completed-tool','server-request','invalid','hang'])test('fails closed and cleans up: '+mode,async()=>{const r=await run(mode,{timeoutMs:mode==='hang'?150:2000});assert.equal(r.status,'failed');assert(r.error);assert(r.cleanup.closed&&r.cleanup.group_absent&&r.cleanup.private_home_removed)});
test('spawn failure is bounded and recorded',async()=>{const r=await run('ok',{executable:'/nonexistent/brooks-codex',timeoutMs:200});assert.equal(r.status,'failed');assert.equal(r.spawn_error,'ENOENT');assert(r.cleanup.private_home_removed)});
test('refuses overwriting prior evidence',async()=>{const root=temp();try{await assert.rejects(runLoginSmoke({model:'gpt-fixture',out:root,fixtureEndpoint}),/New output/)}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('synthetic login lifecycle uses private auth-only home and never archives credentials',async()=>{
 const root=temp(),authHome=path.join(root,'auth');fs.mkdirSync(authHome);const original=JSON.stringify({auth_mode:'chatgpt',OPENAI_API_KEY:'fixture-api-key-private',tokens:{access_token:'fixture-access-token-private',refresh_token:'fixture-refresh-token-private',account_id:'fixture-account-private'}});fs.writeFileSync(path.join(authHome,'auth.json'),original);fs.writeFileSync(path.join(root,'fake.cjs'),fake);const out=path.join(root,'out');
 try{const r=await runLoginSmoke({model:'gpt-fixture',out,live:true,authHome,executable:process.execPath,prefixArgs:[path.join(root,'fake.cjs'),'ok'],timeoutMs:2000});assert.equal(r.status,'completed');assert.equal(r.auth_type,'chatgpt');assert.equal(fs.readFileSync(path.join(authHome,'auth.json'),'utf8'),original);for(const name of fs.readdirSync(out)){const saved=fs.readFileSync(path.join(out,name),'utf8');assert(!saved.includes('fixture-access-token-private'));assert(!saved.includes('fixture-refresh-token-private'));assert(!saved.includes('fixture-api-key-private'));assert(!saved.includes('PRIVATE_EMAIL'));}}
 finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('API account response cannot pass login smoke',async()=>{const root=temp();try{fs.writeFileSync(path.join(root,'auth.json'),JSON.stringify({auth_mode:'chatgpt',tokens:{access_token:'fixture-access'}}));const r=await run('api',{live:true,fixtureEndpoint:undefined,authHome:root});assert.equal(r.status,'failed');assert.match(r.error,/ChatGPT login/)}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('archived real CLI fixture binds the launcher and selected-model RPC evidence',async()=>{
 const url=new URL('../../../../docs/research/runtime-preparations/2026-11-09-native-remote/codex-login-followup/text-smoke-offline-final/record.json',import.meta.url);const r=JSON.parse(fs.readFileSync(url));assert.equal(r.source_sha256,'7c8c4a54476ddda174088424b62c31cafb8a14977a31d72ddb32af2727379814');assert.equal(r.simulation,true);assert.equal(r.status,'completed');assert.equal(r.answer,'BROOKS_LOGIN_OK');assert.equal(r.rpc_responses.find(e=>e.method==='thread/start').response.result.model,r.requested_model);assert(r.cleanup.closed&&r.cleanup.group_absent&&r.cleanup.private_home_removed);assert.equal(r.provider_reported_model,null);
});

test('proxy inheritance is explicit, scoped and credentials are redacted',async()=>{
 const source={https_proxy:'http://proxyuser:proxypass@127.0.0.1:1234',NO_PROXY:'localhost',OPENAI_API_KEY:'dont-copy'};
 assert.deepEqual(proxyEnvironment(source,false).env,{});
 const p=proxyEnvironment(source,true);assert.deepEqual(Object.keys(p.env),['https_proxy','NO_PROXY']);
 assert.equal(scrub({value:source.https_proxy,password:'proxypass'},p.secrets).password,'[redacted]');assert.equal(scrub({password:'x'},['x']).password,'[redacted]');
 assert.throws(()=>proxyEnvironment({https_proxy:'file:///private'},true),/Unsupported/);
 assert.throws(()=>proxyEnvironment({NO_PROXY:'localhost'},true),/requires/);
 const old=process.env.https_proxy;process.env.https_proxy=source.https_proxy;
 try{const absent=await run('no-proxy');assert.equal(absent.status,'completed');const r=await run('proxy',{inheritProxy:true});assert.equal(r.proxy_mode,'explicit-environment');assert.equal(r.status,'completed');assert(!JSON.stringify(r).includes('proxypass'))}finally{if(old===undefined)delete process.env.https_proxy;else process.env.https_proxy=old}
});
test('retained local proxy drill matches current launcher and one simulated request',async()=>{
 const base=new URL('../../../../docs/research/runtime-preparations/2026-11-09-native-remote/codex-login-followup/proxy-offline-2026-11-09/',import.meta.url);
 const record=JSON.parse(fs.readFileSync(new URL('record.json',base)));const proxy=JSON.parse(fs.readFileSync(new URL('proxy-observation.json',base)));
 // A historical drill pins the launcher it actually exercised, not today's source.
 assert.equal(record.source_sha256,'21045c26bf63723b0860564e6deec6c25fceb9de89507ebb1c8eb2d26637856d');
 assert.equal(record.simulation,true);assert.equal(record.proxy_mode,'explicit-environment');assert.equal(record.status,'completed');assert.equal(record.answer,'BROOKS_LOGIN_OK');assert.equal(proxy.observed.length,1);assert.equal(proxy.simulation,true);
});

test('deadline records the last observed phase and actual timeout without fabricating an answer',async()=>{
 const r=await run('hang-turn',{timeoutMs:500});
 assert.equal(r.status,'failed');assert.match(r.error,/deadline/);assert.equal(r.answer,null);
 assert.equal(r.limits.turn_ms,500);assert.equal(r.timing.clock,'monotonic');
 assert.equal(r.timing.deadline_phase,'item/completed');assert.deepEqual(r.timing.pending_rpc_methods,[]);
 assert(r.timing.events.some(e=>e.kind==='rpc_request'&&e.name==='turn/start'));
 assert(r.timing.events.some(e=>e.kind==='rpc_response'&&e.name==='turn/start'));
 assert(r.timing.events.some(e=>e.kind==='notification'&&e.name==='item/completed'));
 assert(r.timing.deadline_elapsed_ms>=450);assert(r.timing.completed_elapsed_ms>=r.timing.deadline_elapsed_ms);
 assert(r.cleanup.closed&&r.cleanup.group_absent&&r.cleanup.private_home_removed);
});

test('deadline identifies an outstanding initialization RPC',async()=>{
 const r=await run('hang',{timeoutMs:350});
 assert.equal(r.status,'failed');assert.equal(r.timing.deadline_phase,'initialize');
 assert.deepEqual(r.timing.pending_rpc_methods,['initialize']);assert.equal(r.answer,null);
});
