import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const directory=path.dirname(fileURLToPath(import.meta.url));
export const root=path.resolve(directory,'../../../..');
export const digest=x=>crypto.createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
export const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json')));
export function loadCase(id) {
  const entry=manifest.cases.find(c=>c.id===id);assert(entry,'Unknown case');
  const dir=path.join(directory,'cases',id);
  return {...entry,inputs:entry.inputs.map(name=>({path:name,content:fs.readFileSync(path.join(dir,name),'utf8')})),rubric:JSON.parse(fs.readFileSync(path.join(dir,entry.rubric)))};
}
export function validate() {
  assert.equal(manifest.cases.length,12);assert.equal(new Set(manifest.cases.map(c=>c.id)).size,12);
  for(const [i,entry] of manifest.cases.entries()) {
    assert.equal(entry.id,`PB-${String(i+1).padStart(2,'0')}`);
    const c=loadCase(entry.id);assert(c.inputs.length>=3);assert(c.rubric.evidence.length>=2);
    assert(['defect','protected','unresolved','out-of-scope'].includes(c.rubric.assessment));
    assert.equal(c.rubric.contractProvenance.independent,false);
    assert.equal(c.rubric.expectedIssues.length,c.rubric.assessment==='defect'?1:0);
    for(const f of c.inputs)assert(!/rubric|manifest|witness/.test(f.path));
  }
  return {cases:12,runtime:9,coreGuardrails:2,routingGuardrails:1,independentHoldouts:0};
}
/** Real fixture execution, plus two separately stated countercontracts for unresolved inputs. */
export async function witness(id) {
  const c=loadCase(id),dir=path.join(directory,'cases',id);
  if(c.family==='cancellation-ownership') {
    const {startPair}=await import(path.join(dir,'coordinator.mjs'));const pair=startPair();
    const normal=pair.b.result();pair.a.cancel();const after=pair.b.result();
    return {normal,after,contracts:{independent:after==='value',cohort:after==='cancelled'}};
  }
  if(c.family==='event-contract') {
    const {deliveries}=await import(path.join(dir,'producer.mjs'));const {project}=await import(path.join(dir,'projection.mjs'));
    const total=project(deliveries()).get('o1');return {total,contracts:{cumulative:total===15,delta:total===25}};
  }
  if(c.family==='freshness-contract') {
    const {scheduler}=await import(path.join(dir,'scheduler.mjs'));const {cache}=await import(path.join(dir,'cache.mjs'));
    const queue=scheduler(),api=cache(queue);const ack=api.write('new'),before=api.read();queue.flush();const after=api.read();
    return {ack,before,after,contracts:{barrier:before==='new',snapshot:before==='old'&&after==='new'}};
  }
  if(c.id==='PB-10') {
    const {total}=await import(path.join(dir,'total.mjs'));await import(path.join(dir,'total.test.mjs'));
    return {actual:total(100),required:90,substituteTestPassed:true};
  }
  if(c.id==='PB-11') {const {retail}=await import(path.join(dir,'retail.mjs'));const {wholesale}=await import(path.join(dir,'wholesale.mjs'));return {retail:retail(100),wholesale:wholesale(100)};}
  const {city}=await import(path.join(dir,'example.mjs'));return {nullish:city(null)===undefined,missing:city({})===undefined,value:city({address:{city:'Oslo'}})};
}
/** Semantic annotations are supplied by a reviewer, never inferred from wording/regex. */
export function score(c,answer,review) {
  assert.equal(typeof answer,'string');assert(review&&typeof review==='object');
  assert.equal(review.answerSha256,digest(answer),'Answer mismatch');
  for(const key of ['identity','exposure','method'])assert(typeof review.reviewer?.[key]==='string'&&review.reviewer[key].trim(),`Reviewer ${key} required`);
  assert(['defect','protected','unresolved','out-of-scope','no-answer'].includes(review.assessment));
  function support(item) {
    assert(item&&typeof item.quote==='string'&&item.quote.trim()&&answer.includes(item.quote),'Exact nonempty answer excerpt required for each judgment');
    assert(typeof item.rationale==='string'&&item.rationale.trim(),'Each judgment needs rationale');
  }
  if(review.assessment!=='no-answer')support(review.assessmentSupport);
  for(const field of ['issues','evidence','unsupportedClaims','pendingClaims','novelConfirmedClaims']) {
    assert(Array.isArray(review[field]),field);
    for(const item of review[field]){support(item);assert(item.id!==undefined,'Item identity required');}
    assert.equal(new Set(review[field].map(x=>x.id)).size,review[field].length,'Duplicate credit/claim');
  }
  for(const item of review.issues)assert(c.rubric.expectedIssues.includes(item.id),'Novel findings belong in separate adjudication');
  for(const item of review.evidence)assert(Number.isInteger(item.id)&&item.id>=0&&item.id<c.rubric.evidence.length,'Unknown evidence requirement');
  const claimIds=[...review.unsupportedClaims,...review.pendingClaims,...review.novelConfirmedClaims].map(x=>x.id);
  assert.equal(new Set(claimIds).size,claimIds.length,'Claim cannot have conflicting adjudications');
  for(const id of claimIds)assert(!c.rubric.expectedIssues.includes(id),'Expected issue cannot also receive novel/extra claim credit');
  for(const item of [...review.unsupportedClaims,...review.novelConfirmedClaims])assert(typeof item.adjudication==='string'&&item.adjudication.trim(),'Confirmed claim requires adjudication evidence/reference');
  const precisionNumerator=review.issues.length+review.novelConfirmedClaims.length;
  const precisionKnownDenominator=precisionNumerator+review.unsupportedClaims.length;
  return {scope:c.scope,assessment:review.assessment,assessmentMatched:review.assessment===c.rubric.assessment,expectedFound:review.issues.length,expectedTotal:c.rubric.expectedIssues.length,evidenceFound:review.evidence.length,evidenceTotal:c.rubric.evidence.length,unsupportedClaims:review.unsupportedClaims.length,pendingClaims:review.pendingClaims.length,novelConfirmed:review.novelConfirmedClaims.length,precisionNumerator,precisionKnownDenominator,complete:review.pendingClaims.length?null:review.assessment===c.rubric.assessment&&review.issues.length===c.rubric.expectedIssues.length&&review.evidence.length===c.rubric.evidence.length&&review.unsupportedClaims.length===0};
}
/** Deliberately weak simulated policies: this checks the rubric arithmetic, not model behavior. */
export function dryPolicies() {
  const result={simulation:true,semanticModelEvaluation:false,policies:{}};
  for(const policy of ['do-nothing','always-flag','always-abstain']) {
    const answer=`SIMULATION ${policy}`;const scores=manifest.cases.map(e=>{
      const c=loadCase(e.id),assessment=policy==='do-nothing'?'no-answer':policy==='always-flag'?'defect':'unresolved';
      return score(c,answer,{answerSha256:digest(answer),reviewer:{identity:'SIMULATED POLICY',exposure:'All rubric labels known; handwritten arithmetic control',method:'Not model grading'},assessment,assessmentSupport:{quote:answer,rationale:'Simulated policy output'},issues:[],evidence:[],unsupportedClaims:policy==='always-flag'&&c.rubric.assessment!=='defect'?[{id:'blanket',quote:answer,rationale:'Simulated blanket assertion against contrary rubric',adjudication:'Handwritten simulation, not observed model claim'}]:[],pendingClaims:[],novelConfirmedClaims:[]});
    });
    result.policies[policy]={assessmentMatches:scores.filter(x=>x.assessmentMatched).length,complete:scores.filter(x=>x.complete).length,expectedFound:0,expectedTotal:4,cases:12};
  }
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const cmd=process.argv[2];if(cmd==='validate')console.log(JSON.stringify(validate(),null,2));
  else if(cmd==='dry')console.log(JSON.stringify(dryPolicies(),null,2));
  else if(cmd==='witnesses')console.log(JSON.stringify(await Promise.all(manifest.cases.map(async c=>({id:c.id,...await witness(c.id)}))),null,2));
  else throw Error('validate | dry | witnesses');
}
