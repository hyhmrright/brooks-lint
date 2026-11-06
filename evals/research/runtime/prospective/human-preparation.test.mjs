/** Frozen offline human participation material; no model/provider execution. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validatePlan,validateResponses,turnInputs,summarize} from './study.mjs';
const root=new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const read=p=>JSON.parse(bytes(p));
const hash=x=>createHash('sha256').update(x).digest('hex');
const plan=read('plan.json'),anchor=read('freeze-anchor.json');

test('frozen design and public external anchor preserve exact artifact bytes',()=>{
  validatePlan(plan,anchor.study_sha256);
  assert.equal(hash(bytes('artifacts.sha256.json')),anchor.inventory_file_sha256);
  const inventory=read('artifacts.sha256.json');
  for(const [p,h]of Object.entries(inventory)){
    assert(!p.startsWith('/')&&!p.split('/').includes('..'));
    assert.equal(hash(bytes(p)),h,p);
  }
  const changed=structuredClone(plan);changed.study.cases[0].inputs[0].content+=' ';assert.throws(()=>validatePlan(changed,anchor.study_sha256));
  assert.throws(()=>validatePlan(plan,'0'.repeat(64)));
  assert.match(read('source.json').source_commit,/^[a-f0-9]{40}$/);
});

test('first-pass pair contains exact whitelisted source bytes and blank fixture judgments',()=>{
  const key=read('facilitator-key.json');
  assert.deepEqual(key.pairs.map(x=>[x.packet,x.case_id]),[['P','HC-01'],['Q','HC-02']]);
  for(const row of key.pairs){
    const c=plan.study.cases.find(c=>c.id===row.case_id);
    assert.deepEqual(row.rubric,JSON.parse(c.rubric.content));
    for(const f of c.inputs){const p=f.path==='shared/controls.mjs'?'participant/shared/controls.mjs':`participant/${row.packet}/${f.path.split('/').at(-1)}`;assert.equal(bytes(p).toString(),f.content);}
  }
  const form=read('participant/response-form.json');assert.equal(form.status,'blank-not-reviewed');
  for(const k of ['reviewer','method','prior_exposure','first_pass_completed_at','consulted_facilitator_material_before_first_pass','post_key_addendum'])assert.equal(form[k],null);
  for(const row of form.cases)for(const[k,v]of Object.entries(row))if(k!=='packet')assert.equal(v,null);
  assert(!bytes('participant/README.md').toString().includes('facilitator-key.json'));
});

test('all 81 primary turns are frozen once with counterbalanced positions and no executed response',()=>{
  const order=read('execution-order.json');assert.equal(order.plan_sha256,plan.study_sha256);
  assert.equal(plan.study.cases.length,9);assert.equal(plan.study.schedule.length,27);assert.equal(order.turns.length,81);
  const seen=new Set(),positions={A:[0,0,0],B:[0,0,0],C:[0,0,0]};
  for(const[t,i]of order.turns.map((t,i)=>[t,i])){
    assert.equal(t.sequence,i+1);const id=`${t.case_id}/${t.repetition}/${t.arm}`;assert(!seen.has(id));seen.add(id);
    assert.equal(t.position,i%3+1);positions[t.arm][t.position-1]++;
    const material=turnInputs(plan,{case_id:t.case_id,repetition:t.repetition,arm:t.arm},anchor.study_sha256);
    assert.equal(material.inputs.length,4);assert(!material.inputs.some(x=>/rubric|cases.json|test/.test(x.path)));
    assert.equal(material.guidance.length,t.arm==='A'?0:plan.study.core.length+(t.arm==='C'?2:0));
  }
  assert.deepEqual(positions,{A:[9,9,9],B:[9,9,9],C:[9,9,9]});
  const responses=read('responses-template.json');validateResponses(plan,responses,anchor.study_sha256);
  assert.equal(responses.records.length,81);assert(responses.records.every(r=>r.execution_status==='not-run'&&r.review===null&&r.model_report===null&&r.execution_evidence===null&&r.answer===''));
  const summary=summarize(plan,responses,anchor.study_sha256);assert.equal(summary.complete_triplets,0);
});

test('future execution registration is explicitly unbound and design has no live results',()=>{
  const reg=read('execution-registration-template.json');assert.equal(reg.status,'unbound-not-runnable');assert.equal(reg.design_plan_sha256,anchor.study_sha256);
  for(const[k,v]of Object.entries(reg))if(!['status','design_plan_sha256'].includes(k))assert.equal(v,null);
  assert.equal(plan.study.intended_model,'UNBOUND-NO-EXECUTION');assert.equal(plan.study.reasoning,'UNBOUND-NO-EXECUTION');
  assert.equal(plan.study.independent,false);assert.equal(plan.study.private_custody,false);assert.equal(plan.study.human_review,'pending');assert.equal(plan.study.book_mapping,'unverified');
  assert.equal(read('source.json').live_execution,false);assert.match(bytes('prompt.txt').toString(),/Symptom → Source → Consequence → Remedy/);
});
