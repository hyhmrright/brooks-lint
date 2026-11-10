// Offline provenance/excerpt/arithmetic verifier, never a semantic judge.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { scoreIssues } from '../../../../evals/research/runtime/benchmark-v2/suite.mjs';
import { reproduce } from './reproduce-novel.mjs';
const dir = fileURLToPath(new URL('.', import.meta.url));
const read = name => JSON.parse(readFileSync(dir + name, 'utf8'));
const member = (archive, path) => JSON.parse(execFileSync('tar', ['-xOzf', dir + archive, path], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
const sha = text => createHash('sha256').update(text).digest('hex');
const reg = member('raw-execution.tar.gz', 'results/registration.json');
const protocol = reg.registration.frozen.protocol;
const initial = member('raw-execution.tar.gz', 'results/responses.json').records;
const review = read('semantic-review.json');
const cases = new Map(review.cases.map(c => [c.id, c]));
assert.equal(review.records.length, 54);
assert.equal(new Set(review.records.map(r => r.ordinal)).size, 54);
assert.equal(review.cases.length, 18);
for (const c of protocol.cases) assert.deepEqual(cases.get(c.id).rubric, JSON.parse(c.rubric.content));
for (const r of review.records) {
  const turn = protocol.schedule.turns[r.ordinal - 1];
  assert.deepEqual([r.caseId,r.arm,r.repetition], [turn.caseId,turn.arm,turn.repetition]);
  const raw = r.ordinal <= 24 ? initial.find(x => x.ordinal === r.ordinal) : member('recovery-raw.tar.gz', `recovery-01/result-${String(r.ordinal).padStart(3,'0')}.json`);
  assert.ok(['executed','completed'].includes(raw.status));
  assert.equal(sha(raw.answer), raw.answerSha256);
  assert.equal(r.answerSha256, raw.answerSha256);
  const refs = new Set(r.excerpts.map(e => e.id));
  assert.equal(refs.size, r.excerpts.length);
  for (const e of r.excerpts) assert.ok(e.text.length > 0 && raw.answer.includes(e.text), `excerpt ${r.ordinal}/${e.id}`);
  for (const v of [...r.claims,...r.evidence,{excerptIds:r.assessmentExcerptIds}]) {
    assert.ok(v.excerptIds.length > 0);
    for (const id of v.excerptIds) assert.ok(refs.has(id));
  }
  const c = cases.get(r.caseId);
  assert.deepEqual(r.evidence.map(e=>e.id), c.rubric.evidenceRequirements.map(e=>typeof e==='string'?e:e.id));
  assert.equal(r.assessmentMatchesFrozen, r.assessment===c.kind);
  assert.equal(typeof r.completion,'boolean');
  for (const e of r.evidence) assert.equal(typeof e.satisfied,'boolean');
  scoreIssues(c.rubric.expectedFindings.map(f=>f.id),r.claims);
}
const rate = (n,d) => ({ numerator:n, denominator:d, rate:d?n/d:null });
function aggregate(rows, amended=false, pendingMode='primary') {
  let expected=0, found=0, rejected=0,pending=0,novel=0,misses=0,defects=0,accuracy=0,evidence=0,requirements=0,full=0,protectedErrors=0,protectedN=0,certainty=0,unresolved=0,severityN=0,severityOK=0,severityAbsent=0;
  const missedIds=[];
  for(const r of rows){
    const c=cases.get(r.caseId), isAmend=amended&&r.caseId==='BV-05';
    const kind=isAmend?'defect':c.kind, ids=isAmend?['generation-saturation']:c.rubric.expectedFindings.map(f=>f.id);
    let claims=structuredClone(r.claims);
    if(isAmend) for(const a of claims) if(a.status==='novel-confirmed'){a.status='matched';a.expectedId='generation-saturation';}
    if(pendingMode==='novel-pending') for(const a of claims) if(a.status==='novel-confirmed')a.status='pending';
    if(r.ordinal===2&&pendingMode==='producer-rejected')claims.find(a=>a.id==='producer-defect').status='rejected';
    if(r.ordinal===2&&pendingMode==='producer-conditional')claims=claims.filter(a=>a.id!=='producer-defect');
    const s=scoreIssues(ids,claims);
    expected+=s.expected;found+=s.found;rejected+=s.falsePositives;pending+=s.pending;novel+=s.novelConfirmed;
    accuracy+=Number(r.completion&&r.assessment===kind);
    if(kind==='defect'){defects++;misses+=Number(s.missed>0);for(const id of ids)if(!claims.some(a=>a.status==='matched'&&a.expectedId===id))missedIds.push({ordinal:r.ordinal,id});}
    if(kind==='protected'){protectedN++;protectedErrors+=Number(s.falsePositives>0);}
    if(kind==='unresolved'){unresolved++;certainty+=Number(s.falsePositives>0||r.unsupportedSafety.length>0);}
    evidence+=r.evidence.filter(e=>e.satisfied).length;requirements+=r.evidence.length;full+=Number(r.evidence.every(e=>e.satisfied));
    for(const a of claims.filter(a=>['matched','novel-confirmed'].includes(a.status))){if(a.severity?.status==='absent')severityAbsent++;else if(a.severity?.label){severityN++;severityOK+=Number(a.severity.label==='Warning');}}
  }
  const confirmed=found+novel,total=confirmed+rejected+pending;
  return {responses:rows.length,completion:rate(rows.filter(r=>r.completion).length,rows.length),assessmentAccuracy:rate(accuracy,rows.length),issueRecall:rate(found,expected),issueMisses:rate(expected-found,expected),missedIds,responseMissRate:rate(misses,defects),protectedFalseDefectRate:rate(protectedErrors,protectedN),unresolvedCertaintyError:rate(certainty,unresolved),unsupportedDefectAssertions:rejected,pendingClaims:pending,novelConfirmed:novel,precision:rate(confirmed,confirmed+rejected),precisionBounds:total?{lower:confirmed/total,upper:(confirmed+pending)/total,denominator:total}:null,evidenceCompleteness:rate(evidence,requirements),fullyEvidenced:rate(full,rows.length),severityCalibration:rate(severityOK,severityN),absentSeverityLabels:severityAbsent,noncanonicalSeverityLabels:0,unsupportedSafety:rows.reduce((n,r)=>n+r.unsupportedSafety.length,0),supplementaryConcerns:rows.reduce((n,r)=>n+r.supplementaryConcerns.length,0)};
}
const arms=(rows, amended=false, mode='primary')=>Object.fromEntries(['A','B','C'].map(a=>[a,aggregate(rows.filter(r=>r.arm===a),amended,mode)]));
const completeCases=review.cases.filter(c=>review.records.filter(r=>r.caseId===c.id).length===3).map(c=>c.id);
const summary={revision:1,model:reg.registration.model,effort:reg.registration.effort,reviewer:review.reviewer,execution:{planned:54,original:{executed:24,failed:1,notRun:29},recovery:{executed:30,failed:0,links:'ordinals 25–54; original failure preserved'},combinedSuccessful:54,reviewed:54,unreviewedSuccessful:0,completeReviewedTriplets:completeCases.length},individual:arms(review.records),paired:arms(review.records.filter(r=>completeCases.includes(r.caseId))),excludedTriplets:[],bySuite:Object.fromEntries(['HB','BV'].map(s=>[s,arms(review.records.filter(r=>r.caseId.startsWith(s)))])),byScope:{runtime:arms(review.records),coreTest:arms([]),transfer:arms([])},byFamily:Object.fromEntries([...new Set(review.cases.map(c=>c.family))].map(f=>[f,arms(review.records.filter(r=>cases.get(r.caseId).family===f))])),byBatch:Object.fromEntries(['original','recovery-01'].map(b=>[b,arms(review.records.filter(r=>r.batch===b))])),sensitivity:{goldAmendmentV1:arms(review.records,true),novelClaimsPending:arms(review.records,false,'novel-pending'),producerRejected:arms(review.records,false,'producer-rejected'),producerConditionalNotClaim:arms(review.records,false,'producer-conditional')},novelBoundaryWitness:reproduce()};
const rendered=JSON.stringify(summary,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync(dir+'statistics.json',rendered);else assert.equal(readFileSync(dir+'statistics.json','utf8'),rendered,'statistics drift');
console.log('PASS: 54 archived answers, schedule, rubric copies, hashes, exact excerpts, issue arithmetic, paired summaries and boundary witness. Semantic truth requires review.');
