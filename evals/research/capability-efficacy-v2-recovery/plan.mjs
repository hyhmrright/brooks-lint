import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {anchored,hash,read,write,root} from '../capability-efficacy-v2/suite.mjs';
export const directory=path.dirname(fileURLToPath(import.meta.url));
export function build(){
 const f=anchored();
 const files=['plan.mjs','runner.mjs','protocol.test.mjs'].map(p=>'evals/research/capability-efficacy-v2-recovery/'+p).concat(['docs/research/capability-efficacy-v2-recovery/README.md',...['REPORT.md','attempt.txt'].map(p=>'docs/research/capability-efficacy-v2/results/2026-11-15-preflight-stopped/'+p)]);
 const body={version:1,parentSha256:f.sha256,prior:{modelSubmissions:0,answers:0,observedTokens:0,kind:'sandbox-preflight-denied',durationMs:null},model:f.model,effort:f.effort,cliVersion:f.cliVersion,budget:f.budget,schedule:f.schedule,policy:{automaticRetries:0,stopOnFirstFailure:true,freshDirectory:true,liveAuthorized:false,clock:'Original collector clock starts after admission preflight; prior preflight duration unavailable and excluded. This explicitly authorizes a fresh six-hour collection window, not a cumulative wall-time claim.'},sources:Object.fromEntries(files.map(p=>[p,hash(fs.readFileSync(path.join(root,p)))]))};return {...body,sha256:hash(JSON.stringify(body))};
}
export function validate(p){assert.deepEqual(p,build(),'Recovery freeze drift');assert.equal(p.sha256,read(path.join(directory,'anchor.json')).sha256);return p;}
export function load(){return validate(read(path.join(directory,'freeze.json')));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv[2]==='freeze'){const p=build();write(path.join(directory,'freeze.json'),p);write(path.join(directory,'anchor.json'),{sha256:p.sha256});console.log(p.sha256);}else console.log(JSON.stringify(load()));}
