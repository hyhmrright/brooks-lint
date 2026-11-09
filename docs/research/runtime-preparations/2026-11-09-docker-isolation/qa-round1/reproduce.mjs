import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {validate} from '../../../../../evals/research/runtime/prospective/docker-isolation-drill.mjs';
const d=fs.mkdtempSync(path.join(os.tmpdir(),'docker-qa-'));
try {
 fs.cpSync(new URL('../observations/',import.meta.url),d,{recursive:true});
 const r=JSON.parse(fs.readFileSync(path.join(d,'run.json')));
 r.cases=Array.from({length:6},()=>structuredClone(r.cases[0]));
 fs.writeFileSync(path.join(d,'run.json'),JSON.stringify(r));
 const inv=JSON.parse(fs.readFileSync(path.join(d,'inventory.json')));
 inv['run.json']=createHash('sha256').update(fs.readFileSync(path.join(d,'run.json'))).digest('hex');
 fs.writeFileSync(path.join(d,'inventory.json'),JSON.stringify(inv));
 console.log(JSON.stringify({tamper:'replace all six modes with copies of cli-answer and rehash run.json',result:validate(d)}));
} finally {fs.rmSync(d,{recursive:true,force:true});}
