/** Offline reproduction only. Reads preserved raw evidence and semantic annotations; calls no model. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readRecovery} from '../../../../evals/research/all-skills/recovery.mjs';
import {summarize as summarizeSkills} from '../../../../evals/research/all-skills/report.mjs';
import {score as scoreSkills,digest} from '../../../../evals/research/all-skills/suite.mjs';
import {verifyRunArtifacts,normalizeAnnotations,summarize as summarizeRuntime} from '../../../../evals/research/runtime/pack-benchmark/report.mjs';
import {score as scoreRuntime} from '../../../../evals/research/runtime/pack-benchmark/suite.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const [rawRoot,output]=process.argv.slice(2);
assert(rawRoot&&output,'Usage: node reproduce.mjs RAW_ROOT NEW_OUTPUT_DIRECTORY');
assert(!fs.existsSync(output),'Output directory must be new; never overwrite preserved results');
const read=name=>JSON.parse(fs.readFileSync(path.join(here,name),'utf8'));
const skillAnnotations=read('annotations-all-skills.json').annotations;
const runtimeAnnotations=read('annotations-runtime.json').annotations;
const prior=read('annotations-in-progress.json').annotations;
for(const old of prior)assert.deepEqual(skillAnnotations.find(a=>a.responseId===old.responseId),old,'Prior published annotation must remain unchanged');
const run=readRecovery(path.join(rawRoot,'all-skills-run'),path.join(rawRoot,'recovery-live-2'),[path.join(rawRoot,'recovery-live')]);
const runtime=verifyRunArtifacts(path.join(rawRoot,'runtime-pack-run'));
assert.equal(run.simulation,false);assert.equal(runtime.response.simulation,false);
assert.equal(skillAnnotations.length,210);assert.equal(runtimeAnnotations.length,108);
const skillSummary={...summarizeSkills(run,skillAnnotations),recovery:run.recovery};
const runtimeSummary={simulation:false,rawEvidenceVerified:true,...summarizeRuntime(runtime.sealed.registration.frozen,runtime.response.records,normalizeAnnotations(runtime.sealed,runtime.response,runtime.mapping,{annotations:runtimeAnnotations}))};
function row(study,r,c,id,review,s) {
 const criteria=c.metricKind==='task-criteria'?c.rubric.expectedCriteria:c.rubric.expectedIssues;
 const credited=new Set(review.issues.map(x=>x.id)),ev=new Set(review.evidence.map(x=>x.id));
 return {study,responseId:id,caseId:c.id,arm:r.arm,repeat:r.repeat,ordinal:r.ordinal,skill:c.skill??'brooks-review + runtime prototype',scope:c.scope,metricKind:c.metricKind??'diagnostic',answerSha256:review.answerSha256,tokens:r.tokens,durationMs:r.durationMs,...s,artifact:r.artifact??null,completeSupported:s.complete===null?null:s.complete===true&&(!r.artifact||r.artifact.success),missingExpected:criteria.filter(x=>!credited.has(x)),missingEvidence:c.rubric.evidence.flatMap((requirement,i)=>ev.has(i)?[]:[{id:i,requirement,rationale:review.missingEvidence?.find(e=>e.id===i)?.rationale??'No exact evidence was credited in the frozen-rubric annotation.'}])};
}
const scored=[];
for(const r of run.records){assert.equal(r.status,'executed');const id=digest(`${run.sealed.sha256}/${r.ordinal}`).slice(0,20),c=run.sealed.registration.frozen.protocol.cases.find(c=>c.id===r.caseId),review=skillAnnotations.find(a=>a.responseId===id).review;scored.push(row('all-skills',r,c,id,review,scoreSkills(c,r.answer,review)));}
for(const r of runtime.response.records){assert.equal(r.status,'executed');const id=runtime.mapping.records[r.ordinal-1].responseId,c=runtime.sealed.registration.frozen.protocol.cases.find(c=>c.id===r.caseId),review=runtimeAnnotations.find(a=>a.responseId===id).review;scored.push(row('runtime',r,c,id,review,scoreRuntime(c,r.answer,review)));}
const fraction=(n,d)=>({numerator:n,denominator:d,rate:d?n/d:null});
function group(rows){const sum=k=>rows.reduce((n,r)=>n+(r[k]??0),0);return {responses:rows.length,assessmentAgreement:fraction(rows.filter(r=>r.assessmentMatched).length,rows.length),completeSupported:fraction(rows.filter(r=>r.completeSupported===true).length,rows.length),adjudicationPending:rows.filter(r=>r.completeSupported===null).length,expectedIssueRecall:fraction(sum('expectedFound'),sum('expectedTotal')),requiredCriteria:fraction(sum('criteriaFound'),sum('criteriaTotal')),evidence:fraction(sum('evidenceFound'),sum('evidenceTotal')),unsupportedClaims:sum('unsupportedClaims'),pendingClaims:sum('pendingClaims'),novelConfirmed:sum('novelConfirmed'),observedTokens:sum('tokens'),durationMs:sum('durationMs')};}
function pairs(rows,base,treatment){const result={improved:0,tied:0,regressed:0,pending:0,details:[]};for(const a of rows.filter(r=>r.arm===base)){const b=rows.find(r=>r.caseId===a.caseId&&r.repeat===a.repeat&&r.arm===treatment);assert(b,'Missing matched response');const status=a.completeSupported===null||b.completeSupported===null?'pending':a.completeSupported===b.completeSupported?'tied':b.completeSupported?'improved':'regressed';result[status]++;result.details.push({caseId:a.caseId,repeat:a.repeat,baselineResponseId:a.responseId,treatmentResponseId:b.responseId,status,assessmentDelta:Number(b.assessmentMatched)-Number(a.assessmentMatched),evidenceDelta:b.evidenceFound-a.evidenceFound,unsupportedClaimsDelta:b.unsupportedClaims-a.unsupportedClaims});}return result;}
const skillComparisons=Object.fromEntries(Object.keys(skillSummary.skills).map(skill=>{
 const rows=scored.filter(r=>r.study==='all-skills'&&r.skill===skill);
 const arms=Object.fromEntries(['A','B'].map(a=>[a,group(rows.filter(r=>r.arm===a))]));
 const cases=Object.fromEntries([...new Set(rows.map(r=>r.caseId))].map(c=>{
  const caseArms=Object.fromEntries(['A','B'].map(a=>[a,group(rows.filter(r=>r.caseId===c&&r.arm===a))]));
  return [c,caseArms];
 }));
 return [skill,{scope:rows[0].scope,arms,completeSupportedPairs:pairs(rows,'A','B'),cases}];
}));
const runtimeRows=scored.filter(r=>r.study==='runtime'&&r.scope==='runtime');
const sensitivityRows=scored.filter(r=>r.study==='all-skills').map(r=>{const review=skillAnnotations.find(a=>a.responseId===r.responseId).review,extra=review.supplementalEvidence??[];for(const e of extra){assert(!review.evidence.some(x=>x.id===e.id),'Sensitivity must not duplicate primary credit');assert((['AS-01','AS-35'].includes(r.caseId)&&e.id===1)||(r.caseId==='AS-04'&&[0,2].includes(e.id)),'Only declared witness-equivalence sensitivity permitted');const raw=run.records[r.ordinal-1];assert(typeof e.quote==='string'&&e.quote.trim()&&raw.answer.includes(e.quote));assert(e.rationale&&e.adjudication,'Sensitivity needs explicit adjudication');}assert.equal(new Set(extra.map(x=>x.id)).size,extra.length);const evidenceFound=r.evidenceFound+extra.length;return {...r,evidenceFound,completeSupported:r.completeSupported===null?null:r.assessmentMatched&&r.expectedFound===r.expectedTotal&&r.criteriaFound===r.criteriaTotal&&evidenceFound===r.evidenceTotal&&r.unsupportedClaims===0&&(!r.artifact||r.artifact.success)};});
const sensitivity={postHoc:true,changesFrozenPrimary:false,policy:'AS-01 equivalent validated numeric policy counterexample; AS-04 verified alternate rounding witnesses; AS-35 explicit behavior-preserving private rename breaking source regex. Generic reasoning is insufficient. Same original label/issue/claim/artifact judgments.',affectedResponses:skillAnnotations.filter(a=>a.review.supplementalEvidence?.length).map(a=>({responseId:a.responseId,supplementalEvidence:a.review.supplementalEvidence})),skills:Object.fromEntries(Object.keys(skillSummary.skills).map(skill=>[skill,Object.fromEntries(['A','B'].map(arm=>[arm,group(sensitivityRows.filter(r=>r.skill===skill&&r.arm===arm))]))]))};
const comparison={simulation:false,semanticJudgmentIndependent:false,judgedModel:'gpt-6.1-terra',judgedEffort:'low',primaryReviewerModel:'gpt-6-astra',reviewerReasoningEffort:'not independently recorded',originalPublishedReviewRetained:prior.map(a=>a.responseId),skills:skillComparisons,runtime:{arms:Object.fromEntries(['A','B','C'].map(a=>[a,group(runtimeRows.filter(r=>r.arm===a))])),coreVersusBaseline:pairs(runtimeRows,'A','B'),runtimeVersusCore:pairs(runtimeRows,'B','C')}};
fs.mkdirSync(output,{recursive:true});
for(const [name,data] of Object.entries({'all-skills-summary.json':skillSummary,'runtime-summary.json':runtimeSummary,'scored-responses.json':{records:scored},'comparison.json':comparison,'equivalence-sensitivity.json':sensitivity}))fs.writeFileSync(path.join(output,name),JSON.stringify(data,null,2)+'\n');
const ledger=['# Per-response semantic review ledger','','Generated offline from frozen raw responses and individually supported annotations. `yes` is a complete supported response; `no` means one or more frozen requirements/claims/artifact checks fail; `pending` preserves unresolved extra claims. A matching disposition alone is not success. Raw answer hashes and all exact supporting quotes are in the JSON artifacts.','','| Study | Case | Arm | Repeat | Response ID | Assessment match | Complete supported | Issues | Criteria | Evidence | Unsupported | Pending | Artifact |','| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',...scored.map(r=>`| ${r.study} | ${r.caseId} | ${r.arm} | ${r.repeat} | ${r.responseId} | ${r.assessmentMatched?'yes':'no'} | ${r.completeSupported===null?'pending':r.completeSupported?'yes':'no'} | ${r.expectedFound}/${r.expectedTotal} | ${r.criteriaFound??0}/${r.criteriaTotal??0} | ${r.evidenceFound}/${r.evidenceTotal} | ${r.unsupportedClaims} | ${r.pendingClaims} | ${r.artifact?r.artifact.success?'pass':'fail':'n/a'} |`)];
fs.writeFileSync(path.join(output,'response-ledger.md'),ledger.join('\n')+'\n');
console.log(JSON.stringify({verifiedRaw:true,allSkills:skillAnnotations.length,runtime:runtimeAnnotations.length,outputs:6}));
