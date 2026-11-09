/** Offline diagnostic only. Replays the stock Luna custom-tool protocol, never a real provider. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {boundedCommand} from './docker-isolation.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
export function stockProbeSource(source,enabled){
 assert.equal(typeof enabled,'boolean');
 const anchor="import {fixtureResponse} from './native-remote-broker.mjs';";
 assert.equal(source.split(anchor).length,2,'probe import drift');
 assert.equal(source.split("'features.code_mode_host=false'").length,2,'probe config drift');
 return source.replace(anchor,`import {fixtureResponse as directFixtureResponse} from './native-remote-broker.mjs';
function fixtureResponse(scenario,tool,n){
 const f=directFixtureResponse(scenario,tool,n);
 if(n!==1)return f;
 const item=f.completed.output[0];
 const wrapped={id:item.id,type:'custom_tool_call',call_id:item.call_id,name:'exec',namespace:'functions',input:'text(await tools.exec_command('+item.arguments+'));',status:'completed'};
 return {...f,body:f.body.split('\\n').map(line=>{if(!line.startsWith('data: '))return line;const x=JSON.parse(line.slice(6));if(x.item)x.item={...wrapped,status:x.item.status};if(x.response?.output.length)x.response.output=[wrapped];return 'data: '+JSON.stringify(x)}).join('\\n')};
}
`).replace("'features.code_mode_host=false'",`'features.code_mode_host=${enabled}'`);
}
export function validateStockObservation(r,enabled){
 assert.equal(r.simulation,true);assert(!r.error);assert.equal(r.catalog_override,null);
 assert.equal(r.requests.length,2);
 const bodies=r.requests.map(x=>{assert.equal(x.path,'/v1/responses');return JSON.parse(x.body)});
 assert(bodies.every(x=>x.model==='gpt-6-luna'));
 const namespaces=bodies[0].input.find(x=>x.type==='additional_tools').tools;
 const exec=namespaces.find(x=>x.name==='functions').tools.find(x=>x.name==='exec');
 assert.equal(exec.type,'custom');assert(exec.description.includes('exec_command'));
 assert(r.app_argv.includes(`features.code_mode_host=${enabled}`));
 const commands=r.events.filter(x=>x.method==='item/completed'&&x.params?.item?.type==='commandExecution');
 const outputs=bodies[1].input.filter(x=>x.type==='custom_tool_call_output');
 assert.equal(outputs.length,1);
 if(enabled){assert.equal(commands.length,1);assert.equal(commands[0].params.item.exitCode,0);assert.equal(commands[0].params.item.aggregatedOutput,'WORKER\n');assert(JSON.stringify(outputs[0].output).includes('WORKER'))}
 else {assert.equal(commands.length,0);assert.equal(outputs[0].output,'code-mode host is disabled')}
 assert.equal(r.cleanup.phase,'complete');assert.equal(r.cleanup.absence_confirmed,true);
 assert.equal(r.cleanup.identity.id,r.worker_id);
 return {simulation:true,code_mode_host:enabled,observed_shell_execution:enabled,catalog_override:false,provider_identity_verified:false};
}
export async function recordStockDrill(out){
 assert(!fs.existsSync(out),'refuse overwrite');fs.mkdirSync(out,{recursive:true});
 const original=fs.readFileSync(path.join(here,'codex-login-probe.mjs'),'utf8');
 const summary={simulation:true,original_probe_sha256:hash(original),cases:[]};
 for(const enabled of [false,true]){
  const name=enabled?'enabled':'disabled';const source=stockProbeSource(original,enabled);
  const temporary=path.join(here,`.stock-probe-${crypto.randomUUID()}.mjs`);
  fs.writeFileSync(temporary,source,{flag:'wx',mode:0o600});
  fs.writeFileSync(path.join(out,name+'-source.txt'),source);
  try{
   const result=await boundedCommand('/usr/bin/env',['-i','PATH='+process.env.PATH,'HOME='+process.env.HOME,'BROOKS_LUNA_FIXTURE=1',process.execPath,temporary,path.resolve(out,name+'.json')],{timeout_ms:45000});
   assert.equal(result.code,0);assert.equal(result.closed,true);
   const file=path.join(out,name+'.json');const r=JSON.parse(fs.readFileSync(file));
   r.events=r.events.filter(x=>x.method!=='remoteControl/status/changed');
   assert.equal(r.source_sha256,hash(source));
   const observation=validateStockObservation(r,enabled);
   fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');
   summary.cases.push({name,...observation,record_sha256:hash(fs.readFileSync(file)),source_sha256:hash(source)});
  }finally{fs.rmSync(temporary,{force:true})}
 }
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');return summary;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 assert.equal(process.argv[2],'record');assert(process.argv[3],'new output directory required');
 console.log(JSON.stringify(await recordStockDrill(process.argv[3]),null,2));
}
