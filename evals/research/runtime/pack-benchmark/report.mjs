/** Offline arithmetic for evidence-backed semantic annotations; never a model judge. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest,score} from './suite.mjs';
import {validateRegistration,assemble} from './runner.mjs';
const ratio=(n,d)=>({numerator:n,denominator:d,rate:d?n/d:null});
/** Pure arithmetic helper for tests; the public CLI must first verifyRunArtifacts. */
export function summarize(frozen,records,annotations) {
  assert.equal(digest(frozen.protocol),frozen.sha256,'Freeze hash mismatch');
  assert.equal(records.length,frozen.protocol.schedule.turns.length,'Missing execution rows');
  assert.equal(new Set(annotations.map(a=>a.responseId)).size,annotations.length,'Duplicate annotations');
  const lookup=new Map(annotations.map(a=>[a.responseId,a.review]));
  const scored=[];
  for(const [i,row] of records.entries()) {
    assert.deepEqual({caseId:row.caseId,arm:row.arm,repeat:row.repeat},frozen.protocol.schedule.turns[i],'Schedule mismatch');
    assert.equal(row.ordinal,i+1);assert(['not-run','failed','interrupted','executed'].includes(row.status));
    if(row.status!=='executed')continue;
    assert.equal(digest(row.answer),row.answerSha256,'Answer hash mismatch');
    const id=digest(`masked/${frozen.sha256}/${row.ordinal}`).slice(0,20);
    // Execution packets use registration anchor, so callers normalize IDs from their private map below.
    const review=lookup.get(id);assert(review,'Every completed response needs semantic annotation');lookup.delete(id);
    const c=frozen.protocol.cases.find(c=>c.id===row.caseId);
    scored.push({...row,family:c.family,expectedAssessment:c.rubric.assessment,...score(c,row.answer,review)});
  }
  assert.equal(lookup.size,0,'Unknown or unexecuted response annotation');
  function group(rows) {
    const sum=key=>rows.reduce((s,r)=>s+r[key],0),protectedRows=rows.filter(r=>r.expectedAssessment==='protected'),unknownRows=rows.filter(r=>r.expectedAssessment==='unresolved');
    const n=sum('precisionNumerator'),d=sum('precisionKnownDenominator'),pending=sum('pendingClaims');
    return {reviewed:rows.length,assessmentAgreement:ratio(rows.filter(r=>r.assessmentMatched).length,rows.length),expectedIssueRecall:ratio(sum('expectedFound'),sum('expectedTotal')),missingIssues:sum('expectedTotal')-sum('expectedFound'),evidence:ratio(sum('evidenceFound'),sum('evidenceTotal')),protectedFalseDefectResponses:ratio(protectedRows.filter(r=>r.assessment==='defect'||r.unsupportedClaims>0).length,protectedRows.length),unresolvedOverclaims:ratio(unknownRows.filter(r=>r.assessment==='defect'||r.assessment==='protected'||r.unsupportedClaims>0).length,unknownRows.length),unsupportedClaims:sum('unsupportedClaims'),pendingClaims:pending,novelConfirmed:sum('novelConfirmed'),fullySupported:rows.filter(r=>r.complete===true).length,adjudicationPending:rows.filter(r=>r.complete===null).length,precisionKnown:ratio(n,d),precisionLower:ratio(n,d+pending),precisionUpper:ratio(n+pending,d+pending)};
  }
  const scopes=['runtime','core-guardrail','routing-guardrail'];
  const arms=Object.fromEntries(['A','B','C'].map(arm=>[arm,{execution:Object.fromEntries(['executed','failed','interrupted','not-run'].map(status=>[status,records.filter(r=>r.arm===arm&&r.status===status).length])),observedTokens:records.filter(r=>r.arm===arm&&Number.isSafeInteger(r.tokens)).reduce((s,r)=>s+r.tokens,0),usageMissing:records.filter(r=>r.arm===arm&&r.status==='executed'&&!Number.isSafeInteger(r.tokens)).length,durationMs:records.filter(r=>r.arm===arm&&Number.isFinite(r.durationMs)).reduce((s,r)=>s+r.durationMs,0),scopes:Object.fromEntries(scopes.map(scope=>[scope,group(scored.filter(r=>r.arm===arm&&r.scope===scope))])),families:Object.fromEntries([...new Set(scored.map(r=>r.family))].map(family=>[family,group(scored.filter(r=>r.arm===arm&&r.family===family))])),repeats:Object.fromEntries(Array.from({length:frozen.protocol.schedule.repetitions},(_,i)=>[i+1,Object.fromEntries(scopes.map(scope=>[scope,group(scored.filter(r=>r.arm===arm&&r.repeat===i+1&&r.scope===scope))]))]))}]));
  const pairedRuntime=[];
  for(const c of frozen.protocol.cases.filter(c=>c.scope==='runtime'))for(let repeat=1;repeat<=frozen.protocol.schedule.repetitions;repeat++){const members=['A','B','C'].map(arm=>scored.find(r=>r.caseId===c.id&&r.repeat===repeat&&r.arm===arm));if(members.some(r=>!r)){pairedRuntime.push({caseId:c.id,repeat,status:'incomplete-triple'});continue;}const [a,b,crow]=members;pairedRuntime.push({caseId:c.id,repeat,status:'complete-triple',runtimeMinusCore:{assessment:Number(crow.assessmentMatched)-Number(b.assessmentMatched),expectedIssues:crow.expectedFound-b.expectedFound,evidence:crow.evidenceFound-b.evidenceFound,unsupportedClaims:crow.unsupportedClaims-b.unsupportedClaims,pendingClaims:crow.pendingClaims-b.pendingClaims},coreMinusBaseline:{assessment:Number(b.assessmentMatched)-Number(a.assessmentMatched),expectedIssues:b.expectedFound-a.expectedFound,evidence:b.evidenceFound-a.evidenceFound}});}
  return {semanticJudge:false,independentValidation:false,arms,pairedRuntime,limitations:frozen.protocol.limitations,conclusion:'Arithmetic only; inspect paired case judgments, failures, exposure and pending claims before drawing conclusions.'};
}
export function normalizeAnnotations(sealed,response,mapping,input) {
  assert.equal(digest(sealed.registration),sealed.sha256,'Registration mismatch');
  assert.equal(response.registrationSha256,sealed.sha256,'Response registration mismatch');
  assert.equal(mapping.records.length,response.records.length);
  for(const [i,m] of mapping.records.entries()) {
    const row=response.records[i];
    assert.deepEqual(m,{responseId:digest(`masked/${sealed.sha256}/${i+1}`).slice(0,20),caseId:row.caseId,arm:row.arm,repeat:row.repeat,ordinal:i+1,status:row.status},'Review mapping drift');
  }
  return input.annotations.map(a=>{const m=mapping.records.find(r=>r.responseId===a.responseId);assert(m,'Unknown packet identity');return {...a,responseId:digest(`masked/${sealed.registration.frozen.sha256}/${m.ordinal}`).slice(0,20)};});
}
/** Bind summaries to original raw bytes before admitting semantic scoring.
 * Hashes detect inconsistent artifacts, not a party rewriting every artifact.
 * Durations are executor monotonic measurements, never reporter wall-clock guesses.
 */
export function verifyRunArtifacts(runDir) {
  const base=path.resolve(runDir);assert(fs.lstatSync(base).isDirectory()&&!fs.lstatSync(base).isSymbolicLink(),'Run root must be a real directory');
  function read(relative) {
    assert(typeof relative==='string'&&relative&&!path.isAbsolute(relative),'Relative artifact path required');
    const parts=relative.split('/');assert(parts.every(p=>p&&p!=='.'&&p!=='..'),'Unsafe artifact path');
    let current=base;
    for(const [i,part] of parts.entries()) {
      current=path.join(current,part);const st=fs.lstatSync(current);
      assert(!st.isSymbolicLink(),'Symlink artifact forbidden');
      assert(i===parts.length-1?st.isFile():st.isDirectory(),'Unexpected artifact type');
    }
    const bytes=fs.readFileSync(current);return {bytes,value:JSON.parse(bytes)};
  }
  const sealed=read('registration.json').value;
  const registration=validateRegistration(sealed,sealed.sha256),frozen=registration.frozen;
  const response=read('responses.json').value,mapping=read('review-mapping-private.json').value,initial=read('responses-initial.json').value;
  assert.equal(typeof response.simulation,'boolean');assert.equal(response.simulation,initial.simulation,'Simulation flag mismatch');
  assert.equal(response.registrationSha256,sealed.sha256);
  assert.equal(response.records.length,frozen.protocol.schedule.turns.length);
  let stopSeen=false;
  for(const [i,row] of response.records.entries()) {
    const turn=frozen.protocol.schedule.turns[i],id=String(i+1).padStart(3,'0');
    assert.deepEqual({caseId:row.caseId,arm:row.arm,repeat:row.repeat},turn,'Schedule mismatch');assert.equal(row.ordinal,i+1);
    assert(['not-run','executed','failed','interrupted'].includes(row.status));
    if(row.status==='not-run') {
      stopSeen=true;assert.equal(row.answer,null);assert.equal(row.answerSha256,null);
      for(const field of ['evidence','model','tokens','durationMs'])assert(!(field in row),'Unattempted row contains execution evidence');
      assert(!fs.existsSync(path.join(base,`intent-${id}.json`))&&!fs.existsSync(path.join(base,id)),'Unattempted row has raw attempt artifacts');continue;
    }
    assert(!stopSeen,'Attempt after stop/not-run');
    const intent=read(`intent-${id}.json`).value;
    assert.deepEqual(intent,{simulation:response.simulation,registrationSha256:sealed.sha256,ordinal:i+1,caseId:row.caseId,arm:row.arm,promptSha256:digest(assemble(frozen,turn))},'Intent mismatch');
    assert(row.evidence&&[`${id}/record.json`,`${id}/setup-failure.json`].includes(row.evidence.path),'Unexpected evidence path');
    const rawFile=read(row.evidence.path),raw=rawFile.value;
    assert.equal(digest(rawFile.bytes),row.evidence.sha256,'Raw evidence hash mismatch');assert.equal(raw.simulation,response.simulation,'Raw simulation mismatch');
    assert(['completed','failed'].includes(raw.status),'Unknown raw status');
    const status=raw.status==='completed'?'executed':raw.error?.includes('deadline')?'interrupted':'failed';assert.equal(row.status,status,'Raw status mismatch');
    assert.equal(row.answer,raw.answer??'','Raw answer mismatch');assert.equal(row.answerSha256,digest(row.answer));
    const tokens=raw.usage?.total?.totalTokens;const expectedTokens=Number.isSafeInteger(tokens)&&tokens>=0?tokens:null;
    assert.equal(row.tokens,expectedTokens,'Raw usage mismatch');
    const duration=raw.timing?.completed_elapsed_ms??null;
    assert(duration===null||Number.isFinite(duration)&&duration>=0,'Invalid raw duration');assert.equal(row.durationMs,duration,'Raw duration mismatch');
    assert.deepEqual(row.model,{requested:registration.model,cliSelected:raw.cli_selected_model??null,effort:registration.effort,backendAttested:false},'Raw model summary mismatch');
    if(row.evidence.path.endsWith('/setup-failure.json')) {
      assert.equal(row.status,'failed');assert.equal(row.answer,'');assert.equal(row.tokens,null);assert.equal(row.durationMs,null);
    } else {
      assert.equal(raw.requested_model,registration.model,'Requested model mismatch');assert.equal(raw.requested_effort,registration.effort,'Requested effort mismatch');
      assert.equal(raw.prompt,assemble(frozen,turn),'Archived prompt mismatch');
      assert.equal(raw.source_sha256,frozen.protocol.sources['evals/research/runtime/prospective/codex-login-turn.mjs'],'Raw adapter source mismatch');
      if(raw.status==='completed') {
        assert.equal(raw.cli_selected_model,registration.model);assert.equal(raw.cli_selected_effort,registration.effort);assert.equal(raw.cli_version,registration.cliVersion);
        assert.equal(raw.auth_type,response.simulation?'synthetic-no-auth':'chatgpt');
        assert(raw.cleanup?.closed&&raw.cleanup?.group_absent&&raw.cleanup?.private_home_removed,'Completed raw cleanup not confirmed');
      }
    }
    if(row.status!=='executed'||row.tokens===null)stopSeen=true;
  }
  // Validate the separately held packet map even when no annotations exist yet.
  normalizeAnnotations(sealed,response,mapping,{annotations:[]});
  return {sealed,response,mapping};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const [runDir,annotationFile,out]=process.argv.slice(2);assert(runDir&&annotationFile&&out,'RUN_DIRECTORY ANNOTATIONS NEW_REPORT');
  const {sealed,response,mapping}=verifyRunArtifacts(runDir);
  const annotations=normalizeAnnotations(sealed,response,mapping,JSON.parse(fs.readFileSync(annotationFile)));
  const result=summarize(sealed.registration.frozen,response.records,annotations);
  fs.writeFileSync(out,JSON.stringify({simulation:response.simulation,rawEvidenceVerified:true,durationSource:'Raw executor monotonic completed_elapsed_ms; includes setup and cleanup, not external reporting time',...result},null,2)+'\n',{flag:'wx',mode:0o600});
}
