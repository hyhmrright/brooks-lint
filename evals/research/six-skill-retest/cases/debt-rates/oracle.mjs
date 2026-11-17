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
for(const name of ['checkout','refund','estimate']){
  const module=await load('flows/'+name+'.mjs');
  if(module[name]('remote')!==350) throw Error('Fixture surcharge drift');
}
checks['duplicated-source']=(await file('ops/changes.md')).includes('omitted refund');
checks['independent-rates']=(await load('rates/retail.mjs')).rate===(await load('rates/franchise.mjs')).rate&&(await file('docs/governance.md')).includes('separate approvers');
console.log(JSON.stringify({checks}));
