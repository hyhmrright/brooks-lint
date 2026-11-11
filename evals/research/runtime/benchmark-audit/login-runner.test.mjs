import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {freeze,register,validateFreeze,validateRegistration,assemble,execute,digest} from './login-runner.mjs';
import {validateHistoricalReadiness,base as historicalBase} from './login-history.mjs';
const fixture=fileURLToPath(new URL('./login-fixture.cjs',import.meta.url));
const config=()=>{const frozen=freeze();return {frozen,anchor:frozen.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'Offline fixture only; not real-model authorization'};};
const route=mode=>({fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[fixture,mode]});
const read=p=>JSON.parse(fs.readFileSync(p));
test('model-independent freeze covers exactly 18 calibration cases and 54 balanced turns',()=>{
  const f=freeze();validateFreeze(f,f.sha256);assert.equal(f.protocol.model,null);assert.equal(f.protocol.liveAuthorized,false);
  assert.equal(f.protocol.cases.length,18);assert.equal(f.protocol.schedule.turns.length,54);
  assert(f.protocol.cases.every(c=>c.split==='calibration'));
  for(const arm of ['A','B','C'])assert.equal(f.protocol.schedule.turns.filter(t=>t.arm===arm).length,18);
  assert.equal(f.protocol.budget.primary_calls,54);assert.equal(f.protocol.budget.harness_retries,0);
});
test('assembly never exports rubric/labels/IDs; arm B and C share exact core guidance',()=>{
  const f=freeze();
  for(const c of f.protocol.cases)for(const arm of ['A','B','C']){
    const prompt=assemble(f,{caseId:c.id,arm}),payload=JSON.parse(prompt.split('contents):\n')[1]);
    assert.deepEqual(Object.keys(payload),['inputs','guidance']);
    assert(!prompt.includes(c.id));assert(!prompt.includes('expectedFindings'));assert(!prompt.includes('rubric.json'));
    assert(payload.inputs.every(x=>!x.path.includes('cases/')));
    assert.equal(payload.guidance.length,arm==='A'?0:f.protocol.core.length+(arm==='C'?2:0));
    assert(Buffer.byteLength(prompt)<=f.protocol.budget.prompt_bytes);
  }
});
test('tamper and rehashed drift fail closed for corpus, guidance, prompts, budget, source and schedule',()=>{
  const f=freeze();
  for(const mutate of [x=>x.protocol.cases[0].inputs[0].content+='tamper',x=>x.protocol.core[0].content+='tamper',x=>x.protocol.prompt+='tamper',x=>x.protocol.budget.primary_calls=55,x=>x.protocol.sources.fake='x',x=>x.protocol.schedule.turns.reverse()]){
    const copy=structuredClone(f);mutate(copy);assert.throws(()=>validateFreeze(copy,f.sha256));copy.sha256=digest(copy.protocol);assert.throws(()=>validateFreeze(copy,copy.sha256));
  }
});
test('registration requires explicit model, effort, version and provenance; binding is immutable',()=>{
  const c=config(),r=register(c);validateRegistration(r,r.sha256);
  for(const key of ['model','effort','cliVersion','authorization'])assert.throws(()=>register({...c,[key]:null}));
  const altered=structuredClone(r);altered.registration.model='gpt-other';assert.throws(()=>validateRegistration(altered,r.sha256));
});
test('no implicit live route, mixed route or remote fixture can create outputs',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'bv-route-'));try{
    const r=register(config()),out=path.join(root,'out');
    await assert.rejects(execute(r,r.sha256,out),/Explicit/);
    await assert.rejects(execute(r,r.sha256,out,{live:true,...route('ok')}),/Mixed/);
    await assert.rejects(execute(r,r.sha256,out,{fixtureEndpoint:'https://example.com/v1'}),/Local/);
    await assert.rejects(execute(r,r.sha256,out,{live:true,executable:process.execPath}),/overrides/);
    assert(!fs.existsSync(out));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('54-turn process fixture preserves raw evidence, identities, intents and pending semantics',{skip:process.platform!=='darwin'},async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'bv-full-'));try{
    const r=register(config()),out=path.join(root,'out'),summary=await execute(r,r.sha256,out,route('ok'));
    assert.equal(summary.stopped,null);assert.equal(summary.attempted,54);assert.equal(summary.executed,54);assert.equal(summary.observedTokens,5400);assert.equal(summary.accuracy,null);
    const rows=read(path.join(out,'responses.json')).records;
    for(const row of rows){assert.equal(row.review,null);assert.equal(row.answerSha256,digest(row.answer));assert.equal(row.model.cliSelected,'gpt-fixture');assert.equal(row.evidence.sha256,digest(fs.readFileSync(path.join(out,row.evidence.path))));const raw=read(path.join(out,row.evidence.path));assert(raw.cleanup.closed&&raw.cleanup.group_absent&&raw.cleanup.private_home_removed);assert.equal(raw.limits.turn_ms,180000);}
    assert.equal(fs.readdirSync(out).filter(n=>n.startsWith('intent-')).length,54);
    assert(read(path.join(out,'review-packets.json')).records.every(r=>!Object.hasOwn(r,'arm')&&r.review===null));
    await assert.rejects(execute(r,r.sha256,out,route('ok')),/New output/);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
for(const [mode,status,reason] of [['wrong-model','failed','execution-failure'],['malformed','failed','execution-failure'],['missing-usage','executed','usage-unavailable'],['token-stop','executed','budget-admission-stop']]){
  test(`offline ${mode} stops admission and preserves full denominator`,{skip:process.platform!=='darwin'},async()=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'bv-stop-'));try{
      const r=register(config()),out=path.join(root,'out'),s=await execute(r,r.sha256,out,route(mode));
      assert.equal(s.attempted,1);assert.equal(s.notRun,53);assert.equal(s.stopped.reason,reason);
      const rows=read(path.join(out,'responses.json')).records;assert.equal(rows[0].status,status);assert.equal(rows.length,54);
      assert(fs.existsSync(path.join(out,'intent-001.json')));assert(!fs.existsSync(path.join(out,'intent-002.json')));
    }finally{fs.rmSync(root,{recursive:true,force:true});}
  });
}
test('spawn failure archives safe failure evidence without admitting next case',{skip:process.platform!=='darwin'},async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'bv-spawn-'));try{
    const r=register(config()),out=path.join(root,'out'),s=await execute(r,r.sha256,out,{...route('ok'),executable:'/nonexistent/brooks-fixture'});
    assert.equal(s.attempted,1);assert.equal(s.failed,1);assert.equal(s.notRun,53);assert(fs.existsSync(path.join(out,'001/record.json')));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('saved readiness freeze and compressed raw drill remain auditable through explicit pinned verification',()=>{
  const result=validateHistoricalReadiness();assert.equal(result.verifiedTurns,54);assert.equal(result.observedTokens,5400);assert.equal(result.simulation,true);assert.equal(result.liveAuthorized,false);
  const old=read(new URL('../../../../docs/research/runtime-preparations/2026-11-10-benchmark-login/frozen-protocol.json',import.meta.url));
  assert.throws(()=>validateFreeze(old,old.sha256),/changed; create a versioned freeze/);
  assert.throws(()=>register({...config(),frozen:old,anchor:old.sha256}),/changed; create a versioned freeze/);
});
test('historical readiness rejects changed frozen bytes and changed compressed raw records',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'login-history-'));
  try{
    const original=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-10-benchmark-login/',import.meta.url)),target=path.join(tmp,historicalBase);
    fs.mkdirSync(target,{recursive:true});for(const n of ['frozen-protocol.json','readiness.json','offline-raw-inventory.json','offline-raw.json.gz','execution.json'])fs.copyFileSync(path.join(original,n),path.join(target,n));
    const f=path.join(target,'frozen-protocol.json');fs.appendFileSync(f,' ');assert.throws(()=>validateHistoricalReadiness({artifactRoot:tmp}),/readiness bytes changed/);fs.copyFileSync(path.join(original,'frozen-protocol.json'),f);
    fs.appendFileSync(path.join(target,'offline-raw.json.gz'),' ');assert.throws(()=>validateHistoricalReadiness({artifactRoot:tmp}),/readiness bytes changed/);
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
