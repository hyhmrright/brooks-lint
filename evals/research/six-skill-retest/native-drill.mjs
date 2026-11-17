/** Authless, loopback-only double for native CLI dynamic workspace wiring. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {runLoginTurn} from './login-turn.mjs';
import {createWorkspace} from './workspace.mjs';
import {localBinding} from './plan.mjs';

const model='gpt-6.1-terra';
const workspace=createWorkspace({skill:'review',writable:[]},{'README.md':'offline fixture'});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-six-native-'));
const requests=[];
const final='OFFLINE_WORKSPACE_CONFIRMED';
const server=http.createServer(async (req,res)=>{
  try {
    assert.equal(req.method,'POST');
    assert.equal(req.url,'/v1/responses');
    let bytes='';
    for await(const chunk of req) {
      bytes+=chunk;
      assert(bytes.length<300_000);
    }
    const body=JSON.parse(bytes);
    assert.equal(body.model,model);
    assert(body.input.some(item=>item.type==='additional_tools' && JSON.stringify(item).includes('benchmark_workspace')));
    requests.push(body);
    assert(requests.length<=2);
    if(requests.length===2) assert(body.input.some(item=>item.type==='custom_tool_call_output' &&
      JSON.stringify(item).includes('offline fixture')));
    const item=requests.length===1 ? {id:'fc_fixture',type:'custom_tool_call',namespace:'functions',call_id:'call_fixture',
      name:'exec',input:'text(await tools.benchmark_workspace({action:"read",path:"README.md"}));',status:'completed'} :
      {id:'msg_fixture',type:'message',role:'assistant',phase:'final_answer',status:'completed',
        content:[{type:'output_text',text:final,annotations:[]}]};
    const base={id:'resp_fixture_'+requests.length,object:'response',created_at:0,model,error:null,
      incomplete_details:null,parallel_tool_calls:false,usage:{input_tokens:1,output_tokens:1,total_tokens:2}};
    const events=[{type:'response.created',response:{...base,status:'in_progress',output:[]}},
      {type:'response.output_item.added',output_index:0,item:{...item,status:'in_progress'}},
      {type:'response.output_item.done',output_index:0,item},
      {type:'response.completed',response:{...base,status:'completed',output:[item]}}];
    res.writeHead(200,{'content-type':'text/event-stream'});
    res.end(events.map((event,i)=>'event: '+event.type+'\ndata: '+JSON.stringify({...event,sequence_number:i})+'\n\n').join(''));
  } catch(error) {
    res.writeHead(400);
    res.end('Offline protocol mismatch: '+String(error.message));
  }
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
try {
  const record=await runLoginTurn({model,effort:'low',cliVersion:'0.169.0',
    executable:localBinding().executable,workspace,out:path.join(temp,'record'),timeoutMs:15_000,
    fixtureEndpoint:'http://127.0.0.1:'+server.address().port+'/v1',
    prompt:'Read README.md using benchmark_workspace, then report your result.'});
  assert.equal(record.status,'completed',JSON.stringify({error:record.error,stderr:record.stderr,events:record.events.map(e=>({method:e.method,message:e.params?.message,error:e.params?.turn?.error})),requests:requests.length}));
  assert.equal(record.answer,final);
  assert.equal(requests.length,2);
  assert.equal(record.tool_calls.length,1);
  assert.equal(record.tool_calls[0].result.text,'offline fixture');
  assert(record.cleanup.private_home_removed && record.cleanup.group_absent);
  console.log(JSON.stringify({simulation:true,cli:record.cli_version,rpc:record.requests.map(r=>r.method),
    fixtureHttpRequests:requests.length,tool:record.tool_calls[0].arguments,cleanup:record.cleanup}));
} finally {
  server.closeAllConnections();
  server.close();
  fs.rmSync(temp,{recursive:true,force:true});
}
