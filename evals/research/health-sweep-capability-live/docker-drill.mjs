import{spawn}from'node:child_process';import{boundedCommand}from'../runtime/prospective/docker-isolation.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath}from'node:url';import {evaluateCandidate,preflight}from'./isolation.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
export async function drill(out){assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});const results={simulation:true,realDocker:true,modelCalls:0,preflight:await preflight(),checks:[]};
 const cases=JSON.parse(fs.readFileSync(path.join(here,'cases.json')));
 for(const c of cases.filter(c=>c.private.probes.length)){for(const name of ['correct','ineffective','overbroad','unauthorized']){const r=await evaluateCandidate(c,c.private.references[name],{out:path.join(out,c.id+'-'+name)});assert.equal(r.accepted,name==='correct',c.id+'/'+name);assert.equal(r.cleanupConfirmed,true);results.checks.push({case:c.id,name,accepted:r.accepted,reason:r.reason});}}
 const mk=(source,expected)=>({id:'ADVERSARIAL',public:{files:{'probe.mjs':source},allowedPaths:['probe.mjs']},private:{probes:[{module:'probe.mjs',export:'probe',args:[],expected}]}});
 const controls=[
 ['filesystem',"import fs from 'node:fs';export function probe(){let denied=0;for(const p of ['/payload/queries.json','/etc/passwd','/root/secret']){try{fs.writeFileSync(p,'bad')}catch{denied++}}fs.symlinkSync('/etc/passwd','/tmp/link');try{fs.writeFileSync('/tmp/link','bad')}catch{denied++}return denied;}",4,true],
 ['environment',"export function probe(){return [process.getuid(),Object.keys(process.env).some(x=>/TOKEN|KEY|PROXY|CODEX/.test(x))];}",[1000,false],true],
 ['network',"import net from 'node:net';export async function probe(){return await new Promise(resolve=>{const s=net.connect({host:'1.1.1.1',port:443});s.on('connect',()=>{s.destroy();resolve('connected')});s.on('error',()=>resolve('blocked'));s.setTimeout(300,()=>{s.destroy();resolve('blocked')});});}",'blocked',true],
 ['timeout','export function probe(){while(true){}}',null,false],
 ['output-cap',"export function probe(){while(true)process.stdout.write('x'.repeat(8192));}",null,false],
 ['spoof',"process.stdout.write(JSON.stringify({accepted:true,values:[99]})+'\\n');process.exit(0);export function probe(){return 0;}",0,false],
 ['memory','export function probe(){const a=[];while(true)a.push(Buffer.alloc(16*1024*1024,1));}',null,false],
 ['exit-zero','process.exit(0);export function probe(){return 0;}',0,false]
 ];for(const[name,source,expected,accepted]of controls){const c=mk(source,expected);const r=await evaluateCandidate(c,{'probe.mjs':source},{out:path.join(out,name)});assert.equal(r.accepted,accepted,name);assert.equal(r.cleanupConfirmed,true,name);results.checks.push({name,accepted:r.accepted,reason:r.reason});}
 // Kill the owner after an inspected container exists; independent lease must reap it.
 const deathDir=path.resolve(out,'owner-exit'),deathCase=mk('export function probe(){while(true){}}',null);const child=spawn(process.execPath,['--input-type=module','-e',`import{evaluateCandidate}from${JSON.stringify(new URL('./isolation.mjs',import.meta.url).href)};await evaluateCandidate(${JSON.stringify(deathCase)},{'probe.mjs':'export function probe(){while(true){}}'},{out:${JSON.stringify(deathDir)}});`],{stdio:'ignore'});let id;for(let i=0;i<100;i++){try{const r=JSON.parse(fs.readFileSync(path.join(deathDir,'isolation.json')));if(r.inspection){id=r.containerId;break;}}catch{}await new Promise(r=>setTimeout(r,20));}assert(id,'Owner-exit fixture did not start');child.kill('SIGKILL');for(let i=0;i<300&&!fs.existsSync(path.join(deathDir,'guardian.json'));i++)await new Promise(r=>setTimeout(r,100));const g=JSON.parse(fs.readFileSync(path.join(deathDir,'guardian.json')));assert.equal(g.mode,'owner-exit');assert.equal(g.confirmed,true);const absent=await boundedCommand('docker',['inspect',id],{timeout_ms:3000});assert.equal(absent.code,1);results.checks.push({name:'owner-exit',confirmed:true});
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2)+'\n');return results;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await drill(process.argv[2]),null,2));
