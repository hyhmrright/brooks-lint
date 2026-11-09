/** Opt-in host service. Import has no side effects. Never mount its state in workers. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {LeaseManager,LEASE_LIMITS,initializeState,acquireManagerLock,atomicJSON,createIntent,heartbeat,cancel} from './docker-lease.mjs';

export async function serve(root,{run}={}) {
  root=initializeState(root);const lock=await acquireManagerLock(root);
  const log=fs.openSync(path.join(root,'events.jsonl'),'a',0o600);
  const record=event=>{fs.writeSync(log,JSON.stringify(event)+'\n');fs.fsyncSync(log);};
  const manager=new LeaseManager(root,{run,record});let stopping=false;
  const stop=()=>{stopping=true;manager.stopping=true;};
  process.on('SIGTERM',stop);process.on('SIGINT',stop);
  atomicJSON(path.join(root,'service.json'),{pid:process.pid,started_at:new Date().toISOString(),port:lock.port});
  record({type:'service-start',pid:process.pid,at:Date.now()});
  try {
    while(!stopping) {await manager.tick();await delay(LEASE_LIMITS.poll_ms);}
    await manager.stop();
    const pending=[...manager.jobs.values()].filter(j=>j.state.phase!=='complete');
    record({type:'service-stop',pending:pending.map(j=>j.intent.token),at:Date.now()});
    return pending.length?2:0;
  } finally {process.off('SIGTERM',stop);process.off('SIGINT',stop);fs.closeSync(log);await lock.close();}
}
export async function supervise(root) {
  root=initializeState(root);
  const supervisorRoot=path.join(root,'supervisor');initializeState(supervisorRoot);
  const lock=await acquireManagerLock(supervisorRoot);let stopping=false,child=null;
  const stop=()=>{stopping=true;child?.kill('SIGTERM');};process.on('SIGTERM',stop);process.on('SIGINT',stop);
  const log=fs.openSync(path.join(root,'supervisor.jsonl'),'a',0o600);
  const record=e=>{fs.writeSync(log,JSON.stringify({...e,at:Date.now()})+'\n');fs.fsyncSync(log);};
  try {
    while(!stopping) {
      child=spawn(process.execPath,[fileURLToPath(import.meta.url),'serve',root],{stdio:['ignore',log,log]});
      record({type:'manager-start',pid:child.pid});
      const result=await new Promise(resolve=>{child.once('error',e=>resolve({error:e.message}));child.once('close',(code,signal)=>resolve({code,signal}));});
      record({type:'manager-exit',...result});child=null;
      if(!stopping) await delay(250);
    }
    return 0;
  } finally {process.off('SIGTERM',stop);process.off('SIGINT',stop);fs.closeSync(log);await lock.close();}
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  try {
    const [action,root,...args]=process.argv.slice(2);if(!root) throw new Error('Usage: docker-lease-service.mjs serve|supervise|create|heartbeat|cancel STATE_DIR [arguments]');
    if(action==='serve') process.exitCode=await serve(root);
    else if(action==='supervise') process.exitCode=await supervise(root);
    else if(action==='create') console.log(JSON.stringify(createIntent(root,args[0],{lease_ms:Number(args[1]||30000),heartbeat_ms:Number(args[2]||5000)})));
    else if(action==='heartbeat') heartbeat(root,args[0],Number(args[1]));
    else if(action==='cancel') cancel(root,args[0]);
    else throw new Error('Unknown action');
  } catch(e) {console.error(e.stack);process.exitCode=1;}
}
