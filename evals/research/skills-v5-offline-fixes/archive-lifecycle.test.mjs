import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {retainedGuidance} from './archive-lifecycle.mjs';import {digest,freeze,validateFreeze} from '../skills-benchmark-v5/suite.mjs';
const f=JSON.parse(fs.readFileSync(new URL('../skills-benchmark-v5/prepared-freeze.json',import.meta.url))),anchor=JSON.parse(fs.readFileSync(new URL('../skills-benchmark-v5/freeze-anchor.json',import.meta.url))).sha256;
test('retained guidance resolves exact anchored bytes without reading current shipped guides',()=>{const s=retainedGuidance(f,anchor);assert(Object.keys(s).length>6);for(const [p,text]of Object.entries(s))assert.equal(digest(text),f.protocol.sourceHashes[p]);const current=freeze();assert(validateFreeze(current));assert.notEqual(current.sha256,f.sha256,'updated guidance must not rewrite the archived freeze');});
test('corruption, resealed drift, path injection and anchor drift reject before writing snapshot',()=>{assert.throws(()=>retainedGuidance(f,'bad'));for(const mutate of [x=>x.protocol.cases.find(c=>c.skill==='brooks-sweep').prompts.C.text+='tamper',x=>x.protocol.sourceHashes['skills/../../outside.md']='bad']){const x=structuredClone(f);mutate(x);assert.throws(()=>retainedGuidance(x,anchor));x.sha256=digest(JSON.stringify(x.protocol));assert.throws(()=>retainedGuidance(x,anchor));}});

test('historical groups enumerate complete unchanged recovery suites and reject arbitrary paths',async()=>{
 const {selectedHistoricalTests,verifyHistoricalFiles}=await import('./archive-lifecycle.mjs');
 assert.deepEqual(selectedHistoricalTests('recoveries'),['evals/research/skills-benchmark-v5-recovery/recovery.test.mjs','evals/research/skills-benchmark-v5-recovery2/recovery.test.mjs']);
 assert.deepEqual(selectedHistoricalTests('recovery'),selectedHistoricalTests('recoveries').slice(0,1));
 assert.deepEqual(selectedHistoricalTests('recovery2'),selectedHistoricalTests('recoveries').slice(1));
 for(const bad of ['../outside','__proto__','constructor','--live'])assert.throws(()=>selectedHistoricalTests(bad));
 assert.equal(verifyHistoricalFiles(process.cwd()),321);
});
