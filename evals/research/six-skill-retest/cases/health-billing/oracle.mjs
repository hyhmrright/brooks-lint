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
const {createHash}=await import('node:crypto');
const hash=x=>createHash('sha256').update(x).digest('hex');
const ledger=await file('ledger.json').then(JSON.parse).catch(()=>null);
const report=await file('report.md').catch(()=>null);
const receipt=await file('receipt.json').then(JSON.parse).catch(()=>null);
checks['artifact-bound']=Boolean(ledger&&report&&receipt?.valid===true&&hash(report)===receipt.reportSha256&&hash(JSON.stringify(ledger))===receipt.ledgerSha256);
checks['missing-test-gate']=Boolean(ledger?.dimensions?.test?.status==='unassessed');
checks['partial-assessment']=Boolean(ledger?.hasDiff===false&&ledger.dimensions?.pr?.status==='skipped'&&ledger.dimensions?.architecture?.status==='assessed'&&ledger.dimensions?.debt?.status==='assessed'&&report?.includes('Composite unavailable'));
console.log(JSON.stringify({checks}));
