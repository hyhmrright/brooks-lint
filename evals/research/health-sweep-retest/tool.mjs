/** Host-only adapter. Both arms receive this exact tool; no filesystem or network input. */
import assert from 'node:assert/strict';
import {finalizeTool as finalize,toolSpec as oldSpec} from '../health-tool-retest/tool.mjs';
import {assembleDelivery,verifyDelivery} from '../../../skills/brooks-health/scripts/deliver-dashboard.mjs';
export const toolName='brooks_health_finalize';
export const toolSpec={...oldSpec,description:'Finalize one ledger and score-free draft, preserving all whitespace. Use action finalize with dashboards:[{ledger,draft}]. Then optionally use action assemble with ledger, finalReport, receipt and fields (object without report) to obtain deliveryJson using the shipped deterministic delivery helper. Return the decoded report or complete JSON required by the task unchanged. Host output alone is not your final answer. No filesystem, shell, network or patch execution.',inputSchema:{type:'object',properties:{action:{enum:['finalize','assemble']},dashboards:{type:'array'},ledger:{type:'object'},finalReport:{type:'string'},receipt:{type:'object'},fields:{type:'object'}},required:['action'],additionalProperties:false}};
export function finalizeTool(args){
 assert(args&&typeof args==='object'&&!Array.isArray(args));assert(Buffer.byteLength(JSON.stringify(args))<=131072);
 if(args.action==='finalize'){assert.deepEqual(Object.keys(args).sort(),['action','dashboards']);assert.equal(args.dashboards.length,1);return finalize({dashboards:args.dashboards});}
 assert.equal(args.action,'assemble');assert.deepEqual(Object.keys(args).sort(),['action','fields','finalReport','ledger','receipt']);
 const deliveryJson=assembleDelivery(args.ledger,args.finalReport,args.receipt,args.fields);
 return {deliveryJson,receipt:verifyDelivery(args.ledger,args.finalReport,args.receipt,JSON.parse(deliveryJson).report),scope:'host assembled string only; final agent response and semantics are separate'};
}
