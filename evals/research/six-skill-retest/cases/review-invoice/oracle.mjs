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
const {quote}=await load('checkout/handler.mjs');
checks['plan-boundary']=quote({plan:'basic',seats:5}).totalCents===(phase==='baseline'?5250:4750);
checks['existing-fee']=quote({plan:'basic',seats:0}).totalCents===0;
checks['protected-team']=quote({plan:'team',seats:5}).totalCents===(phase==='baseline'?5250:4750);
console.log(JSON.stringify({checks}));
