import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {merged as previousMerged} from '../health-sweep-cli169-recovery/review.mjs';
import {packets,assess} from '../health-sweep-cli169/review.mjs';
import {verify,summary} from './runner.mjs';
import {recoveryDirectory,annotationFile,recoveryAnnotations,read,write} from './suite.mjs';
export function preserved(){const prior=previousMerged(recoveryDirectory);const retained=prior.records.filter(r=>r.status==='completed');assert.equal(retained.length,40);const grades=[...read(annotationFile),...read(recoveryAnnotations)];assert.equal(grades.length,40);assess({...prior,records:retained},grades);return {prior,retained,grades};}
export function merged(out){const {prior,retained}=preserved(),next=verify(out);assert(!next.state.simulation,'Simulation cannot enter semantic review');return {f:prior.f,state:{...next.state,recovery:summary(next.state),priorFailures:[prior.state.priorFailure,{ordinal:41,rawSha256:prior.records.at(-1).rawSha256}],records:[...retained,...next.state.records]},records:[...retained,...next.records]};}
export function combineAnnotations(run,newAnnotations){const old=preserved().grades;const newIds=new Set(packets(run).filter(p=>p.ordinal>=41).map(p=>p.responseId));assert.equal(newAnnotations.length,newIds.size);assert.equal(new Set(newAnnotations.map(a=>a.responseId)).size,newAnnotations.length,'Duplicate new annotation');assert(newAnnotations.every(a=>newIds.has(a.responseId)),'Only new answers can be graded');return [...old,...newAnnotations];}
export function assessMerged(out,newAnnotations){const run=merged(out);return assess(run,combineAnnotations(run,newAnnotations));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [cmd,out,a,b]=process.argv.slice(2);if(cmd==='packets'){assert(a&&!b);write(a,packets(merged(out)).filter(p=>p.ordinal>=41));}else if(cmd==='assess'){assert(a&&b);write(b,assessMerged(out,read(a)));}else throw Error('packets RUN NEW_PACKETS | assess RUN NEW_ONLY_ANNOTATIONS NEW_REPORT');}
