/** Explicit offline Docker boundary for candidate artifacts; never a host evaluator. */
import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {boundedCommand} from '../runtime/prospective/docker-isolation.mjs';
export const image='sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d';
const label='brooks.benchmark.v4.artifact';
export const policy=Object.freeze({image,network:'none',timeoutMs:5000,maxOutputBytes:65536,maxInspectionBytes:1048576,maxPayloadBytes:65536,modelCalls:0,hostMounts:0,credentials:0});
const sha=x=>createHash('sha256').update(x).digest('hex');
export function preparePayload(inputs,replacements,check){
 assert(Array.isArray(inputs)&&inputs.length<=40);assert(replacements&&typeof replacements==='object'&&!Array.isArray(replacements));assert(typeof check==='string'&&check.trim());
 const files={};for(const f of inputs){assert(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(f.path),'Flat safe fixture filename required');assert(!Object.hasOwn(files,f.path),'Duplicate fixture');assert(typeof f.content==='string');files[f.path]=f.content;}
 for(const [name,content]of Object.entries(replacements)){assert(Object.hasOwn(files,name),'Replacement outside supplied fixture');assert(typeof content==='string');files[name]=content;}
 assert(!Object.hasOwn(files,'__check.mjs'),'Reserved checker path');
 const bytes=JSON.stringify({files,check});assert(Buffer.byteLength(bytes)<=policy.maxPayloadBytes,'Artifact payload too large');return {bytes,sha256:sha(bytes)};
}
// Trusted wrapper plus candidate source execute only inside the restricted container.
const bootstrap=`const fs=require('node:fs');const {pathToFileURL}=require('node:url');const p=JSON.parse(Buffer.from(process.argv[1],'base64'));fs.mkdirSync('/tmp/task');for(const [name,text]of Object.entries(p.files))fs.writeFileSync('/tmp/task/'+name,text);fs.writeFileSync('/tmp/task/__check.mjs',p.check);process.chdir('/tmp/task');import(pathToFileURL('/tmp/task/__check.mjs').href).catch(e=>{console.error(e);process.exitCode=1;});`;
export function createArgs(name,payload){assert(/^brooks-artifact-[a-f0-9]{24}$/.test(name));return ['create','--name',name,'--label',`${label}=true`,'--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--user','1000:1000','--pids-limit','32','--memory','128m','--cpus','1','--restart','no','--tmpfs','/tmp:rw,noexec,nosuid,size=8m,mode=1777','--entrypoint','node',image,'-e',bootstrap,Buffer.from(payload.bytes).toString('base64')];}
export function inspectBoundary(info,id){
 assert.equal(info.Id,id);assert.equal(info.Config.Image,image);assert.equal(info.Config.Labels?.[label],'true');assert.equal(info.Config.User,'1000:1000');assert.equal(info.Config.Entrypoint[0],'node');
 assert.equal(info.HostConfig.NetworkMode,'none');assert.equal(info.HostConfig.ReadonlyRootfs,true);assert.equal(info.HostConfig.Privileged,false);assert.deepEqual(info.HostConfig.CapDrop,['ALL']);assert(info.HostConfig.SecurityOpt.includes('no-new-privileges'));
 assert.equal(info.HostConfig.PidsLimit,32);assert.equal(info.HostConfig.Memory,134217728);assert.equal(info.HostConfig.NanoCpus,1000000000);assert.equal(info.HostConfig.RestartPolicy.Name,'no');assert.equal(info.HostConfig.Binds,null);assert.equal(info.HostConfig.VolumesFrom,null);assert.equal(info.HostConfig.PidMode,'');assert.equal(info.HostConfig.IpcMode,'private');assert.deepEqual(info.HostConfig.Devices,[]);assert.equal(info.HostConfig.DeviceRequests,null);assert.equal(info.HostConfig.ExtraHosts,null);assert.deepEqual(info.HostConfig.PortBindings,{});assert.equal(info.HostConfig.PublishAllPorts,false);
 assert(info.Mounts.every(m=>m.Type==='tmpfs'));assert.deepEqual(info.HostConfig.Tmpfs,{'/tmp':'rw,noexec,nosuid,size=8m,mode=1777'});assert.deepEqual(Object.keys(info.NetworkSettings.Networks),['none']);
 assert.deepEqual(info.Config.Env.map(s=>s.split('=')[0]).sort(),['NODE_VERSION','PATH','YARN_VERSION']);return true;
}
export async function runSandbox(payload,{timeoutMs=policy.timeoutMs,command=boundedCommand}={}){
 assert.equal(sha(payload.bytes),payload.sha256);assert(Buffer.byteLength(payload.bytes)<=policy.maxPayloadBytes);assert(Number.isInteger(timeoutMs)&&timeoutMs>0&&timeoutMs<=policy.timeoutMs);
 const name='brooks-artifact-'+randomBytes(12).toString('hex'),records=[];let id=null,admitted=false,execution=null,cleanupConfirmed=false,failure=null,createAmbiguous=true;
 const call=async(args,options={})=>{const r=await command('docker',args,{timeout_ms:10000,max_output_bytes:policy.maxOutputBytes,...options});records.push(r);return r;};
 const decode=r=>Buffer.from(r.stdout_base64,'base64').toString();
 try{
  const created=await call(createArgs(name,payload));assert.equal(created.code,0,'Container create failed');assert(!created.reason&&!created.error&&created.closed,'Container create completion uncertain');id=decode(created).trim();assert(/^[a-f0-9]{64}$/.test(id),'Missing full owned container ID');createAmbiguous=false;
  const inspection=await call(['inspect',id],{max_output_bytes:policy.maxInspectionBytes});assert.equal(inspection.code,0);inspectBoundary(JSON.parse(decode(inspection))[0],id);admitted=true;
  execution=await call(['start','--attach',id],{timeout_ms:timeoutMs});
 }catch(e){failure=e.message;}
 finally{
  // Even a create timeout can have allocated the unique owned name. Never remove another container.
  const target=id??name,probe=await call(['inspect',target],{max_output_bytes:policy.maxInspectionBytes});
  if(probe.code===0){try{const info=JSON.parse(decode(probe))[0];assert.equal(info.Config.Labels?.[label],'true');assert.equal(info.Name,'/'+name);assert(/^[a-f0-9]{64}$/.test(info.Id));id=info.Id;const removed=await call(['rm','--force',id]);assert.equal(removed.code,0,'Container cleanup failed');const absent=await call(['inspect',id],{max_output_bytes:policy.maxInspectionBytes});cleanupConfirmed=absent.code===1&&/no such object/i.test(Buffer.from(absent.stderr_base64,'base64').toString());}catch(e){failure=[failure,e.message].filter(Boolean).join('; ');}}
  else cleanupConfirmed=!createAmbiguous&&probe.code===1&&/no such object/i.test(Buffer.from(probe.stderr_base64,'base64').toString());
 }
 return {policy,containerName:name,createAmbiguous,payloadSha256:payload.sha256,admitted,execution,cleanupConfirmed,failure,passed:admitted&&execution?.code===0&&!execution.reason&&execution.closed&&cleanupConfirmed,records,limitation:'Container exit/assertions are bounded execution evidence, not adversarial-proof semantic grading. Candidate code can affect JavaScript builtins; inspect answers and trusted oracle scope separately. No native autonomous repair claim.'};
}
