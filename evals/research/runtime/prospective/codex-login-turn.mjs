/** A single, explicit Codex ChatGPT-login text smoke. No API key or catalog override. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {StringDecoder} from 'node:string_decoder';
import {performance} from 'node:perf_hooks';

export const PROMPT='Reply with exactly BROOKS_LOGIN_OK. Do not use any tools, delegate, or access files.';
export const LIMITS=Object.freeze({turn_ms:900000,cleanup_ms:3000,output_bytes:2097152,turns:1});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const PROXY_KEYS=['http_proxy','https_proxy','all_proxy','no_proxy','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY'];
export function proxyEnvironment(source,enabled) {
  const env={},secrets=[];
  if(!enabled)return {env,secrets};
  for(const key of PROXY_KEYS){
    const value=source[key];if(!value)continue;
    if(/[\r\n\0]/.test(value))throw Error('Invalid proxy environment');
    if(!/no_proxy/i.test(key)){
      let url;try{url=new URL(value)}catch{throw Error('Invalid proxy URL')}
      if(!['http:','https:','socks5:','socks5h:'].includes(url.protocol))throw Error('Unsupported proxy URL');
      for(const part of [url.username,url.password])if(part)secrets.push(part,decodeURIComponent(part));
    }
    env[key]=value;secrets.push(value);
  }
  if(!Object.keys(env).some(k=>!/no_proxy/i.test(k)))throw Error('Proxy opt-in requires a proxy URL');
  return {env,secrets};
}
export function scrub(value,secrets=[],root='') {
  const terms=[...secrets.filter(x=>typeof x==='string'&&x.length),...(typeof root==='string'&&root.length>3?[root]:[])].sort((a,b)=>b.length-a.length);
  return JSON.parse(JSON.stringify(value,(_key,item)=>{
    if(typeof item!=='string')return item;
    let text=item;for(const secret of terms)text=text.split(secret).join('[redacted]');
    return text.replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/g,'Bearer [redacted]');
  }));
}
export function loginCredential(bytes) {
  const auth=JSON.parse(bytes);
  if(auth.auth_mode!=='chatgpt'||!auth.tokens||typeof auth.tokens.access_token!=='string'||!auth.tokens.access_token)throw Error('ChatGPT file login required; run codex login (API keys are not accepted)');
  const secrets=Object.values(auth.tokens).filter(x=>typeof x==='string');
  return {auth:{auth_mode:'chatgpt',tokens:{id_token:auth.tokens.id_token??'',access_token:auth.tokens.access_token,refresh_token:'',...(auth.tokens.account_id?{account_id:auth.tokens.account_id}:{})},...(auth.last_refresh?{last_refresh:auth.last_refresh}:{})},secrets};
}
export function argumentsFor(model,{fixtureEndpoint,effort="low"}={}) {
  if(typeof model!=='string'||!/^gpt-[A-Za-z0-9._-]+$/.test(model))throw Error('Explicit gpt-* model required');
  const config=[`model=${JSON.stringify(model)}`,`model_reasoning_effort=${JSON.stringify(effort)}`,'cli_auth_credentials_store="file"','project_doc_max_bytes=0','web_search="disabled"','cloud.skills.enabled=false','skills.include_instructions=false','skills.bundled.enabled=false','tools.update_plan.enabled=false','tools.experimental_request_user_input.enabled=false'];
  for(const key of ['shell_tool','shell_snapshot','plugins','apps','hooks','multi_agent','multi_agent_v2','goals','view_image','image_generation','request_permissions_tool','context_management','deferred_executor','memories','code_mode_host','unbounded_connection_retries','browser_use','computer_use','workspace_dependencies','sleep_tool','skill_search','plugin_discovery_prefetch'])config.push(`features.${key}=false`);
  if(fixtureEndpoint){const u=new URL(fixtureEndpoint);if(u.hostname!=='127.0.0.1'||u.protocol!=='http:'||u.pathname!=='/v1'||!u.port)throw Error('Offline endpoint must be local /v1');config.push('model_provider="fixture"','model_providers.fixture.name="fixture"',`model_providers.fixture.base_url=${JSON.stringify(fixtureEndpoint)}`,'model_providers.fixture.wire_api="responses"','model_providers.fixture.requires_openai_auth=false','model_providers.fixture.supports_websockets=false','model_providers.fixture.request_max_retries=0','model_providers.fixture.stream_max_retries=0');}
  else config.push('model_provider="openai"','forced_login_method="chatgpt"');
  return ['--no-daemon',...config.flatMap(x=>['-c',x]),'app-server','--stdio'];
}
/** Bounded OS observation; kill(-pgid, 0) can throw EPERM during Darwin exit. */
export async function observeGroup(pid,timeoutMs){
 if(process.platform!=='darwin')return {error:'unsupported-platform',members:[]};
 return new Promise(resolve=>{
  let stdout='',stderr='',done=false,timer;
  const child=spawn('/bin/ps',['-g',String(pid),'-o','pid=,pgid=,stat='],{env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},stdio:['ignore','pipe','pipe']});
  const finish=error=>{if(done)return;done=true;clearTimeout(timer);const members=[];if(!error)for(const line of stdout.split('\n').filter(x=>x.trim())){const m=line.match(/^\s*(\d+)\s+(\d+)\s+(\S+)\s*$/);if(!m||Number(m[2])!==pid){error='invalid-process-observation';break;}members.push({pid:Number(m[1]),pgid:Number(m[2]),state:m[3]});}resolve({error,members});};
  const capture=(which,b)=>{if(stdout.length+stderr.length+b.length>65536){child.kill('SIGKILL');finish('probe-output-limit');return;}if(which==='out')stdout+=b.toString();else stderr+=b.toString();};
  child.stdout.on('data',b=>capture('out',b));child.stderr.on('data',b=>capture('err',b));child.on('error',()=>finish('probe-spawn-error'));child.on('close',code=>finish(code===0||(code===1&&!stdout&&!stderr)?null:'probe-exit-error'));
  timer=setTimeout(()=>{child.kill('SIGKILL');finish('probe-timeout');},timeoutMs);
 });
}
export async function terminate(child,closed,ms=LIMITS.cleanup_ms,{probe=observeGroup,kill=process.kill.bind(process)}={}){
 if(!child?.pid)return {closed:await closed,group_absent:true,observations:[],signals:[]};
 const until=performance.now()+ms,observations=[],signals=[];let didClose=false,groupAbsent=false,killed=false;
 closed.then(value=>{didClose=value});
 const signal=s=>{if(didClose||child.exitCode!==null&&child.exitCode!==undefined||child.signalCode){signals.push({signal:s,skipped:'leader-exited'});return;}try{kill(-child.pid,s);signals.push({signal:s,delivered:true});}catch(e){signals.push({signal:s,delivered:false,error:e.code??'UNKNOWN'});}};
 signal('SIGTERM');
 while(performance.now()<until){
  let observation;try{observation=await probe(child.pid,Math.max(1,Math.min(200,until-performance.now())));}catch{observation={error:'probe-exception',members:[]};}
  observations.push(observation);
  if(observation.error)break;
  groupAbsent=observation.members.length===0;
  if(groupAbsent)break;
  if(!killed&&performance.now()>=until-500){signal('SIGKILL');killed=true;}
  await wait(Math.min(25,Math.max(0,until-performance.now())));
 }
 if(!didClose)didClose=await Promise.race([closed,wait(Math.max(0,until-performance.now())).then(()=>false)]);
 return {closed:didClose,group_absent:groupAbsent,observations,signals};
}
export function answerText(events,threadId,turnId){
 const messages=new Map();
 for(const e of events){const p=e.params;if(!p||p.threadId!==threadId||p.turnId!==turnId)continue;
 if(e.method==='item/agentMessage/delta'){const id=p.itemId;if(typeof id==='string')messages.set(id,(messages.get(id)??'')+(p.delta??''));}
 if(e.method==='item/completed'&&p.item?.type==='agentMessage')messages.set(p.item.id,p.item.text);
 }
 return [...messages.values()].join('\n');
}
/** Completed items are authoritative; stream deltas are diagnostic, never final answers.
 * Preserve every completed agent phase, including commentary and absent/unknown phases.
 * A transport replay of the same completed item is idempotent; conflicting completions fail.
 */
export function completedAnswer(events,threadId,turnId){
 const completed=new Map(),partials=new Map();
 const policy='all-completed-agent-messages-v1';
 if(typeof threadId!=='string'||!threadId||typeof turnId!=='string'||!turnId)return {text:'',policy,completedItems:[],partialItems:[]};
 for(const e of events){const p=e.params;if(!p||p.threadId!==threadId||p.turnId!==turnId)continue;
  if(e.method==='item/agentMessage/delta'&&typeof p.itemId==='string'&&typeof p.delta==='string')partials.set(p.itemId,(partials.get(p.itemId)??'')+p.delta);
  if(e.method==='item/completed'&&p.item?.type==='agentMessage'){
   const item=p.item;if(typeof item.id!=='string'||!item.id||typeof item.text!=='string'||item.phase!=null&&typeof item.phase!=='string')throw Error('Malformed completed agent message');
   const value={id:item.id,phase:item.phase??null,text:item.text},prior=completed.get(item.id);
   if(prior&&(prior.text!==value.text||prior.phase!==value.phase))throw Error('Conflicting completed agent message');
   if(!prior)completed.set(item.id,value);
  }
 }
 const items=[...completed.values()];
 return {text:items.map(i=>i.text).join('\n'),policy,completedItems:items.map(({id,phase,text})=>({id,phase,textSha256:sha(text)})),partialItems:[...partials].filter(([id])=>!completed.has(id)).map(([id,text])=>({id,text,textSha256:sha(text)}))};
}
export function assertSupportedPlatform(platform=process.platform){if(platform!=='darwin')throw Error('Codex login study requires Darwin process-group confirmation');}
/** fixtureEndpoint and executable exist solely for deterministic, offline verification. */
export async function runLoginTurn({model,out,live=false,authHome=path.join(os.homedir(),'.codex'),fixtureEndpoint,executable='codex',prefixArgs=[],timeoutMs=LIMITS.turn_ms,inheritProxy=false,prompt,effort="low",cliVersion}={}) {
  assertSupportedPlatform();
  if(live&&fixtureEndpoint)throw Error('Cannot mix live and fixture routes');
  if(!live&&!fixtureEndpoint)throw Error('Explicit --live required; otherwise a local fixture endpoint is required');
  if(!Number.isInteger(timeoutMs)||timeoutMs<=0||timeoutMs>LIMITS.turn_ms)throw Error('Invalid timeout');
  if(typeof prompt!=='string'||!prompt.length)throw Error('Prompt required');
  if(!['low','medium','high','xhigh'].includes(effort))throw Error('Invalid effort');
  const proxy=proxyEnvironment(process.env,inheritProxy);
  const argv=argumentsFor(model,{fixtureEndpoint,effort});
  if(!out||fs.existsSync(out))throw Error('New output directory required');
  fs.mkdirSync(out,{recursive:true,mode:0o700});
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-login-smoke-'));fs.chmodSync(root,0o700);
  const home=path.join(root,'codex');fs.mkdirSync(home,{mode:0o700});
  const record={version:2,simulation:!live,scope:'login-text-comparison-v1',requested_model:model,requested_effort:effort,proxy_mode:inheritProxy?'explicit-environment':'none',provider_reported_model:null,provider_identity_verified:false,cli_selected_model:null,auth_type:null,started_at:new Date().toISOString(),argv,prompt,limits:LIMITS,source_sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),events:[],requests:[],rpc_responses:[],stderr:'',status:'failed',answer:null,usage:null,limitations:['One submitted turn, not a hard backend-request/token/cost cap; built-in provider retries are not overridden.','ChatGPT usage and billing are not API dollar accounting.','Model selection is CLI metadata, not independent backend attestation.','Text smoke does not validate remote shell execution.','Fresh auth-only home; original refresh token is never copied. Expired access fails and requires refreshing the normal login before retry.']};
  // Diagnostic offsets are monotonic and never include RPC payloads or credentials.
  const origin=performance.now(),elapsed=()=>Math.round(performance.now()-origin);
  record.limits={...LIMITS,turn_ms:timeoutMs};
  record.timing={clock:'monotonic',events:[],last_phase:'setup',deadline_phase:null};
  const mark=(phase,kind='phase')=>{record.timing.last_phase=phase;record.timing.events.push({kind,name:phase,elapsed_ms:elapsed()})};
  let secrets=[...proxy.secrets],child,closed=Promise.resolve(true),timer,buffer='',size=0,next=0,pending=new Map(),resolveTurn,rejectTurn,fatal=null;
  let savedResult;
  const decoder=new StringDecoder('utf8');
  const turn=new Promise((resolve,reject)=>{resolveTurn=resolve;rejectTurn=reject});turn.catch(()=>{});
  const fail=e=>{fatal??=e;for(const p of pending.values())p.reject(e);pending.clear();rejectTurn(e)};
  const clean=x=>scrub(x,secrets,root);
  const validateEvents=()=>{if(!record.thread_id||!record.turn_id)return;for(const e of record.events){if(!['turn/completed','item/started','item/completed','item/agentMessage/delta'].includes(e.method))continue;const p=e.params;if(p?.threadId!==record.thread_id||(e.method==='turn/completed'?p?.turn?.id:p?.turnId)!==record.turn_id)throw Error('Mismatched thread/turn event');}};
  try {
    if(live){const parsed=loginCredential(fs.readFileSync(path.join(authHome,'auth.json'),'utf8'));secrets.push(...parsed.secrets);fs.writeFileSync(path.join(home,'auth.json'),JSON.stringify(parsed.auth),{mode:0o600});}
    mark('spawn');
    child=spawn(executable,[...prefixArgs,...argv],{cwd:root,env:{PATH:process.env.PATH,HOME:root,CODEX_HOME:home,...proxy.env},detached:true,stdio:['pipe','pipe','pipe']});
    closed=new Promise(resolve=>{child.once('close',()=>resolve(true));child.once('error',e=>{record.spawn_error=e.code||'spawn-error';fail(Error('CLI spawn failed'));resolve(true)})});
    child.stdin.on('error',()=>fail(Error('CLI input closed')));
    child.once('close',(code,signal)=>{record.exit={code,signal};fail(Error('CLI closed'))});
    function onBytes(b){size+=b.length;if(size>LIMITS.output_bytes){fail(Error('Output limit exceeded'));try{process.kill(-child.pid,'SIGKILL')}catch{};return false}return true}
    child.stderr.on('data',b=>{if(onBytes(b))record.stderr+=clean(b.toString())});
    child.stdout.on('data',b=>{if(!onBytes(b))return;buffer+=decoder.write(b);let n;while((n=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,n);buffer=buffer.slice(n+1);let e;try{e=JSON.parse(line)}catch{fail(Error('Invalid JSONL from CLI'));continue}
      if(e.id!==undefined&&pending.has(e.id)&&!e.method){const p=pending.get(e.id);pending.delete(e.id);mark(p.method,'rpc_response');if(p.method!=='account/read')record.rpc_responses.push({method:p.method,response:clean(e)});e.error?p.reject(Error('RPC '+p.method+' failed: '+clean(e.error.message))):p.resolve(e.result);continue}
      if(e.method==='remoteControl/status/changed')continue;
      record.events.push(clean(e));try{validateEvents()}catch(error){fail(error);continue;}
      if(typeof e.method==='string')mark(e.method,'notification');
      if(e.id!==undefined&&e.method){child.stdin.write(JSON.stringify({id:e.id,error:{code:-32601,message:'Interactive/server requests are disabled in login smoke'}})+'\n');fail(Error('Unexpected server request'));}
      if(['item/started','item/completed'].includes(e.method)&&e.params?.item&&!['userMessage','agentMessage','reasoning'].includes(e.params.item.type)){record.unexpected_activity=e.params.item.type;fail(Error('Unexpected tool/activity item: '+e.params.item.type));}
      if(e.method==='thread/tokenUsage/updated')record.usage=clean(e.params?.tokenUsage??null);
      if(e.method==='turn/completed')resolveTurn(e.params.turn);
    }});
    timer=setTimeout(()=>{record.timing.deadline_phase=record.timing.last_phase;record.timing.pending_rpc_methods=[...pending.values()].map(p=>p.method);record.timing.deadline_elapsed_ms=elapsed();fail(Error('Smoke deadline exceeded'))},timeoutMs);
    function req(method,params){if(fatal)return Promise.reject(fatal);return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject,method});mark(method,'rpc_request');record.requests.push({id,method,params:clean(params)});child.stdin.write(JSON.stringify({id,method,params})+'\n')})}
    record.initialize=clean(await req('initialize',{clientInfo:{name:'brooks-login-smoke',version:'0.1'},capabilities:{experimentalApi:true}}));
    record.cli_version=record.initialize.userAgent?.match(/^[^/]+\/([0-9.]+)/)?.[1]??null;
    if(cliVersion&&record.cli_version!==cliVersion)throw Error('CLI version mismatch');
    child.stdin.write('{"method":"initialized"}\n');
    if(live){const account=await req('account/read',{refreshToken:false});record.auth_type=account.account?.type??null;if(record.auth_type!=='chatgpt')throw Error('CLI did not confirm ChatGPT login');}
    else record.auth_type='synthetic-no-auth';
    const t=await req('thread/start',{model,modelProvider:live?'openai':'fixture',cwd:root,environments:[],sandbox:'read-only',approvalPolicy:'never',ephemeral:true,allowProviderModelFallback:false});
    record.cli_selected_model=t.model??null;record.cli_selected_effort=t.reasoningEffort??null;
    if(t.model!==model)throw Error('CLI selected a different or unreported model');
    if(t.reasoningEffort!==effort)throw Error('CLI selected a different or unreported effort');
    record.thread_id=t.thread.id;
    const started=await req('turn/start',{threadId:t.thread.id,input:[{type:'text',text:prompt,text_elements:[]}],effort});
    record.turn_id=started.turn?.id;if(typeof record.turn_id!=='string'||!record.turn_id)throw Error('Missing turn identity');validateEvents();
    const completed=await turn;
    if(fatal)throw fatal;
    if(completed.status!=='completed')throw Error('Turn did not complete');
    const selected=completedAnswer(record.events,record.thread_id,record.turn_id);
    if(!selected.completedItems.length||!selected.text.trim())throw Error('No nonempty completed agent answer');
    record.answer=selected.text;
    record.status='completed';
  }catch(e){record.error=clean(String(e.message));}
  finally{
    clearTimeout(timer);
    mark('cleanup');try{record.cleanup=await terminate(child,closed);}catch{record.cleanup={closed:false,group_absent:false,error:'cleanup-exception'};}
    record.timing.completed_elapsed_ms=elapsed();
    // Include any refreshed credentials in redaction before deleting the private home.
    try{const p=loginCredential(fs.readFileSync(path.join(home,'auth.json'),'utf8'));secrets.push(...p.secrets)}catch{}
    if(record.cleanup.closed&&record.cleanup.group_absent){try{fs.rmSync(root,{recursive:true,force:true});}catch(e){record.cleanup.remove_error=e.code??'UNKNOWN';}}
    record.cleanup.private_home_removed=!fs.existsSync(root);
    if(record.unexpected_activity||!record.cleanup.closed||!record.cleanup.group_absent||!record.cleanup.private_home_removed)record.status='failed';
    record.completed_at=new Date().toISOString();
    const saved=clean(record);
    saved.diagnostic_answer=answerText(saved.events,saved.thread_id,saved.turn_id);
    try{
      const selected=completedAnswer(saved.events,saved.thread_id,saved.turn_id);
      saved.answer=selected.text;
      saved.partial_answer=selected.partialItems.map(i=>i.text).join('\n');
      saved.answer_selection={policy:selected.policy,phasePolicy:'Retain all completed agent phases in completion order; absent phase is retained as null',completedItems:selected.completedItems,excludedPartialItems:selected.partialItems,answerSha256:sha(saved.answer)};
      if(saved.status==='completed'&&(!selected.completedItems.length||!selected.text.trim())){saved.status='failed';saved.error??='No nonempty completed agent answer';}
    }catch(e){saved.status='failed';saved.answer='';saved.partial_answer=saved.diagnostic_answer;saved.answer_selection={policy:'all-completed-agent-messages-v1',error:String(e.message)};saved.error??=String(e.message);}
    savedResult=saved;
    fs.writeFileSync(path.join(out,'record.json'),JSON.stringify(saved,null,2)+'\n',{mode:0o600});fs.writeFileSync(path.join(out,'events.jsonl'),saved.events.map(e=>JSON.stringify(e)).join('\n')+'\n',{mode:0o600});if(saved.answer!==null)fs.writeFileSync(path.join(out,'answer.txt'),saved.answer,{mode:0o600});
  }
  return savedResult;
}
