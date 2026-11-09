import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,writeFileSync,readFileSync,readdirSync,existsSync,symlinkSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {frozenDesign,turnKey} from './executor-preparation.mjs';
import {PROCESS_POLICY,createSession,destroySession,isolatedEnvironment,seatbeltProfile,nodeRuntimeFiles,runOfflineFixture,inspectCodexJsonl,executionLedger,codexInvocation,liveReadiness,prepareScheduledTurn,archiveProcessEvidence,sha256,classifyGroup,confirmGroupTermination,probeProcessGroup,guardianSource} from './process-executor.mjs';
const localTest=(name,fn)=>test(name,{skip:process.platform!=='darwin'||!existsSync('/usr/bin/sandbox-exec')?'Seatbelt backend unavailable; real isolation not verified on this platform':false},fn);
const design=frozenDesign();
const text=r=>Buffer.from(r.stdout_base64,'base64').toString('utf8');
async function fixture(fn){const s=createSession(design,design.order.turns[0]);try{return await fn(s);}finally{destroySession(s);}}
const jsonl=events=>Buffer.from(events.map(e=>JSON.stringify(e)).join('\n')+'\n');
const validEvents=[{type:'thread.started',thread_id:'fixture-thread'},{type:'turn.started'},{type:'item.completed',item:{id:'item-1',type:'agent_message',text:'SYNTHETIC local fixture answer'}},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}];

localTest('fresh private state, exact frozen bytes and no inherited personal env/config/skills/memory',async()=>{
 await fixture(async s=>{
  assert.deepEqual(readdirSync(s.home),[]);assert.deepEqual(readdirSync(s.codex_home),[]);
  assert.equal(isolatedEnvironment(s).HOME,s.home);assert(!('OPENAI_API_KEY'in s.env));assert(!('NODE_OPTIONS'in s.env));assert(!('HTTPS_PROXY'in s.env));
  const r=await runOfflineFixture(s,{source:`import{readFileSync,readdirSync}from'node:fs';process.stdout.write(JSON.stringify({cwd:process.cwd(),env:process.env,home:readdirSync(process.env.HOME),codex:readdirSync(process.env.CODEX_HOME),prompt:readFileSync('prompt.txt','utf8')}));`});
  assert.equal(r.status,'process-completed');const seen=JSON.parse(text(r));assert.equal(seen.cwd,s.workspace);assert.deepEqual(seen.env,s.env);assert.deepEqual(seen.home,[]);assert.deepEqual(seen.codex,[]);assert.equal(seen.prompt,design.prompt);
 });
 const a=createSession(design,design.order.turns[0]),b=createSession(design,design.order.turns[1]);try{assert.notEqual(a.root,b.root);writeFileSync(path.join(a.home,'memory'),'private');assert(!existsSync(path.join(b.home,'memory')));}finally{destroySession(a);destroySession(b);}
});

localTest('actual Seatbelt blocks repository/ancestor/home reads, outside writes, workspace mutation and symlink escape',async()=>{
 const parent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-external-'))),outside=path.join(parent,'personal-skill.md');writeFileSync(outside,'hidden sentinel');
 try{await fixture(async s=>{
  const target=path.join(s.home,'link');symlinkSync(outside,target);
  const probes=[['read',outside],['read',path.resolve('AGENTS.md')],['read',path.join(process.env.HOME,'.codex','config.toml')],['read',target],['write',outside],['write',path.join(s.workspace,'prompt.txt')],['write',path.join(parent,'escape')]];
  const source=`import{readFileSync,writeFileSync}from'node:fs';const results=${JSON.stringify(probes)}.map(([op,p])=>{try{if(op==='read')readFileSync(p);else writeFileSync(p,'escape');return{op,path:p,allowed:true};}catch(e){return{op,path:p,allowed:false,code:e.code};}});writeFileSync(process.env.HOME+'/allowed','state');process.stdout.write(JSON.stringify(results));`;
  const r=await runOfflineFixture(s,{source});assert.equal(r.status,'process-completed');const results=JSON.parse(text(r));assert(results.every(p=>p.allowed===false));assert(results.every(p=>['EPERM','EACCES'].includes(p.code)),JSON.stringify(results));assert.equal(readFileSync(outside,'utf8'),'hidden sentinel');assert.equal(readFileSync(path.join(s.workspace,'prompt.txt'),'utf8'),design.prompt);assert.equal(readFileSync(path.join(s.home,'allowed'),'utf8'),'state');
 });}finally{rmSync(parent,{recursive:true,force:true});}
});

localTest('actual Seatbelt refuses loopback network, including child process use',async()=>{
 const server=net.createServer(socket=>socket.destroy());let connections=0;server.on('connection',()=>connections++);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{await fixture(async s=>{
  const probe=`import net from'node:net';const c=net.connect(${server.address().port},'127.0.0.1');c.on('error',e=>{process.stdout.write(e.code);});c.on('connect',()=>{process.stdout.write('CONNECTED');c.end();});`;for(const source of [probe,`import{spawn}from'node:child_process';const c=spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(probe)}],{stdio:'inherit',env:process.env});c.on('exit',code=>process.exit(code??1));`]){const r=await runOfflineFixture(s,{source});assert.equal(r.status,'process-completed');assert.match(text(r),/EPERM|EACCES/);assert.equal(connections,0);}
 });}finally{await new Promise(resolve=>server.close(resolve));}
});

localTest('unsupported platform and unsafe runtime paths fail closed; restrictive profile contains no network allow',async()=>{
 await fixture(async s=>{assert.throws(()=>seatbeltProfile(s,nodeRuntimeFiles(),{platform:'linux'}),/No reviewed/);assert.throws(()=>seatbeltProfile(s,[s.root]),/Native runtime/);const profile=seatbeltProfile(s,nodeRuntimeFiles());assert(profile.includes('(deny default)'));assert(!profile.includes('(allow network'));assert(!profile.includes('(subpath "/Users")'));});
});

localTest('argv is passed literally, no shell; chunks retain exact UTF8 bytes and stderr bytes',async()=>{
 await fixture(async s=>{
  const marker=path.join(s.home,'shell-executed');const arg=`$(touch ${marker}); literal \`text\``;
  const r=await runOfflineFixture(s,{args:[arg],source:`process.stdout.write(Buffer.from([0xe4]));setTimeout(()=>{process.stdout.write(Buffer.from([0xb8,0xad]));process.stderr.write(Buffer.from([0xff,0x00]));process.stdout.write(process.argv[1]);},20);`});
  assert.equal(r.status,'process-completed');assert.equal(text(r),'中'+arg);assert(!existsSync(marker));assert.deepEqual(Buffer.from(r.stderr_base64,'base64'),Buffer.from([255,0]));assert.equal(r.stdout_sha256,sha256(Buffer.from('中'+arg)));
 });
});

localTest('deadline interrupts TERM-resistant process, escalates KILL and preserves partial evidence',async()=>{
 await fixture(async s=>{const r=await runOfflineFixture(s,{timeout_ms:900,grace_ms:70,drain_ms:50,source:`process.on('SIGTERM',()=>{process.stderr.write('TERM received');});process.stdout.write('partial');setInterval(()=>{},50);`});assert.equal(r.status,'interrupted');assert.equal(r.reason,'deadline');assert.equal(text(r),'partial');assert.match(Buffer.from(r.stderr_base64,'base64').toString(),/TERM received/);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(r.elapsed_ms>=900&&r.elapsed_ms<3000);assert(r.events.find(e=>e.type==='stop').elapsed_ms>=890);});
});

localTest('leader exit with TERM-resistant child holding pipes is cleaned despite leader exit/close',async()=>{
 await fixture(async s=>{
  const child=`process.on('SIGTERM',()=>{});process.stdout.write('child-ready\\n');setInterval(()=>{},50);`;
  const source=`import{spawn}from'node:child_process';const c=spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:['ignore','pipe','inherit'],env:process.env});c.stdout.on('data',b=>{process.stdout.write(b);process.stdout.write('child-pid:'+c.pid+'\\n');process.exit(0);});`;
  const r=await runOfflineFixture(s,{source,timeout_ms:2500,grace_ms:80,drain_ms:80});assert.equal(r.reason,'descendant-after-leader-exit');assert.equal(r.status,'failed');assert.equal(r.descendant_group_detected,true);assert.equal(r.leader_exited,true);assert.match(text(r),/child-ready/);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(r.elapsed_ms<1800);
  assert.equal(r.cleanup.confirmed,true);assert(['absent','zombie-only'].includes(r.cleanup.final_state));assert(r.cleanup.observations.at(-1).running_members.length===0);assert.equal(r.guardian_ownership_lost,false);
 });
});

localTest('leader exit with closed-stdio child still escalates rather than cancelling on close',async()=>{
 await fixture(async s=>{
  const child=`import{writeFileSync}from'node:fs';process.on('SIGTERM',()=>{});writeFileSync(process.env.HOME+'/child-ready',String(process.pid));setInterval(()=>{},50);`;
  const source=`import{spawn}from'node:child_process';import{readFileSync}from'node:fs';spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:'ignore',env:process.env});const t=setInterval(()=>{try{const pid=readFileSync(process.env.HOME+'/child-ready','utf8');process.stdout.write(pid);clearInterval(t);process.exit(0);}catch{}},10);`;
  const r=await runOfflineFixture(s,{source,timeout_ms:2500,grace_ms:80,drain_ms:80});assert.equal(r.reason,'descendant-after-leader-exit');assert.equal(r.stdio_closed,true);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert.equal(r.cleanup.confirmed,true);assert(['absent','zombie-only'].includes(r.cleanup.final_state));assert.equal(r.cleanup.observations.at(-1).running_members.length,0);assert.equal(r.guardian_exit.signal,'SIGKILL');
 });
});

localTest('abort before launch spawns nothing; active abort preserves partial; nonzero process failure retained',async()=>{
 await fixture(async s=>{
  const aborted=new AbortController();aborted.abort();const a=await runOfflineFixture(s,{source:'throw Error("must not run")',signal:aborted.signal});assert.equal(a.launched,false);assert.equal(a.status,'interrupted');assert.equal(text(a),'');const evidenceParent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-abort-evidence-')));try{archiveProcessEvidence(path.join(evidenceParent,'abort'),a,s);}finally{rmSync(evidenceParent,{recursive:true,force:true});}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),900);try{const r=await runOfflineFixture(s,{source:`process.stdout.write('abort partial');setInterval(()=>{},20);`,signal:controller.signal});assert.equal(r.reason,'abort');assert.equal(r.status,'interrupted');assert.equal(text(r),'abort partial');}finally{clearTimeout(timer);}
  const r=await runOfflineFixture(s,{source:`process.stdout.write('failure partial');process.stderr.write('local failure');process.exit(7);`});assert.equal(r.status,'failed');assert.equal(r.exit_code,7);assert.equal(text(r),'failure partial');
 });
});

localTest('output overflow stops bounded process and explicitly records truncation',async()=>{
 await fixture(async s=>{const r=await runOfflineFixture(s,{source:`process.stdout.write('x'.repeat(100000));setInterval(()=>{},20);`,max_output_bytes:256});assert.equal(r.reason,'output-limit');assert.equal(r.status,'failed');assert.equal(r.output_truncated,true);assert.equal(Buffer.from(r.stdout_base64,'base64').length,256);});
});

localTest('actual raw bytes archive exclusively outside model-readable state',async()=>{
 const parent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-evidence-')));
 try{await fixture(async s=>{const r=await runOfflineFixture(s,{source:`process.stdout.write(Buffer.from([0xe4,0xb8]));`}),dest=path.join(parent,'new');assert.deepEqual(archiveProcessEvidence(dest,r,s),['process.json','stderr.bin','stdout.bin']);assert.deepEqual(readFileSync(path.join(dest,'stdout.bin')),Buffer.from([0xe4,0xb8]));assert.throws(()=>archiveProcessEvidence(dest,r,s));assert.throws(()=>archiveProcessEvidence(path.join(s.root,'evidence'),r,s),/not be visible/);});}finally{rmSync(parent,{recursive:true,force:true});}
});

test('documented Codex events project separately from identity; self-described model never counted as observed',()=>{
 const parsed=inspectCodexJsonl(jsonl(validEvents));assert.equal(parsed.terminal_completed,true);assert.equal(parsed.answer_projection,'SYNTHETIC local fixture answer');assert.deepEqual(parsed.observed_identity,{model:null,reasoning:null,provider:null,source:null});
 const self=structuredClone(validEvents);self[2].item.text='I am requested-model using requested-provider with high reasoning';assert.equal(inspectCodexJsonl(jsonl(self)).observed_identity.model,null);
 const raw=jsonl(validEvents),r={simulation:true,status:'process-completed',stdout_base64:raw.toString('base64'),stderr_base64:''};const intended={model:'requested-model',provider:'requested-provider',reasoning:'high'};const ledger=executionLedger(r,intended,{cli_version:'fixture-version',cli_binary_sha256:'a'.repeat(64)});assert.equal(ledger.status,'failed');assert.equal(ledger.stop_subsequent,true);assert.deepEqual(ledger.intended,intended);assert.equal(ledger.observed.model,null);assert.equal(ledger.review,null);
});

test('malformed, failed, duplicate, late, unknown and invalid UTF8 JSONL retain errors, never successful',()=>{
 for(const raw of [Buffer.from('partial{'),Buffer.from([255]),jsonl([{type:'turn.completed'}]),jsonl([...validEvents,{type:'turn.completed'}]),jsonl([...validEvents,{type:'item.completed',item:{type:'agent_message',text:'late'}}]),jsonl([...validEvents,{type:'error',message:'failed'}]),jsonl([{type:'undocumented.identity',model:'fake'}]),jsonl([validEvents[0],validEvents[1],{type:'turn.failed'}])]){const p=inspectCodexJsonl(raw);assert.equal(p.terminal_completed,false);assert.equal(p.observed_identity.model,null);}
});

test('future argv freezes explicit intent, no inherited catalog, declares no retry and never runs',async()=>{
 await fixture(async s=>{const c=codexInvocation(s,{model:'requested-model',provider:'openai',reasoning:'medium'});assert.equal(c.execution_enabled,false);assert.equal(c.stdin,design.prompt);assert(c.argv.includes('--ignore-user-config'));assert(c.argv.includes('--no-daemon'));assert(c.settings.includes('model_providers.openai.request_max_retries=0'));assert(c.settings.includes('model_providers.openai.stream_max_retries=0'));assert.throws(()=>codexInvocation(s,{model:'bad$(touch x)',provider:'openai',reasoning:'medium'}));});
});

test('frozen registration and apparently complete declaration cannot unlock live execution; no retry/order skip',()=>{
 const r=JSON.parse(readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/execution-registration-template.json',import.meta.url)));
 const complete=Object.fromEntries(Object.keys(r).map(k=>[k,'declared-value']));assert.equal(liveReadiness(design,complete).ready,false);assert.equal(liveReadiness(design,r).ready,false);assert(liveReadiness(design,r).problems.some(x=>/registration unbound/.test(x)));assert.equal(PROCESS_POLICY.deadline_ms,900000);assert.equal(PROCESS_POLICY.live_enabled,false);
 const prepared=prepareScheduledTurn(design,r,design.order.turns[0]);assert.equal(prepared.launched,false);assert.equal(prepared.readiness.ready,false);
 assert.throws(()=>prepareScheduledTurn(design,r,design.order.turns[1]));assert.throws(()=>prepareScheduledTurn(design,r,design.order.turns[0],[turnKey(design.order.turns[0])]));
 assert.throws(()=>prepareScheduledTurn(design,r,design.order.turns[0],['fabricated/history']));
});

test('unsupported OS isolation refuses before filesystem or subprocess use',()=>{assert.throws(()=>seatbeltProfile({},[],{platform:'linux'}),/No reviewed OS isolation backend/);});

test('saved process archive verifies source/raw hashes and zero model claims on every platform',async()=>{const {validateArchive}=await import('./process-executor-drill.mjs');const r=validateArchive();assert.equal(r.model_calls,0);assert.equal(r.live_ready,false);assert.equal(r.local_process_observations,6);});

test('archived Darwin containment stays POSIX when the validating host uses Win32 separators',async()=>{
 const {archivedDarwinPathWithin}=await import('./process-executor-drill.mjs');
 const root='/private/tmp/hc-saved',workspace='/private/tmp/hc-saved/workspace';
 assert.equal(workspace.startsWith(root+path.win32.sep),false); // Original host-separator bug.
 assert.equal(archivedDarwinPathWithin(root,workspace),true);
 for(const bad of [root,root+'-other/workspace','/private/tmp/outside',root+'/../outside',root+'/workspace/../home','C:\\private\\tmp\\workspace'])assert.equal(archivedDarwinPathWithin(root,bad),false,bad);
 const run=JSON.parse(readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-09-hc-process-executor/run.json',import.meta.url)));
 for(const observation of run.results){const p=JSON.parse(readFileSync(new URL(`../../../../docs/research/runtime-preparations/2026-11-09-hc-process-executor/observations/${observation.id}/process.json`,import.meta.url)));for(const key of ['workspace','home','codex_home','tmp','xdg_config','xdg_cache','xdg_data'])assert(archivedDarwinPathWithin(p.launch.session_paths.root,p.launch.session_paths[key]));}
});

const member=(pid=41,state='S')=>({pid,ppid:1,pgid:40,state,start_text:'fixture start identity'});
test('bounded confirmation waits for running members to disappear and records every injected transition',async()=>{
 let clock=0,calls=0;const r=await confirmGroupTermination({group_id:40,deadline_ms:100,now:()=>clock,sleep:async ms=>{clock+=ms;},poll_ms:5,probe_timeout_ms:20,probe:async options=>{assert(options.timeout_ms<=100-clock);clock+=10;return{members:++calls<3?[member()]:[]};}});
 assert.equal(r.confirmed,true);assert.equal(r.final_state,'absent');assert.deepEqual(r.observations.map(o=>o.state),['running','running','absent']);assert.equal(calls,3);
});
test('zombie-only is explicitly nonrunning but unreaped; mixed/running and ownership loss stay distinct',async()=>{
 const snapshot={members:[member(41,'Z')]};const c=classifyGroup(snapshot,{group_id:40,guardian_alive:false});assert.equal(c.state,'zombie-only');assert.equal(c.running_members.length,0);assert.equal(c.zombie_members.length,1);
 const r=await confirmGroupTermination({group_id:40,deadline_ms:10,now:()=>0,probe:async()=>snapshot});assert.equal(r.confirmed,true);assert.equal(r.terminal_policy,'terminal-nonrunning-unreaped');
 assert.equal(classifyGroup({members:[member(41,'Z'),member(42,'S')]},{group_id:40,guardian_alive:false}).state,'running');
 assert.equal(classifyGroup({members:[member(40,'S')]},{group_id:40,guardian_alive:false}).reason,'guardian-row-after-reap-or-group-reuse');
 assert.equal(classifyGroup({members:[member(40,'S')]},{group_id:40,guardian_alive:true}).state,'guardian-only');
});
test('running, probe error and timeout remain unconfirmed at the injected deadline; late absent cannot pass',async()=>{
 for(const raw of [{members:[member()]},{error:'probe-timeout',members:[]},{error:'probe-spawn:EACCES',members:[]}]){
  let clock=0;const r=await confirmGroupTermination({group_id:40,deadline_ms:30,now:()=>clock,sleep:async ms=>{clock+=ms;},poll_ms:5,probe:async()=>{clock+=5;return raw;}});assert.equal(r.confirmed,false);assert.equal(r.reason,'confirmation-deadline-exceeded');assert(r.observations.length>1);assert.equal(r.final_state,raw.error?'unknown':'running');
 }
 let clock=0;const late=await confirmGroupTermination({group_id:40,deadline_ms:10,now:()=>clock,probe:async()=>{clock=11;return{members:[]};}});assert.equal(late.confirmed,false);assert.equal(late.final_state,'absent');assert.equal(late.reason,'confirmation-deadline-exceeded');
});
localTest('unknown probe and hanging probe exhaust one total budget while preserving completed observations',async()=>{
 await fixture(async s=>{
  let calls=0;const r=await runOfflineFixture(s,{source:`process.stdout.write('probe partial');`,grace_ms:40,confirmation_ms:120,drain_ms:40,group_probe:async()=>{calls++;return calls<3?{error:'injected-probe-timeout',members:[]}:await new Promise(()=>{});}});
  assert.equal(r.probe_mode,'injected-test-only');assert.equal(r.status,'failed');assert.equal(r.cleanup.confirmed,false);assert.equal(r.cleanup.reason,'total-cleanup-deadline-exceeded');assert(r.cleanup.observations.some(o=>o.probe.error==='injected-probe-timeout'));assert.equal(text(r),'probe partial');assert(r.cleanup_elapsed_ms>=r.cleanup_budget_ms-5);assert(r.cleanup_elapsed_ms<r.cleanup_budget_ms+500);assert.equal(r.guardian_exit.signal,'SIGKILL');
 });
});
localTest('real group probe refuses an expired deadline before starting ps',async()=>{const r=await probeProcessGroup(40,{timeout_ms:1,deadline_ms:performance.now()-1});assert.equal(r.error,'probe-deadline-before-launch');assert.deepEqual(r.members,[]);});
localTest('normal success drains large exact bytes; TERM trailing bytes survive bounded cleanup',async()=>{
 await fixture(async s=>{
  const n=2*1024*1024+13;const r=await runOfflineFixture(s,{source:`process.stdout.write(Buffer.alloc(${n},0x5a),()=>process.exit(0));`,timeout_ms:4000});assert.equal(r.status,'process-completed');assert.equal(r.guardian_exit.code,0);assert.equal(r.stdio_closed,true);assert.equal(r.drain_incomplete,false);assert.equal(Buffer.from(r.stdout_base64,'base64').length,n);assert.equal(r.stdout_sha256,sha256(Buffer.alloc(n,0x5a)));assert.equal(r.cleanup.confirmed,true);
  const t=await runOfflineFixture(s,{source:`import{writeSync}from'node:fs';process.on('SIGTERM',()=>{writeSync(1,Buffer.alloc(257,0x74));writeSync(2,'TERM-tail');});process.stdout.write('before:');setInterval(()=>{},20);`,timeout_ms:900,grace_ms:150});assert.equal(t.status,'interrupted');assert.equal(Buffer.from(t.stdout_base64,'base64').length,7+257);assert.equal(t.stdout_sha256,sha256(Buffer.from('before:'+'t'.repeat(257))));assert.equal(Buffer.from(t.stderr_base64,'base64').toString(),'TERM-tail');assert.equal(t.cleanup.confirmed,true);assert.equal(t.drain_incomplete,false);
 });
});
localTest('fixture has no guardian IPC and stdout cannot spoof a fixture exit',async()=>{
 await fixture(async s=>{const r=await runOfflineFixture(s,{source:`process.stdout.write(JSON.stringify({type:'fixture-exit',code:0,send:typeof process.send,ipc:process.env.NODE_CHANNEL_FD??null}));process.exit(7);`});assert.equal(r.status,'failed');assert.equal(r.exit_code,7);const seen=JSON.parse(text(r));assert.equal(seen.send,'undefined');assert.equal(seen.ipc,null);assert.notEqual(r.fixture_pid,r.guardian_pid);assert.equal(r.guardian_exit.code,0);});
});
localTest('unexpected guardian exit never causes another signal to a possibly reused group',async()=>{
 await fixture(async s=>{const r=await runOfflineFixture(s,{source:`setTimeout(()=>process.exit(0),200);`,guardian_hook:g=>g.once('message',m=>{if(m.type==='fixture-spawned')g.kill('SIGKILL');})});assert.equal(r.status,'failed');assert.equal(r.guardian_ownership_lost,true);assert.equal(r.reason,'guardian-ownership-lost');assert.deepEqual(r.signals,[]);assert.equal(r.cleanup.confirmed,true);});
});
localTest('fixed guardian kills its still-owned group if the parent-only IPC disconnects',async()=>{
 await fixture(async s=>{
  const profile=seatbeltProfile(s,nodeRuntimeFiles()),argv=['-p',profile,realpathSync(process.execPath),'--input-type=module','-e','setInterval(()=>{},20);'];
  const g=spawn(process.execPath,['--input-type=module','-e',guardianSource,'--',JSON.stringify({launcher:'/usr/bin/sandbox-exec',argv,cwd:s.workspace,env:s.env})],{cwd:s.workspace,env:s.env,detached:true,stdio:['ignore','pipe','pipe','ipc']});
  const done=new Promise((resolve,reject)=>{const t=setTimeout(()=>{if(g.connected)g.disconnect();reject(Error('guardian disconnect bound exceeded'));},2500);g.on('error',reject);g.on('message',m=>{if(m.type==='fixture-spawned')g.disconnect();});g.on('exit',(code,signal)=>{clearTimeout(t);resolve({code,signal});});});
  const exit=await done;assert.equal(exit.signal,'SIGKILL');const result=await confirmGroupTermination({group_id:g.pid,deadline_ms:performance.now()+1500,probe:o=>probeProcessGroup(g.pid,o)});assert.equal(result.confirmed,true);assert.equal(result.observations.at(-1).running_members.length,0);
 });
});
localTest('predeclared parallel open/closed-stdio orphan stress verifies no running members under load',async()=>{
 const forms=[false,true,false,true];const results=await Promise.all(forms.map(closed=>fixture(async s=>{
  const child=`import{writeFileSync}from'node:fs';process.on('SIGTERM',()=>{});writeFileSync(process.env.HOME+'/ready',String(process.pid));setInterval(()=>{},20);`;
  const source=`import{spawn}from'node:child_process';import{existsSync}from'node:fs';spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{env:process.env,stdio:${closed?"'ignore'":"['ignore','inherit','inherit']"}});const t=setInterval(()=>{if(existsSync(process.env.HOME+'/ready')){clearInterval(t);process.stdout.write('ready');process.exit(0);}},10);`;
  return await runOfflineFixture(s,{source,timeout_ms:4000,grace_ms:100,confirmation_ms:1800});
 })));
 assert.equal(results.length,4);for(const r of results){assert.equal(r.reason,'descendant-after-leader-exit');assert.equal(r.status,'failed');assert.equal(r.cleanup.confirmed,true);assert.equal(r.cleanup.observations.at(-1).running_members.length,0);assert(r.cleanup_elapsed_ms<=r.cleanup_budget_ms);assert.equal(r.guardian_ownership_lost,false);}
});

test('historical QA and observations stay anchored while corrected guardian archive binds separate sources',async()=>{
 const {validateAllArchives}=await import('./process-executor-drill.mjs');const r=validateAllArchives();assert.equal(r.historical.revision,1);assert.equal(r.historical.local_process_observations,6);assert.equal(r.current.revision,2);assert.equal(r.current.local_process_observations,8);assert.equal(r.current.model_calls,0);assert.equal(r.preservation.preserved_files,27);assert.equal(r.preservation.source_snapshots,3);assert.equal(r.preservation.archived_code_executed,false);
});

localTest('primary completion before its deadline stays successful during a separate bounded confirmation',async()=>{
 await fixture(async s=>{let calls=0;const r=await runOfflineFixture(s,{source:`process.stdout.write('early completed');`,timeout_ms:1500,confirmation_ms:2500,group_probe:async o=>{calls++;if(calls===1)return{members:[{pid:o.group_id,ppid:process.pid,pgid:o.group_id,state:'S',start_text:'injected guardian'}]};if(calls<=16){await new Promise(r=>setTimeout(r,100));return{error:'injected-delayed-observation',members:[]};}return{members:[]};}});
  assert(r.elapsed_ms>1500);assert.equal(r.status,'process-completed');assert.equal(r.reason,null);assert.equal(r.guardian_exit.code,0);assert.equal(r.cleanup.confirmed,true);assert.deepEqual(r.signals,[]);assert.equal(text(r),'early completed');
 });
});
localTest('late abort after normal guardian release records interruption without any further group signal',async()=>{
 await fixture(async s=>{const controller=new AbortController();let calls=0;const r=await runOfflineFixture(s,{source:`process.stdout.write('completed before abort');`,signal:controller.signal,group_probe:async o=>{if(++calls===1)return{members:[{pid:o.group_id,ppid:process.pid,pgid:o.group_id,state:'S',start_text:'injected guardian'}]};controller.abort();await new Promise(r=>setTimeout(r,40));return{members:[]};}});
  assert.equal(r.status,'interrupted');assert.equal(r.reason,'abort');assert.equal(r.guardian_exit.code,0);assert.equal(r.cleanup.confirmed,true);assert.deepEqual(r.signals,[]);assert(r.events.some(e=>e.type==='stop-after-guardian-release'));assert.equal(text(r),'completed before abort');
 });
});
