/** A single, explicit Codex ChatGPT-login text smoke. No API key or catalog override. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {StringDecoder} from 'node:string_decoder';

export const PROMPT='Reply with exactly BROOKS_LOGIN_OK. Do not use any tools, delegate, or access files.';
export const LIMITS=Object.freeze({turn_ms:45000,cleanup_ms:3000,output_bytes:2097152,turns:1});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
export function scrub(value,secrets=[],root='') {
  let text=JSON.stringify(value);
  for(const secret of [...secrets,root].filter(x=>typeof x==='string'&&x.length>3).sort((a,b)=>b.length-a.length)) text=text.split(secret).join('[redacted]');
  text=text.replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/g,'Bearer [redacted]');
  return JSON.parse(text);
}
export function loginCredential(bytes) {
  const auth=JSON.parse(bytes);
  if(auth.auth_mode!=='chatgpt'||!auth.tokens||typeof auth.tokens.access_token!=='string'||!auth.tokens.access_token)throw Error('ChatGPT file login required; run codex login (API keys are not accepted)');
  const secrets=Object.values(auth.tokens).filter(x=>typeof x==='string');
  return {auth:{auth_mode:'chatgpt',tokens:{id_token:auth.tokens.id_token??'',access_token:auth.tokens.access_token,refresh_token:'',...(auth.tokens.account_id?{account_id:auth.tokens.account_id}:{})},...(auth.last_refresh?{last_refresh:auth.last_refresh}:{})},secrets};
}
export function argumentsFor(model,{fixtureEndpoint}={}) {
  if(typeof model!=='string'||!/^gpt-[A-Za-z0-9._-]+$/.test(model))throw Error('Explicit gpt-* model required');
  const config=[`model=${JSON.stringify(model)}`,'model_reasoning_effort="low"','cli_auth_credentials_store="file"','project_doc_max_bytes=0','web_search="disabled"','cloud.skills.enabled=false','skills.include_instructions=false','skills.bundled.enabled=false','tools.update_plan.enabled=false','tools.experimental_request_user_input.enabled=false'];
  for(const key of ['shell_tool','shell_snapshot','plugins','apps','hooks','multi_agent','multi_agent_v2','goals','view_image','image_generation','request_permissions_tool','context_management','deferred_executor','memories','code_mode_host','unbounded_connection_retries','browser_use','computer_use','workspace_dependencies','sleep_tool','skill_search','plugin_discovery_prefetch'])config.push(`features.${key}=false`);
  if(fixtureEndpoint){const u=new URL(fixtureEndpoint);if(u.hostname!=='127.0.0.1'||u.protocol!=='http:'||u.pathname!=='/v1'||!u.port)throw Error('Offline endpoint must be local /v1');config.push('model_provider="fixture"','model_providers.fixture.name="fixture"',`model_providers.fixture.base_url=${JSON.stringify(fixtureEndpoint)}`,'model_providers.fixture.wire_api="responses"','model_providers.fixture.requires_openai_auth=false','model_providers.fixture.supports_websockets=false','model_providers.fixture.request_max_retries=0','model_providers.fixture.stream_max_retries=0');}
  else config.push('model_provider="openai"','forced_login_method="chatgpt"');
  return ['--no-daemon',...config.flatMap(x=>['-c',x]),'app-server','--stdio'];
}
const alive=pid=>{try{process.kill(-pid,0);return true}catch(e){if(e.code==='ESRCH')return false;throw e}};
export async function terminate(child,closed,ms=LIMITS.cleanup_ms){
  if(!child?.pid)return {closed:await closed,group_absent:true};
  const signal=s=>{try{process.kill(-child.pid,s)}catch(e){if(e.code!=='ESRCH')throw e}};
  signal('SIGTERM');
  const until=Date.now()+ms;
  while(alive(child.pid)&&Date.now()<until-500)await wait(25);
  if(alive(child.pid))signal('SIGKILL');
  while(alive(child.pid)&&Date.now()<until)await wait(25);
  const didClose=await Promise.race([closed,wait(Math.max(0,until-Date.now())).then(()=>false)]);
  return {closed:didClose,group_absent:!alive(child.pid)};
}
/** fixtureEndpoint and executable exist solely for deterministic, offline verification. */
export async function runLoginSmoke({model,out,live=false,authHome=path.join(os.homedir(),'.codex'),fixtureEndpoint,executable='codex',prefixArgs=[],timeoutMs=LIMITS.turn_ms}={}) {
  if(live&&fixtureEndpoint)throw Error('Cannot mix live and fixture routes');
  if(!live&&!fixtureEndpoint)throw Error('Explicit --live required; otherwise a local fixture endpoint is required');
  if(!Number.isInteger(timeoutMs)||timeoutMs<=0||timeoutMs>LIMITS.turn_ms)throw Error('Invalid timeout');
  const argv=argumentsFor(model,{fixtureEndpoint});
  if(!out||fs.existsSync(out))throw Error('New output directory required');
  fs.mkdirSync(out,{recursive:true,mode:0o700});
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-login-smoke-'));fs.chmodSync(root,0o700);
  const home=path.join(root,'codex');fs.mkdirSync(home,{mode:0o700});
  const record={version:1,simulation:!live,scope:'single-text-login-smoke',requested_model:model,requested_effort:'low',provider_reported_model:null,provider_identity_verified:false,cli_selected_model:null,auth_type:null,started_at:new Date().toISOString(),argv,prompt:PROMPT,limits:LIMITS,source_sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),events:[],requests:[],rpc_responses:[],stderr:'',status:'failed',answer:null,usage:null,limitations:['One submitted turn, not a hard backend-request/token/cost cap; built-in provider retries are not overridden.','ChatGPT usage and billing are not API dollar accounting.','Model selection is CLI metadata, not independent backend attestation.','Text smoke does not validate remote shell execution.','Fresh auth-only home; original refresh token is never copied. Expired access fails and requires refreshing the normal login before retry.']};
  let secrets=[],child,closed=Promise.resolve(true),timer,buffer='',size=0,next=0,pending=new Map(),resolveTurn,rejectTurn,fatal=null;
  const decoder=new StringDecoder('utf8');
  const turn=new Promise((resolve,reject)=>{resolveTurn=resolve;rejectTurn=reject});turn.catch(()=>{});
  const fail=e=>{fatal??=e;for(const p of pending.values())p.reject(e);pending.clear();rejectTurn(e)};
  const clean=x=>scrub(x,secrets,root);
  try {
    if(live){const parsed=loginCredential(fs.readFileSync(path.join(authHome,'auth.json'),'utf8'));secrets=parsed.secrets;fs.writeFileSync(path.join(home,'auth.json'),JSON.stringify(parsed.auth),{mode:0o600});}
    child=spawn(executable,[...prefixArgs,...argv],{cwd:root,env:{PATH:process.env.PATH,HOME:root,CODEX_HOME:home},detached:true,stdio:['pipe','pipe','pipe']});
    closed=new Promise(resolve=>{child.once('close',()=>resolve(true));child.once('error',e=>{record.spawn_error=e.code||'spawn-error';fail(Error('CLI spawn failed'));resolve(true)})});
    child.stdin.on('error',()=>fail(Error('CLI input closed')));
    child.once('close',(code,signal)=>{record.exit={code,signal};fail(Error('CLI closed'))});
    function onBytes(b){size+=b.length;if(size>LIMITS.output_bytes){fail(Error('Output limit exceeded'));try{process.kill(-child.pid,'SIGKILL')}catch{};return false}return true}
    child.stderr.on('data',b=>{if(onBytes(b))record.stderr+=clean(b.toString())});
    child.stdout.on('data',b=>{if(!onBytes(b))return;buffer+=decoder.write(b);let n;while((n=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,n);buffer=buffer.slice(n+1);let e;try{e=JSON.parse(line)}catch{fail(Error('Invalid JSONL from CLI'));continue}
      if(e.id!==undefined&&pending.has(e.id)&&!e.method){const p=pending.get(e.id);pending.delete(e.id);if(p.method!=='account/read')record.rpc_responses.push({method:p.method,response:clean(e)});e.error?p.reject(Error('RPC '+p.method+' failed: '+clean(e.error.message))):p.resolve(e.result);continue}
      if(e.method==='remoteControl/status/changed')continue;
      record.events.push(clean(e));
      if(e.id!==undefined&&e.method){child.stdin.write(JSON.stringify({id:e.id,error:{code:-32601,message:'Interactive/server requests are disabled in login smoke'}})+'\n');fail(Error('Unexpected server request'));}
      if(['item/started','item/completed'].includes(e.method)&&e.params?.item&&!['userMessage','agentMessage','reasoning'].includes(e.params.item.type)){record.unexpected_activity=e.params.item.type;fail(Error('Unexpected tool/activity item: '+e.params.item.type));}
      if(e.method==='thread/tokenUsage/updated')record.usage=clean(e.params?.tokenUsage??null);
      if(e.method==='turn/completed')resolveTurn(e.params.turn);
    }});
    timer=setTimeout(()=>fail(Error('Smoke deadline exceeded')),timeoutMs);
    function req(method,params){if(fatal)return Promise.reject(fatal);return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject,method});record.requests.push({id,method,params:clean(params)});child.stdin.write(JSON.stringify({id,method,params})+'\n')})}
    record.initialize=clean(await req('initialize',{clientInfo:{name:'brooks-login-smoke',version:'0.1'},capabilities:{experimentalApi:true}}));
    record.cli_version=record.initialize.userAgent?.match(/^[^/]+\/([0-9.]+)/)?.[1]??null;
    child.stdin.write('{"method":"initialized"}\n');
    if(live){const account=await req('account/read',{refreshToken:false});record.auth_type=account.account?.type??null;if(record.auth_type!=='chatgpt')throw Error('CLI did not confirm ChatGPT login');}
    else record.auth_type='synthetic-no-auth';
    const t=await req('thread/start',{model,modelProvider:live?'openai':'fixture',cwd:root,environments:[],sandbox:'read-only',approvalPolicy:'never',ephemeral:true,allowProviderModelFallback:false});
    record.cli_selected_model=t.model??null;record.cli_selected_effort=t.reasoningEffort??null;
    if(t.model!==model)throw Error('CLI selected a different or unreported model');
    record.thread_id=t.thread.id;
    await req('turn/start',{threadId:t.thread.id,input:[{type:'text',text:PROMPT,text_elements:[]}],effort:'low'});
    const completed=await turn;
    if(fatal)throw fatal;
    if(completed.status!=='completed')throw Error('Turn did not complete');
    const answers=record.events.filter(e=>e.method==='item/completed'&&e.params?.item?.type==='agentMessage').map(e=>e.params.item.text);
    record.answer=answers.join('\n');if(record.answer.trim()!=='BROOKS_LOGIN_OK')throw Error('Unexpected smoke answer');
    record.status='completed';
  }catch(e){record.error=clean(String(e.message));}
  finally{
    clearTimeout(timer);record.cleanup=await terminate(child,closed);
    // Include any refreshed credentials in redaction before deleting the private home.
    try{const p=loginCredential(fs.readFileSync(path.join(home,'auth.json'),'utf8'));secrets.push(...p.secrets)}catch{}
    fs.rmSync(root,{recursive:true,force:true});record.cleanup.private_home_removed=!fs.existsSync(root);
    if(record.unexpected_activity||!record.cleanup.closed||!record.cleanup.group_absent||!record.cleanup.private_home_removed)record.status='failed';
    record.completed_at=new Date().toISOString();
    const saved=clean(record);fs.writeFileSync(path.join(out,'record.json'),JSON.stringify(saved,null,2)+'\n',{mode:0o600});fs.writeFileSync(path.join(out,'events.jsonl'),saved.events.map(e=>JSON.stringify(e)).join('\n')+'\n',{mode:0o600});if(saved.answer!==null)fs.writeFileSync(path.join(out,'answer.txt'),saved.answer+'\n',{mode:0o600});
  }
  return clean(record);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),allowed=new Set(['--live','--model','--out']);let model,out,live=false;
  for(let i=0;i<args.length;i++){if(!allowed.has(args[i]))throw Error('Usage: --live --model MODEL --out NEW_DIRECTORY');if(args[i]==='--live')live=true;else if(args[i]==='--model')model=args[++i];else out=args[++i]}
  const r=await runLoginSmoke({model,out,live});console.log(JSON.stringify({status:r.status,requested_model:r.requested_model,cli_selected_model:r.cli_selected_model,error:r.error,cleanup:r.cleanup}));if(r.status!=='completed')process.exitCode=1;
}
