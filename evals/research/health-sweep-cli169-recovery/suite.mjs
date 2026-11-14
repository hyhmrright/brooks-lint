import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {anchored as original,hash,read,write,root} from '../health-sweep-cli169/suite.mjs';
export {hash,read,write,root};
export const directory=path.dirname(fileURLToPath(import.meta.url));
export const priorDirectory=path.join(root,'_workspace/health-sweep-cli169-live');
export const annotationFile=path.join(root,'docs/research/health-sweep-cli169/results/2026-11-14-stopped/annotations.json');
export const budget={calls:11,observedTokens:1620288,totalMs:9519504,turnMs:120000};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function hashes(names){return Object.fromEntries(names.sort().map(p=>[path.relative(root,p),hash(fs.readFileSync(p))]));}
// Only experiment inputs are sealed. QA reports and logs are outputs, not inputs.
export const recoverySourceFiles=[
 'evals/research/health-sweep-cli169-recovery/suite.mjs',
 'evals/research/health-sweep-cli169-recovery/runner.mjs',
 'evals/research/health-sweep-cli169-recovery/review.mjs',
 'evals/research/health-sweep-cli169-recovery/diagnostics.mjs',
 'evals/research/health-sweep-cli169-recovery/drill.mjs',
 'evals/research/health-sweep-cli169-recovery/recovery.test.mjs',
 'docs/research/health-sweep-cli169-recovery/README.md',
];
export function sources(){return hashes(recoverySourceFiles.map(p=>path.join(root,p)));}
export function freeze(){const base=original();const history=hashes(files(priorDirectory).concat(files(path.dirname(annotationFile))));const body={...base,version:4,independentCampaign:false,originalPlanSha256:base.sha256,budget,schedule:base.schedule.slice(37),history,recoverySources:sources(),prior:{attempts:38,completed:37,observedTokens:2879712,elapsedMs:1280496},lifetimeAttemptCeiling:49};delete body.sha256;return {...body,sha256:hash(JSON.stringify(body))};}
export function validate(f){const {sha256,...body}=f;assert.equal(hash(JSON.stringify(body)),sha256);const base=original();assert.equal(f.originalPlanSha256,base.sha256);for(const key of ['model','effort','cliVersion','binding','cases','sources','policy','liveAuthorized'])assert.deepEqual(f[key],base[key]);assert.deepEqual(f.schedule,base.schedule.slice(37));assert.deepEqual(f.budget,budget);assert.equal(f.independentCampaign,false);assert.deepEqual(f.prior,{attempts:38,completed:37,observedTokens:2879712,elapsedMs:1280496});assert.equal(f.lifetimeAttemptCeiling,49);assert.deepEqual(f.recoverySources,sources(),'Recovery source drift');assert.deepEqual(f.history,hashes(Object.keys(f.history).map(p=>path.join(root,p))),'Preserved history drift');return true;}
export function anchored(){const f=read(path.join(directory,'freeze.json'));validate(f);assert.equal(f.sha256,read(path.join(directory,'anchor.json')).sha256);return f;}
