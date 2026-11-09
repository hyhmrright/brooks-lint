/** Offline record checks: event-level consistency only, not proof of credential isolation. */
import assert from 'node:assert/strict';
import {verifyIdentity,absenceConfirmed} from './docker-lease.mjs';

export function validateLoginRecord(record,{hostile=false,model='fixture-model',lunaDirect=false}={}) {
  assert(['fixture-model','gpt-6-luna'].includes(model),'unregistered simulated model');
  assert(!lunaDirect || model==='gpt-6-luna','direct catalog override applies only to Luna');
  assert.equal(record.simulation,true,'real provider responses cannot be certified by this fixture validator');
  assert(!record.error && !record.cleanup_error,'run must not report an error');
  if(lunaDirect){
    assert.deepEqual(record.catalog_override?.before,{tool_mode:'code_mode_only',multi_agent_version:'v2',apply_patch_tool_type:'freeform',experimental_supported_tools:['send_user_message_async','clock']});
    assert.deepEqual(record.catalog_override?.after,{tool_mode:'direct',multi_agent_version:null,apply_patch_tool_type:null,experimental_supported_tools:[]});
    assert.match(record.catalog_override?.sha256,/^[0-9a-f]{64}$/);
    assert(Array.isArray(record.app_argv));assert.equal(record.app_argv.filter(x=>x.startsWith('model_catalog_json=')).length,1);
    // Catalog bytes are not retained; the stated digest is metadata, not independently validated.
  }
  assert(Array.isArray(record.events) && Array.isArray(record.requests));
  assert(record.requests.length > 0,'no captured fixture requests');
  for (const request of record.requests) {
    assert.equal(request.path,'/v1/responses');
    const body=JSON.parse(request.body);
    assert.equal(body.model,model);
    assert(Array.isArray(body.input));
    const extra=body.input.filter(item=>item.type==='additional_tools');
    if(lunaDirect){
      assert.equal(extra.length,1,'one admitted additional_tools declaration required');
      assert(!('tools' in body) || (Array.isArray(body.tools) && body.tools.length===0),'no other top-level tools allowed');
      assert.equal(extra[0].role,'developer');assert.equal(extra[0].tools.length,1);
      const ns=extra[0].tools[0];assert.equal(ns.type,'namespace');assert.equal(ns.name,'functions');
      assert.deepEqual(ns.tools.map(t=>t.name).sort(),['exec_command','write_stdin']);
      assert(ns.tools.every(t=>t.type==='function'));
    }else{
      assert.equal(extra.length,0,'additional tool namespaces are not admitted');
      assert(Array.isArray(body.tools),'top-level allowlisted tools required');
      assert.deepEqual(body.tools.map(t=>t.name).sort(),['exec_command','write_stdin']);
      assert(body.tools.every(t=>t.type==='function'));
    }
  }
  const t=record.thread?.thread;
  assert(t && typeof t.id==='string' && t.id.length>0,'missing thread');
  assert.equal(t.model,model);assert.equal(t.reasoningEffort,'low');
  assert.deepEqual(t.environments.map(e=>[e.environmentId,e.cwd]),[['worker','/workspace']]);
  const starts=record.events.filter(e=>e.result?.thread);
  assert.equal(starts.length,1,'one thread/start result required');assert.deepEqual(starts[0].result,record.thread);
  assert(Array.isArray(record.protocol));
  const messages=method=>record.protocol.filter(p=>p.method===method);
  const threadRequests=messages('thread/start');assert.equal(threadRequests.length,1);
  const q=threadRequests[0];assert.deepEqual(record.events.filter(e=>e.id===q.id).map(e=>e.result),[record.thread]);
  assert.deepEqual(Object.keys(q.params).sort(),['allowProviderModelFallback','approvalPolicy','cwd','environments','ephemeral','model','modelProvider','sandbox']);
  assert.equal(q.params.sandbox,'danger-full-access');assert.equal(q.params.approvalPolicy,'never');assert.equal(q.params.ephemeral,true);
  assert.deepEqual(q.params.environments,[{environmentId:'worker',cwd:'/workspace'}]);
  assert.equal(q.params.cwd,'/workspace');assert.equal(q.params.model,model);assert.equal(q.params.modelProvider,'fixture');assert.equal(q.params.allowProviderModelFallback,false);
  const adds=messages('environment/add');assert.equal(adds.length,1);assert.equal(adds[0].params.environmentId,'worker');assert.equal(adds[0].params.authBearerToken,'[redacted]');assert.match(adds[0].params.execServerUrl,/^ws:\/\/127\.0\.0\.1:[0-9]+$/);
  const statuses=messages('environment/status');assert(statuses.length>0);assert(statuses.every(p=>p.params.environmentId==='worker'));
  assert(statuses.some(p=>record.events.some(e=>e.id===p.id&&e.result?.status==='ready')),'worker readiness absent');
  const requests=messages('turn/start');assert.equal(requests.length,1);
  assert.deepEqual(Object.keys(requests[0].params).sort(),['input','threadId']);assert.equal(requests[0].params.threadId,t.id);
  assert.equal(new Set(record.protocol.map(p=>p.id)).size,record.protocol.length,'duplicate RPC id');
  assert(record.events.every(e=>!e.error),'RPC error');
  const turns=record.events.filter(e=>e.method==='turn/completed');
  assert.equal(turns.length,1);const turn=turns[0].params;
  assert.equal(turn.threadId,t.id);assert.equal(turn.turn.status,'completed');assert(!turn.turn.error);
  assert.equal(record.events.find(e=>e.id===requests[0].id)?.result?.turn?.id,turn.turn.id);
  const commands=record.events.filter(e=>e.method==='item/completed' && e.params?.item?.type==='commandExecution');
  assert.equal(commands.length,1,'one observed command required');const command=commands[0].params;
  assert.equal(command.threadId,t.id);assert.equal(command.turnId,turn.turn.id);assert.equal(command.item.status,'completed');assert.equal(command.item.exitCode,0);assert.equal(command.item.cwd,'/workspace');
  assert.equal(record.cleanup?.phase,'complete');assert.equal(record.cleanup?.absence_confirmed,true);
  assert.match(record.worker_id,/^[0-9a-f]{64}$/);assert.equal(record.cleanup.identity?.id,record.worker_id);
  const inspect=record.worker_inspect;
  assert.deepEqual(inspect?.argv,['docker','inspect',record.worker_id]);
  assert(inspect.code===0 && !inspect.signal && !inspect.reason && !inspect.error && inspect.closed);
  verifyIdentity(JSON.parse(Buffer.from(inspect.stdout_base64,'base64'))[0],record.cleanup.intent,record.cleanup.identity);
  const events=record.lease_events.trim().split('\n').map(JSON.parse);
  const rm=events.filter(e=>e.type==='docker' && JSON.stringify(e.result?.argv)===JSON.stringify(['docker','rm',record.worker_id]));
  assert.equal(rm.length,1);const removed=rm[0].result;
  assert(removed.code===0 && !removed.signal && !removed.reason && !removed.error && removed.closed);
  const absent=events.filter(e=>e.type==='docker' && JSON.stringify(e.result?.argv)===JSON.stringify(['docker','inspect',record.worker_id]) && absenceConfirmed(e.result,record.worker_id) && Date.parse(e.result.started_at)>=Date.parse(removed.completed_at));
  assert.equal(absent.length,1,'exact worker absence after removal required');
  const complete=events.filter(e=>e.type==='complete' && e.token===record.cleanup.intent.token);
  assert.equal(complete.length,1);assert.equal(complete[0].reason,record.cleanup.reason);
  const start=Number(record.started_at),end=Number(record.completed_at),done=Number(record.cleanup.completed_at);
  assert(Number.isFinite(start)&&Number.isFinite(end)&&Number.isFinite(done)&&start<=done&&done<=end);
  assert(Date.parse(removed.started_at)>=start && Date.parse(removed.completed_at)<=Date.parse(absent[0].result.started_at));
  assert(Date.parse(absent[0].result.completed_at)<=done && done<=complete[0].at && complete[0].at<=end);

  let observation=null;
  if(!hostile) assert.equal(command.item.aggregatedOutput,'WORKER\n');
  else {
    const lines=command.item.aggregatedOutput.trimEnd().split('\n');
    const sentinel=JSON.parse(lines.at(-2));assert.equal(sentinel.host_auth_sentinel_visible,false);
    observation=JSON.parse(lines.at(-1));
    assert.equal(observation.domain,'WORKER\n');assert.equal(observation.uid,1000);
    assert.deepEqual(observation.process_credentials,[]);assert.deepEqual(observation.credentials,[]);
    assert.equal(observation.mount,false);assert.equal(observation.docker_socket,false);assert.equal(observation.client_home,false);
    assert.deepEqual(observation.broker_probes,['ECONNREFUSED','ECONNREFUSED','ECONNREFUSED','ECONNREFUSED']);
    assert.equal(observation.egress,'ENETUNREACH');assert.equal(observation.host,'EAI_AGAIN');assert.equal(observation.late,'ECONNREFUSED');
  }
  return {simulation:true,model_identity:'not established',hostile_observation:observation};
}
