import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {cases}=JSON.parse(readFileSync(new URL('./sweep-boundaries.json',import.meta.url),'utf8'));
const sortCopy=xs=>[...xs].sort((a,b)=>a-b);
test('same implementation satisfies bounded integer witness but violates explicit validation witness',()=>{const p=cases.find(c=>c.id==='protected-domain'), input=structuredClone(p.input);assert.deepEqual(sortCopy(input),p.expectedOutput);assert.deepEqual(input,p.input);const v=cases.find(c=>c.id==='explicit-validation');assert.doesNotThrow(()=>sortCopy(v.input));assert(v.input.some(n=>!Number.isInteger(n)));});
test('calibration inventory preserves distinct stop-boundary annotations (not a semantic evaluator)',()=>{assert.equal(new Set(cases.map(c=>c.id)).size,6);for(const c of cases){assert(c.rationale);assert.equal(typeof c.expectedReplacements,'number');}assert.equal(cases.filter(c=>c.expectedStop==='verification-blocked').length,2);assert.equal(cases.find(c=>c.id==='budget-and-blocker').contract,null);});
