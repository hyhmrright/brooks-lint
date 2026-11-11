import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {root,build,validate,shippedSkills} from './campaign-plan.mjs';
import {validateHistorical,historicalCommit,historicalAnchor} from './campaign-history.mjs';
import {freeze,validateFreeze,register} from './all-skills/runner.mjs';

const read=()=>JSON.parse(fs.readFileSync(path.join(root,'evals/research/frozen-campaign.json'),'utf8'));
const digest=p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
test('completed campaign verifies explicitly against pinned source without authorizing current execution',()=>{
  const sealed=read(),result=validateHistorical(sealed),p=sealed.protocol;
  assert.equal(result.historical,true);assert.equal(result.liveAuthorized,false);
  assert.equal(result.pinnedCommit,historicalCommit);assert.equal(result.anchor,historicalAnchor);
  assert.equal(p.liveAuthorized,false);assert.equal(p.model,null);assert.equal(p.effort,null);
  assert.deepEqual(p.shippedSkills,shippedSkills());
  assert.deepEqual(p.executionOrder,['all-skills','runtime-pack']);
  assert.equal(p.automaticRetries,0);
  assert.deepEqual(result.studies.map(s=>s.primaryCalls),[210,108]);
  assert.equal(result.totalPrimaryCalls,318);assert(result.verifiedSourceFiles>0);
});
test('historical gate rejects altered and rehashed scope, budgets and omitted studies',()=>{
  const altered=read();altered.protocol.totalPrimaryCalls=1;
  assert.throws(()=>validateHistorical(altered),/hash drift/);
  altered.sha256=digest(altered.protocol);
  assert.throws(()=>validateHistorical(altered),/Unknown historical campaign anchor/);
  const missing=read();missing.protocol.studies.pop();missing.sha256=digest(missing.protocol);
  assert.throws(()=>validateHistorical(missing),/Unknown historical campaign anchor/);
});
test('historical gate checks preserved file bytes, not only self-reported hashes',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-history-'));
  try{
    const sealed=read();
    for(const file of ['evals/research/frozen-campaign.json',...sealed.protocol.studies.map(s=>s.file)]){
      const out=path.join(tmp,file);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,file),out);
    }
    const target=path.join(tmp,sealed.protocol.studies[0].file);
    fs.appendFileSync(target,' ');
    assert.throws(()=>validateHistorical(sealed,{artifactRoot:tmp}),/sub-study bytes changed/);
    const original=path.join(tmp,'evals/research/frozen-campaign.json');fs.appendFileSync(original,' ');
    assert.throws(()=>validateHistorical(sealed,{artifactRoot:tmp}),/campaign bytes changed/);
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('current-source validation never falls back to historical acceptance after guide revision',async()=>{
  const old=JSON.parse(fs.readFileSync(path.join(root,'evals/research/all-skills/frozen-full.json')));
  const current=freeze();assert.notEqual(current.sha256,old.sha256,'Revised source should require a new freeze');
  validateFreeze(current,current.sha256);
  assert.throws(()=>validateFreeze(old,old.sha256),/source\/input drift/);
  assert.throws(()=>register({frozen:old,anchor:old.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE ONLY'}),/source\/input drift/);
  await assert.rejects(build(),/source\/input drift/);
  await assert.rejects(validate(read()),/source\/input drift/);
  const altered=read();altered.protocol.totalPrimaryCalls=1;
  await assert.rejects(validate(altered),/hash drift/);
});
