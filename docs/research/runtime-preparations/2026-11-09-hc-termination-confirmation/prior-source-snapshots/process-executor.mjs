/** Revision 1 local subprocess boundary. No model/provider launch is exposed. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,realpathSync,lstatSync,existsSync,rmSync,chmodSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {assembleTurn,exportWorkspace,registrationProblems,turnKey} from './executor-preparation.mjs';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const PROCESS_POLICY = Object.freeze({revision:1,platform:'darwin',network:'deny-all-including-loopback',deadline_ms:900000,term_grace_ms:2000,drain_ms:500,max_output_bytes:8388608,primary_attempts:1,retries:0,live_enabled:false});
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
function groupExists(pid){try{process.kill(-pid,0);return true;}catch(e){if(e.code==='ESRCH')return false;throw e;}}
/** No shell, scrubbed env, one detached process group, bounded TERM/KILL/drain cleanup. */
async function supervise(executable,args,{cwd,env,input='',timeout_ms=PROCESS_POLICY.deadline_ms,grace_ms=PROCESS_POLICY.term_grace_ms,drain_ms=PROCESS_POLICY.drain_ms,max_output_bytes=PROCESS_POLICY.max_output_bytes,signal}={}) {
  for(const [name,n]of Object.entries({timeout_ms,grace_ms,drain_ms,max_output_bytes}))assert(Number.isSafeInteger(n)&&n>0&&n<=2147483647,`Invalid ${name}`);
  assert.equal(process.platform,'darwin');assert(typeof input==='string'||Buffer.isBuffer(input));
  if(signal?.aborted)return {launched:false,status:'interrupted',reason:'aborted-before-launch',started_at:null,elapsed_ms:0,exit_code:null,exit_signal:null,leader_exited:false,stdio_closed:false,spawn_error:null,descendant_group_detected:false,cleanup_scope:'same-process-group-only; detached/setsid descendants not proven contained',output_truncated:false,event_metadata_dropped:0,stdout_base64:'',stderr_base64:'',stdout_sha256:sha256(''),stderr_sha256:sha256(''),signals:[],events:[]};
  const start=performance.now(),wall=new Date().toISOString();
  return await new Promise(resolve=>{
    let child,code=null,exitSignal=null,error=null,closed=false,exited=false,finished=false,reason=null,detectedDescendants=false,bytes=0,truncated=false;
    const out=[],err=[],signals=[],events=[],timers=[];let eventMetadataDropped=0;
    const elapsed=()=>Math.max(0,performance.now()-start);
    const event=(type,extra={})=>{if(events.length<4096||!type.endsWith('-chunk'))events.push({type,elapsed_ms:elapsed(),...extra});else eventMetadataDropped++;};
    const send=sig=>{try{process.kill(-child.pid,sig);signals.push({signal:sig,elapsed_ms:elapsed(),delivered:true});}catch(e){signals.push({signal:sig,elapsed_ms:elapsed(),delivered:false,error:e.code});}};
    const later=(f,delay)=>{const t=setTimeout(f,delay);timers.push(t);return t;};
    const finish=()=>{
      if(finished)return;finished=true;for(const t of timers)clearTimeout(t);signal?.removeEventListener('abort',abort);
      child?.stdin.destroy();child?.stdout.destroy();child?.stderr.destroy();
      const stdout=Buffer.concat(out),stderr=Buffer.concat(err);
      resolve({launched:!!child?.pid,status:reason==='deadline'||reason==='abort'?'interrupted':!error&&code===0&&!reason?'process-completed':'failed',reason,started_at:wall,elapsed_ms:elapsed(),exit_code:code,exit_signal:exitSignal,leader_exited:exited,stdio_closed:closed,spawn_error:error?.code??null,descendant_group_detected:detectedDescendants,cleanup_scope:'same-process-group-only; detached/setsid descendants not proven contained',output_truncated:truncated,event_metadata_dropped:eventMetadataDropped,stdout_base64:stdout.toString('base64'),stderr_base64:stderr.toString('base64'),stdout_sha256:sha256(stdout),stderr_sha256:sha256(stderr),signals,events});
    };
    const stop=why=>{
      if(reason||finished)return;reason=why;event('stop',{reason:why});send('SIGTERM');
      // Never cancel escalation just because leader exits or stdio closes.
      later(()=>{send('SIGKILL');later(finish,drain_ms);},grace_ms);
    };
    const abort=()=>stop('abort');
    try{child=spawn(executable,args,{cwd,env,stdio:['pipe','pipe','pipe'],shell:false,detached:true});}catch(e){error=e;finish();return;}
    event('spawn-request');
    child.on('spawn',()=>event('spawned',{pid:child.pid}));
    const capture=(target,chunk)=>{
      const remaining=Math.max(0,max_output_bytes-bytes),take=chunk.subarray(0,remaining);if(take.length)target.push(take);bytes+=take.length;
      event(target===out?'stdout-chunk':'stderr-chunk',{bytes:chunk.length,retained_bytes:take.length});
      if(chunk.length>take.length){truncated=true;stop('output-limit');}
    };
    child.stdout.on('data',b=>capture(out,b));child.stderr.on('data',b=>capture(err,b));child.stdin.on('error',()=>{});
    child.on('error',e=>{error=e;event('spawn-error',{code:e.code});if(!child.pid)finish();else stop('process-error');});
    child.on('exit',(c,sig)=>{exited=true;code=c;exitSignal=sig;event('leader-exit',{code:c,signal:sig});
      if(!reason){
        if(groupExists(child.pid)){detectedDescendants=true;stop('descendant-after-leader-exit');}
        else if(closed)finish();
      }
    });
    child.on('close',()=>{closed=true;event('stdio-close');if(!reason&&exited)finish();});
    // Wall time is monotonic and begins before spawn, not on first answer byte.
    later(()=>stop('deadline'),Math.max(0,timeout_ms-elapsed()));
    signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
    child.stdin.end(input);
  });
}

/** Local deterministic probes only. There is intentionally no arbitrary CLI/model launch entrypoint. */
export async function runOfflineFixture(session,{source,input='',timeout_ms=2000,grace_ms=100,drain_ms=100,max_output_bytes=PROCESS_POLICY.max_output_bytes,signal,args=[]}={}) {
  assert.equal(typeof source,'string');assert(Array.isArray(args)&&args.every(x=>typeof x==='string'));
  const runtime=nodeRuntimeFiles(),profile=seatbeltProfile(session,runtime);
  const result=await supervise('/usr/bin/sandbox-exec',['-p',profile,realpathSync(process.execPath),'--no-addons','--input-type=module','-e',source,'--',...args],{cwd:session.workspace,env:isolatedEnvironment(session),input,timeout_ms,grace_ms,drain_ms,max_output_bytes,signal});
  return {...result,simulation:true,source:'offline-local-node-fixture-not-model-output',policy_sha256:sha256(profile),policy_text:profile,launch:{launcher:'/usr/bin/sandbox-exec',child_executable:realpathSync(process.execPath),child_argv:['--no-addons','--input-type=module','-e',source,'--',...args],cwd:session.workspace,env:isolatedEnvironment(session),session_paths:Object.fromEntries(['root','workspace','home','codex_home','tmp','xdg_config','xdg_cache','xdg_data'].map(k=>[k,session[k]]))},runtime_files:runtime.map(p=>({path:p,sha256:sha256(readFileSync(p))})),workspace_inventory:session.inventory,fixture_sha256:sha256(source),input_sha256:sha256(input),fixture_args:args,timeout_ms,grace_ms,drain_ms};
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
  return {ready:false,problems:[...registrationProblems(design,registration),'Live launch entrypoint deliberately unavailable in revision 1','No reviewed transport-only network/auth boundary; deny-all cannot run inference','Codex effective prompt/config/installed-skill/memory isolation not observed','Codex raw identity and final-answer mapping not verified','Provider retry overrides declared only, effective retry behavior unverified','Same-process-group cleanup only; detached/setsid containment unverified'],authorization:'offline-preparation-only'};
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
