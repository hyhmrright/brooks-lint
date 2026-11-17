import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {frozen, loadCases, prompt} from './plan.mjs';
import {execute, verify} from './runner.mjs';
import {aggregate, packets} from './grade.mjs';
import {createWorkspace,verifyHealth} from './workspace.mjs';
import {runLoginTurn} from './login-turn.mjs';

const cases=loadCases();
const plan=frozen();
const temp=t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-six-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  return dir;
};
const stub=(plan,row,workspace,text)=>({
  scope:'six-skill-retest',workspaceTool:'benchmark_workspace',simulation:true,status:'completed',
  prompt:text,cli_version:plan.cliVersion,cli_selected_model:plan.model,cli_selected_effort:plan.effort,
  auth_type:'chatgpt',tool_calls:[],workspace:workspace.snapshot(), thread_id:'thread',turn_id:'turn',
  requests:['initialize','account/read','thread/start','turn/start'].map(method=>({method})),
  answer:'Synthetic answer.',
  events:[{method:'item/completed',params:{threadId:'thread',turnId:'turn',
    item:{id:'synthetic',type:'agentMessage',phase:'final_answer',text:'Synthetic answer.'}}}],
  limits:{turn_ms:row.timeoutMs},timing:{completed_elapsed_ms:1},usage:{total:{totalTokens:100}},
  cleanup:{private_home_removed:true,group_absent:true,closed:true},
});
const fakeReplay=async()=>({checkedPolicy:true,cleanupConfirmed:true,checks:null});

test('frozen pairs balance order and private answer keys are absent from prompts and tool responses',()=>{
  for(const c of cases){
    const rows=plan.schedule.filter(row=>row.id===c.id);
    assert.equal(rows.length,2);
    assert.equal(rows[1].ordinal,rows[0].ordinal+1);
    const g=prompt(c,'generic'), s=prompt(c,'skill');
    assert.equal(g.slice(g.lastIndexOf('## Task')),s.slice(s.lastIndexOf('## Task')));
    for(const p of [g,s]) {
      assert(!p.includes(c.oracle));
      assert(!p.includes('cases/expectations.json'));
    }
    assert.deepEqual(createWorkspace(c,c.tree,c.base).call({action:'list'}).paths,Object.keys(c.tree).sort());
  }
  for(const skill of new Set(cases.map(c=>c.skill))) {
    const first=plan.schedule.filter(r=>r.skill===skill && r.ordinal%2===1);
    assert.deepEqual(first.map(r=>r.arm).sort(),['generic','skill']);
  }
});

test('workspace cannot reach host, hidden files, base writes or unauthorized paths',()=>{
  const c=cases.find(c=>c.skill==='sweep');
  const ws=createWorkspace(c,c.tree,c.base);
  for(const file of ['../oracle.mjs','/etc/passwd','reference/'+c.writable[0], 'constructor']) {
    assert.throws(()=>ws.call({action:'read',path:file}));
    assert.throws(()=>ws.call({action:'write',path:file,text:'bad'}));
  }
  const file=c.writable[0];
  assert.throws(()=>ws.call({action:'write',path:file,text:'bad',revision:'base'}));
  ws.call({action:'write',path:file,text:'new'});
  assert.deepEqual(ws.snapshot().edits,{[file]:'new'});
  ws.call({action:'write',path:file,text:c.tree[file]});
  assert.deepEqual(ws.snapshot().edits,{});
});

test('health artifact bytes and ledger must match the latest score result',()=>{
  const c=cases.find(c=>c.skill==='health');
  const ws=createWorkspace(c,c.tree);
  const assessed={status:'assessed',findings:[]};
  const ledger={hasDiff:false,dimensions:{
    pr:{status:'skipped',reason:'No diff'},architecture:assessed,debt:assessed,test:assessed,
  }};
  const draft='<!-- BROOKS_HEALTH_SCORE -->\n\nEvidence.';
  const result=ws.call({action:'score',ledger,draft});
  for(const [p,text] of Object.entries({'report.md':result.report,'receipt.json':JSON.stringify(result.receipt),
    'ledger.json':JSON.stringify(ledger)})) ws.call({action:'write',path:p,text});
  assert.equal(verifyHealth(ws.snapshot()),true);
  ws.call({action:'score',ledger,draft:draft+' Revised.'});
  assert.equal(verifyHealth(ws.snapshot()),false);
});

test('full 24-call synthetic archive verifies and counts ties, gains and misses by skill',async t=>{
  const out=path.join(temp(t),'complete');
  const state=await execute(out,{simulate:stub,replayProbe:fakeReplay});
  assert.equal(state.records.length,24);
  assert.equal(state.observedTokens,2400);
  const run=verify(out);
  const entries=packets(run,'0'.repeat(64));
  assert(entries.every(x=>!Object.hasOwn(x.packet,'arm')));
  const grading={planSha256:plan.planSha256,simulation:true,reviewer:'synthetic',
    answers:entries.map(({arm,packet})=>({blindId:packet.blindId,falsePositives:[],
      checks:Object.fromEntries(packet.checks.map(c=>[c.id,{
        verdict: packet.probeKeys.includes(c.id) || (packet.id==='review-invoice' && arm==='generic' && c.kind==='expected')?'fail':'pass',
        evidence:'Synthetic fixture verdict',
      }]))}))};
  const {results}=aggregate(run,entries,grading);
  assert.equal(results.review.signal,'single-family-gain');
  assert(results.review.byArm.generic.misses>0);
  assert.equal(results.audit.signal,'tie');
  assert.equal(results.health.pairs[0].result,'both-fail');
  const altered=structuredClone(grading);
  const health=entries.find(x=>x.packet.id==='health-billing').packet.blindId;
  altered.answers.find(x=>x.blindId===health).checks['artifact-bound'].verdict='pass';
  assert.throws(()=>aggregate(run,entries,altered));
  fs.appendFileSync(path.join(out,'001','record.json'),' ');
  assert.throws(()=>verify(out));
});

test('failure, retry, missing usage and token threshold preserve records and stop without further calls',async t=>{
  const top=temp(t);
  const mutants={
    retry:r=>({...r,transport_retry_observed:true}),
    failure:r=>({...r,status:'failed'}),
    usage:r=>({...r,usage:null}),
    budget:r=>({...r,usage:{total:{totalTokens:plan.budget.observedTokens}}}),
  };
  for(const [name,change] of Object.entries(mutants)) {
    const out=path.join(top,name);
    await execute(out,{simulate:(...args)=>change(stub(...args)),replayProbe:fakeReplay});
    const run=verify(out);
    assert.equal(run.records.length,1);
    assert.equal(run.state.stopped,{retry:'transport-retry',failure:'turn-failure',usage:'usage-unavailable',budget:'budget'}[name]);
  }
});

test('offline subprocess records native RPC-shaped success and stops on a retry notification',{skip:process.platform!=='darwin'},async t=>{
  const top=temp(t),c=cases[0];
  for(const mode of ['success','retry','routing-failure']){
    const raw=await runLoginTurn({model:plan.model,effort:plan.effort,cliVersion:plan.cliVersion,
      out:path.join(top,mode),executable:process.execPath,prefixArgs:[new URL('./fake-cli.cjs',import.meta.url).pathname,mode],
      timeoutMs:3500,fixtureEndpoint:'http://127.0.0.1:9/v1',fixtureAccount:true,
      prompt:'Synthetic process verification',workspace:createWorkspace(c,c.tree,c.base)});
    assert.equal(raw.status,mode==='success'?'completed':'failed');
    assert(raw.cleanup.closed && raw.cleanup.group_absent && raw.cleanup.private_home_removed);
    if (mode==='retry') assert(raw.transport_retry_observed);
    if (mode==='routing-failure') assert.deepEqual(raw.requests.map(r=>r.method),['initialize','account/read']);
  }
});

test('interrupt closes detached CLI and retains an incomplete campaign without another attempt',{skip:process.platform!=='darwin'},async t=>{
  const top=temp(t),c=cases[0];
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),750);
  let raw;
  try {
    raw=await runLoginTurn({model:plan.model,effort:plan.effort,cliVersion:plan.cliVersion,
      out:path.join(top,'pinned-process'),executable:process.execPath,
      prefixArgs:[new URL('./fake-cli.cjs',import.meta.url).pathname,'stall'],timeoutMs:3500,
      fixtureEndpoint:'http://127.0.0.1:9/v1',fixtureAccount:true,signal:controller.signal,
      prompt:'Synthetic interrupt verification',workspace:createWorkspace(c,c.tree,c.base)});
  } finally {clearTimeout(timer);}
  assert(raw.interrupted && raw.status==='failed');
  assert.equal(raw.requests.filter(r=>r.method==='turn/start').length,1);
  assert(raw.cleanup.closed && raw.cleanup.group_absent && raw.cleanup.private_home_removed);

  const between=new AbortController(),out=path.join(top,'interrupt-between-attempts');
  await execute(out,{signal:between.signal,simulate:(...args)=>{
    between.abort();
    return stub(...args);
  },replayProbe:fakeReplay});
  const verified=verify(out);
  assert.equal(verified.state.stopped,'interrupted');
  assert.equal(verified.records.length,1);
});
