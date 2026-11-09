import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p));
const doc=JSON.parse(read('commands.json'));
assert.equal(doc.real_model_calls,0);assert.equal(doc.records.length,11);
const image='sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8';
assert.equal(doc.image,image);
for(const [i,r] of doc.records.entries()){
 assert.equal(r.exit_code,i===4?1:0);
 const a=r.argv;assert.deepEqual(a.slice(0,3),['docker','run','--rm']);
 for(const [flag,value] of [['--network','none'],['--user','1000:1000'],['--cap-drop','ALL'],['--security-opt','no-new-privileges'],['--memory','512m'],['--cpus','1']])assert.equal(a[a.indexOf(flag)+1],value);
 assert.ok(a.includes('--read-only'));assert.ok(a.includes(image));
 assert.ok(!a.some(v=>['--mount','-v','--volume','--privileged','--publish','-p'].includes(v)));
 for(const f of Object.values(r.files)){
  assert.match(f.path,/^raw\/[a-z0-9-]+\.(txt|json)$/);const b=read(f.path);
  assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);
 }
}
assert.match(read('raw/0-stdout.txt').toString(),/codex-cli 0\.167\.0/);
assert.match(read('raw/4-stderr.txt').toString(),/No permissions to create a new namespace/);
const schema=JSON.parse(read('raw/schema-stdout.json'));assert.equal(schema.generation.status,0);assert.equal(schema.file_count,470);assert.equal(schema.files.length,470);
assert.ok(schema.selected.find(x=>x.path==='v2/EnvironmentAddParams.json').schema.properties.execServerUrl);
assert.ok(schema.selected.find(x=>x.path==='v2/ThreadStartParams.json').schema.properties.environments);
const h=JSON.parse(read('raw/handshake-stdout.json'));
assert.equal(h.real_model_calls,0);assert.equal(h.live_ready,false);assert.equal(h.actual_model,null);assert.equal(h.error,undefined);
assert.deepEqual(h.requests.map(x=>x.method),['initialize','environment/add','environment/info','environment/status','environment/add','environment/info','environment/status']);
const event=id=>{const e=h.events.filter(x=>x.id===id);assert.equal(e.length,1);return e[0];};
assert.deepEqual(event(2).result,{});assert.equal(event(3).result.shell.path,'/bin/bash');assert.equal(event(4).result.status,'ready');
assert.match(event(6).error.message,/401 Unauthorized/);assert.equal(event(7).result.status,'unknown');
assert.equal(doc.records[10].argv.at(-1),read('handshake-probe.cjs').toString());
console.log('PASS: 11 pinned offline CLI discovery commands; native handshake positive/negative evidence intact; full segregation remains unverified.');
