/** Trusted host lease owner. No live-model transport; workers never receive this state. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import {performance} from 'node:perf_hooks';
import {containerArgs, assertOwnedInspection, boundedCommand} from './docker-isolation.mjs';

export const LEASE_LABEL = 'brooks.runtime.lease';
export const LEASE_LIMITS = Object.freeze({max_ms:300000, max_jobs:4, command_ms:4000, poll_ms:100, live_ready:false});
const TOKEN = /^[a-f0-9]{32}$/;
const ID = /^[a-f0-9]{64}$/;
const IMAGE = /^sha256:[a-f0-9]{64}$/;
export const NATIVE_SESSION_SOURCE="setTimeout(()=>process.exit(0),180000)";
const TERMINAL = new Set(['complete']);
export function atomicJSON(file, value) {
  const temp = `${file}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  const fd = fs.openSync(temp, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2)+'\n'); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temp, file);
  const dir = fs.openSync(path.dirname(file), 'r');
  try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
}
export function initializeState(root) {
  fs.mkdirSync(root, {recursive:true, mode:0o700});
  assert(!fs.lstatSync(root).isSymbolicLink(), 'State directory must not be a symlink');
  assert.equal(fs.statSync(root).mode & 0o077, 0, 'State directory must be private');
  return fs.realpathSync(root);
}
export function createIntent(root, image, {lease_ms=30000, heartbeat_ms=5000, now=Date.now(), workload=null}={}) {
  root=initializeState(root);
  assert(IMAGE.test(image));
  assert(Number.isSafeInteger(lease_ms) && lease_ms>=500 && lease_ms<=LEASE_LIMITS.max_ms);
  assert(Number.isSafeInteger(heartbeat_ms) && heartbeat_ms>=200 && heartbeat_ms<=lease_ms);
  assert(Number.isSafeInteger(now));
  const token=crypto.randomBytes(16).toString('hex');
  const intent={version:1, token, name:`brooks-lease-${token}`, image, issued_at:now,
    deadline:now+lease_ms, lease_ms, heartbeat_ms,...(workload===null?{}:{workload})};
  validateIntent(intent);
  atomicJSON(path.join(root,`${token}.intent.json`),intent);
  return intent;
}
export function validateIntent(i) {
  assert.equal(i.version,1);assert(i.workload===undefined||i.workload==='native-session'); assert(TOKEN.test(i.token));
  assert.equal(i.name,`brooks-lease-${i.token}`); assert(IMAGE.test(i.image));
  assert(Number.isSafeInteger(i.issued_at)); assert(Number.isSafeInteger(i.deadline));
  assert(Number.isSafeInteger(i.lease_ms)&&i.lease_ms>=500&&i.lease_ms<=LEASE_LIMITS.max_ms);
  assert.equal(i.deadline,i.issued_at+i.lease_ms);
  assert(Number.isSafeInteger(i.heartbeat_ms)&&i.heartbeat_ms>=200&&i.heartbeat_ms<=i.lease_ms);
  return i;
}
export function heartbeat(root,token,sequence) {
  assert(TOKEN.test(token)); assert(Number.isSafeInteger(sequence)&&sequence>=1);
  atomicJSON(path.join(root,`${token}.heartbeat.json`),{token,sequence});
}
export function cancel(root,token) {
  assert(TOKEN.test(token)); atomicJSON(path.join(root,`${token}.cancel.json`),{token});
}
export function leaseArgs(i) {
  validateIntent(i);
  const args=containerArgs(i.image,`brooks-rt-${i.token.slice(0,12)}`,'detached');
  args[args.indexOf('--name')+1]=i.name;
  args.splice(1,0,'--label',`${LEASE_LABEL}=${i.token}`);
  if(i.workload==='native-session'){args.splice(args.indexOf(i.image),0,'--entrypoint','node');args.splice(args.indexOf(i.image)+1,1,'-e',NATIVE_SESSION_SOURCE);}
  return args;
}
export function verifyIdentity(info,i,identity=null) {
  validateIntent(i); assert(ID.test(info.Id)); assertOwnedInspection(info,info.Id);
  assert.equal(info.Config.Labels[LEASE_LABEL],i.token);
  assert.equal(info.Name,`/${i.name}`); assert.equal(info.Image,i.image);
  if(i.workload==='native-session'){assert.deepEqual(info.Config.Entrypoint,['node']);assert.deepEqual(info.Config.Cmd,['-e',NATIVE_SESSION_SOURCE]);}
  const born=Date.parse(info.Created); assert(Number.isFinite(born));
  assert(born>=i.issued_at-2000,'Unexpected container birth time');
  if(identity) { assert.equal(info.Id,identity.id); assert.equal(info.Created,identity.created); }
  return {id:info.Id,created:info.Created};
}
export function leaseExpired(i,{wall,elapsed,heartbeat_elapsed,restarted=false,cancelled=false}) {
  validateIntent(i);
  return restarted || cancelled || wall<i.issued_at-2000 || wall>=i.deadline || elapsed>=i.lease_ms || heartbeat_elapsed>=i.heartbeat_ms;
}
export async function acquireManagerLock(root) {
  // Kernel-owned TCP bind survives no process: no stale PID file or PID-reuse recovery.
  // A hash collision or unrelated listener fails closed; there is no command protocol.
  const port=32000+(parseInt(crypto.createHash('sha256').update(fs.realpathSync(root)).digest('hex').slice(0,8),16)%20000);
  const server=net.createServer(socket=>socket.destroy());
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen({port,host:'127.0.0.1',exclusive:true},resolve);});
  return {port,close:()=>new Promise(resolve=>server.close(resolve))};
}
function readJSON(file) {
  const st=fs.lstatSync(file); assert(st.isFile()&&!st.isSymbolicLink()&&st.size<=65536,'Invalid state file');
  return JSON.parse(fs.readFileSync(file,'utf8'));
}
function output(r,stream='stdout') {return Buffer.from(r[`${stream}_base64`],'base64').toString('utf8');}
function ok(r) {return r.code===0&&!r.signal&&!r.reason&&!r.error&&r.closed;}
export function absenceConfirmed(r,id) {
  const match=output(r,'stderr').match(/^Error(?: response from daemon)?: No such (?:object|container): ([a-f0-9]{64})\s*$/i);
  return r.code===1&&!r.signal&&!r.reason&&!r.error&&r.closed&&!!match&&match[1]===id;
}
export class LeaseManager {
  constructor(root,{run=(args)=>boundedCommand('docker',args,{timeout_ms:LEASE_LIMITS.command_ms}),wall=Date.now,mono=()=>performance.now(),record=()=>{}}={}) {
    this.root=initializeState(root);this.run=run;this.wall=wall;this.mono=mono;this.record=record;
    this.jobs=new Map();this.started=false;this.stopping=false;
  }
  save(job) {atomicJSON(path.join(this.root,`${job.intent.token}.state.json`),job.state);}
  event(type,data={}) {this.record({type,at:this.wall(),...data});}
  async command(args) {const r=await this.run(args);this.event('docker',{result:r});return r;}
  load() {
    assert(!this.started); this.started=true;
    for(const file of fs.readdirSync(this.root).filter(f=>f.endsWith('.state.json'))) {
      const state=readJSON(path.join(this.root,file));validateIntent(state.intent);
      assert.equal(file,`${state.intent.token}.state.json`);assert.equal(state.version,1);
      assert(['creating','registered','running','cleanup-pending','complete'].includes(state.phase));
      assert.equal(typeof state.create_attempted,'boolean');
      if(['registered','running'].includes(state.phase)) assert(state.identity);
      if(state.phase==='complete') {assert.equal(state.absence_confirmed,true);if(state.create_attempted) assert(state.identity);}
      if(state.identity) {assert(ID.test(state.identity.id));assert(Number.isFinite(Date.parse(state.identity.created)));}
      const job={intent:state.intent,state,started:this.mono(),beat:this.mono(),sequence:0,restarted:true};
      this.jobs.set(job.intent.token,job);
    }
  }
  async discover(job) {
    const i=job.intent;
    const r=await this.command(['ps','-aq','--no-trunc','--filter',`label=${LEASE_LABEL}=${i.token}`]);
    if(!ok(r)) throw new Error('Discovery unavailable');
    const ids=output(r).trim().split(/\s+/).filter(Boolean); assert(ids.every(id=>ID.test(id)));
    assert(ids.length<=1,'Ambiguous lease identity');
    if(!ids.length) {
      if(job.state.create_attempted && !job.state.identity) throw new Error('Create outcome unresolved; late creation still possible');
      return null;
    }
    const info=await this.inspect(ids[0]); assert(info,'Discovery changed before inspection');
    job.state.identity=verifyIdentity(info,i,job.state.identity); this.save(job);
    return info;
  }
  async inspect(id) {
    assert(ID.test(id));const r=await this.command(['inspect',id]);
    if(absenceConfirmed(r,id)) return null;
    if(!ok(r)) throw new Error('Inspection unavailable');
    const all=JSON.parse(output(r));assert(Array.isArray(all)&&all.length===1);return all[0];
  }
  async cleanup(job,reason) {
    job.state.phase='cleanup-pending';job.state.reason=reason;this.save(job);
    try {
      let info=job.state.identity?await this.inspect(job.state.identity.id):await this.discover(job);
      // A corrupted nonexistent ID must not hide a still-present lease-labelled job.
      if(!info && job.state.identity) info=await this.discover(job);
      if(info) {
        const identity=verifyIdentity(info,job.intent,job.state.identity); job.state.identity=identity;this.save(job);
        if(info.State.Running) {
          await this.command(['stop','--time','1',identity.id]);
          info=await this.inspect(identity.id);
          if(info) verifyIdentity(info,job.intent,identity);
          if(info?.State.Running) {
            await this.command(['kill','--signal','KILL',identity.id]);
            info=await this.inspect(identity.id);
            if(info) verifyIdentity(info,job.intent,identity);
            if(info?.State.Running) throw new Error('Termination unconfirmed');
          }
        }
        if(info) {
          if(info.State.Running) throw new Error('Removal of running container refused');
          const removed=await this.command(['rm',identity.id]);if(!ok(removed)) throw new Error('Removal unconfirmed');
          if(await this.inspect(identity.id)) throw new Error('Absence unconfirmed');
        }
      }
      job.state.phase='complete';job.state.completed_at=this.wall();job.state.absence_confirmed=true;
      this.save(job);this.event('complete',{token:job.intent.token,reason});
    } catch(e) {
      job.state.last_error=e.message;this.save(job);this.event('cleanup-unresolved',{token:job.intent.token,error:e.message});
    }
  }
  async tick() {
    if(!this.started) this.load();
    // Always reconcile old jobs before admitting new work; at most four active jobs.
    for(const job of this.jobs.values()) {
      if(TERMINAL.has(job.state.phase)) continue;
      try {
        const heartbeatExpired=this.mono()-job.beat>=job.intent.heartbeat_ms;
        const beatfile=path.join(this.root,`${job.intent.token}.heartbeat.json`);
        if(fs.existsSync(beatfile)) {const b=readJSON(beatfile);assert.equal(b.token,job.intent.token);assert(Number.isSafeInteger(b.sequence));
          if(!heartbeatExpired && b.sequence>job.sequence) {job.sequence=b.sequence;job.beat=this.mono();}}
        const expired=leaseExpired(job.intent,{wall:this.wall(),elapsed:this.mono()-job.started,heartbeat_elapsed:this.mono()-job.beat,restarted:job.restarted,cancelled:this.stopping||fs.existsSync(path.join(this.root,`${job.intent.token}.cancel.json`))});
        if(expired||job.state.phase==='cleanup-pending'||job.state.phase==='creating') await this.cleanup(job,job.restarted?'manager-restart':expired?'lease-revoked':'reconcile');
      } catch(e) {await this.cleanup(job,`invalid-control:${e.message}`);}
    }
    if(this.stopping) return;
    for(const file of fs.readdirSync(this.root).filter(f=>f.endsWith('.intent.json')).sort()) {
      const token=file.slice(0,-12); if(this.jobs.has(token)) continue;
      if([...this.jobs.values()].filter(j=>!TERMINAL.has(j.state.phase)).length>=LEASE_LIMITS.max_jobs) break;
      const i=validateIntent(readJSON(path.join(this.root,file))); assert.equal(file,`${i.token}.intent.json`);
      const job={intent:i,state:{version:1,intent:i,phase:'creating',identity:null,create_attempted:false},started:this.mono(),beat:this.mono(),sequence:0,restarted:false};
      this.jobs.set(i.token,job);this.save(job);
      if(this.wall()<i.issued_at-2000||this.wall()>=i.deadline||fs.existsSync(path.join(this.root,`${i.token}.cancel.json`))) {await this.cleanup(job,'stale-intent');continue;}
      try {
        job.state.create_attempted=true;this.save(job);
        const created=await this.command(leaseArgs(i));
        // Lost create response is reconciled by the durable random lease label.
        if(!ok(created)||!ID.test(output(created).trim())) {await this.cleanup(job,'create-unacknowledged');continue;}
        const id=output(created).trim(); const info=await this.inspect(id);assert(info);
        job.state.identity=verifyIdentity(info,i);job.state.phase='registered';this.save(job);
        if(leaseExpired(i,{wall:this.wall(),elapsed:this.mono()-job.started,heartbeat_elapsed:this.mono()-job.beat,cancelled:this.stopping})) {await this.cleanup(job,'expired-before-start');continue;}
        const start=await this.command(['start',id]);if(!ok(start)) {await this.cleanup(job,'start-unacknowledged');continue;}
        job.state.phase='running';this.save(job);this.event('running',{token:i.token,id});
      } catch(e) {await this.cleanup(job,`create-error:${e.message}`);}
    }
  }
  async stop() {this.stopping=true;await this.tick();}
}
