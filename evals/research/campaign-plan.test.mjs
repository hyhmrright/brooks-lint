import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,build,validate,shippedSkills} from './campaign-plan.mjs';

const read=()=>JSON.parse(fs.readFileSync(path.join(root,'evals/research/frozen-campaign.json'),'utf8'));
test('campaign binds both current study sources without selecting or starting a model',async()=>{
  const sealed=read(),p=await validate(sealed);
  assert.deepEqual(await build(),sealed);
  assert.equal(p.liveAuthorized,false);assert.equal(p.model,null);assert.equal(p.effort,null);
  assert.deepEqual(p.shippedSkills,shippedSkills());
  assert.deepEqual(p.executionOrder,['all-skills','runtime-pack']);
  assert.equal(p.automaticRetries,0);
  assert.deepEqual(p.studies.map(s=>s.primaryCalls),[210,108]);
  assert.equal(p.totalPrimaryCalls,318);
});
test('campaign rejects altered budgets, rehashed scope changes and omitted study',async()=>{
  const altered=read();altered.protocol.totalPrimaryCalls=1;
  await assert.rejects(validate(altered),/hash drift/);
  altered.sha256=crypto.createHash('sha256').update(JSON.stringify(altered.protocol)).digest('hex');
  await assert.rejects(validate(altered),/source\/schedule drift/);
  const missing=read();missing.protocol.studies.pop();
  missing.sha256=crypto.createHash('sha256').update(JSON.stringify(missing.protocol)).digest('hex');
  await assert.rejects(validate(missing),/source\/schedule drift/);
});
