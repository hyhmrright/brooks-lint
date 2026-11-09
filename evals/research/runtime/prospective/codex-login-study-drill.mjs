/** Real local Codex CLI through a synthetic loopback HTTP proxy; no live inference. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {runLoginTurn,assertSupportedPlatform} from './codex-login-turn.mjs';
import {fixtureResponse} from './native-remote-broker.mjs';
assertSupportedPlatform();
const [out,model='gpt-6-luna',delayArg='0',timeoutArg='45000']=process.argv.slice(2);
const delayMs=Number(delayArg),timeoutMs=Number(timeoutArg);
if(!out||fs.existsSync(out))throw Error('New output directory required');
if(!/^gpt-[A-Za-z0-9._-]+$/.test(model)||!Number.isInteger(delayMs)||delayMs<0||delayMs>45000||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>45000)throw Error('Usage: NEW_DIRECTORY [MODEL [DELAY_MS [TIMEOUT_MS]]]');
const observed=[];
const proxy=http.createServer(async(q,r)=>{
 let body='';for await(const c of q)body+=c;
 const parsed=JSON.parse(body);observed.push({method:q.method,url:q.url,bytes:Buffer.byteLength(body),model:parsed.model,reasoning:parsed.reasoning,tools_present:Object.hasOwn(parsed,'tools'),tool_names:(parsed.tools??[]).map(t=>t.name??t.type),input_sha256:crypto.createHash('sha256').update(JSON.stringify(parsed.input)).digest('hex')});
 if(observed.length>1){r.writeHead(429);r.end();return}
 const response=fixtureResponse('allowed','',2).body.replaceAll('fixture-model',model).replaceAll('NATIVE_OFFLINE_FIXTURE_DONE','BROOKS_LOGIN_OK');
 if(delayMs)await new Promise(resolve=>setTimeout(resolve,delayMs));
 if(r.destroyed)return;
 r.writeHead(200,{'content-type':'text/event-stream'});r.end(response);
});
await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
const keys=['http_proxy','https_proxy','all_proxy','no_proxy','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY'];const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
for(const key of keys)delete process.env[key];
process.env.http_proxy=`http://127.0.0.1:${proxy.address().port}`;
try{
 const result=await runLoginTurn({model,out,prompt:"Diagnose this synthetic example only. Reply with BROOKS_LOGIN_OK.",effort:"medium",cliVersion:"0.167.0",fixtureEndpoint:'http://127.0.0.1:1/v1',inheritProxy:true,timeoutMs});
 fs.writeFileSync(path.join(out,'proxy-observation.json'),JSON.stringify({simulation:true,model,delay_ms:delayMs,timeout_ms:timeoutMs,observed},null,2)+'\n');
 console.log(JSON.stringify({status:result.status,error:result.error,proxyRequests:observed.length,cleanup:result.cleanup}));
 // A deliberate delay longer than the deadline must fail; successful delayed
 // responses are expected only with enough time for CLI initialization.
 const expected=delayMs>=timeoutMs?'failed':'completed';
 if(observed.some(q=>q.tool_names.length||q.model!==model||q.reasoning?.effort!=='medium'))throw Error('Unexpected upstream tool/model/effort profile');
 if(result.status!==expected||observed.length!==1||(expected==='failed'&&result.error!=='Smoke deadline exceeded'))process.exitCode=1;
}finally{for(const key of keys){if(prior[key]===undefined)delete process.env[key];else process.env[key]=prior[key]}proxy.closeAllConnections();proxy.close()}
