import assert from 'node:assert/strict';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {anchored as original,read,write} from '../capability-efficacy-v2/suite.mjs';
import {packets,assess} from '../capability-efficacy-v2/review.mjs';
import {verify,summary} from './runner.mjs';import {withPrior,results} from './archive.mjs';import {anchored} from './suite.mjs';
export function merge(prior,next,{simulation=false}={}){
 const f=original(),recovery=anchored();assert.equal(prior.f.sha256,f.sha256);assert.equal(next.f.sha256,recovery.sha256);assert(simulation||!next.state.simulation,'Simulation cannot be real evidence');assert.equal(prior.state.simulation,false);
 const kept=prior.records.filter(r=>r.status==='completed');assert.deepEqual(kept.map(r=>r.ordinal),Array.from({length:38},(_,i)=>i+1));
 assert.deepEqual(next.state.records.map(({ordinal,id,arm,repeat})=>({ordinal,id,arm,repeat})),f.schedule.slice(38));
 const added=next.records.filter(r=>r.status==='completed');const records=[...kept,...added];assert.equal(new Set(records.map(r=>r.ordinal)).size,records.length);for(const r of records){const slot=f.schedule[r.ordinal-1];for(const k of ['ordinal','id','arm','repeat'])assert.equal(r[k],slot[k]);}
 return{f,state:{simulation:next.state.simulation,stopped:next.state.stopped,observedTokens:prior.state.observedTokens+next.state.observedTokens,elapsedMs:prior.state.elapsedMs+next.state.elapsedMs},records,history:{priorPlanSha256:prior.f.sha256,recoveryPlanSha256:next.f.sha256,retainedFailedOrdinals:prior.records.filter(r=>r.status==='failed').map(r=>r.ordinal),recovery:summary(next.state)}};
}
export function merged(out){const next=verify(out);return withPrior(prior=>merge(prior,next));}
export function mergedAnnotations(newAnnotations){const old=read(path.join(results,'annotations.json')),all=[...old,...newAnnotations];assert.equal(new Set(all.map(a=>a.responseId)).size,all.length,'Duplicate annotation');return all;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[cmd,out,a,b]=process.argv.slice(2);if(cmd==='packets')write(a,packets(verify(out)));else if(cmd==='merged-packets')write(a,packets(merged(out)));else if(cmd==='assess'){const run=merged(out),annotations=mergedAnnotations(read(a));write(b,{...assess(run,annotations),recoveryHistory:run.history});}else throw Error('packets RUN NEW_PACKETS | merged-packets RUN ALL_PACKETS | assess RUN NEW_ANNOTATIONS REPORT');}
