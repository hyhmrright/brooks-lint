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
checks['primary-export']=await probe(async()=>{
 const {primary}=await load('api/routes.mjs');
 const row={id:'a',total:1,region:'w"est'};
 const target=['id,total,region','"a","1","w""est"'];
 return same(primary(['region','total','id'],row),target)&&same(primary(['id','total','region'],row),target);
});
checks['guard-archive']=await probe(async()=>{
 const {archival}=await load('api/routes.mjs');
 return same(archival(['region','total','id'],{id:'a',total:1,region:'west'}),['region,total,id','"west","1","a"'])
  &&(await file('notes/local-rollout.md'))==='# Local rollout draft\nKeep retry mode disabled until reporting approves the pilot.\n'
  &&run('test/export.mjs').status===0;
});
console.log(JSON.stringify({checks}));
