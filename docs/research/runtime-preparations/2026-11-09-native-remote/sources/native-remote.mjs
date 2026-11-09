/** Opt-in, fake-only native App Server remote environment controls. No real transport. */
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {createBroker} from './native-remote-broker.mjs';
import {createIntent,heartbeat,cancel} from './docker-lease.mjs';
import {boundedCommand,assertOwnedInspection} from './docker-isolation.mjs';
export const IMAGE='sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8';
export const CASES=['allowed','hostile','missing','local-disabled','bad-auth','disabled-surface','disconnected','cancel','deadline','client-death'];
export const SOURCES=['native-remote.mjs','native-remote-client.cjs','native-remote-tool.cjs','native-remote-policy.cjs','native-remote-broker.mjs'];
const here=path.dirname(fileURLToPath(import.meta.url));const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const hash=x=>createHash('sha256').update(x).digest('hex');
const text=r=>Buffer.from(r.stdout_base64,'base64').toString();
async function until(fn,ms){const end=Date.now()+ms;while(Date.now()<end){const v=fn();if(v)return v;await sleep(50)}throw Error('bounded state wait expired')}
export async function runCase(scenario,out,options={}){
 assert(CASES.includes(scenario));fs.mkdirSync(out,{recursive:true});const root=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-native-'));fs.chmodSync(root,0o700);
 const record={version:1,scenario,simulation:!options.live,real_model_calls:options.live?null:0,actual_model:null,live_ready:false,image:IMAGE,started_at:Date.now(),commands:[],streams:[],states:[],sources:Object.fromEntries(SOURCES.map(f=>[f,hash(fs.readFileSync(path.join(here,f)))]))};
 const service=spawn(process.execPath,[path.join(here,'docker-lease-service.mjs'),'supervise',root],{stdio:'ignore'});const children=[];let beats,seq=0,clientId,workerId,broker;
 const intents=[createIntent(root,IMAGE,{lease_ms:options.smoke?90000:20000,heartbeat_ms:5000,...(options.smoke?{workload:'native-session'}:{})}),createIntent(root,IMAGE,{lease_ms:options.smoke?90000:20000,heartbeat_ms:5000,...(options.smoke?{workload:'native-session'}:{})})];
 function state(i){const p=path.join(root,i.token+'.state.json');return fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):null}
 function stream(id,source){const argv=['exec','-i',id,'node','-e',source];const entry={argv:['docker',...argv],started_at:Date.now(),stdout_base64:'',stderr_base64:'',observed_bytes:0};record.streams.push(entry);const p=spawn('docker',argv,{stdio:['pipe','pipe','pipe']});let out=[],err=[];p.stdin.on('error',()=>{});for(const [s,arr]of[[p.stdout,out],[p.stderr,err]])s.on('data',b=>{entry.observed_bytes+=b.length;if(entry.observed_bytes>1048576){entry.limit='output';p.kill('SIGKILL')}else arr.push(b)});const t=setTimeout(()=>{entry.limit='deadline';p.kill('SIGKILL')},options.smoke?75000:16000);p.on('close',(code,signal)=>{clearTimeout(t);Object.assign(entry,{code,signal,completed_at:Date.now(),stdout_base64:Buffer.concat(out).toString('base64'),stderr_base64:Buffer.concat(err).toString('base64')})});children.push(p);return p}
 async function command(args,opts){const r=await boundedCommand('docker',args,opts);record.commands.push(r);return r}
 try{
 beats=setInterval(()=>{for(const i of intents)heartbeat(root,i.token,++seq)},500);
 await until(()=>intents.every(i=>state(i)?.phase==='running'),6000);[workerId,clientId]=intents.map(i=>state(i).identity.id);record.worker_id=workerId;record.client_id=clientId;
 for(const id of[workerId,clientId]){const r=await command(['inspect',id]);assertOwnedInspection(JSON.parse(text(r))[0],id)}
 const ex=stream(workerId,`require('node:fs').writeFileSync('/workspace/domain','WORKER');require('node:child_process').spawn('codex',['exec-server','--listen','ws://127.0.0.1:18764','--ws-auth','capability-token','--ws-token-sha256','${hash('PUBLIC_CONTROL_TOKEN')}'],{stdio:'inherit',env:{PATH:'/usr/local/bin:/usr/bin:/bin',HOME:'/home/node',CODEX_HOME:'/tmp/executor-home'}})`);
 await sleep(400);
 const a=stream(clientId,`const net=require('node:net');let used=false;net.createServer(s=>{if(used){s.destroy();return}used=true;process.stdin.pipe(s);s.pipe(process.stdout);s.on('close',()=>process.exit())}).listen(18765,'127.0.0.1');setTimeout(()=>process.exit(),75000)`);
 const b=stream(workerId,`const s=require('node:net').connect(18764,'127.0.0.1');process.stdin.pipe(s);s.pipe(process.stdout);s.on('error',()=>process.exit(1));s.on('close',()=>process.exit());setTimeout(()=>process.exit(),75000)`);a.stdout.pipe(b.stdin);b.stdout.pipe(a.stdin);await sleep(250);
 if(scenario==='disconnected'){b.kill('SIGKILL');await sleep(100)}
 let tool=scenario==='hostile'?fs.readFileSync(path.join(here,'native-remote-tool.cjs'),'utf8'):"console.log(require('node:fs').readFileSync('/workspace/domain','utf8'))";
 if(['cancel','deadline','client-death'].includes(scenario))tool="process.on('SIGTERM',()=>{});setInterval(()=>{},1000)";
 const args=['exec',clientId,'node','-e',fs.readFileSync(path.join(here,'native-remote-client.cjs'),'utf8'),scenario,Buffer.from(tool).toString('base64'),fs.readFileSync(path.join(here,'native-remote-policy.cjs')).toString('base64'),Buffer.from(JSON.stringify(options.clientConfig||{})).toString('base64')];
 if(scenario==='client-death'){setTimeout(()=>{clearInterval(beats);record.heartbeat_stopped_at=Date.now()},700)}
 broker=options.brokerFactory?await options.brokerFactory(scenario,tool,record):await createBroker(scenario,tool,record);
 const client=spawn('docker',['exec','-i',...args.slice(1)],{stdio:['pipe','pipe','pipe']});children.push(client);client.stdin.on('error',()=>{});let output='',errors='',buffer='',bytes=0,reason=null;const begun=new Date().toISOString();
 client.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes>1048576){reason='output-cap';client.kill('SIGKILL');return}output+=chunk;buffer+=chunk;let n;while((n=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,n);buffer=buffer.slice(n+1);if(line.startsWith('BROKER ')){try{const packet=JSON.parse(Buffer.from(line.slice(7),'base64'));broker.request(packet).then(response=>{if(!client.killed)client.stdin.write(JSON.stringify({...response,id:packet.id})+'\n')}).catch(e=>{record.gateway_error=String(e.message).slice(0,500);reason='broker-rejected';client.kill('SIGKILL')})}catch{reason='invalid-broker-packet';client.kill('SIGKILL')}}else if(line.startsWith('FINAL ')){try{record.client=JSON.parse(Buffer.from(line.slice(6),'base64'))}catch{reason='invalid-final'}}else{reason='unexpected-client-output';client.kill('SIGKILL')}}});client.stderr.on('data',b=>{errors+=b;if(errors.length>1048576){reason='stderr-cap';client.kill('SIGKILL')}});
 const timer=setTimeout(()=>{reason='deadline';client.kill('SIGKILL')},scenario==='deadline'?2000:options.smoke?65000:14000);const exit=await new Promise(r=>client.on('close',(code,signal)=>r({code,signal})));clearTimeout(timer);record.result={argv:['docker','exec','-i',...args.slice(1)],...exit,reason,closed:true,started_at:begun,completed_at:new Date().toISOString(),stdout_base64:Buffer.from(output).toString('base64'),stderr_base64:Buffer.from(errors).toString('base64')};record.commands.push(record.result);broker.close();

 record.client_sentinel=await command(['exec',clientId,'cat','/workspace/domain'],{timeout_ms:2000});
 }catch(e){record.error=e.stack}finally{
 clearInterval(beats);broker?.close();for(const p of children)p.kill('SIGKILL');
 if(scenario==='client-death')await until(()=>intents.every(i=>state(i)?.phase==='complete'),12000).catch(e=>record.cleanup_error=e.message);
 else{for(const i of intents)cancel(root,i.token);await until(()=>intents.every(i=>state(i)?.phase==='complete'),12000).catch(e=>record.cleanup_error=e.message)}
 service.kill('SIGTERM');await Promise.race([new Promise(r=>service.once('close',r)),sleep(2000)]);await sleep(100);
 record.states=intents.map(state);record.lease_events=fs.existsSync(path.join(root,'events.jsonl'))?fs.readFileSync(path.join(root,'events.jsonl'),'utf8'):'';
 record.completed_at=Date.now();fs.cpSync(root,path.join(out,'lease'),{recursive:true});fs.writeFileSync(path.join(out,'record.json'),JSON.stringify(record,null,2)+'\n');
 }
 return record;
}
