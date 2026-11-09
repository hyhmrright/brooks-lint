#!/usr/bin/env node
/** Records local subprocess observations; never starts Codex or another model. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync,readdirSync,lstatSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {frozenDesign} from './executor-preparation.mjs';
import {createSession,destroySession,runOfflineFixture,archiveProcessEvidence,executionLedger,liveReadiness,isolatedEnvironment,sha256,PROCESS_POLICY} from './process-executor.mjs';
const DEFAULT=new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-process-executor/',import.meta.url);
const modules=['process-executor.mjs','process-executor.test.mjs','process-executor-drill.mjs'];
const sources=()=>Object.fromEntries(modules.map(p=>[p,sha256(readFileSync(new URL(p,import.meta.url)))]));
const encode=x=>JSON.stringify(x,null,2)+'\n';
const jsonl=events=>events.map(e=>JSON.stringify(e)).join('\n')+'\n';
export const FIXTURES=[
 {id:'success-synthetic',source:`process.stdout.write(${JSON.stringify(jsonl([{type:'thread.started',thread_id:'local-fixture-only'},{type:'turn.started'},{type:'item.completed',item:{id:'fixture-item',type:'agent_message',text:'SYNTHETIC local subprocess marker; no model response.'}},{type:'turn.completed',usage:{input_tokens:0,output_tokens:0}}]))});`,expect:'process-completed'},
 {id:'environment',source:`import{readdirSync}from'node:fs';process.stdout.write(JSON.stringify({cwd:process.cwd(),env:process.env,home:readdirSync(process.env.HOME),codex_home:readdirSync(process.env.CODEX_HOME)}));`,expect:'process-completed'},
 {id:'denied-boundaries',source:`import{readFileSync,writeFileSync}from'node:fs';import net from'node:net';const probes=[process.argv[1],process.argv[2]].map(p=>{try{readFileSync(p);return{path:p,allowed:true};}catch(e){return{path:p,allowed:false,code:e.code};}});try{writeFileSync('prompt.txt','tampered');probes.push({workspace_write:true});}catch(e){probes.push({workspace_write:false,code:e.code});}const c=net.connect(9,'127.0.0.1');c.on('connect',()=>{probes.push({network:true});c.end();process.stdout.write(JSON.stringify(probes));});c.on('error',e=>{probes.push({network:false,code:e.code});process.stdout.write(JSON.stringify(probes));});`,expect:'process-completed'},
 {id:'nonzero-partial',source:`process.stdout.write(Buffer.from([0xe4,0xb8]));process.stderr.write('LOCAL fixture failure');process.exit(7);`,expect:'failed'},
 {id:'deadline-partial',source:`process.on('SIGTERM',()=>{process.stderr.write('TERM fixture observed');});process.stdout.write('LOCAL partial before timeout');setInterval(()=>{},20);`,timeout_ms:450,expect:'interrupted'},
 {id:'orphan-group',source:`import{spawn}from'node:child_process';const c=spawn(process.execPath,['--input-type=module','-e',${JSON.stringify("process.on('SIGTERM',()=>{});process.stdout.write('LOCAL child ready');setInterval(()=>{},20);")}],{stdio:['ignore','pipe','inherit'],env:process.env});c.stdout.on('data',b=>{process.stdout.write(b);process.exit(0);});`,expect:'failed'}
];
export async function recordArchive(root=fileURLToPath(DEFAULT)) {
 assert.equal(process.platform,'darwin','Recording requires the reviewed local Seatbelt backend');
 assert(!existsSync(path.join(root,'observations')),'Observation archive already exists');mkdirSync(root,{recursive:true});mkdirSync(path.join(root,'observations'));
 const design=frozenDesign(),results=[];
 for(const f of FIXTURES){const s=createSession(design,design.order.turns[0]);try{
  const r=await runOfflineFixture(s,{source:f.source,args:f.id==='denied-boundaries'?[path.resolve('AGENTS.md'),path.resolve('package.json')]:[],timeout_ms:f.timeout_ms??2500,grace_ms:80,drain_ms:80});assert.equal(r.status,f.expect,f.id);
  if(f.id==='denied-boundaries'){const p=JSON.parse(Buffer.from(r.stdout_base64,'base64'));assert(p.every(x=>x.allowed===false||x.workspace_write===false||x.network===false));assert(p.every(x=>['EPERM','EACCES'].includes(x.code)));}
  archiveProcessEvidence(path.join(root,'observations',f.id),r,s);
  results.push({id:f.id,status:r.status,reason:r.reason,expected_process_status:f.expect,fixture_source:f.source,fixture_sha256:sha256(f.source),process_sha256:sha256(readFileSync(path.join(root,'observations',f.id,'process.json'))),ledger:executionLedger(r,{model:'UNBOUND-NO-EXECUTION',provider:'UNBOUND-NO-EXECUTION',reasoning:'UNBOUND-NO-EXECUTION'})});
 }finally{destroySession(s);}}
 const registration=JSON.parse(readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/execution-registration-template.json',import.meta.url)));
 const summary={revision:1,recorded_at:new Date().toISOString(),type:'actual-local-subprocess-observations-with-authored-fixture-output-not-model-results',host:{platform:process.platform,arch:process.arch,node:process.version,uid:process.getuid()},source_sha256:sources(),frozen_plan_sha256:design.anchor.study_sha256,policy:PROCESS_POLICY,results,readiness:liveReadiness(design,registration),model_calls:0,semantic_reviews:0,independent_human_reviews:0,limitations:['Local process checks only; no Codex inference or prompt catalog observation','Same-process-group cleanup; detached/setsid escape containment unverified','macOS Seatbelt runtime allows process*, mach-lookup, sysctl and file metadata; not complete host noninterference','Deny-all networking cannot support inference; transport isolation/auth and retry behavior pending','Public same-workflow exposed development cases; no independent holdout or efficacy claim']};
 writeFileSync(path.join(root,'run.json'),encode(summary),{flag:'wx'});return summary;
}
/** Recorded Darwin paths use POSIX semantics on every validating host. */
export function archivedDarwinPathWithin(root,child) {
 if(typeof root!=='string'||typeof child!=='string'||!path.posix.isAbsolute(root)||!path.posix.isAbsolute(child))return false;
 if(path.posix.normalize(root)!==root||path.posix.normalize(child)!==child)return false;
 const relative=path.posix.relative(root,child);
 return relative!==''&&relative!=='..'&&!relative.startsWith('../')&&!path.posix.isAbsolute(relative);
}
export function validateArchive(root=fileURLToPath(DEFAULT)) {
 const run=JSON.parse(readFileSync(path.join(root,'run.json'))),design=frozenDesign();assert.equal(run.model_calls,0);assert.equal(run.semantic_reviews,0);assert.equal(run.independent_human_reviews,0);assert.equal(run.readiness.ready,false);assert.equal(run.host.platform,'darwin');assert.equal(run.frozen_plan_sha256,design.anchor.study_sha256);assert.deepEqual(run.source_sha256,sources());assert.deepEqual(run.policy,PROCESS_POLICY);assert.deepEqual(run.results.map(r=>r.id),FIXTURES.map(f=>f.id));
 for(const [i,r]of run.results.entries()){
  const f=FIXTURES[i],folder=path.join(root,'observations',r.id);assert.equal(r.fixture_source,f.source);assert.equal(r.fixture_sha256,sha256(f.source));assert.equal(r.process_sha256,sha256(readFileSync(path.join(folder,'process.json'))));
  const p=JSON.parse(readFileSync(path.join(folder,'process.json')));assert.equal(p.simulation,true);assert.equal(p.fixture_sha256,r.fixture_sha256);assert.equal(p.status,f.expect);assert.equal(p.timeout_ms,f.timeout_ms??2500);assert.equal(p.grace_ms,80);assert.equal(p.drain_ms,80);assert.equal(p.stdout_sha256,sha256(readFileSync(path.join(folder,'stdout.bin'))));assert.equal(p.stderr_sha256,sha256(readFileSync(path.join(folder,'stderr.bin'))));assert.equal(p.stdout_base64,readFileSync(path.join(folder,'stdout.bin')).toString('base64'));assert.equal(p.stderr_base64,readFileSync(path.join(folder,'stderr.bin')).toString('base64'));assert.equal(p.output_truncated,false);
  assert(p.runtime_files.length>0&&p.runtime_files.every(f=>path.posix.isAbsolute(f.path)&&/^[a-f0-9]{64}$/.test(f.sha256)));assert.equal(p.policy_sha256,sha256(p.policy_text));assert(p.policy_text.includes('(deny default)')&&!p.policy_text.includes('(allow network'));assert.equal(p.launch.launcher,'/usr/bin/sandbox-exec');assert(p.runtime_files.some(f=>f.path===p.launch.child_executable));assert.deepEqual(p.launch.child_argv,['--no-addons','--input-type=module','-e',f.source,'--',...p.fixture_args]);assert.equal(p.launch.cwd,p.launch.session_paths.workspace);const expectedEnv=isolatedEnvironment(p.launch.session_paths);expectedEnv.__CF_USER_TEXT_ENCODING=`0x${run.host.uid.toString(16).toUpperCase()}:0:0`;assert.deepEqual(p.launch.env,expectedEnv);for(const key of ['workspace','home','codex_home','tmp','xdg_config','xdg_cache','xdg_data'])assert(archivedDarwinPathWithin(p.launch.session_paths.root,p.launch.session_paths[key]));assert.equal(p.workspace_inventory.length,5);
  assert.deepEqual(r.ledger,executionLedger(p,r.ledger.intended));assert.equal(r.ledger.observed.model,null);assert.equal(r.ledger.stop_subsequent,true);
  if(f.id==='deadline-partial'){assert.equal(p.reason,'deadline');assert.deepEqual(p.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(p.events.find(e=>e.type==='stop').elapsed_ms>=400);}
  if(f.id==='orphan-group'){assert.equal(p.reason,'descendant-after-leader-exit');assert.equal(p.descendant_group_detected,true);assert.deepEqual(p.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);}
  if(f.id==='denied-boundaries'){const probes=JSON.parse(readFileSync(path.join(folder,'stdout.bin')));assert(probes.every(x=>(x.allowed===false||x.workspace_write===false||x.network===false)&&['EPERM','EACCES'].includes(x.code)));}
 }
 const cli=JSON.parse(readFileSync(path.join(root,'local-cli.json')));assert.equal(cli.model_turns_launched,0);assert.equal(cli.inspection_only,true);assert.equal(cli.version_stdout_sha256,sha256(readFileSync(path.join(root,'codex-version.txt'))));assert.equal(cli.exec_help_stdout_sha256,sha256(readFileSync(path.join(root,'codex-exec-help.txt'))));assert.equal(cli.version,readFileSync(path.join(root,'codex-version.txt'),'utf8').trim());assert(/^[a-f0-9]{64}$/.test(cli.binary_sha256));
 return {offline:true,local_process_observations:run.results.length,model_calls:0,live_ready:false,archive_platform:run.host.platform,validation_platform:process.platform};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [command='validate',root]=process.argv.slice(2);assert(['record','validate'].includes(command),'Use record or validate; no live command exists');
 console.log(JSON.stringify(command==='record'?{recorded:(await recordArchive(root)).results.length,model_calls:0}:validateArchive(root)));
}
