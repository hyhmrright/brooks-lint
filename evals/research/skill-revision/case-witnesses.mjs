/** Trusted, authored fixture witnesses only; never invokes a model or executes model replacements. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {health} from '../all-skills/suite.mjs';
import {checkArtifacts} from '../all-skills/artifacts.mjs';
export const cases=JSON.parse(fs.readFileSync(new URL('./cases.json',import.meta.url),'utf8')).cases;
export function validateCases(){
 assert.deepEqual(cases.map(c=>c.id),['SR-01','SR-02','SR-03','SR-04','SR-05','SR-06']);
 assert.deepEqual(cases.map(c=>c.skill),['brooks-review','brooks-review','brooks-health','brooks-health','brooks-sweep','brooks-sweep']);
 for(const c of cases){
  assert.equal(c.scope,'product');assert.equal(c.cohort,'new-boundary');assert.equal(c.rubric.contractProvenance.independent,false);
  assert(c.inputs.some(f=>f.path==='task.md'));assert(c.inputs.some(f=>f.path==='contract.md'));
  assert.equal(new Set(c.inputs.map(f=>f.path)).size,c.inputs.length);
  assert(c.inputs.every(f=>typeof f.content==='string'&&!/rubric|oracle|witness/.test(f.path)));
  assert(c.rubric.evidence.length>=3);assert(Array.isArray(c.rubric[c.metricKind==='task-criteria'?'expectedCriteria':'expectedIssues']));
  if(c.skill==='brooks-sweep')assert(c.oracle);
 }
 return {cases:6,skills:3,independentHoldouts:0};
}
const input=(c,name)=>c.inputs.find(f=>f.path===name).content;
function runAuthoredReview(c){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'revision-authored-review-'));
 try{
  for(const f of c.inputs)fs.writeFileSync(path.join(dir,f.path),f.content);
  const execute=file=>{const r=spawnSync(process.execPath,[file],{cwd:dir,encoding:'utf8',timeout:2000,env:{PATH:process.env.PATH}});assert(!r.error);return {exit:r.status,stdout:r.stdout.trim()};};
  fs.writeFileSync(path.join(dir,'trace.mjs'),"import {expedite} from './fee.mjs'; console.log(JSON.stringify([expedite(false),expedite(true)]));\n");
  const observed=execute('trace.mjs');assert.equal(observed.exit,0);
  const result={trace:JSON.parse(observed.stdout),inventorySupplied:c.inputs.some(f=>f.path==='unit.test.mjs')};
  if(result.inventorySupplied){result.originalTestPass=execute('unit.test.mjs').exit===0;fs.writeFileSync(path.join(dir,'fee.mjs'),'export function expedite(enabled) { return 0; }\n');result.alwaysZeroMutantPass=execute('unit.test.mjs').exit===0;}
  return result;
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
export function witnesses(){
 validateCases();
 const first=runAuthoredReview(cases[0]),second=runAuthoredReview(cases[1]);
 const ledger=JSON.parse(input(cases[2],'ledger.json'));
 const full=health({...ledger,diff:true}),withoutPR=health({...ledger,diff:false});
 const partial=JSON.parse(input(cases[3],'ledger.json'));let incompleteRejected=false;try{health(partial);}catch{incompleteRejected=true;}
 const ifTestClean=health({...partial,Test:[]}),ifTestWarning=health({...partial,Test:['Warning']});
 const validRepair=JSON.stringify({report:'The policy "handling" adds 12 but source adds 10.\nVerification was not executed.',replacements:[{path:'calc.mjs',content:'export function total(cents) { return cents + 12; }\n'}]});
 const refusal=JSON.stringify({report:'Read-only: the function adds 10 instead of the required 12; no edits or tests performed.',replacements:[]});
 return [
  {id:'SR-01',...first},
  {id:'SR-02',...second},
  {id:'SR-03',full,withoutPR,exact:{fullNumerator:9450,fullDenominator:100,noPrNumerator:6950,noPrDenominator:75}},
  {id:'SR-04',known:{Architecture:ifTestClean.scores.Architecture,Debt:ifTestClean.scores.Debt,Test:'unknown'},incompleteRejected,counterfactuals:{ifTestClean,ifTestWarning}},
  {id:'SR-05',validRepair,artifact:checkArtifacts(cases[4],validRepair)},
  {id:'SR-06',refusal,artifact:checkArtifacts(cases[5],refusal)},
 ];
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(witnesses(),null,2));
