import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const DOCKER_POLICY = {command_timeout_ms:15000,max_output_bytes:1048576};
export async function boundedCommand(binary,args,{timeout_ms=DOCKER_POLICY.command_timeout_ms,max_output_bytes=DOCKER_POLICY.max_output_bytes}={}){
 assert(Number.isSafeInteger(timeout_ms)&&timeout_ms>0&&timeout_ms<=300000);assert(Number.isSafeInteger(max_output_bytes)&&max_output_bytes>0&&max_output_bytes<=DOCKER_POLICY.max_output_bytes);
 const started_at=new Date().toISOString(),child=spawn(binary,args,{stdio:['ignore','pipe','pipe']});let out=[],err=[],kept=0,observed=0,reason=null,timer,drain;
 return await new Promise(resolve=>{let settled=false;const finish=(code,signal,error=null,closed=true)=>{if(settled)return;settled=true;clearTimeout(timer);clearTimeout(drain);resolve({argv:[binary,...args],started_at,completed_at:new Date().toISOString(),code,signal,error,reason,closed,observed_bytes:observed,retained_bytes:kept,stdout_base64:Buffer.concat(out).toString('base64'),stderr_base64:Buffer.concat(err).toString('base64')});};const stop=why=>{if(reason)return;reason=why;child.kill('SIGKILL');drain=setTimeout(()=>{child.stdout.destroy();child.stderr.destroy();finish(null,null,'drain-unconfirmed',false);},1000);};
 for(const [stream,parts]of [[child.stdout,out],[child.stderr,err]])stream.on('data',b=>{observed+=b.length;const retain=b.subarray(0,Math.max(0,max_output_bytes-kept));parts.push(retain);kept+=retain.length;if(observed>max_output_bytes)stop('output-cap');});
 child.on('error',e=>finish(null,null,e.code));child.on('close',(code,signal)=>finish(code,signal));timer=setTimeout(()=>stop('deadline'),timeout_ms);
 });
}
