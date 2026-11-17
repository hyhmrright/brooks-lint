import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {here, loadCases, read} from './plan.mjs';
import {probePreflight, replay} from './probe.mjs';

const binding = await probePreflight();
const expected=read(path.join(here,'cases','expectations.json'));
const results=[];
async function check(c, source, edits, phase, key) {
  const result=await replay(c,source,edits,phase);
  assert(result.checkedPolicy && result.cleanupConfirmed && !result.error,
    'Oracle isolation failed: '+JSON.stringify(result));
  assert.deepEqual(result.checks,expected[c.id][key],c.id+'/'+key+' '+JSON.stringify(result));
  results.push({id:c.id,key,checks:result.checks,policyChecked:true,cleanupConfirmed:true});
}
for(const c of loadCases()) {
  await check(c,c.tree,{},'final','initial');
  if(c.base) await check(c,c.base,{},'baseline','base');
  if(expected[c.id].patched) {
    const source=path.join(here,'cases',c.id,'reference');
    const edits=Object.fromEntries(c.writable.map(file=>[file,fs.readFileSync(path.join(source,file),'utf8')]));
    await check(c,c.tree,edits,'final','patched');
  }
}
console.log(JSON.stringify({simulation:true, binding, executions:results.length, results},null,2));
