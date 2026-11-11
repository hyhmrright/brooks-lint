/** Versioned guide-revision development comparison. No imports start model calls. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {digest,score,root} from '../all-skills/suite.mjs';
export {digest,score,root};
export const directory=path.dirname(fileURLToPath(import.meta.url));
export const targets=['brooks-review','brooks-health','brooks-sweep'];
export const baseline=JSON.parse(fs.readFileSync(path.join(directory,'baseline.json')));
export function oldFreeze(){const value=JSON.parse(fs.readFileSync(path.join(root,baseline.freezePath)));assert.equal(value.sha256,baseline.freezeSha256,'Historical baseline anchor changed');assert.equal(digest(value.protocol),baseline.freezeSha256,'Historical baseline content changed');return value;}
export function cases(){
 const old=oldFreeze().protocol.cases.filter(c=>targets.includes(c.skill)).map(c=>({...structuredClone(c),cohort:'historical-development',originalRubric:structuredClone(c.rubric)}));
 // Prospective equivalence rules for this NEW comparison; original frozen gold stays untouched.
 for(const c of old){
  if(c.id==='AS-01')c.rubric.evidence[1]='Trace any valid concrete cents/points example in the mismatched eligibility interval to distinct checkout and preview amounts';
  if(c.id==='AS-04'){
   c.rubric.evidence[0]='Trace a valid concrete cents input through the supplied floor calculation, correctly including any fractional discarded part';
   c.rubric.evidence[2]='Explain at least two compatible rounding contracts with different expected outcomes for a valid concrete example, and why the missing policy prevents a defect verdict';
  }
  if(c.id==='AS-35')c.rubric.evidence[1]='Show that a behavior-preserving private rename or equivalent expression preserves quote output while breaking the source regex assertion';
 }
 const extra=JSON.parse(fs.readFileSync(path.join(directory,'cases.json')));
 const values=Array.isArray(extra)?extra:extra.cases;
 return [...old,...values.map(c=>({...c,cohort:'new-same-workflow-boundaries'}))];
}
export function validate(){const all=cases();assert.equal(all.length,22);assert.equal(new Set(all.map(c=>c.id)).size,22);assert.equal(all.filter(c=>c.cohort==='historical-development').length,16);for(const skill of targets){assert.equal(all.filter(c=>c.skill===skill&&c.cohort==='new-same-workflow-boundaries').length,2);}for(const c of all){assert(targets.includes(c.skill));assert(['diagnostic','task-criteria'].includes(c.metricKind));assert(c.inputs.some(i=>i.path==='task.md'));assert(c.inputs.every(i=>typeof i.content==='string'&&!/rubric|oracle|witness/i.test(i.path)));assert(Array.isArray(c.rubric.evidence)&&c.rubric.evidence.length>=2);assert(Array.isArray(c.metricKind==='task-criteria'?c.rubric.expectedCriteria:c.rubric.expectedIssues));assert(c.rubric.contractProvenance.independent===false);if(c.skill==='brooks-sweep')assert(c.oracle);}return {cases:22,historical:16,newBoundaries:6,independentHoldouts:0};}
