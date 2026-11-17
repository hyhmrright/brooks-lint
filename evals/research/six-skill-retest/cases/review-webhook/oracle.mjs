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
const {upload}=await load('server/http.mjs');
const event={id:'m1',kind:'changed'};
checks['async-error']=await upload(event,{async enqueue(){throw Error('queue unavailable');}})===(phase==='baseline'?503:202);
let deliveries=0;
const ok={async enqueue(){deliveries++;}};
await upload(event,ok);await upload(event,ok);
checks['duplicate-event']=deliveries===2;
checks['nonqueued']=await upload({kind:'other'},ok)===422&&deliveries===2;
console.log(JSON.stringify({checks}));
