#!/usr/bin/env node
/** Local process archives only. Historical source is hashed data, never imported/executed. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {frozenDesign} from './executor-preparation.mjs';
import {createSession,destroySession,runOfflineFixture,archiveProcessEvidence,executionLedger,liveReadiness,isolatedEnvironment,sha256,PROCESS_POLICY,guardianSource,classifyGroup} from './process-executor.mjs';
const HISTORICAL=new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-process-executor/',import.meta.url);
const CURRENT=new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-termination-confirmation/',import.meta.url);
export const PRIOR_INVENTORY_SHA256='1d9a2f4e1e122c80b47d1131fc63f8acef80071053f735dc64430ccc5f9e5b55';
const modules=['process-executor.mjs','process-executor.test.mjs','process-executor-drill.mjs','process-executor-guardian.mjs'];
const sources=()=>Object.fromEntries(modules.map(p=>[p,sha256(readFileSync(new URL(p,import.meta.url)))]));
const encode=x=>JSON.stringify(x,null,2)+'\n';
const jsonl=events=>events.map(e=>JSON.stringify(e)).join('\n')+'\n';
export const FIXTURES=[
 {id:'success-synthetic',source:`process.stdout.write(${JSON.stringify(jsonl([{type:'thread.started',thread_id:'local-fixture-only'},{type:'turn.started'},{type:'item.completed',item:{id:'fixture-item',type:'agent_message',text:'SYNTHETIC local subprocess marker; no model response.'}},{type:'turn.completed',usage:{input_tokens:0,output_tokens:0}}]))});`,expect:'process-completed'},
 {id:'environment',source:`import{readdirSync}from'node:fs';process.stdout.write(JSON.stringify({cwd:process.cwd(),env:process.env,home:readdirSync(process.env.HOME),codex_home:readdirSync(process.env.CODEX_HOME),send:typeof process.send,channel:process.env.NODE_CHANNEL_FD??null}));`,expect:'process-completed'},
 {id:'denied-boundaries',source:`import{readFileSync,writeFileSync}from'node:fs';import net from'node:net';const probes=[process.argv[1],process.argv[2]].map(p=>{try{readFileSync(p);return{path:p,allowed:true};}catch(e){return{path:p,allowed:false,code:e.code};}});try{writeFileSync('prompt.txt','tampered');probes.push({workspace_write:true});}catch(e){probes.push({workspace_write:false,code:e.code});}const c=net.connect(9,'127.0.0.1');c.on('connect',()=>{probes.push({network:true});c.end();process.stdout.write(JSON.stringify(probes));});c.on('error',e=>{probes.push({network:false,code:e.code});process.stdout.write(JSON.stringify(probes));});`,expect:'process-completed'},
 {id:'nonzero-partial',source:`process.stdout.write(Buffer.from([0xe4,0xb8]));process.stderr.write('LOCAL fixture failure');process.exit(7);`,expect:'failed'},
 {id:'deadline-partial',source:`process.on('SIGTERM',()=>{process.stderr.write('TERM fixture observed');});process.stdout.write('LOCAL partial before timeout');setInterval(()=>{},20);`,timeout_ms:900,expect:'interrupted'},
 {id:'orphan-open-stdio',source:`import{spawn}from'node:child_process';const c=spawn(process.execPath,['--input-type=module','-e',${JSON.stringify("process.on('SIGTERM',()=>{});process.stdout.write('LOCAL child ready');setInterval(()=>{},20);")}],{stdio:['ignore','pipe','inherit'],env:process.env});c.stdout.on('data',b=>{process.stdout.write(b);process.exit(0);});`,expect:'failed'},
 {id:'orphan-closed-stdio',source:`import{spawn}from'node:child_process';import{existsSync}from'node:fs';spawn(process.execPath,['--input-type=module','-e',${JSON.stringify("import{writeFileSync}from'node:fs';process.on('SIGTERM',()=>{});writeFileSync(process.env.HOME+'/ready','ready');setInterval(()=>{},20);")}],{stdio:'ignore',env:process.env});const t=setInterval(()=>{if(existsSync(process.env.HOME+'/ready')){clearInterval(t);process.stdout.write('LOCAL closed-stdio child ready');process.exit(0);}},10);`,expect:'failed'},
 {id:'trailing-term-bytes',source:`import{writeSync}from'node:fs';process.on('SIGTERM',()=>{writeSync(1,'LOCAL TERM trailing bytes');writeSync(2,'LOCAL TERM stderr');});process.stdout.write('LOCAL before TERM:');setInterval(()=>{},20);`,timeout_ms:900,expect:'interrupted'}
];
function listFiles(root,prefix=''){
 return readdirSync(path.join(root,prefix),{withFileTypes:true}).flatMap(e=>{const relative=prefix?`${prefix}/${e.name}`:e.name;assert(!e.isSymbolicLink(),'Archive symlink refused');return e.isDirectory()?listFiles(root,relative):[relative];}).sort();
}
/** Anchored inventory and old source snapshots preserve the original failed QA; no code evaluation. */
export function validatePriorArtifacts(){
 const bytes=readFileSync(new URL('prior-archive-inventory.json',CURRENT));assert.equal(sha256(bytes),PRIOR_INVENTORY_SHA256);
 const inventory=JSON.parse(bytes),root=fileURLToPath(HISTORICAL);assert.deepEqual(listFiles(root),Object.keys(inventory.sha256).sort());
 for(const [p,h]of Object.entries(inventory.sha256)){assert(!path.posix.isAbsolute(p)&&!p.split('/').includes('..'));assert.equal(sha256(readFileSync(path.join(root,p))),h,`Prior artifact drift: ${p}`);}
 const run=JSON.parse(readFileSync(new URL('run.json',HISTORICAL)));
 for(const [p,h]of Object.entries(run.source_sha256))assert.equal(sha256(readFileSync(new URL(`prior-source-snapshots/${p}`,CURRENT))),h,`Historical source drift: ${p}`);
 return {preserved_files:Object.keys(inventory.sha256).length,source_snapshots:Object.keys(run.source_sha256).length,inventory_sha256:PRIOR_INVENTORY_SHA256,archived_code_executed:false};
}
export async function recordArchive(root=fileURLToPath(CURRENT)){
 assert.equal(process.platform,'darwin');validatePriorArtifacts();assert(!existsSync(path.join(root,'observations')),'Observation archive already exists');mkdirSync(root,{recursive:true});mkdirSync(path.join(root,'observations'));
 const design=frozenDesign(),results=[];
 for(const f of FIXTURES){const s=createSession(design,design.order.turns[0]);try{
  const r=await runOfflineFixture(s,{source:f.source,args:f.id==='denied-boundaries'?[path.resolve('AGENTS.md'),path.resolve('package.json')]:[],timeout_ms:f.timeout_ms??3000,grace_ms:100,confirmation_ms:1500,drain_ms:150});
  assert.equal(r.status,f.expect,f.id);assert.equal(r.cleanup.confirmed,true,f.id);assert.equal(r.drain_incomplete,false,f.id);
  if(f.id==='denied-boundaries'){const p=JSON.parse(Buffer.from(r.stdout_base64,'base64'));assert(p.every(x=>(x.allowed===false||x.workspace_write===false||x.network===false)&&['EPERM','EACCES'].includes(x.code)));}
  archiveProcessEvidence(path.join(root,'observations',f.id),r,s);
  results.push({id:f.id,status:r.status,reason:r.reason,expected_process_status:f.expect,fixture_source:f.source,fixture_sha256:sha256(f.source),process_sha256:sha256(readFileSync(path.join(root,'observations',f.id,'process.json'))),ledger:executionLedger(r,{model:'UNBOUND-NO-EXECUTION',provider:'UNBOUND-NO-EXECUTION',reasoning:'UNBOUND-NO-EXECUTION'})});
 }finally{destroySession(s);}}
 const registration=JSON.parse(readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/execution-registration-template.json',import.meta.url)));
 const run={revision:2,recorded_at:new Date().toISOString(),type:'actual-local-subprocess-observations-with-authored-fixture-output-not-model-results',host:{platform:process.platform,arch:process.arch,node:process.version,uid:process.getuid()},source_sha256:sources(),frozen_plan_sha256:design.anchor.study_sha256,prior_inventory_sha256:PRIOR_INVENTORY_SHA256,policy:PROCESS_POLICY,results,readiness:liveReadiness(design,registration),model_calls:0,semantic_reviews:0,independent_human_reviews:0,limitations:['Same process group only; detached/setsid escapes uncontained','Zombie-only means no running members, not reaping; prior failure actual state was unknown','No Codex inference, model identity observation, semantic review or independent holdout evidence','POSIX process snapshots and JS timers are observations, not hard real-time or adversarial kernel guarantees']};
 mkdirSync(path.join(root,'source-snapshots'));for(const p of modules)writeFileSync(path.join(root,'source-snapshots',p),readFileSync(new URL(p,import.meta.url)),{flag:'wx'});
 writeFileSync(path.join(root,'run.json'),encode(run),{flag:'wx'});return run;
}
/** Recorded Darwin paths stay POSIX on every validating host. */
export function archivedDarwinPathWithin(root,child){
 if(typeof root!=='string'||typeof child!=='string'||!path.posix.isAbsolute(root)||!path.posix.isAbsolute(child))return false;
 if(path.posix.normalize(root)!==root||path.posix.normalize(child)!==child)return false;
 const relative=path.posix.relative(root,child);return relative!==''&&relative!=='..'&&!relative.startsWith('../')&&!path.posix.isAbsolute(relative);
}
export function validateArchive(root=fileURLToPath(HISTORICAL)){
 const run=JSON.parse(readFileSync(path.join(root,'run.json'))),design=frozenDesign(),historical=run.revision===1;validatePriorArtifacts();
 assert.equal(run.model_calls,0);assert.equal(run.semantic_reviews,0);assert.equal(run.independent_human_reviews,0);assert.equal(run.readiness.ready,false);assert.equal(run.host.platform,'darwin');assert.equal(run.frozen_plan_sha256,design.anchor.study_sha256);
 const fixtures=historical?run.results.map(r=>({id:r.id,source:r.fixture_source,expect:r.expected_process_status,timeout_ms:r.id==='deadline-partial'?450:2500})):FIXTURES;
 if(historical){assert.equal(sha256(readFileSync(path.join(root,'run.json'))),'de3ab246ead0e6e95126a26ef5685a12003f68fa728e625a8122e43049c605fc');assert.equal(run.policy.revision,1);}
 else{assert.equal(run.revision,2);assert.deepEqual(run.source_sha256,sources());assert.deepEqual(run.policy,PROCESS_POLICY);assert.equal(run.prior_inventory_sha256,PRIOR_INVENTORY_SHA256);for(const[p,h]of Object.entries(run.source_sha256))assert.equal(sha256(readFileSync(path.join(root,'source-snapshots',p))),h);}
 assert.deepEqual(run.results.map(r=>r.id),fixtures.map(f=>f.id));
 for(const[i,r]of run.results.entries()){
  const f=fixtures[i],folder=path.join(root,'observations',r.id),p=JSON.parse(readFileSync(path.join(folder,'process.json')));
  assert.equal(r.fixture_source,f.source);assert.equal(r.fixture_sha256,sha256(f.source));assert.equal(r.process_sha256,sha256(readFileSync(path.join(folder,'process.json'))));assert.equal(p.simulation,true);assert.equal(p.fixture_sha256,r.fixture_sha256);assert.equal(p.status,f.expect);assert.equal(p.timeout_ms,f.timeout_ms??3000);assert.equal(p.grace_ms,historical?80:100);assert.equal(p.drain_ms,historical?80:150);assert.equal(p.output_truncated,false);
  for(const name of ['stdout','stderr']){const bytes=readFileSync(path.join(folder,`${name}.bin`));assert.equal(p[`${name}_sha256`],sha256(bytes));assert.equal(p[`${name}_base64`],bytes.toString('base64'));}
  assert(p.runtime_files.length>0&&p.runtime_files.every(f=>path.posix.isAbsolute(f.path)&&/^[a-f0-9]{64}$/.test(f.sha256)));assert.equal(p.policy_sha256,sha256(p.policy_text));assert(p.policy_text.includes('(deny default)')&&!p.policy_text.includes('(allow network'));assert.equal(p.launch.launcher,'/usr/bin/sandbox-exec');assert(p.runtime_files.some(f=>f.path===p.launch.child_executable));assert.deepEqual(p.launch.child_argv,['--no-addons','--input-type=module','-e',f.source,'--',...p.fixture_args]);assert.equal(p.launch.cwd,p.launch.session_paths.workspace);
  const expectedEnv=isolatedEnvironment(p.launch.session_paths);expectedEnv.__CF_USER_TEXT_ENCODING=`0x${run.host.uid.toString(16).toUpperCase()}:0:0`;assert.deepEqual(p.launch.env,expectedEnv);for(const key of ['workspace','home','codex_home','tmp','xdg_config','xdg_cache','xdg_data'])assert(archivedDarwinPathWithin(p.launch.session_paths.root,p.launch.session_paths[key]));assert.equal(p.workspace_inventory.length,5);
  assert.deepEqual(r.ledger,executionLedger(p,r.ledger.intended));assert.equal(r.ledger.observed.model,null);assert.equal(r.ledger.stop_subsequent,true);
  if(!historical){
   assert.equal(p.probe_mode,'actual-parent-darwin-ps');assert.equal(p.guardian_control_mode,'fixed-supervisor');assert.equal(p.guardian_source_sha256,sha256(guardianSource));assert.equal(p.confirmation_ms,1500);assert.equal(p.cleanup.confirmed,true);assert(['absent','zombie-only'].includes(p.cleanup.final_state));assert.equal(p.guardian_ownership_lost,false);assert.equal(p.drain_incomplete,false);assert.equal(p.stdio_closed,true);assert(p.cleanup_elapsed_ms<=p.cleanup_budget_ms);assert(p.cleanup.observations.length>0);
   for(const o of p.cleanup.observations){const state=classifyGroup(o.probe,{group_id:p.guardian_pid,guardian_alive:o.guardian_alive});assert.equal(o.state,state.state);assert.deepEqual(o.running_members,state.running_members);assert.deepEqual(o.zombie_members,state.zombie_members);}
   assert.equal(p.cleanup.observations.at(-1).running_members.length,0);
   for(const signal of p.signals)if(signal.delivered)assert.equal(signal.ownership,'live-unreaped-guardian-child');
   if(p.status==='process-completed'){assert.equal(p.exit_code,0);assert.equal(p.guardian_exit.code,0);assert.equal(p.leader_exited,true);}
  }
  if(f.id==='deadline-partial'||f.id==='trailing-term-bytes'){assert.equal(p.reason,'deadline');assert.deepEqual(p.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(p.events.find(e=>e.type==='stop').elapsed_ms>=(historical?400:890));}
  if(f.id.startsWith('orphan')){assert.equal(p.reason,'descendant-after-leader-exit');assert.equal(p.descendant_group_detected,true);assert.deepEqual(p.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);}
  if(f.id==='denied-boundaries'){const probes=JSON.parse(readFileSync(path.join(folder,'stdout.bin')));assert(probes.every(x=>(x.allowed===false||x.workspace_write===false||x.network===false)&&['EPERM','EACCES'].includes(x.code)));}
 }
 if(historical){const cli=JSON.parse(readFileSync(path.join(root,'local-cli.json')));assert.equal(cli.model_turns_launched,0);assert.equal(cli.inspection_only,true);assert.equal(cli.version_stdout_sha256,sha256(readFileSync(path.join(root,'codex-version.txt'))));assert.equal(cli.exec_help_stdout_sha256,sha256(readFileSync(path.join(root,'codex-exec-help.txt'))));}
 return {offline:true,revision:run.revision,local_process_observations:run.results.length,model_calls:0,live_ready:false,archive_platform:run.host.platform,validation_platform:process.platform,historical_sources_executed:false};
}
export function validateAllArchives(){
 const root=new URL('author-pre-boundary-correction/',CURRENT),bytes=readFileSync(new URL('record.json',root));assert.equal(sha256(bytes),'c05794b288560722c4a4808b211a70fa6e0651ff978a26fc5c21f621f6543b7b');const record=JSON.parse(bytes);
 for(const[p,h]of Object.entries(record.sha256)){assert(!path.posix.isAbsolute(p)&&!p.split('/').includes('..'));assert.equal(sha256(readFileSync(new URL(p,root))),h,`Author attempt drift: ${p}`);}
 return {historical:validateArchive(),current:validateArchive(fileURLToPath(CURRENT)),preservation:validatePriorArtifacts(),author_attempt_preserved_files:Object.keys(record.sha256).length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const[command='validate',root]=process.argv.slice(2);assert(['record','validate'].includes(command),'Use record or validate; no live command exists');console.log(JSON.stringify(command==='record'?{recorded:(await recordArchive(root)).results.length,model_calls:0}:root?validateArchive(root):validateAllArchives()));
}
