import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verify as oldVerify} from '../health-sweep-cli169/runner.mjs';
import {packets,assess} from '../health-sweep-cli169/review.mjs';
import {verify,summary} from './runner.mjs';
import {priorDirectory,annotationFile,read,write} from './suite.mjs';
export function merged(out){const prior=oldVerify(priorDirectory),next=verify(out);assert(!next.state.simulation,'Simulation cannot enter semantic review');const retained=prior.records.filter(r=>r.status==='completed');assert.equal(retained.length,37);return {f:prior.f,state:{...next.state,recovery:summary(next.state),priorFailure:{ordinal:38,rawSha256:prior.records.at(-1).rawSha256},records:[...retained,...next.state.records]},records:[...retained,...next.records]};}
export function assessMerged(out,newAnnotations){const run=merged(out),old=read(annotationFile);const newIds=new Set(packets(run).filter(p=>p.ordinal>=38).map(p=>p.responseId));assert.equal(newAnnotations.length,newIds.size);assert(newAnnotations.every(a=>newIds.has(a.responseId)),'Only new answers can be graded');return assess(run,[...old,...newAnnotations]);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [cmd,out,a,b]=process.argv.slice(2);if(cmd==='packets'){assert(a&&!b);write(a,packets(merged(out)).filter(p=>p.ordinal>=38));}else if(cmd==='assess'){assert(a&&b);write(b,assessMerged(out,read(a)));}else throw Error('packets RUN NEW_PACKETS | assess RUN NEW_ONLY_ANNOTATIONS NEW_REPORT');}
