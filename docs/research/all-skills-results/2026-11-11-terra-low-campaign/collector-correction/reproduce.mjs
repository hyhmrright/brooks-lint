/** Offline correction: verify original archives with their pinned source, then derive completed-message answers. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const [rawRoot,legacyRoot,output]=process.argv.slice(2);
assert(rawRoot&&legacyRoot&&output,'RAW_ROOT PINNED_SOURCE_ROOT NEW_OUTPUT_DIRECTORY');
assert(!fs.existsSync(output),'Never overwrite preserved results');
const pinned='37fd5a282df17736541c7c36d109f4ab070bbc8a';
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:legacyRoot,encoding:'utf8'}).trim(),pinned);
assert.equal(execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:legacyRoot,encoding:'utf8'}).trim(),'','Pinned tracked source must be clean');
const imp=p=>import(pathToFileURL(path.resolve(legacyRoot,p)).href);
const {readRecovery}=await imp('evals/research/all-skills/recovery.mjs');
const {summarize:skillsSummary}=await imp('evals/research/all-skills/report.mjs');
const {verifyRunArtifacts,normalizeAnnotations,summarize:runtimeSummary}=await imp('evals/research/runtime/pack-benchmark/report.mjs');
const {checkArtifacts}=await imp('evals/research/all-skills/artifacts.mjs');
const {digest}=await imp('evals/research/all-skills/suite.mjs');
const run=readRecovery(path.join(rawRoot,'all-skills-run'),path.join(rawRoot,'recovery-live-2'),[path.join(rawRoot,'recovery-live')]);
const rt=verifyRunArtifacts(path.join(rawRoot,'runtime-pack-run'));
const here=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(here);
const read=n=>JSON.parse(fs.readFileSync(path.join(parent,n)));
const publishedPath='docs/research/all-skills-results/2026-11-11-terra-low-campaign';
for(const name of ['annotations-all-skills.json','annotations-runtime.json','all-skills-summary.json','runtime-summary.json'])assert(fs.readFileSync(path.join(parent,name)).equals(fs.readFileSync(path.join(legacyRoot,publishedPath,name))),'Published original evidence must remain byte-identical: '+name);
const sa=read('annotations-all-skills.json').annotations,ra=read('annotations-runtime.json').annotations;
const originalSkills=skillsSummary(run,sa),originalRuntime=runtimeSummary(rt.sealed.registration.frozen,rt.response.records,normalizeAnnotations(rt.sealed,rt.response,rt.mapping,{annotations:ra}));
assert.deepEqual(originalSkills,((x)=>{const {recovery,...rest}=x;return rest;})(read('all-skills-summary.json')));
const affected=[],counts={reviewed:0,completedMessages:0,orphanItems:0},revisions=[];
function transform(row,study,c,annotation,rawFile){
 const raw=JSON.parse(fs.readFileSync(rawFile));assert.equal(raw.answer,row.answer);assert.equal(digest(raw.answer),annotation.review.answerSha256);
 const completed=new Map(),deltas=new Map();
 for(const e of raw.events){const p=e.params;if(!p||p.threadId!==raw.thread_id||p.turnId!==raw.turn_id)continue;
  if(e.method==='item/agentMessage/delta')deltas.set(p.itemId,(deltas.get(p.itemId)??'')+(p.delta??''));
  if(e.method==='item/completed'&&p.item?.type==='agentMessage'){assert.equal(p.item.phase,'final_answer','This historical audit only admits the observed final-only corpus');assert.equal(typeof p.item.text,'string');completed.set(p.item.id,p.item.text);}
 }
 assert.equal(completed.size,1,'Historical corpus has exactly one completed final message per answer');
 const answer=[...completed.values()].join('\n'),orphans=[...deltas].filter(([id])=>!completed.has(id));
 counts.reviewed++;counts.completedMessages+=completed.size;counts.orphanItems+=orphans.length;
 if(answer===row.answer){assert.equal(orphans.length,0);return row;}
 assert(orphans.length>0,'Unexpected extraction difference');
 const originalReview=structuredClone(annotation.review),review=annotation.review;
 review.answerSha256=digest(answer);
 review.reviewer={identity:'gpt-6-astra / root collector-audit reviewer',exposure:'Same-workflow rubric and arm exposed; not independent human review',method:'Re-read completed event text and original fixture; exact citation and bounded artifact revalidation after transport-orphan exclusion'};
 const artifact=c.oracle?checkArtifacts(c,answer):null;
 if(study==='all-skills'){
  assert.equal(annotation.responseId,'0fe9233be960c955b315');assert(artifact.success,'Completed JSON must pass original behavioral/preservation oracle');
  assert(!review.evidence.some(x=>x.id===1));
  review.evidence.push({id:1,quote:'export function total(cents) { return cents * .9; }',rationale:'The completed message contains one valid JSON object. Its allowed replacement passes the unchanged original artifact oracle, preserving the public signature and sentinel.'});review.evidence.sort((a,b)=>a.id-b.id);review.missingEvidence=[];
 }else assert.equal(annotation.responseId,'950579f179f8fdae93de');
 revisions.push({responseId:annotation.responseId,originalReview,correctedReview:structuredClone(review)});
 affected.push({study,responseId:annotation.responseId,caseId:row.caseId,arm:row.arm,repeat:row.repeat,ordinal:row.ordinal,rawSha256:digest(fs.readFileSync(rawFile)),originalAnswerSha256:digest(row.answer),completedAnswerSha256:digest(answer),completedItemIds:[...completed.keys()],orphanItems:orphans.map(([id,text])=>({id,text})),completedAnswer:answer,originalArtifact:row.artifact??null,correctedArtifact:artifact});
 return {...row,answer,answerSha256:digest(answer),...(artifact?{artifact}:{} )};
}
const correctedSkills={...run,records:run.records.map(row=>{const id=digest(`${run.sealed.sha256}/${row.ordinal}`).slice(0,20),c=run.sealed.registration.frozen.protocol.cases.find(c=>c.id===row.caseId),a=sa.find(a=>a.responseId===id),segment=row.ordinal<46?'all-skills-run':row.ordinal<80?'recovery-live':'recovery-live-2';return transform(row,'all-skills',c,a,path.join(rawRoot,segment,String(row.ordinal).padStart(3,'0'),'record.json'));})};
const correctedRuntime={...rt.response,records:rt.response.records.map(row=>{const id=rt.mapping.records[row.ordinal-1].responseId,c=rt.sealed.registration.frozen.protocol.cases.find(c=>c.id===row.caseId),a=ra.find(a=>a.responseId===id);return transform(row,'runtime',c,a,path.join(rawRoot,'runtime-pack-run',String(row.ordinal).padStart(3,'0'),'record.json'));})};
assert.equal(counts.reviewed,318);assert.equal(affected.length,2);
const cs=skillsSummary(correctedSkills,sa),cr=runtimeSummary(rt.sealed.registration.frozen,correctedRuntime.records,normalizeAnnotations(rt.sealed,correctedRuntime,rt.mapping,{annotations:ra}));
assert.deepEqual(cr,originalRuntime,'Runtime scores must remain unchanged');
for(const [skill,s]of Object.entries(originalSkills.skills))if(skill!=='brooks-sweep')assert.deepEqual(cs.skills[skill],s);
const old=originalSkills.skills['brooks-sweep'].arms.B.byMetricKind.diagnostic,now=cs.skills['brooks-sweep'].arms.B.byMetricKind.diagnostic;
assert.equal(old.completeSupported,14);assert.equal(now.completeSupported,15);assert.equal(now.artifactSuccess.numerator,15);assert.equal(now.evidence.numerator,45);
const audit={answerView:'completed-agent-message-events-v1',pinnedVerificationCommit:pinned,rawRecordsUnmodified:true,originalRawVerificationPassed:true,semanticJudgmentIndependent:false,counts,affected,impact:{sweepB:{originalComplete:14,correctedComplete:15,denominator:15,originalEvidence:'44/45',correctedEvidence:'45/45',originalArtifact:'14/15',correctedArtifact:'15/15'},runtimeScoresChanged:false,otherSkillsChanged:false}};
fs.mkdirSync(output,{recursive:true});
for(const [name,value]of Object.entries({'audit.json':audit,'annotation-revisions.json':{revisions},'all-skills-corrected-summary.json':{...cs,answerView:audit.answerView,recovery:run.recovery},'runtime-corrected-summary.json':{...cr,answerView:audit.answerView}}))fs.writeFileSync(path.join(output,name),JSON.stringify(value,null,2)+'\n');
console.log(JSON.stringify({verifiedOriginal:318,affected:2,sweepBComplete:'15/15',runtimeScoresUnchanged:true,outputs:4}));
