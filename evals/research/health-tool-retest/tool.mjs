/** Host-only deterministic scoring. No paths, commands or network are accepted. */
import assert from 'node:assert/strict';
import {finalizeDashboard,verifyDashboard} from '../../../skills/brooks-health/scripts/score-dashboard.mjs';
export const toolName='brooks_health_finalize';
export const toolSpec={type:'function',name:toolName,description:'Finalize and verify one or two health dashboards from supplied ledgers and score-free drafts. Each draft must include exactly one <!-- BROOKS_HEALTH_SCORE --> placeholder. Returns reports joined by two newlines as finalReport and verification receipts. Return finalReport unchanged as your final answer. This validates score arithmetic, not the truth of findings.',inputSchema:{type:'object',additionalProperties:false,required:['dashboards'],properties:{dashboards:{type:'array',minItems:1,maxItems:2,items:{type:'object',additionalProperties:false,required:['ledger','draft'],properties:{ledger:{type:'object',additionalProperties:true},draft:{type:'string'}}}}}}};
export function finalizeTool(args){
 assert(args&&typeof args==='object'&&!Array.isArray(args));assert.deepEqual(Object.keys(args),['dashboards']);assert(Array.isArray(args.dashboards)&&args.dashboards.length>=1&&args.dashboards.length<=2);
 assert(Buffer.byteLength(JSON.stringify(args))<=131072,'Tool input too large');
 const reports=args.dashboards.map(d=>{assert.deepEqual(Object.keys(d).sort(),['draft','ledger']);assert.equal(typeof d.draft,'string');const report=finalizeDashboard(d.ledger,d.draft);return {report,receipt:verifyDashboard(d.ledger,report)};});
 return {finalReport:reports.map(x=>x.report).join('\n\n'),reports};
}
export function toolOutcome(c,arm,raw){
 const calls=raw.tool_calls??[],successful=calls.filter(x=>x.success),last=successful.at(-1);
 const required=arm==='B'&&!['AS-24','AS-25'].includes(c.id);
 const prohibited=c.id==='AS-25';
 const expectedReports=c.id==='SR-03'?2:1;
 return {required,prohibited,calls:calls.length,successfulCalls:successful.length,
   exactFinalMatch:!!last&&raw.answer===last.result.finalReport,
   expectedReports,actualReports:last?.result.reports.length??0,
   workflowPassed:arm==='A'?null:prohibited?calls.length===0:!required&&calls.length===0?true:!!last&&raw.answer===last.result.finalReport&&last.result.reports.length===expectedReports,
   limitation:'Tool receipts establish consistency with model-submitted ledger, not ledger correctness. Semantic adjudication remains required.'};
}
