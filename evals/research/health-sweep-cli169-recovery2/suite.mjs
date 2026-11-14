import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {anchored as original,hash,read,write,root} from '../health-sweep-cli169/suite.mjs';
import {anchored as previous} from '../health-sweep-cli169-recovery/suite.mjs';
export {hash,read,write,root};
export const directory=path.dirname(fileURLToPath(import.meta.url));
export const priorDirectory=path.join(root,'_workspace/health-sweep-cli169-live');
export const annotationFile=path.join(root,'docs/research/health-sweep-cli169/results/2026-11-14-stopped/annotations.json');
export const recoveryDirectory=path.join(root,'_workspace/health-sweep-cli169-recovery-live');
export const recoveryAnnotations=path.join(root,'docs/research/health-sweep-cli169-recovery/results/2026-11-14-stopped/new-annotations.json');
export const budget={calls:8,observedTokens:1312115,totalMs:9394989,turnMs:120000};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function hashes(names){return Object.fromEntries(names.sort().map(p=>[path.relative(root,p),hash(fs.readFileSync(p))]));}
// Only experiment inputs are sealed. QA reports and logs are outputs, not inputs.
export const recoverySourceFiles=[
 'evals/research/health-sweep-cli169-recovery2/suite.mjs',
 'evals/research/health-sweep-cli169-recovery2/runner.mjs',
 'evals/research/health-sweep-cli169-recovery2/review.mjs',
 'evals/research/health-sweep-cli169-recovery2/diagnostics.mjs',
 'evals/research/health-sweep-cli169-recovery2/drill.mjs',
 'evals/research/health-sweep-cli169-recovery2/recovery.test.mjs',
 'docs/research/health-sweep-cli169-recovery2/README.md',
];
export function sources(){return hashes(recoverySourceFiles.map(p=>path.join(root,p)));}
export function freeze(){previous();const base=original();const history=hashes(files(priorDirectory).concat(files(path.dirname(annotationFile)),files(recoveryDirectory),files(path.dirname(recoveryAnnotations)),files(path.join(root,'evals/research/health-sweep-cli169-recovery'))));const body={...base,version:5,independentCampaign:false,originalPlanSha256:base.sha256,budget,schedule:base.schedule.slice(40),history,recoverySources:sources(),prior:{attempts:42,completed:40,observedTokens:3187885,elapsedMs:1405011},lifetimeAttemptCeiling:50};delete body.sha256;return {...body,sha256:hash(JSON.stringify(body))};}
export function validate(f){previous();const {sha256,...body}=f;assert.equal(hash(JSON.stringify(body)),sha256);const base=original();assert.equal(f.originalPlanSha256,base.sha256);for(const key of ['model','effort','cliVersion','binding','cases','sources','policy','liveAuthorized'])assert.deepEqual(f[key],base[key]);assert.deepEqual(f.schedule,base.schedule.slice(40));assert.deepEqual(f.budget,budget);assert.equal(f.independentCampaign,false);assert.deepEqual(f.prior,{attempts:42,completed:40,observedTokens:3187885,elapsedMs:1405011});assert.equal(f.lifetimeAttemptCeiling,50);assert.deepEqual(f.recoverySources,sources(),'Recovery source drift');assert.deepEqual(f.history,hashes(Object.keys(f.history).map(p=>path.join(root,p))),'Preserved history drift');return true;}
export function anchored(){const f=read(path.join(directory,'freeze.json'));validate(f);assert.equal(f.sha256,read(path.join(directory,'anchor.json')).sha256);return f;}
