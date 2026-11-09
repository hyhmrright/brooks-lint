import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.join(here,'transport');
const hash=b=>createHash('sha256').update(b).digest('hex');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'inventory.json')));
for(const [name,digest] of Object.entries(inventory)){
 assert(!path.isAbsolute(name)&&!name.split('/').includes('..'));
 assert.equal(hash(fs.readFileSync(path.join(root,name))),digest,name);
}
for(const name of ['native-upstream-transport.mjs','native-upstream-transport.test.mjs']){
 assert.equal(hash(fs.readFileSync(path.resolve(here,'../../../../evals/research/runtime/prospective',name))),inventory['sources/'+name]);
}
const files=fs.readdirSync(path.join(root,'observations')).sort();assert.equal(files.length,53);
let requests=0;const tests=new Set();
for(const file of files){
 const x=JSON.parse(fs.readFileSync(path.join(root,'observations',file)));tests.add(x.test);
 assert.equal(x.simulation,true);assert.equal(x.real_model_calls,0);
 for(const r of x.observed){requests++;assert.equal(r.auth_matches,true);assert.equal(r.response_terminal,true);
  assert(['/v1/responses','/v1/responses/input_tokens'].includes(r.path));
  assert.deepEqual(JSON.parse(Buffer.from(r.request_base64,'base64')),r.body);
  const response=Buffer.concat(r.response_chunks.map(c=>Buffer.from(c,'base64')));
  assert.equal(response.length,r.response_bytes);assert.equal(hash(response),r.response_sha256);
  assert(Number.isInteger(r.response_status)&&r.response_status>=100&&r.response_status<=599);
 }
}
assert(tests.size>=49);assert.equal(requests,42);
const tap=fs.readFileSync(path.join(root,'tests.tap'),'utf8');
assert.match(tap,/tests 53/);assert.match(tap,/pass 53/);assert.match(tap,/fail 0/);assert.match(tap,/skipped 0/);
console.log('PASS: 53 local TLS fixture archives, 42 HTTP receipts, complete server capture and source binding. No real provider request.');
