/** Opt-in real-Docker drill. `validate` reads saved evidence without contacting Docker. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {LeaseManager,createIntent,heartbeat,cancel,atomicJSON,leaseArgs,verifyIdentity,absenceConfirmed} from './docker-lease.mjs';
import {boundedCommand} from './docker-isolation.mjs';
const defaultDir=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-09-docker-lease/observations/',import.meta.url));
const service=fileURLToPath(new URL('./docker-lease-service.mjs',import.meta.url));
export const CASES=['launcher-loss','absolute-deadline','automatic-manager-restart','lost-create-response','daemon-unavailable-recovery','concurrent-sentinel','expired-intent','late-create-reconciliation'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const decode=r=>Buffer.from(r.stdout_base64,'base64').toString();
function walk(root,prefix='') {return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(root,e.name),prefix+e.name+'/'):[prefix+e.name]);}
async function until(fn,ms=15000) {const end=Date.now()+ms;while(Date.now()<end){const result=await fn();if(result)return result;await delay(100);}throw new Error('Drill deadline exceeded');}
export async function record(dir,image) {
 assert(!fs.existsSync(dir),'Use a fresh output directory');fs.mkdirSync(dir,{recursive:true});
 const results=[],commands=[],processes=[];
 const command=async args=>{const r=await boundedCommand('docker',args,{timeout_ms:4000});commands.push(r);atomicJSON(path.join(dir,'orchestrator-commands.json'),commands);return r;};
 const version=await command(['version','--format','{{json .}}']);assert.equal(version.code,0);
 const imageInspect=await command(['image','inspect',image]);assert.equal(imageInspect.code,0);
 assert.equal(JSON.parse(decode(imageInspect))[0].Id,image);
 try {
  for(const name of CASES) {
   const root=path.join(dir,name);fs.mkdirSync(root,{mode:0o700});const start=Date.now(),facts={};let serviceChild=null,launcher=null,timer=null;
   const state=i=>read(path.join(root,`${i.token}.state.json`));
   const waitRunning=i=>until(()=>fs.existsSync(path.join(root,`${i.token}.state.json`))&&state(i).phase==='running'&&state(i));
   const waitComplete=i=>until(()=>fs.existsSync(path.join(root,`${i.token}.state.json`))&&state(i).phase==='complete'&&state(i));
   const launch=()=>{const fd=fs.openSync(path.join(root,'process.log'),'a');serviceChild=spawn(process.execPath,[service,'supervise',root],{stdio:['ignore',fd,fd],detached:true});fs.closeSync(fd);processes.push(serviceChild);return serviceChild;};
   const events=[];const rawRun=async args=>{const r=await command(args);return r;};
   const manager=opts=>new LeaseManager(root,{run:rawRun,record:e=>{events.push(e);fs.writeFileSync(path.join(root,'events.jsonl'),events.map(x=>JSON.stringify(x)).join('\n')+'\n');},...opts});
   try {
    if(['launcher-loss','absolute-deadline','automatic-manager-restart'].includes(name)) {
     const i=createIntent(root,image,{lease_ms:name==='absolute-deadline'?3500:12000,heartbeat_ms:1500});
     launch();
     const heartbeatModule=fileURLToPath(new URL('./docker-lease.mjs',import.meta.url));
     launcher=spawn(process.execPath,['--input-type=module','-e',`import {heartbeat} from ${JSON.stringify('file://'+heartbeatModule)};let n=0;setInterval(()=>heartbeat(${JSON.stringify(root)},${JSON.stringify(i.token)},++n),200);`],{stdio:'ignore',detached:true});processes.push(launcher);
     const running=await waitRunning(i);facts.id=running.identity.id;
     await delay(400);const logs=await command(['logs',facts.id]);facts.worker_log=JSON.parse(decode(logs).trim());assert(facts.worker_log.child.pid&&facts.worker_log.grandchild.pid);
     if(name==='launcher-loss'){facts.launcher_killed_at=Date.now();launcher.kill('SIGKILL');await until(()=>launcher.exitCode!==null||launcher.signalCode!==null);}
     if(name==='automatic-manager-restart') {
      facts.old_manager=read(path.join(root,'service.json')).pid;facts.manager_killed_at=Date.now();process.kill(facts.old_manager,'SIGKILL');
      await until(()=>read(path.join(root,'service.json')).pid!==facts.old_manager);facts.new_manager=read(path.join(root,'service.json')).pid;
     }
     const done=await waitComplete(i);facts.completed_at=done.completed_at;facts.reason=done.reason;facts.intent=i;
     if(name==='absolute-deadline')assert(done.completed_at>=i.deadline);
     else if(name==='launcher-loss')assert(done.completed_at-facts.launcher_killed_at<10000);
     else assert.equal(done.reason,'manager-restart');
    } else if(name==='lost-create-response') {
     const i=createIntent(root,image);let injected=false;
     const m=manager({run:async args=>{const r=await rawRun(args);if(args[0]==='create'&&!injected){injected=true;facts.actual_create_result=r;return {...r,code:null,reason:'simulated-lost-create-ack',stdout_base64:''};}return r;}});
     await m.tick();assert.equal(state(i).phase,'complete');facts.intent=i;facts.fault='Injected acknowledgement loss after real Docker create returned';
    } else if(name==='daemon-unavailable-recovery') {
     const i=createIntent(root,image);let outage=false;
     const m=manager({run:async args=>outage?{argv:['docker',...args],code:1,signal:null,error:null,reason:null,closed:true,stdout_base64:'',stderr_base64:Buffer.from('SIMULATED daemon unavailable').toString('base64')}:rawRun(args)});
     await m.tick();cancel(root,i.token);outage=true;await m.tick();facts.unavailable_state=state(i);assert.equal(facts.unavailable_state.phase,'cleanup-pending');outage=false;await m.tick();assert.equal(state(i).phase,'complete');facts.intent=i;facts.fault='Injected command unavailability; actual Docker daemon was not stopped';
    } else if(name==='concurrent-sentinel') {
     const a=createIntent(root,image),b=createIntent(root,image),m=manager();await m.tick();
     cancel(root,a.token);await m.tick();assert.equal(state(a).phase,'complete');const sentinel=await command(['inspect',state(b).identity.id]);facts.sentinel=JSON.parse(decode(sentinel))[0];verifyIdentity(facts.sentinel,b,state(b).identity);assert(facts.sentinel.State.Running);cancel(root,b.token);await m.tick();assert.equal(state(b).phase,'complete');facts.intents=[a,b];
    } else if(name==='expired-intent') {
     const i=createIntent(root,image,{now:Date.now()-2000,lease_ms:500,heartbeat_ms:200}),m=manager();await m.tick();assert.equal(state(i).phase,'complete');assert(!events.some(e=>e.type==='docker'&&e.result.argv[1]==='create'));facts.intent=i;
    } else if(name==='late-create-reconciliation') {
     const i=createIntent(root,image);atomicJSON(path.join(root,`${i.token}.state.json`),{version:1,intent:i,phase:'creating',identity:null,create_attempted:true});
     const m=manager();await m.tick();facts.pending_before_create=state(i);assert.equal(facts.pending_before_create.phase,'cleanup-pending');
     const created=await command(leaseArgs(i));assert.equal(created.code,0);await m.tick();assert.equal(state(i).phase,'complete');facts.intent=i;facts.fault='Simulated restart journal; real create was delayed until after first reconciliation';
    }
   } finally {
    if(timer)clearInterval(timer);if(launcher&&launcher.exitCode===null&&launcher.signalCode===null)launcher.kill('SIGKILL');
    if(serviceChild&&serviceChild.exitCode===null&&serviceChild.signalCode===null){serviceChild.kill('SIGTERM');await until(()=>serviceChild.exitCode!==null||serviceChild.signalCode!==null,15000);}
   }
   const result={name,started_at:start,completed_at:Date.now(),facts};atomicJSON(path.join(root,'result.json'),result);results.push(result);
  }
 } finally {
  for(const child of processes)if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');
  atomicJSON(path.join(dir,'run.json'),{version:1,image,simulation:true,real_model_calls:0,live_ready:false,development_model:'gpt-6-astra (prior-session summary; not independently attested)' ,model_switch:false,results});
  const inventory={};for(const file of walk(dir))if(file!=='inventory.json')inventory[file]=hash(fs.readFileSync(path.join(dir,file)));atomicJSON(path.join(dir,'inventory.json'),inventory);
 }
 return validate(dir);
}
export function validate(dir=defaultDir) {
 const inventory=read(path.join(dir,'inventory.json'));assert.deepEqual(Object.keys(inventory).sort(),walk(dir).filter(f=>f!=='inventory.json').sort());
 for(const [file,digest]of Object.entries(inventory)){assert(!path.isAbsolute(file)&&!file.split('/').includes('..'));assert.equal(hash(fs.readFileSync(path.join(dir,file))),digest);}
 const run=read(path.join(dir,'run.json'));assert.equal(run.version,1);assert.equal(run.real_model_calls,0);assert.equal(run.live_ready,false);assert.equal(run.model_switch,false);assert.equal(run.simulation,true);assert(/^sha256:[a-f0-9]{64}$/.test(run.image));
 assert.deepEqual(run.results.map(c=>c.name),CASES);
 const ids=new Set(),tokens=new Set();
 for(const result of run.results) {
  const root=path.join(dir,result.name);assert.deepEqual(read(path.join(root,'result.json')),result);
  const intents=result.facts.intents||[result.facts.intent];
  const events=fs.readFileSync(path.join(root,'events.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  const evidence=events.filter(e=>e.type==='docker').map(e=>e.result);
  const states=intents.map(i=>read(path.join(root,`${i.token}.state.json`)));
  for(const r of evidence) {
   assert.equal(r.argv[0],'docker');
   const args=r.argv.slice(1),op=args[0],target=args.at(-1);
   if(op==='create') assert(intents.some(i=>JSON.stringify(args)===JSON.stringify(leaseArgs(i))));
   else if(op==='ps') assert(intents.some(i=>JSON.stringify(args)===JSON.stringify(['ps','-aq','--no-trunc','--filter',`label=brooks.runtime.lease=${i.token}`])));
   else {
    const state=states.find(s=>s.identity?.id===target);assert(state,'Foreign command target');
    const expected=op==='stop'?['stop','--time','1',target]:op==='kill'?['kill','--signal','KILL',target]:[op,target];
    assert(['start','stop','kill','rm','inspect'].includes(op));assert.deepEqual(args,expected);
    if(op==='inspect'&&r.code===0)verifyIdentity(JSON.parse(decode(r))[0],state.intent,state.identity);
   }
  }

  for(const i of intents) {
   assert(!tokens.has(i.token));tokens.add(i.token);assert.equal(i.image,run.image);assert.deepEqual(read(path.join(root,`${i.token}.intent.json`)),i);
   const state=read(path.join(root,`${i.token}.state.json`));assert.deepEqual(state.intent,i);assert.equal(state.phase,'complete');assert.equal(state.absence_confirmed,true);
   if(state.identity){assert(!ids.has(state.identity.id));ids.add(state.identity.id);}
   const complete=events.find(e=>e.type==='complete'&&e.token===i.token);assert(complete);assert(complete.at>=state.completed_at&&complete.at<=result.completed_at);assert.equal(complete.reason,state.reason);
   if(state.identity) {
    const inspections=evidence.filter(r=>r.argv[1]==='inspect'&&r.argv.at(-1)===state.identity.id);
    const initial=inspections.find(r=>r.code===0);assert(initial);verifyIdentity(JSON.parse(decode(initial))[0],i,state.identity);
    const last=inspections.at(-1);assert(absenceConfirmed(last,state.identity.id));
    assert(evidence.some(r=>r.argv[1]==='rm'&&r.argv.at(-1)===state.identity.id&&r.code===0));
   } else {assert.equal(result.name,'expired-intent');assert(!evidence.some(r=>r.argv[1]==='create'));}
  }
  if(result.name==='launcher-loss') {assert(result.facts.completed_at-result.facts.launcher_killed_at<10000);assert(result.facts.worker_log.child.pid&&result.facts.worker_log.grandchild.pid);}
  if(result.name==='absolute-deadline')assert(result.facts.completed_at>=result.facts.intent.deadline);
  if(result.name==='automatic-manager-restart'){assert.notEqual(result.facts.old_manager,result.facts.new_manager);assert.equal(result.facts.reason,'manager-restart');const supervisor=fs.readFileSync(path.join(root,'supervisor.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert(supervisor.some(e=>e.type==='manager-exit'&&e.signal==='SIGKILL'));assert(supervisor.filter(e=>e.type==='manager-start').length>=2);}
  if(result.name==='daemon-unavailable-recovery')assert.equal(result.facts.unavailable_state.phase,'cleanup-pending');
  if(result.name==='late-create-reconciliation')assert.equal(result.facts.pending_before_create.phase,'cleanup-pending');
  if(result.name==='concurrent-sentinel'){assert.equal(result.facts.sentinel.State.Running,true);verifyIdentity(result.facts.sentinel,result.facts.intents[1]);}
 }
 return {cases:run.results.length,containers:ids.size,live_ready:false,real_model_calls:0};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 try{const [action,dir,image]=process.argv.slice(2);console.log(JSON.stringify(action==='record'?await record(path.resolve(dir),image):action==='validate'?validate(dir?path.resolve(dir):undefined):(()=>{throw new Error('Usage: docker-lease-drill.mjs validate [DIR] | record NEW_DIR sha256:IMAGE');})(),null,2));}catch(e){console.error(e.stack);process.exitCode=1;}
}
