/** Versioned semantic admission; a judgment remains authored and inspectable, not keyword-derived. */
import assert from 'node:assert/strict';
import {packets} from '../skills-benchmark-v2/campaign.mjs';
import {summarize} from './suite.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
import {validateSweepShape,digest} from './suite.mjs';
const digestResponse=(run,row)=>digest(`${run.sealed.sha256}/${row.ordinal}`).slice(0,24);
export {packets};
export function mechanicalOutcome(c,raw){
 const required=['brooks-health','brooks-sweep'].includes(c.skill),successful=(raw.tool_calls??[]).filter(t=>t.success),last=successful.at(-1);
 let reportRetainedUnchanged=false,shapePassed=null;
 if(last){const expected=finalizeTool(last.arguments);assert.deepEqual(last.result,expected);
  if(c.skill==='brooks-health')reportRetainedUnchanged=raw.answer===expected.finalReport;
  if(c.skill==='brooks-sweep')try{const a=JSON.parse(raw.answer);reportRetainedUnchanged=a.report===expected.finalReport;validateSweepShape(c,a);shapePassed=true;}catch{shapePassed=false;}
 }
 return {required,prohibited:false,observedCalls:(raw.tool_calls??[]).length,successfulCalls:successful.length,reportRetainedUnchanged,shapePassed,
 passed:required?raw.status==='completed'&&Boolean(last)&&last.result.reports.length===1&&reportRetainedUnchanged:null,
 limitation:'Exact report receipt and shape are separate from ledger truth and sandbox patch behavior.'};
}
export function assessRun(run,annotations){
 const ps=new Map(packets(run).packets.map(p=>[p.responseId,p]));
 for(const a of annotations){const p=ps.get(a.responseId);assert(p);const r=a.review;
  assert(typeof r.labelBasis==='string'&&r.labelBasis.trim(),'Explicit scoped label basis required');
  assert(Array.isArray(r.novelFindings),'Explicit novel-findings inventory required, including empty');
  for(const f of r.novelFindings){assert(['supported','unsupported','pending'].includes(f.verdict));assert(f.quote&&p.answer.includes(f.quote));for(const key of ['contract','reason','reproduction'])assert(typeof f[key]==='string'&&f[key].trim());
   if(f.verdict==='supported')assert(!(r.falseDefectClaims??[]).some(x=>x.quote===f.quote),'Supported novel finding cannot be counted as false defect');
  }
 }
 assert.equal(annotations.length,ps.size,'Every completed answer needs a judgment');assert.equal(new Set(annotations.map(a=>a.responseId)).size,annotations.length);const rm=new Map(annotations.map(a=>[a.responseId,a.review]));const rows=run.records.map(row=>({...row,review:rm.get(digestResponse(run,row))}));for(const r of rows)if(r.status==='completed')assert(r.review,'Missing annotation');const report={simulation:run.state.simulation,registrationSha256:run.sealed.sha256,results:summarize(rows,{cases:run.sealed.frozen.protocol.cases}),byRepeat:Object.fromEntries([1,2,3].map(repeat=>[repeat,summarize(rows.filter(r=>r.repeat===repeat),{cases:run.sealed.frozen.protocol.cases})])),workflow:rows.filter(r=>r.status==='completed').map(r=>({id:r.id,arm:r.arm,repeat:r.repeat,...r.workflow})),perAnswer:rows.map(r=>({id:r.id,arm:r.arm,repeat:r.repeat,status:r.status,taskCriteria:r.review?.criteria.map(c=>c.id)??[],unsupportedClaims:r.review?.otherUnsupportedClaims.length??null}))};
 report.novelFindings=annotations.flatMap(a=>a.review.novelFindings.map(f=>({responseId:a.responseId,...f})));
 const byResponse=new Map(annotations.map(a=>[a.responseId,a.review]));
 const reviewed=run.records.filter(r=>r.status==='completed').map(row=>({...row,review:byResponse.get(digestResponse(run,row))}));
 const count=rows=>['A','B','C'].map(arm=>{const selected=rows.filter(r=>r.arm===arm);return {arm,reviewedAnswers:selected.length,
  confirmedFalseDefectClaims:selected.reduce((n,r)=>n+r.review.falseDefectClaims.length,0),
  answersWithConfirmedFalseDefects:selected.filter(r=>r.review.falseDefectClaims.length>0).length,
  answersWithPendingClaims:selected.filter(r=>r.review.pendingClaims.length>0).length,
  novelVerdictCounts:Object.fromEntries(['supported','unsupported','pending'].map(v=>[v,selected.reduce((n,r)=>n+r.review.novelFindings.filter(f=>f.verdict===v).length,0)]))};});
 report.claimMetrics={arms:count(reviewed),bySkill:Object.fromEntries([...new Set(run.sealed.frozen.protocol.cases.map(c=>c.skill))].map(skill=>[skill,count(reviewed.filter(r=>run.sealed.frozen.protocol.cases.find(c=>c.id===r.id).skill===skill))]))};
 const outcomes=rows.map(row=>{const c=run.sealed.frozen.protocol.cases.find(c=>c.id===row.id),r=row.review;if(row.status!=='completed')return {id:row.id,skill:c.skill,arm:row.arm,repeat:row.repeat,outcome:row.status};const pending=r.pendingClaims.length||r.novelFindings.some(f=>f.verdict==='pending');const credits=(key,ids)=>ids.every(id=>r[key].some(x=>x.id===id));const semantic=r.assessment!=='no-answer'&&credits('issues',c.rubric.expectedIssues)&&credits('criteria',c.rubric.expectedCriteria)&&r.falseDefectClaims.length===0&&r.otherUnsupportedClaims.length===0&&!r.novelFindings.some(f=>f.verdict==='unsupported');const workflow=!row.workflow.required||row.workflow.passed;const shape=c.skill!=='brooks-sweep'||row.workflow.shapePassed===true;return {id:row.id,skill:c.skill,arm:row.arm,repeat:row.repeat,outcome:r.assessment==='no-answer'?'fail':pending?'pending':semantic&&workflow&&shape?'pass':'fail',semantic,workflow,shape};});
 const counts=rs=>Object.fromEntries(['pass','fail','pending','failed','not-run'].map(k=>[k,rs.filter(r=>r.outcome===k).length]));
 report.primaryOutcome={definition:'All frozen expected issues and task criteria credited, no confirmed false or unsupported claims, no pending claims, and required exact tool/report/shape receipt. Collection failures and not-run remain separate; later patch execution is a different endpoint. No effectiveness verdict is inferred.',perAnswer:outcomes,byArm:Object.fromEntries(['A','B','C'].map(a=>[a,counts(outcomes.filter(r=>r.arm===a))])),bySkill:Object.fromEntries([...new Set(outcomes.map(r=>r.skill))].map(skill=>[skill,Object.fromEntries(['A','B','C'].map(a=>[a,counts(outcomes.filter(r=>r.skill===skill&&r.arm===a))]))])),byRepeat:Object.fromEntries([1,2,3].map(n=>[n,Object.fromEntries(['A','B','C'].map(a=>[a,counts(outcomes.filter(r=>r.repeat===n&&r.arm===a))]))]))};
 report.metricMeaning='Frozen-label agreement is not complete-answer correctness; novel supported findings are oracle gaps, never automatic false positives.';
 report.artifactExecution='Collection never executes model code. Separate sandbox receipts, if produced, must be attached and reported independently.';
 return report;
}
