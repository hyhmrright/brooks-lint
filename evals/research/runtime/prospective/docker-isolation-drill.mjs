/** Explicit record only launches Docker; validate is daemon-free saved-evidence inspection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
import {containerArgs,ownedId,assertOwnedInspection,boundedCommand} from './docker-isolation.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const defaultRoot=fileURLToPath(new URL('../../../../docs/research/runtime-preparations/2026-11-09-docker-isolation/observations/',import.meta.url));
const sources=['docker-isolation.mjs','docker-isolation-drill.mjs','docker-isolation-probe.mjs','docker-isolation.test.mjs'];
export async function record(root,image){assert(!fs.existsSync(root));fs.mkdirSync(root,{recursive:true});let seq=0;const index=[];const put=(name,v)=>fs.writeFileSync(path.join(root,name),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
 async function command(args,opts){const r=await boundedCommand('docker',args,opts),name=String(++seq).padStart(3,'0');put(name+'.json',r);fs.writeFileSync(path.join(root,name+'.stdout.bin'),Buffer.from(r.stdout_base64,'base64'),{flag:'wx'});fs.writeFileSync(path.join(root,name+'.stderr.bin'),Buffer.from(r.stderr_base64,'base64'),{flag:'wx'});index.push(name);return r;}
 const cases=[];for(const mode of ['cli-answer','cli-readonly','cli-outer','detached','owner-exit','launcher-death']){let id=null,created=null;const name='brooks-rt-'+randomBytes(6).toString('hex');const item={mode,commands:[],cleanup_confirmed:false};const begin=seq;
 try{const c=await command(containerArgs(image,name,mode==='launcher-death'?'detached':mode));created=c;assert.equal(c.code,0);id=ownedId(Buffer.from(c.stdout_base64,'base64').toString().trim());item.id=id;
 const inspection=await command(['inspect',id]);assert.equal(inspection.code,0);assertOwnedInspection(JSON.parse(Buffer.from(inspection.stdout_base64,'base64'))[0],id);
 if(mode.startsWith('cli')){const run=await command(['start','--attach',id]);item.run_command=String(seq).padStart(3,'0');item.run_exit=run.code;}
 else{if(mode==='launcher-death'){const killed=await command(['start','--attach',id],{timeout_ms:600});item.launcher_killed_command=String(seq).padStart(3,'0');assert.equal(killed.reason,'deadline');const alive=await command(['inspect','--format','{{json .State}}',id]);item.after_launcher_death=JSON.parse(Buffer.from(alive.stdout_base64,'base64'));}else await command(['start',id]);await new Promise(r=>setTimeout(r,500));await command(['top',id,'-eo','pid,ppid,pgid,sid,stat,args']);await command(['logs',id]);if(mode==='detached'||mode==='launcher-death'){await command(['kill','--signal','TERM',id]);const alive=await command(['inspect','--format','{{json .State}}',id]);item.after_term=JSON.parse(Buffer.from(alive.stdout_base64,'base64'));await command(['kill','--signal','KILL',id]);}await command(['wait',id]);}
 const state=await command(['inspect','--format','{{json .State}}',id]);item.final_state=JSON.parse(Buffer.from(state.stdout_base64,'base64'));await command(['top',id]);item.stopped_observed=item.final_state.Running===false&&item.final_state.Pid===0;
 }catch(e){item.error=e.message;}finally{if(!id&&created&&(created.code===0||created.reason)){const recovered=await command(['inspect',name]);if(recovered.code===0){const info=JSON.parse(Buffer.from(recovered.stdout_base64,'base64'));assert.equal(info[0].Name,'/'+name);assert.equal(info[0].Image,image);assertOwnedInspection(info[0],info[0].Id);id=ownedId(info[0].Id);item.id=id;item.recovered_after_create=true;}else item.create_cleanup_unknown=true;}if(id){const check=await command(['inspect',id]);if(check.code===0){assertOwnedInspection(JSON.parse(Buffer.from(check.stdout_base64,'base64'))[0],id);await command(['rm','--force',id]);const absent=await command(['inspect',id]);item.cleanup_confirmed=absent.code===1&&Buffer.from(absent.stderr_base64,'base64').toString().toLowerCase().includes('no such object');}}item.commands=index.slice(begin);cases.push(item);put('case-'+mode+'.json',item);}}
 for(const n of sources)fs.copyFileSync(new URL(n,import.meta.url),path.join(root,n+'.snapshot'),fs.constants.COPYFILE_EXCL);
 put('run.json',{image,cases,commands:index,model_calls:0,real_credentials:0,live_ready:false,scope:'Owned network-none containers and authored local HTTP only; no native tool/client identity separation claim'});
 const inventory={};for(const n of fs.readdirSync(root))inventory[n]=hash(fs.readFileSync(path.join(root,n)));put('inventory.json',inventory);return validate(root);}
const CASE_MODES=Object.freeze(['cli-answer','cli-readonly','cli-outer','detached','owner-exit','launcher-death']);
function expectedCommands(c,image,name){
 const id=c.id,state=['inspect','--format','{{json .State}}',id];
 const a=[containerArgs(image,name,c.mode==='launcher-death'?'detached':c.mode),['inspect',id]];
 if(c.mode.startsWith('cli'))a.push(['start','--attach',id]);
 else{
  a.push(c.mode==='launcher-death'?['start','--attach',id]:['start',id]);
  if(c.mode==='launcher-death')a.push(state);
  a.push(['top',id,'-eo','pid,ppid,pgid,sid,stat,args'],['logs',id]);
  if(c.mode!=='owner-exit')a.push(['kill','--signal','TERM',id],state,['kill','--signal','KILL',id]);
  a.push(['wait',id]);
 }
 a.push(state,['top',id],['inspect',id],['rm','--force',id],['inspect',id]);
 return a.map(argv=>['docker',...argv]);
}
function validateCoverage(root,inventory,run){
 assert.deepEqual(run.cases.map(c=>c.mode),CASE_MODES,'Exact unique case order required');
 assert.equal(new Set(run.cases.map(c=>c.id)).size,CASE_MODES.length,'Container IDs must be unique');
 const all=run.cases.flatMap(c=>c.commands);assert.equal(new Set(all).size,all.length,'Command partitions must be disjoint');
 assert.deepEqual(run.commands,all,'Case partitions must cover every command in order');
 assert.deepEqual(all,all.map((_,i)=>String(i+1).padStart(3,'0')),'Commands must be contiguous');
 const expectedFiles=['run.json',...sources.map(n=>n+'.snapshot'),...CASE_MODES.map(n=>'case-'+n+'.json'),...all.flatMap(n=>[n+'.json',n+'.stdout.bin',n+'.stderr.bin'])].sort();
 assert.deepEqual(Object.keys(inventory).sort(),expectedFiles,'Inventory must contain exactly all declared artifacts');
 assert.deepEqual(fs.readdirSync(root).sort(),[...expectedFiles,'inventory.json'].sort(),'Foreign or missing artifacts');
 const names=new Set();
 for(const c of run.cases){ownedId(c.id);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'case-'+c.mode+'.json'))),c,'Standalone case differs');
  const records=c.commands.map(n=>JSON.parse(fs.readFileSync(path.join(root,n+'.json'))));const name=records[0].argv[3];assert(!names.has(name),'Container names must be unique');names.add(name);
  assert.deepEqual(records.map(r=>r.argv),expectedCommands(c,run.image,name),'Commands must bind to their case ID and exact sequence');
  for(const r of records.filter(r=>r.argv[1]==='inspect'&&r.argv.length===3&&r.code===0)){
   const info=JSON.parse(Buffer.from(r.stdout_base64,'base64'));assert.equal(info.length,1);assertOwnedInspection(info[0],c.id);assert.equal(info[0].Name,'/'+name);assert.equal(info[0].Image,run.image);assert.equal(info[0].Config.Image,run.image);assert.deepEqual(info[0].Config.Cmd,[c.mode==='launcher-death'?'detached':c.mode]);assert.deepEqual(info[0].Config.Entrypoint,['node','/opt/probe.mjs']);
  }
  for(const [i,r]of records.entries()){assert.equal(r.error,null);const bytes=Buffer.from(r.stdout_base64,'base64').length+Buffer.from(r.stderr_base64,'base64').length;assert.equal(r.retained_bytes,bytes);assert.equal(r.observed_bytes,bytes,'No truncated command evidence accepted');if(c.mode==='launcher-death'&&i===2){assert.equal(r.code,null);assert.equal(r.signal,'SIGKILL');}else{assert.equal(r.signal,null);if(i===records.length-1||i===records.length-4)assert.equal(r.code,1);else if(c.mode==='owner-exit'&&i===3)assert([0,1].includes(r.code));else assert.equal(r.code,0);}}
  if(c.mode.startsWith('cli')){assert.equal(c.run_command,c.commands[2]);assert.equal(c.run_exit,records[2].code);}
  else assert.equal(c.run_command,undefined);
  if(c.mode==='launcher-death')assert.equal(c.launcher_killed_command,c.commands[2]);else assert.equal(c.launcher_killed_command,undefined);
 }
}
export function validate(root=defaultRoot){const inventory=JSON.parse(fs.readFileSync(path.join(root,'inventory.json')));for(const[n,h]of Object.entries(inventory)){assert(/^[a-zA-Z0-9_.-]+$/.test(n));assert(fs.lstatSync(path.join(root,n)).isFile()&&!fs.lstatSync(path.join(root,n)).isSymbolicLink(),'Regular evidence files only');assert.equal(hash(fs.readFileSync(path.join(root,n))),h);}const run=JSON.parse(fs.readFileSync(path.join(root,'run.json')));assert.equal(run.model_calls,0);assert.equal(run.live_ready,false);validateCoverage(root,inventory,run);assert.equal(run.real_credentials,0);for(const c of run.cases){assert.equal(c.cleanup_confirmed,true);assert.equal(c.stopped_observed,true);assert(!c.error,c.error);for(const n of c.commands){const r=JSON.parse(fs.readFileSync(path.join(root,n+'.json')));assert.equal(fs.readFileSync(path.join(root,n+'.stdout.bin')).toString('base64'),r.stdout_base64);assert.equal(fs.readFileSync(path.join(root,n+'.stderr.bin')).toString('base64'),r.stderr_base64);assert.equal(r.closed,true);assert.equal(r.reason,n===c.launcher_killed_command?'deadline':null);}}
 for(const c of run.cases){
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,n+'.json'))),text=r=>Buffer.from(r.stdout_base64,'base64').toString();
 const cmds=c.commands.map(read);assert.deepEqual(cmds[0].argv.slice(1),containerArgs(run.image,cmds[0].argv[3],c.mode==='launcher-death'?'detached':c.mode));assert.equal(text(cmds[0]).trim(),c.id);assertOwnedInspection(JSON.parse(text(cmds[1]))[0],c.id);
 const last=cmds.at(-1);assert.deepEqual(last.argv,['docker','inspect',c.id]);assert.equal(last.code,1);assert(Buffer.from(last.stderr_base64,'base64').toString().toLowerCase().includes('no such object'));assert.deepEqual(cmds.at(-2).argv,['docker','rm','--force',c.id]);assert.equal(cmds.at(-2).code,0);
 const state=cmds.filter(r=>r.argv[1]==='inspect'&&r.argv[2]==='--format').at(-1);assert.deepEqual(JSON.parse(text(state)),c.final_state);assert.equal(c.final_state.Running,false);assert.equal(c.final_state.Pid,0);
 if(c.mode.startsWith('cli')){const native=JSON.parse(text(read(c.run_command)));assert.equal(native.model_calls,0);assert.equal(native.actual_responding_model,null);assert.equal(native.live_ready,false);assert.equal(native.version.stdout.trim(),'codex-cli 0.167.0');assert.equal(native.exit.code,0);assert.equal(native.stop,null);assert.equal(native.requests.length,c.mode==='cli-answer'?1:2);assert.equal(native.responses.length,native.requests.length);
 for(const q of native.requests){const b=Buffer.from(q.body_base64,'base64');assert.equal(hash(b),q.sha256);const body=JSON.parse(b);assert.equal(body.model,'fixture-model');assert.equal(body.reasoning.effort,'medium');assert(!q.headers.authorization);}
 for(const r of native.responses)assert.equal(hash(Buffer.from(r.body_base64,'base64')),r.sha256);
 const events=Buffer.from(native.stdout_base64,'base64').toString().trim().split('\n').map(x=>JSON.parse(x));assert(events.some(e=>e.type==='turn.completed'));assert(events.some(e=>e.item?.text==='DOCKER_LOCAL_FIXTURE_ONLY'));
 if(c.mode==='cli-readonly'){const failed=events.find(e=>e.item?.type==='command_execution'&&e.item.status==='failed');assert(failed);assert.match(failed.item.aggregated_output,/bwrap: No permissions/);assert.equal(native.tools.length,0);}
 if(c.mode==='cli-outer'){const command=events.find(e=>e.item?.type==='command_execution'&&e.item.status==='completed');assert(command);const probe=JSON.parse(command.item.aggregated_output);assert.equal(probe.uid,1000);assert.deepEqual(probe.auth_names_present,[]);assert.equal(probe.docker_socket_present,false);assert.equal(probe.host_mount_present,false);assert.equal(probe['/etc/fixture-write'],'EROFS');assert.equal(probe['/workspace/allowed.txt'],'write-succeeded');assert.equal(probe.shared_broker.body,'SHARED_PORT_REACHABLE');assert.equal(probe.documentation_address_egress,'ENETUNREACH');assert.equal(native.tools.length,1);}
 }else{const logs=cmds.find(r=>r.argv[1]==='logs');const p=JSON.parse(text(logs));assert.equal(p.pid,1);for(const descendant of [p.child,p.grandchild]){assert(descendant.pid>1);const rest=descendant.stat.slice(descendant.stat.lastIndexOf(')')+2).split(' ');assert.equal(Number(rest[3]),descendant.pid,'detached new session');}
 if(c.mode!=='owner-exit'){assert.equal(c.after_term.Running,true);assert.equal(c.final_state.ExitCode,137);}if(c.mode==='launcher-death'){assert.equal(c.after_launcher_death.Running,true);assert.equal(read(c.launcher_killed_command).signal,'SIGKILL');}
 }
 }
 return {cases:run.cases.length,commands:run.commands.length,model_calls:0,live_ready:false};}
if(process.argv[1]===fileURLToPath(import.meta.url)){const[mode='validate',root=defaultRoot,image]=process.argv.slice(2);assert(['record','validate'].includes(mode));console.log(JSON.stringify(mode==='record'?await record(root,image):validate(root)));}
