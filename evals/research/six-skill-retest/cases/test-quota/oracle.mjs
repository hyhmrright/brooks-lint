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
const {post}=await load('http/route.mjs');
checks['quota-equality']=post(Array(100).fill('x')).status===202;
const {readFileSync, writeFileSync,chmodSync,mkdtempSync,cpSync,rmSync}=await import('node:fs');
const {tmpdir}=await import('node:os');
const scratch=mkdtempSync(join(tmpdir(),'brooks-quota-'));
try{
  cpSync(root,scratch,{recursive:true});
  const quota=join(scratch,'service/quota.mjs');
  chmodSync(quota,0o600);
  writeFileSync(quota,readFileSync(quota,'utf8').replace('return count<=maxBatch','return true'));
  const mutated=await import(pathToFileURL(join(scratch,'http/route.mjs')));
  const result=spawnSync(process.execPath,['test/quota.test.mjs'],{cwd:scratch,timeout:3000});
  checks['escaping-quota']=result.status===0&&post(Array(101).fill('x')).status===429&&mutated.post(Array(101).fill('x')).status===202;
}finally{rmSync(scratch,{recursive:true,force:true});}
console.log(JSON.stringify({checks}));
