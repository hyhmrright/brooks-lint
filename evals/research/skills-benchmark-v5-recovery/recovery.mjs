/** Additive, fail-closed recovery. Synthetic execution is explicitly labeled and cannot be live. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {readRun,validateRegistration,verifyProxy} from '../skills-benchmark-v5/campaign.mjs';
import {mechanicalOutcome,assessRun,packets} from '../skills-benchmark-v5/review.mjs';
import {runLoginTurn,verifyToolchain,selectedAnswer} from '../health-transport-v3/login-turn.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
export const anchor='e1fd7864864137111f74a0f045dca627e64f70688048ac832a26220ba3624fd2';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export const read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,x,exclusive=false)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n',{flag:exclusive?'wx':'w',mode:0o600});
const directory=path.dirname(fileURLToPath(import.meta.url));
const priorAnnotations=path.resolve(directory,'../../../docs/research/skills-benchmark-v5-results/2026-11-13-stopped/annotations.json');
const sources=()=>Object.fromEntries(['recovery.mjs','recovery.test.mjs','drill.mjs'].map(f=>[f,digest(fs.readFileSync(path.join(directory,f)))]));
const count=r=>Number.isSafeInteger(r.usage?.total?.totalTokens)&&r.usage.total.totalTokens>=0?r.usage.total.totalTokens:null;
const retry=r=>Boolean(r.transport_retry_observed||r.events?.some(e=>e.method==='error'&&e.params?.willRetry));
export function createPlan(original){
 assert.equal(digest(fs.readFileSync(path.join(original,'execution.json'))),'a4471f935a50ea43e8ac221ee93ebd119b196c4267c58f6455184c181a1e0e32','Original execution drift');
 const run=readRun(original),r=validateRegistration(run.sealed,anchor),s=run.state,f=run.records[78];
 assert(!r.simulation);assert.equal(s.stopped,'transport-retry');assert.equal(s.observedTokens,1315995);assert.equal(s.elapsedMs,1590911);
 assert(run.records.slice(0,78).every(x=>x.status==='completed'));assert.equal(f.ordinal,79);assert.equal(f.id,'BV5-27');assert.equal(f.arm,'C');assert.equal(f.status,'failed');assert.equal(f.observedTokens,null);assert(retry(f.record));assert(f.record.cleanup.closed&&f.record.cleanup.group_absent&&f.record.cleanup.private_home_removed);assert(run.records.slice(79).every(x=>x.status==='not-run'));
 const body={version:1,kind:'v5-one-shot-recovery',registrationSha256:anchor,parentExecutionSha256:digest(fs.readFileSync(path.join(original,'execution.json'))),failedRawSha256:f.rawSha256,priorAnnotationsSha256:digest(fs.readFileSync(priorAnnotations)),retainedRawHashes:run.records.slice(0,78).map(x=>({ordinal:x.ordinal,sha256:x.rawSha256})),sources:sources(),completedPreserved:78,ordinals:run.records.slice(78).map(x=>x.ordinal),priorObservedTokens:s.observedTokens,priorElapsedMs:s.elapsedMs,unknownPriorFailedUsage:true,limits:{totalObservedTokens:12000000,totalElapsedMs:43200000,turnMs:120000,maxNewCalls:246,maxLifetimeCalls:325},identity:{model:r.model,effort:r.effort,cliVersion:r.cliVersion},policy:{automaticRetries:0,stopOnFirstFailure:true,unknownNewUsageStops:true,modelPatchesExecuted:false,freshOnly:true},limitations:['Observed tokens exclude unknown failed-request usage and may overshoot by one admitted turn; not a billing cap.','Cumulative recorded execution time excludes the human pause; prior execution is not reset.','Original provider reconnect event is retained; no claim of zero provider-side retry. Only one additional collector submission per remaining ordinal is authorized after model confirmation.']};
 return {...body,sha256:digest(JSON.stringify(body))};
}
export function validatePlan(plan,original){assert.deepEqual(plan,createPlan(original),'Recovery plan, original or source drift');return plan;}
const prompt=(r,row)=>{const p=r.frozen.protocol.cases.find(c=>c.id===row.id).prompts[row.arm];assert.equal(digest(p.text),p.sha256);return p.text+'\n\n'+r.commonProtocol;};
const scenarioNames=['success','failure','retry','identity','usage','cleanup','budget','deadline','proxy'];
function synthetic(reg,row,text,scenario){
 const answer='Synthetic protocol fixture; no semantic answer.',thread='fixture-thread',turn='fixture-turn';
 const raw={simulation:true,status:'completed',answer,prompt:text,requested_model:reg.model,requested_effort:reg.effort,cli_selected_model:reg.model,cli_selected_effort:reg.effort,cli_version:reg.cliVersion,enableScoreTool:true,tool_calls:[],scope:'health-transport-v3',source_sha256:reg.sourceHashes['evals/research/health-transport-v3/login-turn.mjs'],proxy_mode:'none',thread_id:thread,turn_id:turn,events:[{method:'item/completed',params:{threadId:thread,turnId:turn,item:{type:'agentMessage',id:'fixture-message',phase:'final_answer',text:answer}}}],cleanup:{closed:true,group_absent:true,private_home_removed:true},usage:{total:{totalTokens:100}}};
 if(scenario==='failure'){raw.status='failed';raw.error='Synthetic turn failure';}
 if(scenario==='retry'){raw.status='failed';raw.transport_retry_observed=true;raw.events.push({method:'error',params:{willRetry:true}});}
 if(scenario==='identity')raw.cli_selected_model='wrong-model';
 if(scenario==='usage')raw.usage=null;
 if(scenario==='cleanup')raw.cleanup.group_absent=false;
 if(scenario==='budget')raw.usage.total.totalTokens=12000000;
 return raw;
}
function checkRaw(raw,reg,row,intent,plan,simulation){
 assert(['completed','failed'].includes(raw.status),'Unknown raw status');assert.equal(raw.simulation,simulation);assert.equal(raw.prompt,prompt(reg,row));assert.equal(raw.requested_model,reg.model);assert.equal(raw.requested_effort,reg.effort);assert.equal(raw.enableScoreTool,true);assert.equal(raw.scope,'health-transport-v3');assert.equal(raw.source_sha256,reg.sourceHashes['evals/research/health-transport-v3/login-turn.mjs']);assert.equal(raw.proxy_mode,simulation?'none':'explicit-environment');assert.equal(intent.promptSha256,digest(raw.prompt));assert.equal(intent.planSha256,plan.sha256);assert.equal(intent.ordinal,row.ordinal);
 if(retry(raw))assert.equal(raw.status,'failed','Retry must fail turn');
 if(raw.status==='completed'){assert.equal(raw.cli_selected_model,reg.model);assert.equal(raw.cli_selected_effort,reg.effort);assert.equal(raw.cli_version,reg.cliVersion);assert(raw.cleanup?.closed&&raw.cleanup.group_absent&&raw.cleanup.private_home_removed,'Cleanup incomplete');assert.equal(raw.answer,selectedAnswer(raw.events,raw.thread_id,raw.turn_id).text);assert(raw.answer.trim());if(!simulation){assert.equal(raw.auth_type,'chatgpt');assert.deepEqual(raw.toolchain,reg.toolchain);}}
 for(const call of raw.tool_calls??[])if(call.success)assert.deepEqual(call.result,finalizeTool(call.arguments));
}
export async function execute(plan,original,out,{live=false,simulation=false,scenario='success'}={}){
 validatePlan(plan,original);assert(live!==simulation,'Exactly one explicit execution mode required');assert(scenarioNames.includes(scenario));if(live)assert.equal(scenario,'success','Live fixture injection forbidden');
 const source=readRun(original),reg=validateRegistration(source.sealed,anchor);
 if(live){verifyProxy(reg.proxy);verifyToolchain(reg.executable,reg.toolchain);}
 assert(!path.resolve(out).startsWith(path.resolve(original)+path.sep),'Output must not mutate original directory');
 assert(!fs.existsSync(out),'Fresh output required; no implicit resume');fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'plan.json'),plan,true);
 const state={planSha256:plan.sha256,simulation,scenario:simulation?scenario:null,startedAt:new Date().toISOString(),priorObservedTokens:plan.priorObservedTokens,priorElapsedMs:plan.priorElapsedMs,unknownPriorFailedUsage:true,observedTokens:plan.priorObservedTokens,elapsedMs:0,stopped:null,records:source.records.slice(78).map(({ordinal,id,arm,repeat})=>({ordinal,id,arm,repeat,status:'not-run',observedTokens:null,raw:null}))};
 const start=performance.now(),wall=Date.now(),elapsed=()=>Math.max(performance.now()-start,Date.now()-wall),save=()=>write(path.join(out,'execution.json'),state);
 save();
 for(const row of state.records){
  state.elapsedMs=Math.ceil(elapsed());const remaining=plan.limits.totalElapsedMs-plan.priorElapsedMs-state.elapsedMs;
  if(remaining<=0||state.observedTokens>=plan.limits.totalObservedTokens||(simulation&&scenario==='deadline')){state.stopped='budget';if(simulation&&scenario==='deadline')state.elapsedMs=plan.limits.totalElapsedMs-plan.priorElapsedMs;break;}
  if(simulation&&scenario==='proxy'){state.stopped='proxy-drift';write(path.join(out,'admission-stop.json'),{reason:state.stopped,ordinal:row.ordinal,elapsedMs:state.elapsedMs,observedTokens:state.observedTokens,simulation:true},true);break;}
  if(live){try{validateRegistration(source.sealed,anchor);verifyProxy(reg.proxy);verifyToolchain(reg.executable,reg.toolchain);}catch{state.stopped='admission-drift';write(path.join(out,'admission-stop.json'),{reason:state.stopped,ordinal:row.ordinal,elapsedMs:state.elapsedMs,observedTokens:state.observedTokens,simulation:false},true);break;}}
  const name=String(row.ordinal).padStart(3,'0'),dir=path.join(out,name),text=prompt(reg,row),intent={planSha256:plan.sha256,ordinal:row.ordinal,promptSha256:digest(text),priorObservedTokens:state.observedTokens,elapsedMs:state.elapsedMs,timeoutMs:Math.max(1,Math.floor(Math.min(remaining,plan.limits.turnMs)))};
  write(path.join(out,`intent-${name}.json`),intent,true);let raw,file='record.json';
  try{if(simulation){fs.mkdirSync(dir);raw=synthetic(reg,row,text,scenario);write(path.join(dir,file),raw,true);}else raw=await runLoginTurn({model:reg.model,effort:reg.effort,cliVersion:reg.cliVersion,executable:reg.executable,toolchain:reg.toolchain,live:true,inheritProxy:true,enableScoreTool:true,prompt:text,out:dir,timeoutMs:intent.timeoutMs});}
  catch{fs.mkdirSync(dir,{recursive:true});file='setup-failure.json';raw={simulation,status:'failed',answer:'',usage:null,error:'Setup/archive failure; no subsequent submission'};write(path.join(dir,file),raw,true);}
  const bytes=fs.readFileSync(path.join(dir,file));write(path.join(dir,'receipt.json'),{file,sha256:digest(bytes)},true);row.raw=`${name}/${file}`;row.rawSha256=digest(bytes);row.observedTokens=count(raw);row.status=raw.status==='completed'?'completed':'failed';if(row.observedTokens!==null)state.observedTokens+=row.observedTokens;
  if(file==='record.json')try{checkRaw(raw,reg,row,intent,plan,simulation);}catch(e){state.stopped='verification-failure';state.verificationError=e.message;}
  if(!state.stopped){if(row.status==='failed')state.stopped=retry(raw)?'transport-retry':'execution-failure';else if(row.observedTokens===null)state.stopped='usage-unavailable';}
  state.elapsedMs=Math.ceil(elapsed());save();if(state.stopped)break;
 }
 if(!(simulation&&scenario==='deadline'))state.elapsedMs=Math.ceil(elapsed());state.completedAt=new Date().toISOString();save();return verify(plan,original,out);
}
export function verify(plan,original,out){
 validatePlan(plan,original);const source=readRun(original),reg=source.sealed,s=read(path.join(out,'execution.json'));assert.equal(s.planSha256,plan.sha256);assert.deepEqual(read(path.join(out,'plan.json')),plan);assert.equal(typeof s.simulation,'boolean');assert(s.simulation?scenarioNames.includes(s.scenario):s.scenario===null);assert.equal(s.priorElapsedMs,plan.priorElapsedMs);assert.equal(s.priorObservedTokens,plan.priorObservedTokens);assert.equal(s.unknownPriorFailedUsage,true);assert(Number.isSafeInteger(s.elapsedMs)&&s.elapsedMs>=0);assert.equal(s.records.length,246);
 let tokens=plan.priorObservedTokens,ended=false,lastElapsed=0,reason=null,attempted=0;
 for(let i=0;i<246;i++){
  const row=s.records[i],expected=reg.frozen.protocol.schedule[i+78];for(const key of ['ordinal','id','arm','repeat'])assert.equal(row[key],expected[key]);assert(['completed','failed','not-run'].includes(row.status));
  const name=String(row.ordinal).padStart(3,'0');
  if(row.status==='not-run'){ended=true;assert.equal(row.raw,null);assert.equal(row.observedTokens,null);assert(!fs.existsSync(path.join(out,`intent-${name}.json`)),'Not-run intent exists');continue;}
  assert(!ended,'Executed after stop or gap');attempted++;
  const receipt=read(path.join(out,name,'receipt.json'));assert(['record.json','setup-failure.json'].includes(receipt.file));assert.equal(row.raw,`${name}/${receipt.file}`);const bytes=fs.readFileSync(path.join(out,row.raw));assert.equal(digest(bytes),receipt.sha256);assert.equal(row.rawSha256,receipt.sha256);const raw=JSON.parse(bytes),intent=read(path.join(out,`intent-${name}.json`));
  assert.equal(intent.priorObservedTokens,tokens);assert(tokens<plan.limits.totalObservedTokens,'Submitted beyond token admission');assert(Number.isSafeInteger(intent.elapsedMs)&&intent.elapsedMs>=lastElapsed&&intent.elapsedMs<=s.elapsedMs);lastElapsed=intent.elapsedMs;const remaining=plan.limits.totalElapsedMs-plan.priorElapsedMs-intent.elapsedMs;assert(remaining>0,'Submitted after time budget');assert.equal(intent.timeoutMs,Math.max(1,Math.floor(Math.min(remaining,plan.limits.turnMs))));assert.equal(intent.ordinal,row.ordinal);assert.equal(intent.planSha256,plan.sha256);assert.equal(intent.promptSha256,digest(prompt(reg,row)));
  assert.equal(raw.simulation,s.simulation);assert.equal(row.status,raw.status==='completed'?'completed':'failed');let invalid=null;
  if(receipt.file==='record.json')try{checkRaw(raw,reg,row,intent,plan,s.simulation);}catch(e){invalid=e.message;}else{assert.equal(raw.status,'failed');assert.equal(raw.error,'Setup/archive failure; no subsequent submission');}
  assert.equal(row.observedTokens,count(raw));if(row.observedTokens!==null)tokens+=row.observedTokens;
  if(invalid){reason='verification-failure';assert.equal(s.verificationError,invalid);}else if(row.status==='failed')reason=retry(raw)?'transport-retry':'execution-failure';else if(row.observedTokens===null)reason='usage-unavailable';
  if(reason)ended=true;
 }
 assert.equal(tokens,s.observedTokens);
 if(reason)assert.equal(s.stopped,reason);else if(attempted===246)assert.equal(s.stopped,null);else{assert(['budget','proxy-drift','admission-drift'].includes(s.stopped),'Unexplained early stop');if(s.stopped==='budget')assert(tokens>=plan.limits.totalObservedTokens||plan.priorElapsedMs+s.elapsedMs>=plan.limits.totalElapsedMs);else{const stop=read(path.join(out,'admission-stop.json'));assert.equal(stop.reason,s.stopped);assert.equal(stop.ordinal,79+attempted);assert.equal(stop.observedTokens,tokens);assert.equal(stop.simulation,s.simulation);assert(Number.isSafeInteger(stop.elapsedMs)&&stop.elapsedMs>=lastElapsed&&stop.elapsedMs<=s.elapsedMs);}}
 return {simulation:s.simulation,attempted,completed:s.records.filter(r=>r.status==='completed').length,failed:s.records.filter(r=>r.status==='failed').length,notRun:s.records.filter(r=>r.status==='not-run').length,observedTokens:tokens,elapsedMs:s.elapsedMs,cumulativeElapsedMs:plan.priorElapsedMs+s.elapsedMs,stopped:s.stopped,unknownPriorFailedUsage:true};
}
export function preserveJudgments(annotations){const supplied=new Map(annotations.map(a=>[a.responseId,a]));for(const a of read(priorAnnotations))assert.deepEqual(supplied.get(a.responseId),a,'Retained original judgment changed or missing');return annotations;}
export function combine(plan,original,recovery){const result=verify(plan,original,recovery);assert(!result.simulation,'Synthetic recovery cannot merge with real answers');assert.notEqual(result.stopped,'verification-failure','Unverified record cannot be adjudicated');const base=readRun(original),s=read(path.join(recovery,'execution.json'));const rows=s.records.map(row=>{if(row.status==='not-run')return row;const raw=read(path.join(recovery,row.raw)),c=base.sealed.frozen.protocol.cases.find(c=>c.id===row.id);return {...row,answer:raw.answer??'',record:raw,workflow:mechanicalOutcome(c,raw)};});return {...base,state:{...base.state,segmented:true,observedTokens:s.observedTokens,elapsedMs:plan.priorElapsedMs+s.elapsedMs,stopped:s.stopped,completedAt:s.completedAt,unknownPriorFailedUsage:true,originalFailure:base.records[78]},records:[...base.records.slice(0,78),...rows]};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [cmd,...a]=process.argv.slice(2);
 if(cmd==='plan'){assert.equal(a.length,2);write(a[1],createPlan(a[0]),true);console.log(read(a[1]).sha256);}
 else if(cmd==='execute'){assert.equal(a.length,4);assert.equal(a[3],'--live');console.log(JSON.stringify(await execute(read(a[0]),a[1],a[2],{live:true})));}
 else if(cmd==='simulate'){assert.equal(a.length,4);console.log(JSON.stringify(await execute(read(a[0]),a[1],a[2],{simulation:true,scenario:a[3]})));}
 else if(cmd==='verify'){assert.equal(a.length,3);console.log(JSON.stringify(verify(read(a[0]),a[1],a[2])));}
 else if(cmd==='packets'){assert.equal(a.length,4);write(a[3],packets(combine(read(a[0]),a[1],a[2])),true);}
 else if(cmd==='review'){assert.equal(a.length,5);write(a[4],assessRun(combine(read(a[0]),a[1],a[2]),preserveJudgments(read(a[3]))),true);}
 else throw Error('plan ORIGINAL NEW_PLAN | execute PLAN ORIGINAL NEW_OUT --live | simulate PLAN ORIGINAL NEW_OUT SCENARIO | verify PLAN ORIGINAL OUT | packets PLAN ORIGINAL OUT NEW_PACKETS | review PLAN ORIGINAL OUT ANNOTATIONS NEW_REPORT');
}
