import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const [rootArg,phase]=process.argv.slice(2);
if(!rootArg || !['baseline','final'].includes(phase)) throw Error('Expected workspace and baseline/final phase');
const root=resolve(rootArg);
const file=p=>readFile(join(root,p),'utf8');
const load=p=>import(pathToFileURL(join(root,p)));
const probe=async fn=>{try{return Boolean(await fn());}catch{return false;}};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function run(p){
  const result=spawnSync(process.execPath,[p],{cwd:root,encoding:'utf8',timeout:3000});
  if(result.error) throw result.error;
  return result;
}
const checks={};
const {readFileSync,writeFileSync,chmodSync,mkdtempSync,cpSync,rmSync}=await import('node:fs');
const {tmpdir}=await import('node:os');
const scratch=mkdtempSync(join(tmpdir(),'brooks-export-'));
try{
  cpSync(root,scratch,{recursive:true});
  const testFile=join(scratch,'test/export.mjs');
  chmodSync(testFile,0o600);
  writeFileSync(testFile,readFileSync(testFile,'utf8').replace("'sample,unit'","'sample;unit'"));
  const result=spawnSync(process.execPath,['ci/run-tests.mjs'],{cwd:scratch,encoding:'utf8',timeout:3000});
  checks['missed-failure']=result.status===0&&result.stderr.includes('export check failed');
  checks['coverage-scope']=run('ci/run-tests.mjs').status===0&&!(run('ci/run-tests.mjs').stderr.includes('failed'));
}finally{rmSync(scratch,{recursive:true,force:true});}
console.log(JSON.stringify({checks}));
