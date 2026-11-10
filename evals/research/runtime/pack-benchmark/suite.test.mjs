import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {manifest,loadCase,validate,witness,dryPolicies,digest,score,root} from './suite.mjs';
import {summarize,normalizeAnnotations,verifyRunArtifacts} from './report.mjs';
import {freeze,validateFreeze,assemble,register,execute,CORE,exportReviewPackets} from './runner.mjs';
test('12 cases preserve runtime versus guardrail denominators',()=>{assert.deepEqual(validate(),{cases:12,runtime:9,coreGuardrails:2,routingGuardrails:1,independentHoldouts:0});});
test('actual cancellation code violates independence and satisfies cohort ownership',async()=>{for(const id of ['PB-01','PB-02','PB-03'])assert.deepEqual(await witness(id),{normal:'value',after:'cancelled',contracts:{independent:false,cohort:true}});});
test('duplicate delivery is protected; business meaning changes verdict',async()=>{for(const id of ['PB-04','PB-05','PB-06'])assert.deepEqual(await witness(id),{total:25,contracts:{cumulative:false,delta:true}});});
test('flush actually refreshes; only acknowledgement contract changes verdict',async()=>{for(const id of ['PB-07','PB-08','PB-09'])assert.deepEqual(await witness(id),{ack:'ack',before:'old',after:'new',contracts:{barrier:false,snapshot:true}});});
test('core and routing witnesses execute',async()=>{assert.deepEqual(await witness('PB-10'),{actual:80,required:90,substituteTestPassed:true});assert.deepEqual(await witness('PB-11'),{retail:90,wholesale:90});assert.deepEqual(await witness('PB-12'),{nullish:true,missing:true,value:'Oslo'});});
test('paired runtime source is byte-identical and only contract varies',()=>{for(const ids of [['PB-01','PB-02','PB-03'],['PB-04','PB-05','PB-06'],['PB-07','PB-08','PB-09']]){const cases=ids.map(loadCase);for(const c of cases.slice(1)){assert.deepEqual(c.inputs.filter(f=>f.path!=='contract.md'),cases[0].inputs.filter(f=>f.path!=='contract.md'));assert.notEqual(c.inputs.find(f=>f.path==='contract.md').content,cases[0].inputs.find(f=>f.path==='contract.md').content);}}});
test('weak policies cannot receive complete or expected-issue credit',()=>{const result=dryPolicies();assert.equal(result.simulation,true);for(const p of Object.values(result.policies)){assert.equal(p.complete,0);assert.equal(p.expectedFound,0);}assert.equal(result.policies['do-nothing'].assessmentMatches,0);assert.equal(result.policies['always-flag'].assessmentMatches,4);assert.equal(result.policies['always-abstain'].assessmentMatches,3);});
test('semantic scoring requires per-judgment evidence and separates pending adjudication',()=>{
 const c=loadCase('PB-04'),answer='The result is 25; the contract requires 15.';
 const support={quote:answer,rationale:'Simulated evidence for arithmetic test, not a real semantic review'};
 const review={answerSha256:digest(answer),reviewer:{identity:'fixture',exposure:'all inputs/rubric',method:'handwritten test'},assessment:'defect',assessmentSupport:support,issues:c.rubric.expectedIssues.map(id=>({id,...support})),evidence:[0,1,2].map(id=>({id,...support})),unsupportedClaims:[],pendingClaims:[],novelConfirmedClaims:[]};
 assert.equal(score(c,answer,review).complete,true);
 assert.throws(()=>score(c,'edited',review));
 assert.throws(()=>score(c,answer,{...review,assessmentSupport:{...support,quote:'invented'}}));
 assert.throws(()=>score(c,answer,{...review,issues:[{id:'novel',...support}]}));
 assert.throws(()=>score(c,answer,{...review,evidence:[{id:9,...support}]}));
 assert.throws(()=>score(c,answer,{...review,evidence:[{id:0,...support},{id:0,...support}]}));
 assert.throws(()=>score(c,answer,{...review,evidence:[{id:0,...support,quote:''}]}));
 assert.throws(()=>score(c,answer,{...review,reviewer:{}}));
 assert.throws(()=>score(c,answer,{...review,novelConfirmedClaims:[{id:'new',...support}]}));
 const pending=score(c,answer,{...review,pendingClaims:[{id:'new',...support}]});assert.equal(pending.complete,null);assert.equal(pending.pendingClaims,1);
});
test('full and smoke freezes bind budget, repetition, scope and inputs without model calls',()=>{for(const [mode,count] of [['full',108],['smoke',9]]){const f=freeze({mode});assert.equal(f.protocol.schedule.turns.length,count);assert.equal(f.protocol.budget.primary_calls,count);validateFreeze(f,f.sha256);assert.equal(f.protocol.liveAuthorized,false);assert.equal(f.protocol.model,null);const changed=structuredClone(f);changed.protocol.cases[0].inputs[0].content+='x';changed.sha256=digest(changed.protocol);assert.throws(()=>validateFreeze(changed,changed.sha256));}assert(!CORE.some(x=>/brooks-audit|brooks-sweep/.test(x)));});
test('prompt export omits rubric, labels, case id, arm and evaluator-only artifacts',()=>{const f=freeze();for(const row of f.protocol.schedule.turns){const p=assemble(f,row),body=JSON.parse(p.slice(p.indexOf('\n')+1));assert.deepEqual(Object.keys(body),['inputs','guidance']);assert(!p.includes(row.caseId));assert(!p.includes('expectedIssues'));assert(!p.includes('falsePositiveGuards'));assert.equal(body.guidance.length,row.arm==='A'?0:CORE.length+(row.arm==='C'?2:0));}});
test('registration requires explicit selected model effort CLI and provenance',()=>{const f=freeze({mode:'smoke'}),config={frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE TEST ONLY'};assert(register(config));for(const key of ['model','effort','cliVersion','authorization'])assert.throws(()=>register({...config,[key]:''}));});
test('review packet shuffles and strips group/order labels; mapping is separate',()=>{const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pack-review-'));try{const f=freeze({mode:'smoke'});const records=f.protocol.schedule.turns.map((t,i)=>({...t,ordinal:i+1,status:'executed',answer:'fixture',answerSha256:digest('fixture')}));exportReviewPackets(f,records,f.sha256,tmp,true);const p=JSON.parse(fs.readFileSync(path.join(tmp,'review-packets.json')));assert.equal(p.packets.length,9);for(const r of p.packets){assert(!('arm'in r));assert(!('ordinal'in r));assert(!('repeat'in r));assert(!('caseId'in r));}assert.equal(JSON.parse(fs.readFileSync(path.join(tmp,'review-mapping-private.json'))).doNotGiveToReviewer,true);}finally{fs.rmSync(tmp,{recursive:true,force:true});}});
test('offline real adapter archives nine fixture turns without network or auth', {skip:process.platform!=='darwin'}, async()=>{const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pack-cli-'));try{const f=freeze({mode:'smoke'}),r=register({frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE ONLY'});await assert.rejects(execute(r,r.sha256,path.join(tmp,'rejected')));const out=path.join(tmp,'run'),summary=await execute(r,r.sha256,out,{fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[path.join(root,'evals/research/runtime/benchmark-audit/login-fixture.cjs'),'ok']});assert.equal(summary.simulation,true);assert.equal(summary.executed,9);assert.equal(summary.observedTokens,900);assert.equal(summary.accuracy,null);assert(fs.existsSync(path.join(out,'009','record.json')));await assert.rejects(execute(r,r.sha256,out,{fixtureEndpoint:'http://127.0.0.1:1/v1'}));}finally{fs.rmSync(tmp,{recursive:true,force:true});}});
test('adapter stops at first failed model identity and preserves intent', {skip:process.platform!=='darwin'}, async()=>{const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pack-failure-'));try{const f=freeze({mode:'smoke'}),r=register({frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE ONLY'});const out=path.join(tmp,'run');const summary=await execute(r,r.sha256,out,{fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[path.join(root,'evals/research/runtime/benchmark-audit/login-fixture.cjs'),'wrong-model']});assert.equal(summary.attempted,1);assert.equal(summary.failed,1);assert.equal(summary.notRun,8);assert.equal(verifyRunArtifacts(out).response.records[0].status,'failed');assert(fs.existsSync(path.join(out,'intent-001.json')));assert(!fs.existsSync(path.join(out,'intent-002.json')));}finally{fs.rmSync(tmp,{recursive:true,force:true});}});

test('report keeps runtime and guardrail denominators separate and fails missing annotations',()=>{
 const f=freeze({mode:'full'}),answer='SIMULATED known rubric answer';
 const records=f.protocol.schedule.turns.map((t,i)=>({...t,ordinal:i+1,status:'executed',answer,answerSha256:digest(answer)}));
 const annotations=records.map(r=>{const c=f.protocol.cases.find(c=>c.id===r.caseId);const support={quote:answer,rationale:'Handwritten arithmetic fixture'};return {responseId:digest(`masked/${f.sha256}/${r.ordinal}`).slice(0,20),review:{answerSha256:digest(answer),reviewer:{identity:'simulation',exposure:'all rubric',method:'handwritten arithmetic'},assessment:c.rubric.assessment,assessmentSupport:support,issues:c.rubric.expectedIssues.map(id=>({id,...support})),evidence:c.rubric.evidence.map((_,id)=>({id,...support})),unsupportedClaims:[],pendingClaims:[],novelConfirmedClaims:[]}};});
 const report=summarize(f,records,annotations);assert.equal(report.arms.A.scopes.runtime.expectedIssueRecall.denominator,9);assert.equal(report.arms.A.scopes['core-guardrail'].expectedIssueRecall.denominator,3);assert.equal(report.arms.A.scopes['routing-guardrail'].expectedIssueRecall.rate,null);assert.throws(()=>summarize(f,records,annotations.slice(1)));assert.throws(()=>summarize(f,records,[...annotations,annotations[0]]));
});

test('review mapping rejects swapped or forged opaque identities',()=>{
 const f=freeze({mode:'smoke'}),sealed=register({frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE'});
 const records=f.protocol.schedule.turns.map((t,i)=>({...t,ordinal:i+1,status:'executed'}));
 const response={registrationSha256:sealed.sha256,records};
 const mapping={records:records.map(r=>({...r,responseId:digest(`masked/${sealed.sha256}/${r.ordinal}`).slice(0,20)}))};
 assert.deepEqual(normalizeAnnotations(sealed,response,mapping,{annotations:[]}),[]);
 const bad=structuredClone(mapping);[bad.records[0].responseId,bad.records[1].responseId]=[bad.records[1].responseId,bad.records[0].responseId];
 assert.throws(()=>normalizeAnnotations(sealed,response,bad,{annotations:[]}));
});

test('run verifier rejects summary forgery, raw corruption, identity/usage drift and unsafe paths', {skip:process.platform!=='darwin'}, async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pack-provenance-'));
 try {
  const f=freeze({mode:'smoke'}),sealed=register({frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'OFFLINE PROVENANCE TEST'}),out=path.join(tmp,'run');
  await execute(sealed,sealed.sha256,out,{fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[path.join(root,'evals/research/runtime/benchmark-audit/login-fixture.cjs'),'ok']});
  assert.equal(verifyRunArtifacts(out).response.records.length,9);
  const summaryPath=path.join(out,'responses.json'),rawPath=path.join(out,'001/record.json'),summaryBytes=fs.readFileSync(summaryPath),rawBytes=fs.readFileSync(rawPath);
  function corruptSummary(change) {const response=JSON.parse(summaryBytes);change(response);fs.writeFileSync(summaryPath,JSON.stringify(response));assert.throws(()=>verifyRunArtifacts(out));fs.writeFileSync(summaryPath,summaryBytes);}
  corruptSummary(r=>{r.records[0].answer='Forged answer';r.records[0].answerSha256=digest('Forged answer');});
  corruptSummary(r=>{r.records[0].model.cliSelected='gpt-other';});
  corruptSummary(r=>{r.records[0].model.effort='high';});
  corruptSummary(r=>{r.records[0].tokens++;});
  corruptSummary(r=>{r.records[0].durationMs++;});
  corruptSummary(r=>{r.records[0].status='failed';});
  corruptSummary(r=>{r.simulation=false;});
  corruptSummary(r=>{r.records[0].evidence.path='../record.json';});
  corruptSummary(r=>{r.records[0].evidence.path='002/record.json';});
  const raw=JSON.parse(rawBytes);raw.answer='Raw mutation';fs.writeFileSync(rawPath,JSON.stringify(raw));assert.throws(()=>verifyRunArtifacts(out));fs.writeFileSync(rawPath,rawBytes);
  // Even a recomputed raw hash cannot hide raw model drift from the registration.
  raw.requested_model='gpt-other';raw.answer=JSON.parse(rawBytes).answer;const altered=JSON.stringify(raw);fs.writeFileSync(rawPath,altered);const summary=JSON.parse(summaryBytes);summary.records[0].evidence.sha256=digest(altered);fs.writeFileSync(summaryPath,JSON.stringify(summary));assert.throws(()=>verifyRunArtifacts(out));fs.writeFileSync(rawPath,rawBytes);fs.writeFileSync(summaryPath,summaryBytes);
  fs.unlinkSync(rawPath);assert.throws(()=>verifyRunArtifacts(out));fs.writeFileSync(rawPath,rawBytes);
  const real=path.join(tmp,'outside-record.json');fs.writeFileSync(real,rawBytes);fs.unlinkSync(rawPath);fs.symlinkSync(real,rawPath);assert.throws(()=>verifyRunArtifacts(out));fs.unlinkSync(rawPath);fs.writeFileSync(rawPath,rawBytes);
  assert.equal(verifyRunArtifacts(out).response.simulation,true);
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
