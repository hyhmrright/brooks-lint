import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,writeFileSync,readFileSync,readdirSync,existsSync,symlinkSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {frozenDesign,turnKey} from './executor-preparation.mjs';
import {PROCESS_POLICY,createSession,destroySession,isolatedEnvironment,seatbeltProfile,nodeRuntimeFiles,runOfflineFixture,inspectCodexJsonl,executionLedger,codexInvocation,liveReadiness,prepareScheduledTurn,archiveProcessEvidence,sha256} from './process-executor.mjs';
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
 await fixture(async s=>{const r=await runOfflineFixture(s,{timeout_ms:450,grace_ms:70,drain_ms:50,source:`process.on('SIGTERM',()=>{process.stderr.write('TERM received');});process.stdout.write('partial');setInterval(()=>{},50);`});assert.equal(r.status,'interrupted');assert.equal(r.reason,'deadline');assert.equal(text(r),'partial');assert.match(Buffer.from(r.stderr_base64,'base64').toString(),/TERM received/);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(r.elapsed_ms>=450&&r.elapsed_ms<2000);assert(r.events.find(e=>e.type==='stop').elapsed_ms>=440);});
});

localTest('leader exit with TERM-resistant child holding pipes is cleaned despite leader exit/close',async()=>{
 await fixture(async s=>{
  const child=`process.on('SIGTERM',()=>{});process.stdout.write('child-ready\\n');setInterval(()=>{},50);`;
  const source=`import{spawn}from'node:child_process';const c=spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:['ignore','pipe','inherit'],env:process.env});c.stdout.on('data',b=>{process.stdout.write(b);process.stdout.write('child-pid:'+c.pid+'\\n');process.exit(0);});`;
  const r=await runOfflineFixture(s,{source,timeout_ms:2500,grace_ms:80,drain_ms:80});assert.equal(r.reason,'descendant-after-leader-exit');assert.equal(r.status,'failed');assert.equal(r.descendant_group_detected,true);assert.equal(r.leader_exited,true);assert.match(text(r),/child-ready/);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);assert(r.elapsed_ms<1800);
  const pid=Number(text(r).match(/child-pid:(\d+)/)[1]);assert.throws(()=>process.kill(pid,0),e=>e.code==='ESRCH','child survives cleanup');
 });
});

localTest('leader exit with closed-stdio child still escalates rather than cancelling on close',async()=>{
 await fixture(async s=>{
  const child=`import{writeFileSync}from'node:fs';process.on('SIGTERM',()=>{});writeFileSync(process.env.HOME+'/child-ready',String(process.pid));setInterval(()=>{},50);`;
  const source=`import{spawn}from'node:child_process';import{readFileSync}from'node:fs';spawn(process.execPath,['--input-type=module','-e',${JSON.stringify(child)}],{stdio:'ignore',env:process.env});const t=setInterval(()=>{try{const pid=readFileSync(process.env.HOME+'/child-ready','utf8');process.stdout.write(pid);clearInterval(t);process.exit(0);}catch{}},10);`;
  const r=await runOfflineFixture(s,{source,timeout_ms:2500,grace_ms:80,drain_ms:80});assert.equal(r.reason,'descendant-after-leader-exit');assert.equal(r.stdio_closed,true);assert.deepEqual(r.signals.map(s=>s.signal),['SIGTERM','SIGKILL']);const pid=Number(text(r));assert.throws(()=>process.kill(pid,0),e=>e.code==='ESRCH');
 });
});

localTest('abort before launch spawns nothing; active abort preserves partial; nonzero process failure retained',async()=>{
 await fixture(async s=>{
  const aborted=new AbortController();aborted.abort();const a=await runOfflineFixture(s,{source:'throw Error("must not run")',signal:aborted.signal});assert.equal(a.launched,false);assert.equal(a.status,'interrupted');assert.equal(text(a),'');const evidenceParent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-abort-evidence-')));try{archiveProcessEvidence(path.join(evidenceParent,'abort'),a,s);}finally{rmSync(evidenceParent,{recursive:true,force:true});}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),400);try{const r=await runOfflineFixture(s,{source:`process.stdout.write('abort partial');setInterval(()=>{},20);`,signal:controller.signal});assert.equal(r.reason,'abort');assert.equal(r.status,'interrupted');assert.equal(text(r),'abort partial');}finally{clearTimeout(timer);}
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
