/** Offline checks only. Never evaluates or executes model-authored source. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessRun,readRun,packets} from '../../../../evals/research/skills-benchmark-v2/campaign-v3.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(path.join(here,name),'utf8'));
const run=readRun(process.argv[2]??'_workspace/campaign-v3-live');
const annotations=read('annotations.json'), result=assessRun(run,annotations);
assert.equal(annotations.length,108);
assert.deepEqual(result,read('assessment.json'));
const packetMap=new Map(packets(run).packets.map(p=>[p.responseId,p]));
for(const a of annotations){
 const p=packetMap.get(a.responseId);assert(p);assert.equal(a.caseId,p.caseId);
 assert(a.labelReason?.trim());
}
for(const row of read('per-skill-metrics.json').rows){
 const s=result.results.bySkill[row.skill.replace('brooks-','')].find(s=>s.arm===row.arm);
 assert.equal(row.answers,s.reviewed);assert.equal(row.frozenLabelMatches,s.labelCorrect);
 assert.equal(row.frozenLabelMatchRate,s.labelCorrect/s.reviewed);
 assert.equal(row.expectedIssues,s.expectedIssueRecall[1]);
 assert.equal(row.missedExpectedIssues,s.expectedIssueRecall[1]-s.expectedIssueRecall[0]);
 assert.equal(row.confirmedFalseDefectClaims,s.falseDefectClaims);
 assert.equal(row.otherUnsupportedClaims,s.otherUnsupportedClaims);assert.equal(row.disputedClaims,s.pendingClaims);
 assert.deepEqual(row.taskCriteria,s.taskCriteria);assert.deepEqual(row.evidence,s.evidence);
}
// Authored, isolated arithmetic checks for novel valid findings; no answer evaluation.
const cents=9007199254740901;
assert(Number.isSafeInteger(cents));
assert.equal(Math.round(cents*5000/10000),4503599627370450);
assert.equal((BigInt(cents)+1n)/2n,4503599627370451n);
assert(Number.isInteger(1e308));assert.equal(1e308*5000/10000,Infinity);assert(Number.isFinite(1e308/2));
const executionItemTypes=new Set();
for(const row of run.records)for(const event of row.record.events)if(event.method==='item/completed')executionItemTypes.add(event.params.item.type);
assert([...executionItemTypes].every(t=>['userMessage','reasoning','agentMessage','dynamicToolCall'].includes(t)));
console.log(JSON.stringify({reviewed:annotations.length,rawRunVerified:true,hashesQuotesAndFrozenCreditsValid:true,assessmentReproduced:true,perSkillMetricsReproduced:true,authoredNumericCounterexamplesReproduced:true,completedItemTypes:[...executionItemTypes].sort(),modelPatchesExecuted:0,liveCalls:0},null,2));
