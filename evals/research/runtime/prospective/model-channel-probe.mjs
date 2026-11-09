/** Fixed local Node client probe; never invokes a model or provider. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {realpathSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {seatbeltProfile,nodeRuntimeFiles,isolatedEnvironment} from './process-executor.mjs';
import {hash} from './model-channel.mjs';
export const CLIENT_SOURCE=`import http from 'node:http';let input='';for await(const c of process.stdin)input+=c;const config=JSON.parse(input);const request=(endpoint,headers,body)=>new Promise(resolve=>{const u=new URL(endpoint),r=http.request({hostname:u.hostname,port:u.port,path:u.pathname,method:'POST',agent:false,headers},res=>{let bytes=Buffer.alloc(0);res.on('data',b=>bytes=Buffer.concat([bytes,b]));res.on('end',()=>resolve({status:res.statusCode,response_base64:bytes.toString('base64')}));});r.on('error',e=>resolve({error:e.code}));r.end(body);});const denied=await request(config.denied,{},'');const allowed=await request(config.client.endpoint,{'content-type':'application/json','x-hc-capability':config.client.capability},config.client.body);process.stdout.write(JSON.stringify({denied,allowed,env_keys:Object.keys(process.env).sort(),cwd:process.cwd(),has_provider_credential:!!process.env.OPENAI_API_KEY||!!process.env.CODEX_API_KEY}));`;
export async function runSandboxChannelProbe(session,client,deniedEndpoint){
 assert.equal(process.platform,'darwin','No reviewed channel sandbox backend for this platform');
 const allowed=new URL(client.endpoint),denied=new URL(deniedEndpoint);
 assert(allowed.hostname==='127.0.0.1'&&denied.hostname==='127.0.0.1'&&allowed.port!==denied.port);
 const runtime=nodeRuntimeFiles(),profile=seatbeltProfile(session,runtime)+`(allow network-outbound (remote ip "localhost:${Number(allowed.port)}"))\n`,start=performance.now();
 return await new Promise(resolve=>{
  const child=spawn('/usr/bin/sandbox-exec',['-p',profile,realpathSync(process.execPath),'--no-addons','--input-type=module','-e',CLIENT_SOURCE],{cwd:session.workspace,env:isolatedEnvironment(session),stdio:['pipe','pipe','pipe'],shell:false});
  let stdout=Buffer.alloc(0),stderr=Buffer.alloc(0),timed_out=false,error=null,finished=false;
  const finish=(code,signal)=>{if(finished)return;finished=true;clearTimeout(timer);child.stdin.destroy();child.stdout.destroy();child.stderr.destroy();resolve({fixture_only:true,kind:'actual-fixed-node-channel-sandbox-probe',code,signal,timed_out,error,elapsed_ms:performance.now()-start,stdout_base64:stdout.toString('base64'),stderr_base64:stderr.toString('base64'),policy_text:profile,policy_sha256:hash(profile),environment:isolatedEnvironment(session),runtime_files:runtime.map(path=>({path})),client_source_sha256:hash(CLIENT_SOURCE),source_limitation:'One fixed immediate Node child; this helper is not the full guardian-backed executor',live_ready:false});};
  const capture=(target,b)=>{if(stdout.length+stderr.length+b.length>262144){error='probe-output-limit';child.kill('SIGKILL');return;}if(target==='stdout')stdout=Buffer.concat([stdout,b]);else stderr=Buffer.concat([stderr,b]);};
  child.stdout.on('data',b=>capture('stdout',b));child.stderr.on('data',b=>capture('stderr',b));child.stdin.on('error',()=>{});child.on('error',e=>{error=e.code;finish(null,null);});child.on('close',finish);
  const timer=setTimeout(()=>{timed_out=true;child.kill('SIGKILL');setTimeout(()=>finish(null,'SIGKILL'),100);},2500);
  child.stdin.end(JSON.stringify({client,denied:deniedEndpoint}));
 });
}
