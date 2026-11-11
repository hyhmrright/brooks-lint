/** Offline campaign inventory. No model calls; the explicit historical command reads local Git objects. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
export const sources=[
  {id:'all-skills',file:'evals/research/all-skills/frozen-full.json',runner:'evals/research/all-skills/runner.mjs'},
  {id:'runtime-pack',file:'evals/research/runtime/pack-benchmark/frozen-full.json',runner:'evals/research/runtime/pack-benchmark/runner.mjs'},
];
export function shippedSkills() {
  return fs.readdirSync(path.join(root,'skills')).filter(name=>fs.existsSync(path.join(root,'skills',name,'SKILL.md'))).sort();
}
export async function build() {
  const studies=[];
  for(const source of sources) {
    const frozen=read(source.file);
    const {validateFreeze}=await import(path.join(root,source.runner));
    validateFreeze(frozen,frozen.sha256);
    assert.equal(frozen.protocol.liveAuthorized,false,'No frozen study may authorize live calls');
    assert.equal(frozen.protocol.model,null,'Choose model only after campaign preparation');
    assert.equal(frozen.protocol.budget.primary_calls,frozen.protocol.schedule.turns.length);
    assert.equal(frozen.protocol.budget.harness_retries,0,'Campaign forbids automatic retries');
    if(source.id==='all-skills') {
      const product=frozen.protocol.cases.filter(c=>c.scope==='product');
      assert.deepEqual([...new Set(product.map(c=>c.skill))].sort(),shippedSkills(),'Every shipped skill needs coverage');
      for(const skill of shippedSkills()) {
        const cases=product.filter(c=>c.skill===skill);
        assert.equal(cases.length,skill==='brooks-health'?6:5,`${skill}: incomplete scoped cases`);
        for(const kind of ['protected','unresolved','out-of-scope'])assert(cases.some(c=>c.kind===kind),`${skill}: missing ${kind} control`);
      }
      const maintenance=frozen.protocol.cases.filter(c=>c.scope!=='product');
      assert.equal(maintenance.length,4);
      assert(maintenance.every(c=>c.skill==='brooks-harness'),'Maintenance stays separate');
    }
    studies.push({...source,freezeSha256:frozen.sha256,cases:frozen.protocol.cases.length,
      primaryCalls:frozen.protocol.schedule.turns.length,budget:frozen.protocol.budget});
  }
  const protocol={revision:1,status:'offline-prepared-awaiting-model-and-effort',
    plannerSha256:crypto.createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
    liveAuthorized:false,model:null,effort:null,shippedSkills:shippedSkills(),studies,
    totalPrimaryCalls:studies.reduce((n,s)=>n+s.primaryCalls,0),
    observedTokenAdmissionSum:studies.reduce((n,s)=>n+s.budget.observed_tokens_stop,0),
    studyDeadlineSumMs:studies.reduce((n,s)=>n+s.budget.study_ms,0),
    executionOrder:studies.map(s=>s.id),automaticRetries:0,
    firstFailure:'Stop campaign admission. Preserve every attempted call; never silently replay or skip to the next study.',
    registration:'Bind the same explicitly selected model and effort to each study separately; verify CLI and login before submission.',
    reporting:'Report each product skill, maintenance workflow and runtime arm comparison separately; never pool these into one accuracy.',
    limitations:[
      'Preparation does not authorize execution. Earlier study model registrations are not reused.',
      'Public authored development material, not independent holdouts; repetitions are not independent cases.',
      'Text-guidance and bounded repair-artifact checks do not establish native skill discovery or full workflow execution.',
      'Observed-token stops are checked between turns and may overshoot; not hard billing limits or dollar estimates.',
      'A failed or incomplete study prevents an all-skills completion claim. Record failures alongside quality metrics.',
    ]};
  return {protocol,sha256:sha(protocol)};
}
export async function validate(sealed) {
  assert.equal(sha(sealed.protocol),sealed.sha256,'Campaign hash drift');
  assert.deepEqual(sealed,await build(),'Campaign source/schedule drift');
  return sealed.protocol;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const [command,file]=process.argv.slice(2);assert(file,'Explicit campaign file required');
  if(command==='freeze')fs.writeFileSync(file,JSON.stringify(await build(),null,2)+'\n',{flag:'wx'});
  else if(command==='validate-historical'){const {validateHistorical}=await import('./campaign-history.mjs');console.log(JSON.stringify(validateHistorical(JSON.parse(fs.readFileSync(file,'utf8'))),null,2));}
  else if(command==='validate')console.log(JSON.stringify(await validate(JSON.parse(fs.readFileSync(file,'utf8'))),null,2));
  else throw Error('freeze NEW_FILE | validate CAMPAIGN_FILE | validate-historical CAMPAIGN_FILE');
}
