/** Saved, simulated upstream records; never invokes a model, Docker, or real authentication. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLoginRecord} from './codex-login-validation.mjs';
const archive=new URL('../../../../docs/research/runtime-preparations/2026-11-09-native-remote/codex-login-followup/',import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name+'.json',archive)));
const cmd=r=>r.events.find(e=>e.method==='item/completed'&&e.params?.item?.type==='commandExecution');
const terminal=r=>r.events.find(e=>e.method==='turn/completed');
const body=r=>JSON.parse(r.requests[0].body);
const changeBody=(r,fn)=>{const b=body(r);fn(b);r.requests[0].body=JSON.stringify(b)};
const leaseEdit=(r,fn)=>{const es=r.lease_events.trim().split('\n').map(JSON.parse);fn(es);r.lease_events=es.map(JSON.stringify).join('\n')+'\n'};
const syncThread=(r,fn)=>{fn(r.thread);r.events.find(e=>e.result?.thread).result=structuredClone(r.thread)};

test('captured CLI fake-upstream worker execution and hostile probe validate as simulated observations only',()=>{
 assert.equal(validateLoginRecord(load('allowed')).model_identity,'not established');
 assert.equal(validateLoginRecord(load('hostile'),{hostile:true}).simulation,true);
});
for(const [name,mutate] of Object.entries({
 'non-simulated record':r=>r.simulation=false,
 'run error':r=>r.error='failed',
 'cleanup error':r=>r.cleanup_error='failed',
 'missing requests':r=>r.requests=[],
 'foreign route':r=>r.requests[0].path='/v1/other',
 'wrong fixture model':r=>changeBody(r,b=>b.model='other'),
 'missing shell tool':r=>changeBody(r,b=>b.tools=b.tools.filter(x=>x.name!=='exec_command')),
 'additional namespaced tools':r=>changeBody(r,b=>b.input.push({type:'additional_tools',tools:[{type:'namespace',name:'collaboration',tools:[{type:'function',name:'spawn_agent'}]}]})),
 'extra tool':r=>changeBody(r,b=>b.tools.push({type:'function',name:'other'})),
 'wrong thread model':r=>syncThread(r,t=>t.thread.model='other'),
 'wrong effort':r=>syncThread(r,t=>t.thread.reasoningEffort='high'),
 'local fallback':r=>syncThread(r,t=>t.thread.environments.push({environmentId:'local',cwd:'/workspace'})),
 'turn override':r=>r.protocol.find(p=>p.method==='turn/start').params.environments=[{environmentId:'local',cwd:'/workspace'}],
 'thread request mismatch':r=>r.protocol.find(p=>p.method==='thread/start').params.model='other',
 'status for different environment':r=>r.protocol.filter(p=>p.method==='environment/status').forEach(p=>p.params.environmentId='local'),
 'missing ready':r=>r.events=r.events.filter(e=>e.result?.status!=='ready'),
 'RPC error':r=>r.events.push({id:99,error:{message:'failed'}}),
 'failed turn':r=>terminal(r).params.turn.status='failed',
 'wrong turn thread':r=>terminal(r).params.threadId='other',
 'missing command':r=>r.events=r.events.filter(e=>e!==cmd(r)),
 'command failed':r=>cmd(r).params.item.exitCode=1,
 'command unfinished':r=>cmd(r).params.item.status='inProgress',
 'wrong command output':r=>cmd(r).params.item.aggregatedOutput='CLIENT\n',
 'wrong command turn':r=>cmd(r).params.turnId='other',
 'wrong command thread':r=>cmd(r).params.threadId='other',
 'no cleanup':r=>r.cleanup.phase='running',
 'absence unconfirmed':r=>r.cleanup.absence_confirmed=false,
 'cleanup wrong worker':r=>r.cleanup.identity.id='0'.repeat(64),
 'inspect missing':r=>delete r.worker_inspect,
 'removed wrong worker':r=>leaseEdit(r,es=>{es.find(e=>e.result?.argv[1]==='rm').result.argv[2]='0'.repeat(64)}),
 'removal failed':r=>leaseEdit(r,es=>{es.find(e=>e.result?.argv[1]==='rm').result.code=1}),
 'absence deleted':r=>leaseEdit(r,es=>{const i=es.findIndex(e=>e.result?.argv[1]==='inspect'&&e.result.code===1);es.splice(i,1)}),
 'cleanup predates launch':r=>r.cleanup.completed_at=r.started_at-1,
}))test('simulated record guard rejects '+name,()=>{const r=load('allowed');mutate(r);assert.throws(()=>validateLoginRecord(r))});

test('hostile sentinel must remain outside worker',()=>{
 const r=load('hostile'),item=cmd(r).params.item,lines=item.aggregatedOutput.trimEnd().split('\n');lines[lines.length-2]=JSON.stringify({host_auth_sentinel_visible:true});item.aggregatedOutput=lines.join('\n')+'\n';assert.throws(()=>validateLoginRecord(r,{hostile:true}));
});

test('hostile observation cannot hide an exposed credential or successful network connection',()=>{
 for(const mutate of [o=>o.credentials.push('OPENAI_API_KEY'),o=>o.process_credentials.push('TOKEN=x'),o=>o.egress='CONNECTED',o=>o.docker_socket=true,o=>o.broker_probes[0]='CONNECTED']){
  const r=load('hostile'),item=cmd(r).params.item,lines=item.aggregatedOutput.trimEnd().split('\n'),o=JSON.parse(lines.at(-1));mutate(o);lines[lines.length-1]=JSON.stringify(o);item.aggregatedOutput=lines.join('\n')+'\n';assert.throws(()=>validateLoginRecord(r,{hostile:true}));
 }
});

test('luna catalog exposes unapproved namespaces and is rejected, despite a fake command event',()=>{const r=load('luna-catalog');assert.equal(r.simulation,true);assert.throws(()=>validateLoginRecord(r,{model:'gpt-6-luna'}),/top-level allowlisted tools required|additional tool namespaces/);});

test('explicit Luna direct-catalog simulation admits only the two observed command tools',()=>{
 const options={model:'gpt-6-luna',lunaDirect:true};
 for(const f of ['luna-direct','luna-direct-hostile'])assert.equal(validateLoginRecord(load(f),{...options,hostile:f.endsWith('hostile')}).model_identity,'not established');
 const mutations=[
   r=>changeBody(r,b=>b.input.find(i=>i.type==='additional_tools').tools.push({type:'namespace',name:'collaboration',tools:[]})),
   r=>changeBody(r,b=>b.input.find(i=>i.type==='additional_tools').tools[0].tools.push({type:'function',name:'spawn_agent'})),
   r=>changeBody(r,b=>b.input.push({type:'additional_tools',role:'developer',tools:[]})),
   r=>changeBody(r,b=>b.tools=[{type:'function',name:'other'}]),
   r=>r.catalog_override.after.multi_agent_version='v2',
   r=>delete r.catalog_override.sha256,
   r=>r.app_argv=r.app_argv.filter(s=>!s.startsWith('model_catalog_json=')),
 ];
 for(const mutate of mutations){const r=load('luna-direct');mutate(r);assert.throws(()=>validateLoginRecord(r,options));}
 assert.throws(()=>validateLoginRecord(load('luna-catalog'),options));
 assert.throws(()=>validateLoginRecord(load('luna-direct')));
});


test('probe exit status rejects failed and unconfirmed cleanup records', async () => {
  const {probeExitCode} = await import('./codex-login-exit.mjs');
  assert.equal(probeExitCode({cleanup:{phase:'complete',absence_confirmed:true}}), 0);
  for (const record of [null, {}, {error:'preflight failed',cleanup:{phase:'complete',absence_confirmed:true}}, {cleanup:{phase:'cleanup-pending',absence_confirmed:false}}, {cleanup:{phase:'complete',absence_confirmed:false}}]) assert.equal(probeExitCode(record),1);
});

test('child spawn errors are recorded and fail the probe', async () => {
  const {EventEmitter} = await import('node:events');
  const {trackChildErrors,probeExitCode} = await import('./codex-login-exit.mjs');
  const child = new EventEmitter(), record = {cleanup:{phase:'complete',absence_confirmed:true}};
  trackChildErrors(child,record,'worker');
  child.emit('error',Object.assign(new Error('not found'),{code:'ENOENT'}));
  assert.deepEqual(record.child_errors,[{name:'worker',code:'ENOENT'}]);
  assert.equal(probeExitCode(record),1);
});

test('missing Codex binary fails before creating a supervisor', async () => {
  const {spawnSync} = await import('node:child_process');
  const {mkdtempSync,existsSync} = await import('node:fs');
  const {tmpdir} = await import('node:os');
  const {join} = await import('node:path');
  const dir=mkdtempSync(join(tmpdir(),'brooks-login-missing-cli-')), out=join(dir,'out.json');
  const result=spawnSync(process.execPath,[new URL('./codex-login-probe.mjs',import.meta.url).pathname,out],{env:{PATH:'/nonexistent',HOME:dir,TMPDIR:dir},timeout:5000,encoding:'utf8'});
  assert.equal(result.status,1);
  assert.equal(existsSync(out),false);
});

test('direct probe evidence names the checked-in probe source', async () => {
  const {createHash} = await import('node:crypto');
  const {readFileSync} = await import('node:fs');
  const hash=createHash('sha256').update(readFileSync(new URL('./codex-login-probe.mjs',import.meta.url))).digest('hex');
  for (const name of ['luna-direct.json','luna-direct-hostile.json']) {
    const file=new URL(`../../../../docs/research/runtime-preparations/2026-11-09-native-remote/codex-login-followup/${name}`,import.meta.url);
    assert.equal(JSON.parse(readFileSync(file)).source_sha256,hash);
  }
});
