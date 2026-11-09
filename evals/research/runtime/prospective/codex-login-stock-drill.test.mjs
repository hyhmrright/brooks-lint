import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {stockProbeSource,validateStockObservation} from './codex-login-stock-drill.mjs';
const dir=new URL('../../../../docs/research/runtime-preparations/2026-11-09-native-remote/codex-login-followup/stock-code-mode/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,dir));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const original=fs.readFileSync(new URL('./codex-login-probe.mjs',import.meta.url),'utf8');
for(const enabled of [false,true]){
 const name=enabled?'enabled':'disabled';
 test(`stock code mode ${name}: observed behavior and reproducible source`,()=>{
  const r=JSON.parse(read(name+'.json'));validateStockObservation(r,enabled);
  const source=stockProbeSource(original,enabled);
  assert.equal(read(name+'-source.txt').toString(),source);
  assert.equal(r.source_sha256,hash(source));
  const summary=JSON.parse(read('summary.json'));assert.equal(summary.original_probe_sha256,hash(original));
  assert.equal(summary.cases.find(c=>c.name===name).record_sha256,hash(read(name+'.json')));
 });
 test(`stock code mode ${name}: opposite outcome rejected`,()=>{
  assert.throws(()=>validateStockObservation(JSON.parse(read(name+'.json')),!enabled));
 });
 for(const [label,mutate] of [
  ['real data',r=>r.simulation=false],
  ['missing cleanup',r=>r.cleanup.absence_confirmed=false],
  ['catalog override',r=>r.catalog_override={}],
  ['wrong worker',r=>r.worker_id='wrong'],
  ['missing response',r=>r.requests.pop()],
 ])test(`stock ${name}: reject ${label}`,()=>{const r=JSON.parse(read(name+'.json'));mutate(r);assert.throws(()=>validateStockObservation(r,enabled))});
}
test('drill refuses source drift',()=>assert.throws(()=>stockProbeSource('',true)));
