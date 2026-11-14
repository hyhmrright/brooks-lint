/** Host-only adapter. Both arms receive this exact tool; no filesystem or network input. */
import assert from 'node:assert/strict';
import {finalizeTool as finalize,toolSpec as oldSpec} from '../health-tool-retest/tool.mjs';
import {assembleDelivery,verifyDelivery} from '../../../skills/brooks-health/scripts/deliver-dashboard.mjs';
export const toolName='brooks_health_finalize';
export const toolSpec={...oldSpec,description:'Finalize one ledger and score-free draft, preserving all whitespace. Use action finalize with dashboards:[{ledger,draft}]. Then use the REQUIRED action assemble with ledger, finalReport, receipt and fields (object without report) to obtain deliveryJson using the shipped deterministic delivery helper. Return the decoded report or complete JSON required by the task unchanged. Host output alone is not your final answer. No filesystem, shell, network or patch execution.',inputSchema:{type:'object',properties:{action:{enum:['finalize','assemble']},dashboards:{type:'array'},ledger:{type:'object'},finalReport:{type:'string'},receipt:{type:'object'},fields:{type:'object'}},required:['action'],additionalProperties:false}};
export function finalizeTool(args){
 assert(args&&typeof args==='object'&&!Array.isArray(args));assert(Buffer.byteLength(JSON.stringify(args))<=131072);
 if(args.action==='finalize'){assert.deepEqual(Object.keys(args).sort(),['action','dashboards']);assert.equal(args.dashboards.length,1);return finalize({dashboards:args.dashboards});}
 assert.equal(args.action,'assemble');assert.deepEqual(Object.keys(args).sort(),['action','fields','finalReport','ledger','receipt']);
 const deliveryJson=assembleDelivery(args.ledger,args.finalReport,args.receipt,args.fields);
 return {deliveryJson,receipt:verifyDelivery(args.ledger,args.finalReport,args.receipt,JSON.parse(deliveryJson).report),scope:'host assembled string only; final agent response and semantics are separate'};
}

export const MAX_TOOL_REQUESTS=8;
export function admitToolRequest(p,{threadId,turnId,ids,count}) {
 assert(threadId&&turnId&&p?.threadId===threadId&&p?.turnId===turnId&&p.tool===toolName&&(p.namespace===undefined||p.namespace===null)&&typeof p.callId==='string'&&p.callId,'Invalid scoring request scope');
 assert(!ids.has(p.callId),'Duplicate scoring call ID');
 assert(count<MAX_TOOL_REQUESTS,'Scoring request limit exceeded (8)');
}
const finding={type:'object',additionalProperties:false,required:['id','severity'],properties:{id:{type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9._-]*$'},risk:{type:'string',pattern:'^(?:[RT][1-6]|C[0-9]+)$'},severity:{enum:['critical','warning','suggestion']}}};
const dimension={type:'object',additionalProperties:false,required:['status'],properties:{status:{enum:['assessed','unassessed','skipped']},findings:{type:'array',maxItems:3,items:finding},reason:{type:'string',minLength:1}}};
export const ledgerSchema={type:'object',additionalProperties:false,required:['hasDiff','dimensions'],properties:{strictness:{enum:['strict','balanced','legacy-friendly']},hasDiff:{type:'boolean'},suppliedCappedLedger:{type:'boolean'},dimensions:{type:'object',additionalProperties:false,required:['pr','architecture','debt','test'],properties:Object.fromEntries(['pr','architecture','debt','test'].map(k=>[k,dimension]))}}};
toolSpec.inputSchema.properties.ledger=ledgerSchema;
toolSpec.inputSchema.properties.dashboards={type:'array',minItems:1,maxItems:1,items:{type:'object',additionalProperties:false,required:['ledger','draft'],properties:{ledger:ledgerSchema,draft:{type:'string'}}}};
toolSpec.description+=' At most 8 tool requests per submitted turn, counting rejected payloads and both actions. Scope violations or repeated call IDs terminate the turn; invalid payloads consume a request and return an error. No model request is retried. Ledger requires hasDiff and all four dimensions; consult the shared input contract for status constraints. Fields are protocol syntax, not prefilled case judgments.';
