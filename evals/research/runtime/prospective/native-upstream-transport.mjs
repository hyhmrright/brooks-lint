/** Trusted-parent smoke transport. Offline by default; never reads ambient credentials. */
import https from 'node:https';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

export const SMOKE_LIMITS=Object.freeze({requests:6,input_tokens:32768,output_tokens:4096,
  input_nano_usd_per_token:350,output_nano_usd_per_token:500,budget_nano_usd:100000000,
  request_bytes:300000,response_bytes:1048576,total_ms:120000,exchange_ms:30000});
const digest=x=>createHash('sha256').update(x).digest('hex');
const requireThat=(v,code)=>{if(!v)throw Error(code);};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const fields=['model','stream','input','tools','tool_choice','parallel_tool_calls','reasoning',
  'store','include','prompt_cache_key','client_metadata','max_output_tokens','service_tier'];

/** Returns provider-reported fields, never independent model attestation. */
export function parseCompletion(bytes,model){
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  const events=[];
  for(const block of text.split(/\r?\n\r?\n/)){
    const data=block.split(/\r?\n/).filter(s=>s.startsWith('data:')).map(s=>s.slice(5).trimStart()).join('\n');
    if(!data||data==='[DONE]')continue;
    events.push(JSON.parse(data));
  }
  requireThat(events.length>0,'missing-events');
  requireThat(events.every(e=>object(e)&&typeof e.type==='string'&&e.type.startsWith('response.')&&!e.type.includes('configuration')),'event-profile');
  for(const e of events){
    if(e.item)requireThat(object(e.item)&&['reasoning','message','function_call'].includes(e.item.type)&&
      (e.item.type!=='function_call'||['exec_command','write_stdin'].includes(e.item.name)),'event-tool-profile');
    if(e.response?.model!==undefined)requireThat(e.response.model===model,'event-model-mismatch');
  }
  requireThat(!events.some(e=>['error','response.failed','response.incomplete'].includes(e.type)),'failed-event');
  const terminal=events.filter(e=>e.type==='response.completed');
  requireThat(terminal.length===1&&events.at(-1)===terminal[0],'terminal-sequence');
  const r=terminal[0].response;
  requireThat(object(r)&&r.status==='completed'&&typeof r.id==='string'&&r.id.length>0,'invalid-completion');
  requireThat(r.model===model,'reported-model-mismatch');
  requireThat(!r.error&&!r.incomplete_details&&Array.isArray(r.output),'invalid-completion');
  requireThat(r.output.every(item=>object(item)&&['reasoning','message','function_call'].includes(item.type)&&
    (item.type!=='function_call'||['exec_command','write_stdin'].includes(item.name))),'response-tool-profile');
  const u=r.usage;
  requireThat(object(u)&&['input_tokens','output_tokens','total_tokens'].every(k=>integer(u[k])),'usage-unreported');
  requireThat(u.total_tokens===u.input_tokens+u.output_tokens,'usage-inconsistent');
  requireThat(u.input_tokens<=SMOKE_LIMITS.input_tokens&&u.output_tokens<=SMOKE_LIMITS.output_tokens,'reported-token-limit');
  return {id:r.id,model:r.model,usage:{input_tokens:u.input_tokens,output_tokens:u.output_tokens,total_tokens:u.total_tokens},response:r,decoded_events:events};
}

/**
 * countInput must be a trusted, reviewed counter for the complete serialized request.
 * It is required: no byte/character approximation silently substitutes for token counting.
 * Offline tests inject authored counts. That does not verify the production tokenizer.
 */
export function createUpstreamTransport({mode='offline',endpoint,credential,model='fixture-model',
  effort='low',countInput,authorization=null,ca,exchangeMs=SMOKE_LIMITS.exchange_ms,
  totalMs=SMOKE_LIMITS.total_ms}={}){
  requireThat(['offline','live'].includes(mode),'invalid-mode');
  const url=new URL(endpoint);
  requireThat(url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname==='/v1/responses','invalid-endpoint');
  requireThat(typeof credential==='string'&&/^[A-Za-z0-9_-]{16,256}$/.test(credential),'invalid-credential');
  requireThat((effort==='low'||(mode==='offline'&&effort==='medium'))&&(countInput==='provider'||typeof countInput==='function'),'missing-reviewed-counter-or-effort');
  requireThat(Number.isInteger(exchangeMs)&&exchangeMs>0&&exchangeMs<=SMOKE_LIMITS.exchange_ms,'exchange-limit');
  requireThat(Number.isInteger(totalMs)&&totalMs>0&&totalMs<=SMOKE_LIMITS.total_ms,'total-limit');
  if(mode==='offline'){
    requireThat(url.hostname==='127.0.0.1'&&url.port&&credential.startsWith('fixture-only-')&&model==='fixture-model','offline-route-only');
  }else{
    requireThat(url.origin==='https://api.openai.com'&&!url.port&&!ca,'live-route-denied');
    requireThat(model==='gpt-6-luna'&&!credential.startsWith('fixture-only-'),'live-model-or-credential');
    requireThat(countInput==='provider','live-provider-count-required');
    requireThat(object(authorization)&&authorization.enabled===true&&
      typeof authorization.user_reference==='string'&&authorization.user_reference.trim().length>0&&
      /^[a-f0-9]{64}$/.test(authorization.registration_sha256)&&
      authorization.budget_nano_usd===SMOKE_LIMITS.budget_nano_usd,'live-authorization-required');
  }
  const started=performance.now(),deadline=started+totalMs;
  const reservation=SMOKE_LIMITS.input_tokens*SMOKE_LIMITS.input_nano_usd_per_token+
    SMOKE_LIMITS.output_tokens*SMOKE_LIMITS.output_nano_usd_per_token;
  let closed=false,inflight=false,attempts=0,countAttempts=0,reserved=0,active=null;
  const observations=[],ids=new Set();
  function snapshot(){return {mode,requested_model:model,requested_effort:effort,attempts,count_attempts:countAttempts,
    reserved_nano_usd:reserved,budget_nano_usd:SMOKE_LIMITS.budget_nano_usd,closed,
    provider_billed_cost:null,identity_scope:'provider-reported-not-independent-attestation',
    observations:structuredClone(observations)};}
  function close(){closed=true;active?.destroy(Error('cancelled'));}
  async function exchange(body,target,contentType,maxBytes){
    return new Promise((resolve,reject)=>{
        let settled=false,timer,response,parts=[],size=0;
        const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);if(error){response?.destroy();active?.destroy();reject(error);}else resolve(value);};
        active=https.request(target,{method:'POST',agent:false,ca,rejectUnauthorized:true,
          headers:{authorization:`Bearer ${credential}`,'content-type':'application/json','content-length':body.length}},r=>{
          response=r;
          if(r.statusCode!==200){finish(Error('http-'+r.statusCode));return;}
          if(!(r.headers['content-type']??'').toLowerCase().startsWith(contentType)){finish(Error('content-type'));return;}
          r.on('data',b=>{size+=b.length;if(size>maxBytes){finish(Error('response-byte-limit'));return;}parts.push(b);});
          r.on('error',()=>finish(Error('response-transport')));
          r.on('aborted',()=>finish(Error('response-aborted')));
          r.on('end',()=>finish(null,Buffer.concat(parts)));
        });
        active.on('error',()=>finish(Error(closed?'cancelled':'tls-or-transport')));
        timer=setTimeout(()=>finish(Error('absolute-deadline')),Math.max(1,Math.min(exchangeMs,deadline-performance.now())));
        active.end(body);
      });
  }
  async function dispatch(input){
    // All misuse closes this run; a caller cannot retry malformed/mismatched input.
    try{
      requireThat(!closed&&!inflight&&performance.now()<deadline,'closed-concurrent-or-expired');
      requireThat(object(input)&&Object.keys(input).every(k=>fields.includes(k)),'request-fields');
      requireThat(input.model===model&&object(input.reasoning)&&input.reasoning.effort===effort,'request-identity');
      requireThat(Object.keys(input.reasoning).every(k=>['effort','summary'].includes(k)),'reasoning-fields');
      requireThat(input.stream===true&&input.store===false&&Array.isArray(input.input)&&input.input.length>0,'request-shape');
      requireThat(input.input.every(item=>object(item)&&['message','function_call','function_call_output','reasoning'].includes(item.type??'message')&&
        ((item.type??'message')!=='message'||typeof item.content==='string'||(Array.isArray(item.content)&&item.content.every(c=>object(c)&&['input_text','output_text'].includes(c.type))))),'input-profile');
      requireThat(input.service_tier===undefined||input.service_tier==='default','tier-refused');
      requireThat(input.max_output_tokens===undefined||(integer(input.max_output_tokens)&&input.max_output_tokens>0&&input.max_output_tokens<=SMOKE_LIMITS.output_tokens),'output-limit-refused');
      requireThat(Array.isArray(input.tools)&&input.tools.every(t=>object(t)&&t.type==='function'&&['exec_command','write_stdin'].includes(t.name)),'tool-profile');
      requireThat(new Set(input.tools.map(t=>t.name)).size===input.tools.length,'duplicate-tool');
      const body=Buffer.from(JSON.stringify({...input,max_output_tokens:input.max_output_tokens??SMOKE_LIMITS.output_tokens,service_tier:'default'}));
      requireThat(body.length<=SMOKE_LIMITS.request_bytes&&!body.includes(Buffer.from(credential)),'request-size-or-secret');
      requireThat(attempts<SMOKE_LIMITS.requests&&reserved+reservation<=SMOKE_LIMITS.budget_nano_usd,'reservation-limit');
      inflight=true;
      let count;
      if(countInput==='provider'){
        requireThat(countAttempts<SMOKE_LIMITS.requests,'count-request-limit');countAttempts++;
        const parsed=JSON.parse(body.toString());
        const counting=Object.fromEntries(['model','input','tools','tool_choice','parallel_tool_calls','reasoning'].filter(k=>parsed[k]!==undefined).map(k=>[k,parsed[k]]));
        const countBody=Buffer.from(JSON.stringify(counting));
        const receipt=JSON.parse((await exchange(countBody,new URL('/v1/responses/input_tokens',url),'application/json',4096)).toString());
        requireThat(object(receipt)&&receipt.object==='response.input_tokens','invalid-count-response');
        count=receipt.input_tokens;
        requireThat(integer(count)&&count<=SMOKE_LIMITS.input_tokens,'input-count-unverified-or-limit');
        observations.push({kind:'provider-input-count',request_sha256:digest(countBody),inference_request_sha256:digest(body),input_tokens:count});
      }else count=countInput(JSON.parse(body.toString()));
      requireThat(integer(count)&&count<=SMOKE_LIMITS.input_tokens,'input-count-unverified-or-limit');
      requireThat(!closed&&performance.now()<deadline,'late-count-response');
      attempts++;reserved+=reservation;
      const entry={attempt:attempts,request_sha256:digest(body),request_bytes:body.length,
        counted_input_tokens:count,reserved_nano_usd:reservation,status:'pending',usage:null};
      observations.push(entry);
      const bytes=await exchange(body,url,'text/event-stream',SMOKE_LIMITS.response_bytes);
      requireThat(!closed&&performance.now()<deadline,'late-response');
      const text=bytes.toString('utf8');
      requireThat(![credential,Buffer.from(credential).toString('base64'),Buffer.from(credential).toString('hex')].some(s=>text.includes(s)),'credential-echo');
      const completion=parseCompletion(bytes,model);
      requireThat(completion.usage.output_tokens<=(input.max_output_tokens??SMOKE_LIMITS.output_tokens),'reported-token-limit');
      requireThat(completion.usage.input_tokens===count,'count-usage-mismatch');
      if(completion.response.reasoning?.effort!==undefined)requireThat(completion.response.reasoning.effort===effort,'reported-effort-mismatch');
      if(completion.response.service_tier!==undefined)requireThat(completion.response.service_tier==='default','reported-tier-mismatch');
      requireThat(![credential,Buffer.from(credential).toString('base64'),Buffer.from(credential).toString('hex')]
        .some(s=>JSON.stringify(completion.decoded_events).includes(s)),'credential-echo');
      delete completion.decoded_events;
      requireThat(!ids.has(completion.id),'duplicate-response-id');
      ids.add(completion.id);
      Object.assign(entry,{status:'completed',response_sha256:digest(bytes),response_bytes:bytes.length,
        reported_model:completion.model,usage:completion.usage});
      return {status:200,body_base64:bytes.toString('base64'),completion};
    }catch(e){
      closed=true;active?.destroy();
      // No headers, response bodies, arbitrary error strings, stack, or credential in logs.
      const codes=['closed-concurrent-or-expired','request-fields','request-identity','reasoning-fields','request-shape','input-profile','tier-refused','output-limit-refused','tool-profile','duplicate-tool','request-size-or-secret','reservation-limit','count-request-limit','invalid-count-response','input-count-unverified-or-limit','late-count-response','late-response','credential-echo','duplicate-response-id','count-usage-mismatch','reported-effort-mismatch','reported-tier-mismatch','missing-events','event-profile','event-tool-profile','event-model-mismatch','failed-event','terminal-sequence','invalid-completion','reported-model-mismatch','response-tool-profile','usage-unreported','usage-inconsistent','reported-token-limit','content-type','response-byte-limit','response-transport','response-aborted','cancelled','tls-or-transport','absolute-deadline'];
      const safe=codes.includes(e.message)||/^http-\d{3}$/.test(e.message)?e.message:'contract-rejected';
      if(observations.at(-1)?.status==='pending')observations.at(-1).status=safe;
      throw Error(safe);
    }finally{inflight=false;active=null;}
  }
  return Object.freeze({dispatch,close,snapshot});
}
