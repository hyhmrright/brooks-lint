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
checks['closed-import']=(await file('cart/service.mjs')).includes('../store/repository.mjs') && (await file('store/repository.mjs')).includes('../cart/service.mjs');
const {get}=await load('bootstrap.mjs');
checks['call-vs-import']=get(' C1 ').id==='c1'&&!(await file('metrics/events.mjs')).includes('/cart/');
console.log(JSON.stringify({checks}));
