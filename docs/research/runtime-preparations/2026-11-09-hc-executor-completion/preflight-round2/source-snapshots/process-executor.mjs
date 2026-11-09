/** Revision 2 local subprocess boundary. No model/provider launch is exposed. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,realpathSync,lstatSync,existsSync,rmSync,chmodSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {assembleTurn,exportWorkspace,registrationProblems,turnKey} from './executor-preparation.mjs';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const PROCESS_POLICY = Object.freeze({revision:2,platform:'darwin',network:'deny-all-including-loopback',deadline_ms:900000,term_grace_ms:2000,drain_ms:500,confirmation_ms:1500,probe_timeout_ms:200,poll_ms:25,zombie_policy:'terminal-nonrunning-unreaped',max_output_bytes:8388608,primary_attempts:1,retries:0,live_enabled:false});
const within = (parent, child) => child===parent || child.startsWith(parent+path.sep);
const systemRoots=['/System','/usr/lib','/Library/Apple','/private/var/db/dyld'];
const literal = p => {assert(typeof p==='string' && path.isAbsolute(p) && !/[\x00-\x1f]/.test(p),'Absolute safe path required');return JSON.stringify(p);};

/** Exact loaded native modules, not all of Homebrew or any personal home. */
export function nodeRuntimeFiles() {
  const modules=process.report.getReport().sharedObjects;
  const files=[process.execPath,...modules].filter(p=>path.isAbsolute(p)&&!systemRoots.some(root=>within(root,p)));
  return [...new Set(files.map(p=>realpathSync(p)))].sort();
}
export function isolatedEnvironment(session) {
  return {HOME:session.home,CODEX_HOME:session.codex_home,XDG_CONFIG_HOME:session.xdg_config,XDG_CACHE_HOME:session.xdg_cache,XDG_DATA_HOME:session.xdg_data,TMPDIR:session.tmp,PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C',__CF_USER_TEXT_ENCODING:`0x${(process.getuid?.()??0).toString(16).toUpperCase()}:0:0`,OPENSSL_CONF:'/dev/null',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'};
}
/** Private per-turn directories; no auth/config/skills/rules/memory/session copied. */
export function createSession(design,scheduled,{parent=realpathSync(tmpdir())}={}) {
  assert(path.isAbsolute(parent)&&realpathSync(parent)===parent,'Canonical scratch parent required');
  const root=mkdtempSync(path.join(parent,'hc-process-'));chmodSync(root,0o700);
  try {
    const s={root,workspace:path.join(root,'workspace'),home:path.join(root,'home'),codex_home:path.join(root,'codex'),tmp:path.join(root,'tmp'),xdg_config:path.join(root,'xdg-config'),xdg_cache:path.join(root,'xdg-cache'),xdg_data:path.join(root,'xdg-data')};
    // Root contains model-visible state only. Raw evidence belongs outside this sandbox.
    for(const p of [s.home,s.codex_home,s.tmp,s.xdg_config,s.xdg_cache,s.xdg_data])mkdirSync(p,{mode:0o700});
    s.packet=assembleTurn(design,scheduled);s.inventory=exportWorkspace(design,s.packet,s.workspace);
    s.env=isolatedEnvironment(s);return s;
  } catch(error){rmSync(root,{recursive:true,force:true});throw error;}
}
export function destroySession(s){rmSync(s.root,{recursive:true,force:true});}

/** Deny-default Seatbelt profile. Metadata names are visible; file contents are allowlisted. */
export function seatbeltProfile(s,runtimeFiles,{platform=process.platform}={}) {
  assert.equal(platform,'darwin','No reviewed OS isolation backend for this platform');
  assert(existsSync('/usr/bin/sandbox-exec'),'Seatbelt unavailable');
  for(const p of [s.root,s.workspace,s.home,s.codex_home,s.tmp,s.xdg_config,s.xdg_cache,s.xdg_data])assert(lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink()&&realpathSync(p)===p);
  assert(Array.isArray(runtimeFiles)&&runtimeFiles.length>0);
  for(const p of runtimeFiles){assert(lstatSync(p).isFile()&&!lstatSync(p).isSymbolicLink()&&realpathSync(p)===p,'Native runtime must be canonical regular files');}
  const reads=[...systemRoots.map(p=>`(subpath ${literal(p)})`),...runtimeFiles.map(p=>`(literal ${literal(p)})`),`(subpath ${literal(s.root)})`,'(literal "/")','(literal "/dev/null")','(literal "/dev/random")','(literal "/dev/urandom")'];
  // Nothing grants network*. No inherited sockets; the parent creates only stdio pipes.
  return `(version 1)\n(deny default)\n(allow process*)\n(allow sysctl-read)\n(allow mach-lookup)\n(allow file-read-metadata)\n(allow file-read* ${reads.join(' ')})\n(allow file-write* (subpath ${literal(s.home)}) (subpath ${literal(s.codex_home)}) (subpath ${literal(s.tmp)}) (subpath ${literal(s.xdg_config)}) (subpath ${literal(s.xdg_cache)}) (subpath ${literal(s.xdg_data)}) (literal "/dev/null"))\n`;
}
export const guardianSource=readFileSync(new URL('./process-executor-guardian.mjs',import.meta.url),'utf8');
export const TERMINAL_GROUP_STATES=Object.freeze(['absent','zombie-only']);
/** Snapshot classification, not PID visibility. Guardian liveness comes from ChildProcess. */
export function classifyGroup(snapshot,{group_id,guardian_alive}) {
 if(!snapshot||snapshot.error||!Array.isArray(snapshot.members))return {state:'unknown',reason:snapshot?.error??'invalid-probe',running_members:[],zombie_members:[]};
 const members=snapshot.members;
 if(members.some(m=>!Number.isSafeInteger(m.pid)||m.pid<=0||m.pgid!==group_id||typeof m.state!=='string'||!m.state))return {state:'unknown',reason:'invalid-member',running_members:[],zombie_members:[]};
 const guardian=members.find(m=>m.pid===group_id),others=members.filter(m=>m.pid!==group_id);
 const zombies=others.filter(m=>m.state.startsWith('Z')),running=others.filter(m=>!m.state.startsWith('Z'));
 if(members.some(m=>m.state.startsWith('?')))return {state:'unknown',reason:'unknown-process-state',running_members:running,zombie_members:zombies};
 if(!guardian_alive&&guardian)return {state:'unknown',reason:'guardian-row-after-reap-or-group-reuse',running_members:running,zombie_members:zombies};
 if(guardian_alive&&(!guardian||guardian.state.startsWith('Z')))return {state:'unknown',reason:'guardian-exit-observation-pending',running_members:running,zombie_members:zombies};
 if(running.length)return {state:'running',running_members:running,zombie_members:zombies};
 if(guardian_alive)return {state:'guardian-only',running_members:[],zombie_members:zombies};
 return {state:zombies.length?'zombie-only':'absent',running_members:[],zombie_members:zombies};
}
/** Pure polling policy with injectable clock/probe, including all probe time in one deadline. */
export async function confirmGroupTermination({probe,group_id,guardianAlive=()=>false,deadline_ms,now=()=>performance.now(),sleep=ms=>new Promise(r=>setTimeout(r,ms)),poll_ms=PROCESS_POLICY.poll_ms,probe_timeout_ms=PROCESS_POLICY.probe_timeout_ms,onObservation=()=>{}}) {
 const observations=[];let last={state:'unknown',reason:'no-probe-before-deadline',running_members:[],zombie_members:[]};
 while(now()<deadline_ms){
  const remaining=deadline_ms-now();let raw;
  try{raw=await probe({timeout_ms:Math.max(1,Math.min(probe_timeout_ms,remaining)),deadline_ms});}catch(e){raw={error:`probe-error:${e.code??e.message}`};}
  const guardian_alive=guardianAlive();last=classifyGroup(raw,{group_id,guardian_alive});const observation={observed_at_ms:now(),guardian_alive,...last,probe:raw};observations.push(observation);onObservation(observation);
  if(now()>deadline_ms)return {confirmed:false,final_state:last.state,reason:'confirmation-deadline-exceeded',observations,terminal_policy:PROCESS_POLICY.zombie_policy};
  if(TERMINAL_GROUP_STATES.includes(last.state))return {confirmed:true,final_state:last.state,reason:null,observations,terminal_policy:PROCESS_POLICY.zombie_policy};
  const delay=Math.min(poll_ms,Math.max(0,deadline_ms-now()));if(delay>0)await sleep(delay);
 }
 return {confirmed:false,final_state:last.state,reason:'confirmation-deadline-exceeded',observations,terminal_policy:PROCESS_POLICY.zombie_policy};
}
/** Parent-side OS observation. ps is async, byte bounded, timed and killed on overrun. */
export async function probeProcessGroup(group_id,{timeout_ms=PROCESS_POLICY.probe_timeout_ms,deadline_ms=performance.now()+timeout_ms}={}) {
 assert(Number.isSafeInteger(group_id)&&group_id>1);assert.equal(process.platform,'darwin');
 const start=performance.now(),budget=Math.max(0,Math.min(timeout_ms,deadline_ms-start));
 if(budget<=0)return {error:'probe-deadline-before-launch',members:[],elapsed_ms:0};
 return await new Promise(resolve=>{
  const argv=['-g',String(group_id),'-o','pid=,ppid=,pgid=,stat=,lstart='];
  let child,done=false,psExited=false,timer,stdout=Buffer.alloc(0),stderr=Buffer.alloc(0);
  const finish=(error=null,code=null)=>{if(done)return;if(!error&&performance.now()-start>budget)error='probe-timeout';done=true;clearTimeout(timer);child?.stdout.destroy();child?.stderr.destroy();
   const members=[];let parseError=null;
   if(!error){for(const line of stdout.toString('utf8').split('\n').filter(x=>x.trim())){const m=line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+?)\s*$/);if(!m){parseError='unparseable-ps-row';break;}if(Number(m[3])!==group_id){parseError='foreign-group-row';break;}members.push({pid:Number(m[1]),ppid:Number(m[2]),pgid:Number(m[3]),state:m[4],start_text:m[5]});}}
   resolve({error:error??parseError,members,command:['/bin/ps',...argv],exit_code:code,elapsed_ms:performance.now()-start,stdout_base64:stdout.toString('base64'),stderr_base64:stderr.toString('base64')});
  };
  try{child=spawn('/bin/ps',argv,{env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},stdio:['ignore','pipe','pipe'],shell:false});}catch(e){finish(`probe-spawn:${e.code}`);return;}
  const capture=(which,chunk)=>{if(stdout.length+stderr.length+chunk.length>1048576){if(!psExited)child.kill('SIGKILL');finish('probe-output-limit');return;}if(which==='stdout')stdout=Buffer.concat([stdout,chunk]);else stderr=Buffer.concat([stderr,chunk]);};
  child.stdout.on('data',b=>capture('stdout',b));child.stderr.on('data',b=>capture('stderr',b));
  child.on('error',e=>finish(`probe-spawn:${e.code}`));child.on('exit',()=>{psExited=true;});child.on('close',code=>finish(code===0||(code===1&&stdout.length===0&&stderr.length===0)?null:`probe-exit:${code}`,code));
  timer=setTimeout(()=>{if(!psExited)child.kill('SIGKILL');finish('probe-timeout');},Math.max(0,budget-(performance.now()-start)));
 });
}
/** Guardian-owned group; no group signal can be sent after guardian ownership ends. */
async function supervise(executable,args,{cwd,env,input='',timeout_ms=PROCESS_POLICY.deadline_ms,grace_ms=PROCESS_POLICY.term_grace_ms,drain_ms=PROCESS_POLICY.drain_ms,confirmation_ms=PROCESS_POLICY.confirmation_ms,max_output_bytes=PROCESS_POLICY.max_output_bytes,signal,group_probe=null,guardian_hook=null}={}) {
 for(const [name,n]of Object.entries({timeout_ms,grace_ms,drain_ms,confirmation_ms,max_output_bytes}))assert(Number.isSafeInteger(n)&&n>0&&n<=2147483647,`Invalid ${name}`);
 assert.equal(process.platform,'darwin');assert(typeof input==='string'||Buffer.isBuffer(input));
 const start=performance.now(),wall=new Date().toISOString(),out=[],err=[],signals=[],events=[];let eventMetadataDropped=0;
 const elapsed=()=>Math.max(0,performance.now()-start);
 const event=(type,extra={})=>{if(events.length<4096||!type.endsWith('-chunk'))events.push({type,elapsed_ms:elapsed(),...extra});else eventMetadataDropped++;};
 const emptyCleanup={confirmed:true,final_state:'not-launched',reason:null,observations:[],terminal_policy:PROCESS_POLICY.zombie_policy};
 if(signal?.aborted)return {launched:false,status:'interrupted',reason:'aborted-before-launch',started_at:null,elapsed_ms:0,exit_code:null,exit_signal:null,leader_exited:false,guardian_pid:null,fixture_pid:null,guardian_exit:null,stdio_closed:false,spawn_error:null,descendant_group_detected:false,cleanup_scope:'same-owned-process-group-only; detached/setsid not contained',cleanup:emptyCleanup,output_truncated:false,event_metadata_dropped:0,stdout_base64:'',stderr_base64:'',stdout_sha256:sha256(''),stderr_sha256:sha256(''),signals:[],events:[]};
 return await new Promise(resolve=>{
  let guardian,guardianAlive=false,guardianExited=false,guardianExit=null,fixturePid=null,code=null,exitSignal=null,error=null,closed=false,exited=false,finished=false,reason=null,descendants=false,bytes=0,truncated=false,cleanup=null,cleanupStart=null,cleanupDeadline=null,killTimer,hardTimer,mainTimer,normalChecking=false,stopping=false,guardianReleased=false,killDelivered=false,ownershipLost=false,drainTimer,drainIncomplete=false;
  const finish=()=>{
   if(finished)return;finished=true;clearTimeout(mainTimer);clearTimeout(killTimer);clearTimeout(hardTimer);clearTimeout(drainTimer);signal?.removeEventListener('abort',abort);
   guardian?.stdin.destroy();guardian?.stdout.destroy();guardian?.stderr.destroy();if(guardian?.connected)guardian.disconnect();
   const stdout=Buffer.concat(out),stderr=Buffer.concat(err),verified=cleanup?.confirmed===true;
   const status=!verified||ownershipLost||drainIncomplete?'failed':reason==='deadline'||reason==='abort'?'interrupted':!reason&&!error&&code===0&&exited&&guardianExit?.code===0?'process-completed':'failed';
   resolve({launched:!!guardian?.pid,status,reason,started_at:wall,elapsed_ms:elapsed(),exit_code:code,exit_signal:exitSignal,leader_exited:exited,guardian_pid:guardian?.pid??null,fixture_pid:fixturePid,guardian_exit:guardianExit,guardian_release_requested:guardianReleased,guardian_ownership_lost:ownershipLost,stdio_closed:closed,drain_incomplete:drainIncomplete,spawn_error:error?.code??null,descendant_group_detected:descendants,cleanup_scope:'same-owned-process-group-only; detached/setsid not contained',cleanup:cleanup??{confirmed:false,final_state:'unknown',reason:'no-confirmation',observations:[],terminal_policy:PROCESS_POLICY.zombie_policy},cleanup_elapsed_ms:cleanupStart===null?0:performance.now()-cleanupStart,cleanup_budget_ms:cleanupStart===null?0:grace_ms+confirmation_ms+drain_ms,output_truncated:truncated,event_metadata_dropped:eventMetadataDropped,stdout_base64:stdout.toString('base64'),stderr_base64:stderr.toString('base64'),stdout_sha256:sha256(stdout),stderr_sha256:sha256(stderr),signals,events});
  };
  const send=sig=>{
   if(guardianReleased){signals.push({signal:sig,elapsed_ms:elapsed(),delivered:false,error:'guardian-ownership-releasing'});return false;}
   if(!guardianAlive||guardianExited){signals.push({signal:sig,elapsed_ms:elapsed(),delivered:false,error:'guardian-ownership-ended'});return false;}
   try{process.kill(-guardian.pid,sig);signals.push({signal:sig,elapsed_ms:elapsed(),delivered:true,ownership:'live-unreaped-guardian-child'});if(sig==='SIGKILL')killDelivered=true;return true;}
   catch(e){signals.push({signal:sig,elapsed_ms:elapsed(),delivered:false,error:e.code});return false;}
  };
  const beginBudget=()=>{
   if(cleanupStart!==null)return;cleanupStart=performance.now();cleanupDeadline=cleanupStart+grace_ms+confirmation_ms+drain_ms;
   hardTimer=setTimeout(()=>{cleanup={confirmed:false,final_state:cleanup?.final_state??'unknown',reason:'total-cleanup-deadline-exceeded',observations:cleanup?.observations??[],terminal_policy:PROCESS_POLICY.zombie_policy};drainIncomplete=!closed;event('cleanup-budget-exhausted');finish();},Math.max(0,cleanupDeadline-performance.now()));
  };
  const probe=options=>group_probe?group_probe({...options,group_id:guardian.pid,guardian_alive:guardianAlive}):probeProcessGroup(guardian.pid,options);
  const completeAfterDrain=()=>{
   if(closed){finish();return;}
   const remaining=Math.max(0,cleanupDeadline-performance.now());
   drainTimer=setTimeout(()=>{drainIncomplete=!closed;if(drainIncomplete)event('stdio-drain-bound-exceeded');finish();},Math.min(drain_ms,remaining));
  };
  const confirm=async()=>{
   const incremental=[];
   const result=await confirmGroupTermination({probe,group_id:guardian.pid,guardianAlive:()=>guardianAlive,deadline_ms:cleanupDeadline-drain_ms,onObservation:o=>{incremental.push(o);cleanup={confirmed:false,final_state:o.state,reason:'confirmation-in-progress',observations:[...incremental],terminal_policy:PROCESS_POLICY.zombie_policy};}});
   if(finished)return;cleanup=result;event('termination-confirmed',{confirmed:result.confirmed,state:result.final_state});completeAfterDrain();
  };
  const stop=why=>{
   if(stopping||finished)return;stopping=true;reason=reason??why;event('stop',{reason:why});beginBudget();if(guardianReleased){event('stop-after-guardian-release');return;}send('SIGTERM');
   // Guardian ignores TERM and owns PGID until KILL. Never signal after it exits.
   killTimer=setTimeout(()=>{if(finished)return;send('SIGKILL');void confirm();},grace_ms);
  };
  const checkNormalExit=async()=>{
   if(normalChecking||stopping||finished)return;normalChecking=true;beginBudget();
   const raw=await probe({timeout_ms:Math.min(PROCESS_POLICY.probe_timeout_ms,Math.max(1,cleanupDeadline-performance.now())),deadline_ms:cleanupDeadline});if(finished||stopping)return;
   const state=classifyGroup(raw,{group_id:guardian.pid,guardian_alive:guardianAlive});event('post-fixture-exit-probe',{state:state.state,probe:raw});
   if(state.state==='guardian-only'&&guardianAlive&&guardian.connected){guardianReleased=true;event('guardian-release-requested');guardian.send({type:'finish'},()=>{});void confirm();}
   else if(state.state==='running'){descendants=true;stop('descendant-after-leader-exit');}
   else if(!guardianAlive){reason='guardian-ownership-lost';void confirm();}
   else stop('cleanup-probe-unknown');
  };
  const abort=()=>stop('abort');
  try{guardian=spawn(realpathSync(process.execPath),['--input-type=module','-e',guardianSource,'--',JSON.stringify({launcher:executable,argv:args,cwd,env})],{cwd,env,stdio:['pipe','pipe','pipe','ipc'],shell:false,detached:true});}catch(e){error=e;cleanup=emptyCleanup;finish();return;}
  event('guardian-spawn-request');
  guardian.on('spawn',()=>{guardianAlive=true;event('guardian-spawned',{pid:guardian.pid});guardian_hook?.(guardian);});
  const capture=(target,chunk)=>{const take=chunk.subarray(0,Math.max(0,max_output_bytes-bytes));if(take.length)target.push(take);bytes+=take.length;event(target===out?'stdout-chunk':'stderr-chunk',{bytes:chunk.length,retained_bytes:take.length});if(take.length<chunk.length){truncated=true;stop('output-limit');}};
  guardian.stdout.on('data',b=>capture(out,b));guardian.stderr.on('data',b=>capture(err,b));guardian.stdin.on('error',()=>{});
  guardian.on('message',m=>{
   if(m?.type==='fixture-spawned'&&Number.isSafeInteger(m.pid)){fixturePid=m.pid;event('fixture-spawned',{pid:m.pid});}
   else if(m?.type==='fixture-exit'){exited=true;code=m.code;exitSignal=m.signal;event('leader-exit',{pid:m.pid,code,signal:exitSignal});clearTimeout(mainTimer);if(!stopping&&elapsed()>=timeout_ms)stop('deadline');else void checkNormalExit();}
   else if(m?.type==='fixture-error'){error={code:m.code};exited=true;event('fixture-spawn-error',{code:m.code});clearTimeout(mainTimer);if(!stopping&&elapsed()>=timeout_ms)stop('deadline');else void checkNormalExit();}
   else if(m?.type==='guardian-term-observed')event('guardian-term-observed');
  });
  guardian.on('error',e=>{error=e;event('guardian-spawn-error',{code:e.code});if(!guardian.pid){cleanup=emptyCleanup;finish();}else stop('guardian-error');});
  guardian.on('exit',(c,sig)=>{guardianAlive=false;guardianExited=true;guardianExit={code:c,signal:sig};if(!guardianReleased&&!killDelivered)ownershipLost=true;if(guardianReleased&&c!==0)reason=reason??'guardian-release-exit-failed';event('guardian-exit',{...guardianExit,expected:!ownershipLost});
   if(!stopping&&!normalChecking){reason='guardian-ownership-lost';beginBudget();void confirm();}
  });
  guardian.on('close',()=>{closed=true;event('stdio-close');if(cleanup&&cleanup.reason!=='confirmation-in-progress')finish();});
  mainTimer=setTimeout(()=>stop('deadline'),Math.max(0,timeout_ms-elapsed()));
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();guardian.stdin.end(input);
 });
}

/** Local deterministic probes only. There is intentionally no arbitrary CLI/model launch entrypoint. */
export async function runOfflineFixture(session,{source,input='',timeout_ms=2000,grace_ms=100,drain_ms=100,confirmation_ms=PROCESS_POLICY.confirmation_ms,max_output_bytes=PROCESS_POLICY.max_output_bytes,signal,args=[],group_probe=null,guardian_hook=null}={}) {
  assert.equal(typeof source,'string');assert(Array.isArray(args)&&args.every(x=>typeof x==='string'));
  const runtime=nodeRuntimeFiles(),profile=seatbeltProfile(session,runtime);
  const result=await supervise('/usr/bin/sandbox-exec',['-p',profile,realpathSync(process.execPath),'--no-addons','--input-type=module','-e',source,'--',...args],{cwd:session.workspace,env:isolatedEnvironment(session),input,timeout_ms,grace_ms,drain_ms,confirmation_ms,max_output_bytes,signal,group_probe,guardian_hook});
  return {...result,guardian_control_mode:guardian_hook?'parent-test-hook':'fixed-supervisor',probe_mode:group_probe?'injected-test-only':'actual-parent-darwin-ps',guardian_source_sha256:sha256(guardianSource),simulation:true,source:'offline-local-node-fixture-not-model-output',policy_sha256:sha256(profile),policy_text:profile,launch:{launcher:'/usr/bin/sandbox-exec',child_executable:realpathSync(process.execPath),child_argv:['--no-addons','--input-type=module','-e',source,'--',...args],cwd:session.workspace,env:isolatedEnvironment(session),session_paths:Object.fromEntries(['root','workspace','home','codex_home','tmp','xdg_config','xdg_cache','xdg_data'].map(k=>[k,session[k]]))},runtime_files:runtime.map(p=>({path:p,sha256:sha256(readFileSync(p))})),workspace_inventory:session.inventory,fixture_sha256:sha256(source),input_sha256:sha256(input),fixture_args:args,timeout_ms,grace_ms,drain_ms,confirmation_ms};
}

/** Official JSONL projection; no guessed model/provider/reasoning fields. */
export function inspectCodexJsonl(bytes) {
  assert(Buffer.isBuffer(bytes));const errors=[],items=[],events=[];let started=false,completed=false,failed=false,thread=false;
  let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{errors.push('invalid-utf8');text='';}
  const lines=text.split('\n');if(lines.at(-1)==='')lines.pop();
  for(let i=0;i<lines.length;i++){
    let e;try{e=JSON.parse(lines[i]);assert(e&&typeof e==='object'&&!Array.isArray(e)&&typeof e.type==='string');}catch{errors.push(`invalid-jsonl-line:${i+1}`);continue;}
    events.push(e);
    if(e.type==='thread.started'){if(thread||started||typeof e.thread_id!=='string'||!e.thread_id)errors.push('invalid-thread-start');thread=true;}
    else if(e.type==='turn.started'){if(!thread||started||completed||failed)errors.push('invalid-turn-start');started=true;}
    else if(e.type==='turn.completed'){if(!started||completed||failed)errors.push('invalid-turn-completion');completed=true;}
    else if(e.type==='turn.failed'||e.type==='error'){if(completed)errors.push('failure-after-completion');failed=true;}
    else if(/^item\.(started|updated|completed)$/.test(e.type)){
      if(!started||completed||failed)errors.push('item-outside-active-turn');
      if(!e.item||typeof e.item!=='object')errors.push('invalid-item');
      else if(e.type==='item.completed'&&e.item.type==='agent_message'){if(typeof e.item.text!=='string')errors.push('invalid-agent-message');else items.push({id:e.item.id??null,text:e.item.text});}
    }else errors.push(`unmapped-event:${e.type}`);
  }
  return {events,message_items:items,terminal_completed:started&&completed&&!failed&&errors.length===0,errors,observed_identity:{model:null,reasoning:null,provider:null,source:null},identity_status:'UNOBSERVED: documented exec JSONL does not establish model/provider/reasoning; model text is not identity evidence',answer_projection:items.at(-1)?.text??'',answer_projection_limitation:'Last completed agent message only; final-answer phase/file mapping needs review'};
}
export function executionLedger(result,intended,{cli_version=null,cli_binary_sha256=null}={}) {
  const raw=Buffer.from(result.stdout_base64,'base64'),trace=inspectCodexJsonl(raw);
  return {revision:1,simulation:result.simulation===true,intended:{...intended},observed:trace.observed_identity,cli:{reported_version:cli_version,binary_sha256:cli_binary_sha256,evidence_scope:'local binary metadata, not provider observation'},raw:{stdout_sha256:sha256(raw),stderr_sha256:sha256(Buffer.from(result.stderr_base64,'base64'))},trace,status:result.status==='interrupted'?'interrupted':'failed',stop_subsequent:true,reason:'No reviewed independent model/provider/reasoning observation; never substitute intended identity',review:null};
}

/** Future command declaration only; returning argv does not execute or prove config acceptance. */
export function codexInvocation(session,intended) {
  for(const k of ['model','reasoning','provider'])assert(typeof intended[k]==='string'&&/^[A-Za-z0-9_.-]+$/.test(intended[k]),`Unsafe intended ${k}`);
  const settings=['skills.bundled.enabled=false','project_doc_max_bytes=0','features.plugins=false','features.apps=false','features.hooks=false','features.multi_agent=false','memories.use_memories=false','memories.generate_memories=false','web_search="disabled"',`model_reasoning_effort=${JSON.stringify(intended.reasoning)}`,`model_provider=${JSON.stringify(intended.provider)}`,`model_providers.${intended.provider}.request_max_retries=0`,`model_providers.${intended.provider}.stream_max_retries=0`];
  return {argv:['--no-daemon','-a','never','-C',session.workspace,'-m',intended.model,...settings.flatMap(s=>['-c',s]),'exec','--strict-config','--json','--ephemeral','--ignore-user-config','--ignore-rules','--skip-git-repo-check','-s','read-only','-'],stdin:session.packet.messages[0].content,settings,execution_enabled:false,limitation:'Declarative argv only; effective config/provider hidden retries and prompt catalog must be independently checked before live use'};
}
export function liveReadiness(design,registration) {
  return {ready:false,problems:[...registrationProblems(design,registration),'Live launch entrypoint deliberately unavailable in revision 2','No reviewed transport-only network/auth boundary; deny-all cannot run inference','Codex effective prompt/config/installed-skill/memory isolation not observed','Codex raw identity and final-answer mapping not verified','Provider retry overrides declared only, effective retry behavior unverified','Same-process-group cleanup only; detached/setsid containment unverified'],authorization:'offline-preparation-only'};
}
/** Full frozen order; no retry/skip, refused until readiness succeeds in a later revision. */
export function prepareScheduledTurn(design,registration,turn,completedKeys=[]) {
  assert.deepEqual(completedKeys,design.order.turns.slice(0,completedKeys.length).map(turnKey),'Schedule history mismatch');
  assert(completedKeys.length<design.order.turns.length,'Schedule exhausted');assert.equal(turnKey(turn),turnKey(design.order.turns[completedKeys.length]),'Out-of-order or retry');
  const readiness=liveReadiness(design,registration);return {turn:assembleTurn(design,turn).turn,readiness,launched:false};
}
/** Exact-byte evidence is new-path only and lives outside model-readable scratch. */
export function archiveProcessEvidence(destination,result,session) {
  assert(path.isAbsolute(destination)&&realpathSync(path.dirname(destination))===path.dirname(destination));
  assert(!within(session.root,destination),'Evidence must not be visible to child');assert(!existsSync(destination),'Evidence destination exists');
  mkdirSync(destination,{mode:0o700});
  const stdout=Buffer.from(result.stdout_base64,'base64'),stderr=Buffer.from(result.stderr_base64,'base64');
  assert.equal(sha256(stdout),result.stdout_sha256);assert.equal(sha256(stderr),result.stderr_sha256);
  writeFileSync(path.join(destination,'stdout.bin'),stdout,{flag:'wx',mode:0o600});writeFileSync(path.join(destination,'stderr.bin'),stderr,{flag:'wx',mode:0o600});
  writeFileSync(path.join(destination,'process.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  return readdirSync(destination).sort();
}
