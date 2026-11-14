/** Replay the historical suite against its retained skill snapshot, never today's files. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {digest,validateFreeze,freeze,root} from '../skills-benchmark-v5/suite.mjs';
export function retainedGuidance(f,anchor){
 validateFreeze(f);assert.equal(f.sha256,anchor);
 const c=f.protocol.cases.find(c=>c.skill==='brooks-sweep');assert(c);
 const files=Object.keys(f.protocol.sourceHashes).filter(p=>p.startsWith('skills/')).sort();
 const text=c.prompts.C.text;assert.equal(digest(text),c.prompts.C.sha256);
 const result={};
 for(let i=0;i<files.length;i++){
  const file=files[i];assert(/^skills\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\.md$/.test(file),'unsafe snapshot path');
  const marker=`FILE ${file}\n`,start=text.indexOf(marker);assert(start>=0);assert.equal(text.indexOf(marker,start+1),-1,'ambiguous snapshot marker');
  const next=`\n\nFILE ${files[i+1]??c.inputs[0].path}\n`,end=text.indexOf(next,start+marker.length);assert(end>=0);
  const content=text.slice(start+marker.length,end);assert.equal(digest(content),f.protocol.sourceHashes[file],file);result[file]=content;
 }
 return result;
}
const historicalGroups = Object.freeze({
 suite: ['evals/research/skills-benchmark-v5/suite.test.mjs'],
 recovery: ['evals/research/skills-benchmark-v5-recovery/recovery.test.mjs'],
 recovery2: ['evals/research/skills-benchmark-v5-recovery2/recovery.test.mjs'],
 recoveries: ['evals/research/skills-benchmark-v5-recovery/recovery.test.mjs', 'evals/research/skills-benchmark-v5-recovery2/recovery.test.mjs'],
});
export function selectedHistoricalTests(group = 'suite') {
 assert(Object.hasOwn(historicalGroups, group), 'Unknown historical test group');
 return [...historicalGroups[group]];
}
export function verifyHistoricalFiles(base) {
 const hashes = JSON.parse(fs.readFileSync(path.join(base, 'docs/research/skills-benchmark-v5-recovery2/history-hashes.json')));
 assert.equal(Object.keys(hashes).length, 321);
 for (const [file, sha] of Object.entries(hashes)) {
  assert(!path.isAbsolute(file) && !file.split(/[\\/]/).some(x => x === '..' || x === '.' || !x), 'Unsafe history path');
  assert.equal(digest(fs.readFileSync(path.join(base, file))), sha, `Historical file changed: ${file}`);
 }
 return Object.keys(hashes).length;
}
export function replayHistoricalSuite(group = 'suite'){
 const tests = selectedHistoricalTests(group);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-v5-archive-'));
 try{
  const base=path.join(root,'evals/research/skills-benchmark-v5');const f=JSON.parse(fs.readFileSync(path.join(base,'prepared-freeze.json'))),anchor=JSON.parse(fs.readFileSync(path.join(base,'freeze-anchor.json'))).sha256;
  const snapshot=retainedGuidance(f,anchor);
  for(const name of ['evals','scripts','skills','docs'])fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});
  fs.copyFileSync(path.join(root,'package.json'),path.join(dir,'package.json'));
  // Remove current Markdown first so newly added guidance cannot enter the historical snapshot.
  for(const sub of fs.readdirSync(path.join(dir,'skills'),{withFileTypes:true}))if(sub.isDirectory())for(const p of fs.readdirSync(path.join(dir,'skills',sub.name)))if(p.endsWith('.md'))fs.unlinkSync(path.join(dir,'skills',sub.name,p));
  for(const [file,content] of Object.entries(snapshot)){const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
  const historyCount=verifyHistoricalFiles(dir);
  for(const testFile of tests){
   const r=spawnSync(process.execPath,['--test',testFile],{cwd:dir,encoding:'utf8',timeout:900000,maxBuffer:8*1024*1024});
   process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');
   if(r.error)throw r.error;
   assert.equal(r.status,0,`historical test failed: ${testFile}`);
  }
  assert.equal(verifyHistoricalFiles(dir),historyCount);
  assert.equal(verifyHistoricalFiles(root),historyCount);
  const current=freeze();assert(validateFreeze(current));assert.equal(current.protocol.schedule.length,324);console.log(JSON.stringify({historicalFreeze:f.sha256,currentProspectiveFreeze:current.sha256,guidanceFiles:Object.keys(snapshot).length,historicalFiles:historyCount,group,tests,liveCalls:0}));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert(process.argv.length<=3, 'Expected at most one historical test group');replayHistoricalSuite(process.argv[2]);}
