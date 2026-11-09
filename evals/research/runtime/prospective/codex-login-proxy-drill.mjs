/** Real local Codex CLI through a synthetic loopback HTTP proxy; no live inference. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {runLoginSmoke} from './codex-login-smoke.mjs';
import {fixtureResponse} from './native-remote-broker.mjs';
const out=process.argv[2];if(!out||fs.existsSync(out))throw Error('New output directory required');
const observed=[];
const proxy=http.createServer(async(q,r)=>{
 let body='';for await(const c of q)body+=c;
 observed.push({method:q.method,url:q.url,bytes:Buffer.byteLength(body)});
 if(observed.length>1){r.writeHead(429);r.end();return}
 const response=fixtureResponse('allowed','',2).body.replaceAll('fixture-model','gpt-6-luna').replaceAll('NATIVE_OFFLINE_FIXTURE_DONE','BROOKS_LOGIN_OK');
 r.writeHead(200,{'content-type':'text/event-stream'});r.end(response);
});
await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
const keys=['http_proxy','https_proxy','all_proxy','no_proxy','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY'];const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
for(const key of keys)delete process.env[key];
process.env.http_proxy=`http://127.0.0.1:${proxy.address().port}`;
try{
 const result=await runLoginSmoke({model:'gpt-6-luna',out,fixtureEndpoint:'http://127.0.0.1:1/v1',inheritProxy:true});
 fs.writeFileSync(path.join(out,'proxy-observation.json'),JSON.stringify({simulation:true,observed},null,2)+'\n');
 console.log(JSON.stringify({status:result.status,error:result.error,proxyRequests:observed.length,cleanup:result.cleanup}));
 if(result.status!=='completed'||observed.length!==1)process.exitCode=1;
}finally{for(const key of keys){if(prior[key]===undefined)delete process.env[key];else process.env[key]=prior[key]}proxy.closeAllConnections();proxy.close()}
