import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {finalizeTool,toolSpec as original,toolName,admitToolRequest} from '../health-sweep-cli169/tool.mjs';
export {toolName,admitToolRequest};
export const toolSpec={...original,description:original.description+' Assembly must use this turn\'s latest successful finalize receipt. Successful re-finalization invalidates older assemblies; return the latest assembled deliveryJson exactly. Never reuse another turn\'s receipt.'};
export function createTurnTool(){
 const scope=crypto.randomUUID();let generation=0,current=null,assembled=null;
 return {call(args){
  if(args.action==='finalize'){
   const result=finalizeTool(args);generation++;assembled=null;
   const token={scope,generation};result.reports[0].receipt={...result.reports[0].receipt,turnBinding:token};
   current={ledger:structuredClone(args.dashboards[0].ledger),report:result.finalReport,receipt:structuredClone(result.reports[0].receipt)};return result;
  }
  assert(current,'Finalize required');assert.deepEqual(args.ledger,current.ledger,'Superseded ledger');assert.equal(args.finalReport,current.report,'Superseded report');assert.deepEqual(args.receipt,current.receipt,'Stale or foreign receipt');
  const unbound=structuredClone(args);delete unbound.receipt.turnBinding;
  const result=finalizeTool(unbound);assembled=result.deliveryJson;return {...result,turnBinding:{scope,generation}};
 },accept(answer){assert(assembled!==null,'Latest artifact has not been assembled');assert.equal(answer,assembled,'Final response differs from latest assembly');return true;},snapshot(){return{generation,assembled:assembled!==null,scope,latestReceipt:current?.receipt??null};}};
}
