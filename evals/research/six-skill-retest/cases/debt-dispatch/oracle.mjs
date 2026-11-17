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
const names=['web','batch','email','partner','mobile'];
const statuses=await Promise.all(names.map(async name=>(await load('adapters/'+name+'.mjs')).status('queued')));
checks['repayment-order']=statuses.every(x=>x==='waiting')&&(await file('docs/change-history.csv')).split('\n').filter(x=>x.includes('standard update')).length===3;
console.log(JSON.stringify({checks}));
