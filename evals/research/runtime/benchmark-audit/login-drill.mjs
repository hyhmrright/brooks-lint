/** Deterministic fake process responses, real process cleanup; never invokes Codex or a provider. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {freeze,register,execute,digest,assemble} from './login-runner.mjs';
const [out]=process.argv.slice(2);
assert(out&&!fs.existsSync(out),'New artifact directory required');
assert.equal(process.platform,'darwin','Darwin cleanup observation required');
fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const frozen=freeze();write('frozen-protocol.json',frozen);
const registered=register({frozen,anchor:frozen.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',authorization:'SYNTHETIC OFFLINE PROCESS FIXTURE ONLY; no live authorization'});
const fixture=fileURLToPath(new URL('./login-fixture.cjs',import.meta.url));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'benchmark-login-drill-'));
try{
  const run=path.join(tmp,'run');
  const summary=await execute(registered,registered.sha256,run,{fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[fixture,'ok']});
  assert.equal(summary.stopped,null);assert.equal(summary.executed,54);
  const archive={},inventory=[];
  function collect(dir,relative=''){
    for(const name of fs.readdirSync(dir).sort()){
      if(name.startsWith('checkpoint-')||name==='responses-initial.json')continue; // redundant snapshots; final rows and each attempt remain
      const rel=relative?`${relative}/${name}`:name,full=path.join(dir,name);
      if(fs.statSync(full).isDirectory())collect(full,rel);
      else{const content=fs.readFileSync(full,'utf8');archive[rel]=content;inventory.push({path:rel,sha256:digest(content),bytes:Buffer.byteLength(content)});}
    }
  }
  collect(run);
  const compressed=gzipSync(JSON.stringify({simulation:true,format:'relative paths to exact UTF-8 raw artifact contents',files:archive}));
  fs.writeFileSync(path.join(out,'offline-raw.json.gz'),compressed,{flag:'wx'});
  write('offline-raw-inventory.json',{simulation:true,archiveSha256:digest(compressed),files:inventory});
  write('execution.json',summary);
  const sizes=Object.fromEntries(['A','B','C'].map(arm=>{const values=frozen.protocol.schedule.turns.filter(t=>t.arm===arm).map(t=>Buffer.byteLength(assemble(frozen,t)));return [arm,{calls:values.length,minBytes:Math.min(...values),maxBytes:Math.max(...values),totalBytes:values.reduce((a,b)=>a+b,0)}]}));
  write('readiness.json',{status:'offline-process-fixture-passed-live-model-pending',simulation:true,protocolSha256:frozen.sha256,fixtureSourceSha256:digest(fs.readFileSync(fixture)),node:process.version,platform:process.platform,model:'gpt-fixture (fake process label; no model called)',cliVersion:'0.167.0 (simulated initialize metadata; not installed CLI verification)',promptSizes:sizes,budget:frozen.protocol.budget,summary,archiveSha256:digest(compressed),independence:'same-workflow synthetic fixture; not model evaluation'});
  console.log(JSON.stringify({protocolSha256:frozen.sha256,promptSizes:sizes,summary},null,2));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
