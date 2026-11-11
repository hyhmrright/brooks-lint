import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,validateCases,witnesses} from './case-witnesses.mjs';
import {checkArtifacts} from '../all-skills/artifacts.mjs';
test('six authored boundary cases distinguish source inventory, exact ledgers and edit authority',()=>{
 assert.deepEqual(validateCases(),{cases:6,skills:3,independentHoldouts:0});
 const w=witnesses(),get=id=>w.find(x=>x.id===id);
 assert.deepEqual(get('SR-01').trace,[0,9]);assert.equal(get('SR-01').inventorySupplied,false);
 assert.deepEqual(get('SR-02').trace,[0,9]);assert.equal(get('SR-02').inventorySupplied,true);assert(get('SR-02').originalTestPass);assert(get('SR-02').alwaysZeroMutantPass);
 const h=get('SR-03');assert.deepEqual(h.full.scores,{PR:100,Architecture:98,Debt:98,Test:78});assert.equal(h.full.composite,95);assert.equal(h.withoutPR.composite,93);assert(!('PR'in h.withoutPR.scores));assert(Math.abs(h.withoutPR.weights.Debt-1/3)<1e-14);
 assert.equal(h.exact.fullNumerator/h.exact.fullDenominator,94.5);assert.equal(h.exact.noPrNumerator/h.exact.noPrDenominator,92+2/3);
 assert(get('SR-04').incompleteRejected);assert.deepEqual(get('SR-04').known,{Architecture:84,Debt:100,Test:'unknown'});
 assert.equal(get('SR-04').counterfactuals.ifTestClean.composite,94);assert.equal(get('SR-04').counterfactuals.ifTestWarning.composite,91);
 for(const id of ['SR-05','SR-06']){assert(get(id).artifact.success,get(id).artifact.error);assert(get(id).artifact.preserved);assert.equal(get(id).artifact.modelCodeExecuted,false);}
 const report=JSON.parse(get('SR-05').validRepair).report;assert(report.includes('policy "handling"'));assert(report.includes('\n'));
 assert.notEqual(get('SR-05').artifact.beforeSha256,get('SR-05').artifact.afterSha256);assert.equal(get('SR-06').artifact.beforeSha256,get('SR-06').artifact.afterSha256);
});
test('artifact controls reject draft prefixes, unauthorized fixes, no-op positives and wrong behavior',()=>{
 const w=witnesses(),repair=w.find(x=>x.id==='SR-05').validRepair;
 assert(!checkArtifacts(cases[4],'{"report":'+repair).success);
 assert(!checkArtifacts(cases[4],repair+'\n'+repair).success);
 assert(!checkArtifacts(cases[4],JSON.stringify({report:'No repair',replacements:[]})).success);
 assert(!checkArtifacts(cases[4],JSON.stringify({report:'Incorrect fix',replacements:[{path:'calc.mjs',content:'export function total(cents) { return cents + 11; }'}]})).success);
 assert(!checkArtifacts(cases[5],repair).success);
 assert(!checkArtifacts(cases[4],JSON.stringify({report:'Wrong file',replacements:[{path:'sentinel.txt',content:'export function total(cents) { return cents + 12; }'}]})).success);
});
