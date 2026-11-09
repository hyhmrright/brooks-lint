/** Pure and saved-data tests only; npm test never launches Codex or inference. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {cliDeclaration,runtimeEnvironment,normalizedStubRoute,sseFixture,SCENARIOS,STUB_CAPABILITY,STUB_AUTH,POLICY} from './codex-channel.mjs';
const session={workspace:'/private/tmp/owned-cli-stub/workspace'};
test('CLI declaration fixes no-auth custom provider and isolated controls without real credentials',()=>{
 const d=cliDeclaration(session,'http://127.0.0.1:1234/v1');
 for(const s of ['cli_auth_credentials_store="file"','model_provider="hc_cli_stub"','model_providers.hc_cli_stub.requires_openai_auth=false','model_providers.hc_cli_stub.request_max_retries=0','model_providers.hc_cli_stub.stream_max_retries=0','otel.exporter="none"','analytics.enabled=false'])assert(d.settings.includes(s));
 for(const x of ['--ignore-user-config','--ignore-rules','--ephemeral','--no-daemon','--json'])assert(d.argv.includes(x));
 assert(!JSON.stringify(d).includes(STUB_AUTH));assert(JSON.stringify(d).includes(STUB_CAPABILITY));assert.equal(d.live_ready,false);
});
test('external, ambiguous, credential-bearing or malformed endpoint cannot be declared',()=>{
 for(const endpoint of ['https://api.openai.com/v1','http://localhost:123/v1','http://127.0.0.1:123/v1?x=1','http://u:p@127.0.0.1:123/v1','http://127.0.0.1:123/v1#x','http://127.0.0.1:123/other'])assert.throws(()=>cliDeclaration(session,endpoint));
 for(const n of [-1,2,NaN,1.5])assert.throws(()=>cliDeclaration(session,'http://127.0.0.1:1234/v1',{requestRetries:n}));
});
test('authored success payload is local SSE with explicit fixture model and deterministic terminal event',()=>{
 const bytes=sseFixture(),events=bytes.toString().split('\n').filter(l=>l.startsWith('data: ')).map(l=>JSON.parse(l.slice(6)));
 assert.equal(events.at(-1).type,'response.completed');assert.equal(events.at(-1).response.model,'fixture-model');assert.equal(events.at(-1).response.output[0].content[0].text,'LOCAL_STUB_ONLY');assert(events.every((e,i)=>e.sequence_number===i));assert.equal(POLICY.model_calls,0);assert.equal(POLICY.external_network,false);assert(SCENARIOS.includes('retry1-budget-http503'));
});
test('saved real-CLI/local-stub archive is source-bound and never counts synthetic payload as model evidence',async()=>{
 const {validateArchive}=await import('./codex-channel-drill.mjs');const r=validateArchive();assert.equal(r.model_calls,0);assert.equal(r.live_ready,false);assert(r.real_cli_cases>=7);
});

test('fixed local proxy only accepts its own response route and refuses arbitrary proxy targets',()=>{
 const origin='http://127.0.0.1:1234';assert.equal(normalizedStubRoute('/v1/responses',origin),'/v1/responses');assert.equal(normalizedStubRoute(origin+'/v1/responses',origin),'/v1/responses');
 for(const value of ['http://external.invalid/v1/responses','http://127.0.0.1:9999/v1/responses','http://u:p@127.0.0.1:1234/v1/responses',origin+'/v1/responses?x=1',origin+'/v1/responses#x','api.openai.com:443','/v1/models'])assert.equal(normalizedStubRoute(value,origin),null);
});
test('one shared runtime environment pins fresh state and proxy origins without inherited auth',()=>{
 const s={workspace:'/tmp/fixture/workspace',home:'/tmp/fixture/home',codex_home:'/tmp/fixture/codex',tmp:'/tmp/fixture/tmp',xdg_config:'/tmp/fixture/xdg-config',xdg_cache:'/tmp/fixture/xdg-cache',xdg_data:'/tmp/fixture/xdg-data'};const env=runtimeEnvironment(s,'http://127.0.0.1:1234');
 assert.equal(env.HOME,s.home);assert.equal(env.CODEX_HOME,s.codex_home);assert.equal(env.CFFIXED_USER_HOME,s.home);assert.equal(env.__CFPREFERENCES_AVOID_DAEMON,'1');for(const name of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy'])assert.equal(env[name],'http://127.0.0.1:1234');for(const name of ['OPENAI_API_KEY','CODEX_API_KEY','ANTHROPIC_API_KEY','NODE_OPTIONS','DYLD_INSERT_LIBRARIES'])assert(!(name in env));assert.throws(()=>runtimeEnvironment(s,'http://external.invalid'));
});

test('summary counters, retry contract, auth/status and CLI version cannot contradict original records',async()=>{
 const {validateArchive}=await import('./codex-channel-drill.mjs'),fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');const root=new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-codex-channel/',import.meta.url),dir=fs.mkdtempSync(path.join(os.tmpdir(),'cli-record-check-'));try{fs.cpSync(root,dir,{recursive:true});validateArchive(dir);const original=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 for(const [field,value]of [['cli_post_requests',0],['retry_contract_observed',false],['auth_header_absent_at_cli',false],['parent_dummy_auth_present',false],['cleanup_confirmed',false],['primary_status','failed']]){const changed=structuredClone(original);changed.cases[0][field]=value;fs.writeFileSync(path.join(dir,'run.json'),JSON.stringify(changed,null,2)+'\n');assert.throws(()=>validateArchive(dir),e=>e.actual===value,field);}
 const changed=structuredClone(original);changed.binary.version='not-the-recorded-version';fs.writeFileSync(path.join(dir,'run.json'),JSON.stringify(changed,null,2)+'\n');assert.throws(()=>validateArchive(dir),e=>e.actual==='not-the-recorded-version');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('development inventories reject traversal, absolute paths, duplicate keys and malformed schemas before file access',async()=>{
 const {validateArchive}=await import('./codex-channel-drill.mjs'),fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');const root=new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-codex-channel/',import.meta.url),dir=fs.mkdtempSync(path.join(os.tmpdir(),'cli-inventory-check-'));try{fs.cpSync(root,dir,{recursive:true});validateArchive(dir);const file=path.join(dir,'development','inventory.json'),original=JSON.parse(fs.readFileSync(file));
 for(const name of ['../outside','/tmp/outside','C:\\outside','a//b','./outside']){const changed=structuredClone(original);changed.sha256[name]='a'.repeat(64);fs.writeFileSync(file,JSON.stringify(changed,null,2)+'\n');assert.throws(()=>validateArchive(dir),/Unsafe inventory path/);}
 fs.writeFileSync(file,JSON.stringify({kind:original.kind,sha256:[]},null,2)+'\n');assert.throws(()=>validateArchive(dir));
 const first=Object.keys(original.sha256)[0],raw=JSON.stringify(original,null,2)+'\n',marker=JSON.stringify(first)+': '+JSON.stringify(original.sha256[first]);fs.writeFileSync(file,raw.replace(marker,marker+',\n    '+marker));assert.throws(()=>validateArchive(dir),/duplicate keys/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
