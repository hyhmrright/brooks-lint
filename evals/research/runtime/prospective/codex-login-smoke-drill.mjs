/** Real Codex CLI against a local authored response; no credentials or live inference. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {runLoginSmoke,scrub} from './codex-login-smoke.mjs';
import {fixtureResponse} from './native-remote-broker.mjs';
const out=process.argv[2];if(!out||fs.existsSync(out))throw Error('New output directory required');
const requests=[];const server=http.createServer(async(q,r)=>{
 let raw='',size=0;for await(const c of q){size+=c.length;if(size>400000){q.destroy();return}raw+=c}
 requests.push({path:q.url,body:JSON.parse(raw)});
 if(requests.length>1){r.writeHead(429);r.end();return}
 const response=fixtureResponse('allowed','',2).body.replaceAll('fixture-model','gpt-6-luna').replaceAll('NATIVE_OFFLINE_FIXTURE_DONE','BROOKS_LOGIN_OK');
 r.writeHead(200,{'content-type':'text/event-stream'});r.end(response);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const record=await runLoginSmoke({model:'gpt-6-luna',out,fixtureEndpoint:`http://127.0.0.1:${server.address().port}/v1`});
 // The fresh private root appears in the request context; scrub it before archiving.
 const root=record.requests.find(q=>q.method==='thread/start')?.params.cwd;
 const requestText=JSON.stringify(requests).replace(/\/private\/var\/folders\/[^\s"\\]+\/brooks-login-smoke-[A-Za-z0-9]+/g,'[private-home]').replace(/\/var\/folders\/[^\s"\\]+\/brooks-login-smoke-[A-Za-z0-9]+/g,'[private-home]').replace(/\/tmp\/brooks-login-smoke-[A-Za-z0-9]+/g,'[private-home]');
 fs.writeFileSync(path.join(out,'fixture-requests.json'),JSON.stringify(JSON.parse(requestText),null,2)+'\n');
 console.log(JSON.stringify({status:record.status,error:record.error,requests:requests.length,cleanup:record.cleanup}));
 if(record.status!=='completed'||requests.length!==1)process.exitCode=1;
}finally{server.closeAllConnections();server.close()}
