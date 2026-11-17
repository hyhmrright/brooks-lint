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
const {start}=await load('app.mjs');
let attempts=0;
checks['closed-runtime']=await start(async()=>({status:++attempts<=2?'retryable':'ok'}))('job-1').then(x=>x.status==='ok'&&attempts===3);
checks['no-module-cycle']=!(await file('jobs/dispatch.mjs')).includes('import ')&&!(await file('lifecycle/retries.mjs')).includes('import ');
console.log(JSON.stringify({checks}));
