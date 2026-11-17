import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {admit, frozen, here, loadCases, prompt, read, root, sha, write} from './plan.mjs';
import {runLoginTurn, selectedAnswer} from './login-turn.mjs';
import {createWorkspace, verifyHealth} from './workspace.mjs';
import {probePreflight, replay} from './probe.mjs';

const folder = row => String(row.ordinal).padStart(3, '0');
const usage = record => {
  const value = record.usage?.total?.totalTokens;
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
};
const tokenCheck = (record, row) => record.requests?.filter(x=>x.method==='turn/start').length <= 1 &&
  row.promptSha256 === sha(record.prompt ?? '');

function status(record, plan, row, simulation) {
  if (record.setupFailure) return 'setup-failure';
  if (record.interrupted) return 'interrupted';
  if (record.transport_retry_observed || record.events?.some(e=>e.method==='error' && e.params?.willRetry))
    return 'transport-retry';
  if (record.status !== 'completed') return 'turn-failure';
  if (usage(record)===null) return 'usage-unavailable';
  try {
    assert.equal(record.simulation, simulation);
    assert.equal(record.scope,'six-skill-retest');
    assert.equal(record.workspaceTool,'benchmark_workspace');
    assert(tokenCheck(record,row));
    assert.deepEqual(record.requests.map(r=>r.method),['initialize','account/read','thread/start','turn/start']);
    assert.equal(record.cli_version,plan.cliVersion);
    assert.equal(record.cli_selected_model,plan.model);
    assert.equal(record.cli_selected_effort,plan.effort);
    assert.equal(record.auth_type,'chatgpt');
    assert(record.cleanup.closed && record.cleanup.group_absent && record.cleanup.private_home_removed);
    assert.equal(record.answer,selectedAnswer(record.events,record.thread_id,record.turn_id).text);
    assert(record.answer.trim().length);
    verifyWorkspace(loadCases().find(c=>c.id===row.id),record);
    assert(record.timing.completed_elapsed_ms <= row.timeoutMs+4000);
    assert.equal(record.limits.turn_ms,row.timeoutMs);
    if (!simulation) assert.deepEqual(record.toolchain,plan.binding.toolchain);
  } catch {
    return 'verification-failure';
  }
  return null;
}

const evidenceFailure = result => !result.cleanupConfirmed || !result.checkedPolicy || !!result.error;
function verifyWorkspace(c, raw) {
  const workspace=createWorkspace(c,c.tree,c.base);
  const ids=new Set();
  assert(raw.tool_calls.length<=40);
  for(const call of raw.tool_calls) {
    assert(typeof call.callId==='string' && call.callId && !ids.has(call.callId));
    ids.add(call.callId);
    if(call.success) assert.deepEqual(workspace.call(call.arguments),call.result);
    else assert.throws(()=>workspace.call(call.arguments));
  }
  assert.deepEqual(workspace.snapshot(),raw.workspace);
}

const diskPath = (out,row) => path.join(out,folder(row));

export async function execute(out, {simulate, replayProbe=replay, signal}={}) {
  const plan=frozen();
  const simulation=typeof simulate==='function';
  const cases=new Map(loadCases().map(c=>[c.id,c]));
  if(!simulation) {
    admit(plan);
    await probePreflight();
  }
  fs.mkdirSync(out,{mode:0o700});
  write(path.join(out,'plan.json'),plan);
  // Reservation starts before any account or model request. Recovery needs a new freeze.
  if(!simulation) {
    const claims=path.join(root,'_workspace','six-skill-live-claims');
    fs.mkdirSync(claims,{recursive:true,mode:0o700});
    fs.writeFileSync(path.join(claims,plan.planSha256),out+'\n',{flag:'wx',mode:0o600});
  }
  write(path.join(out,'admission.json'),{planSha256:plan.planSha256,simulation,initialRequests:0});
  const start=performance.now(), wall=Date.now(), elapsed=()=>Math.ceil(Math.max(performance.now()-start,Date.now()-wall));
  const state={planSha256:plan.planSha256,simulation,startedAt:new Date().toISOString(),
    records:[], observedTokens:0, stopped:null};
  const save=()=>{state.elapsedMs=elapsed();write(path.join(out,'execution.json'),state);};
  save();
  for(const scheduled of plan.schedule) {
    if(signal?.aborted) {state.stopped='interrupted'; break;}
    const c=cases.get(scheduled.id);
    const admissionElapsedMs=elapsed();
    // Leave room for child cleanup and bounded Docker evidence collection.
    const remaining=plan.budget.totalMs-admissionElapsedMs-plan.budget.cleanupReserveMs;
    if(remaining<=0 || state.observedTokens>=plan.budget.observedTokens) {
      state.stopped='budget'; break;
    }
    const text=prompt(c,scheduled.arm);
    const row={...scheduled,admissionElapsedMs,timeoutMs:Math.min(plan.budget.turnMs,remaining),promptSha256:sha(text)};
    assert.equal(row.promptSha256,plan.promptSha256[c.id][row.arm]);
    const dir=diskPath(out,row);
    write(path.join(out,'intent-'+folder(row)+'.json'),row);
    const workspace=createWorkspace(c,c.tree,c.base);
    let record;
    try {
      record=simulation ? await simulate(plan,row,workspace,text,dir) :
        await runLoginTurn({model:plan.model,effort:plan.effort,cliVersion:plan.cliVersion,
          out:dir,executable:plan.binding.executable,toolchain:plan.binding.toolchain,live:true,
          inheritProxy:true,prompt:text,workspace,timeoutMs:row.timeoutMs,signal});
    } catch {
      record={setupFailure:true, simulation};
    }
    fs.mkdirSync(dir,{recursive:true,mode:0o700});
    if(record.setupFailure || simulation) write(path.join(dir,'record.json'),record);
    row.recordSha256=sha(fs.readFileSync(path.join(dir,'record.json')));
    row.stop=status(record,plan,row,simulation);
    row.tokens=usage(record);
    row.delivery=null;
    if(row.tokens!==null) state.observedTokens+=row.tokens;
    if(!row.stop && ['health','sweep'].includes(c.skill)) {
      try {
        const observed=await replayProbe(c,c.tree,record.workspace.edits,'final');
        const artifactMatch=c.skill==='health' ? verifyHealth(record.workspace) : null;
        write(path.join(dir,'probe.json'),observed);
        row.delivery={artifactMatch,probeSha256:sha(fs.readFileSync(path.join(dir,'probe.json')))};
        if(evidenceFailure(observed)) row.stop='probe-infrastructure-failure';
      } catch {
        row.stop='probe-infrastructure-failure';
      }
    }
    row.finishedElapsedMs=elapsed();
    state.records.push(row);
    state.stopped=row.stop;
    save();
    if(row.stop) break;
  }
  state.finishedAt=new Date().toISOString();
  save();
  return state;
}

export function verify(out) {
  const plan=frozen();
  assert.deepEqual(read(path.join(out,'plan.json')),plan,'Run plan drift');
  const state=read(path.join(out,'execution.json'));
  assert.equal(state.planSha256,plan.planSha256);
  assert.equal(typeof state.simulation,'boolean');
  assert.deepEqual(read(path.join(out,'admission.json')),{planSha256:plan.planSha256,simulation:state.simulation,initialRequests:0});
  assert(state.finishedAt && state.records.length<=plan.schedule.length);
  let tokens=0, last=0, stop=null;
  const records=state.records.map((row,i)=>{
    assert.equal(stop,null,'An attempt followed a stop');
    for(const k of ['id','ordinal','skill','arm']) assert.equal(row[k],plan.schedule[i][k]);
    assert.equal(row.promptSha256,plan.promptSha256[row.id][row.arm]);
    assert(tokens<plan.budget.observedTokens && row.admissionElapsedMs>=last);
    assert.equal(row.timeoutMs,Math.min(plan.budget.turnMs,plan.budget.totalMs-row.admissionElapsedMs-plan.budget.cleanupReserveMs));
    assert(row.timeoutMs>0 && row.finishedElapsedMs>=row.admissionElapsedMs && row.finishedElapsedMs<=state.elapsedMs);
    last=row.finishedElapsedMs;
    const intent=read(path.join(out,'intent-'+folder(row)+'.json'));
    for(const [key,value] of Object.entries(intent)) assert.equal(row[key],value);
    const dir=diskPath(out,row);
    const bytes=fs.readFileSync(path.join(dir,'record.json'));
    assert.equal(sha(bytes),row.recordSha256);
    const raw=JSON.parse(bytes);
    assert.equal(raw.simulation,state.simulation);
    if (!state.simulation && !raw.setupFailure) {
      assert.equal(fs.readFileSync(path.join(dir,'events.jsonl'),'utf8'),
        raw.events.map(e=>JSON.stringify(e)).join('\n')+'\n');
      if(raw.answer!==null) assert.equal(fs.readFileSync(path.join(dir,'answer.txt'),'utf8'),raw.answer);
    }
    assert((raw.requests?.filter(r=>r.method==='turn/start').length ?? 0)<=1);
    stop=status(raw,plan,row,state.simulation);
    assert.equal(row.tokens,usage(raw));
    if(row.tokens!==null) tokens+=row.tokens;
    let probe=null;
    if(row.delivery) {
      const evidence=fs.readFileSync(path.join(dir,'probe.json'));
      assert.equal(sha(evidence),row.delivery.probeSha256);
      probe=JSON.parse(evidence);
      assert.equal(row.delivery.artifactMatch,row.skill==='health'?verifyHealth(raw.workspace):null);
      if(evidenceFailure(probe)) stop='probe-infrastructure-failure';
    } else if(!stop && ['health','sweep'].includes(row.skill)) stop='probe-infrastructure-failure';
    assert.equal(stop,row.stop);
    return {...row,raw,probe};
  });
  assert.equal(tokens,state.observedTokens);
  if(stop) assert.equal(state.stopped,stop);
  else if(records.length<plan.schedule.length) {
    assert(['interrupted','budget'].includes(state.stopped));
    if(state.stopped==='budget') assert(tokens>=plan.budget.observedTokens || state.elapsedMs>=plan.budget.totalMs-plan.budget.cleanupReserveMs);
  } else assert.equal(state.stopped,null);
  return {plan,state,records};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [cmd,out,flag,...extra]=process.argv.slice(2);
  assert(out && !extra.length);
  if(cmd==='execute') {
    assert.equal(flag,'--live','Live execution needs explicit authorization');
    const controller=new AbortController();
    const abort=()=>controller.abort();
    process.on('SIGINT',abort);
    process.on('SIGTERM',abort);
    try {
      const state=await execute(path.resolve(out),{signal:controller.signal});
      console.log(JSON.stringify({attempted:state.records.length,observedTokens:state.observedTokens,stop:state.stopped}));
      if(state.stopped) process.exitCode=state.stopped==='interrupted'?130:1;
    } finally {
      process.removeListener('SIGINT',abort);
      process.removeListener('SIGTERM',abort);
    }
  } else if(cmd==='verify') {
    assert.equal(flag,undefined);
    const {state}=verify(path.resolve(out));
    console.log(JSON.stringify({attempted:state.records.length,observedTokens:state.observedTokens,stop:state.stopped}));
  } else throw Error('execute FRESH_OUT --live | verify OUT');
}
