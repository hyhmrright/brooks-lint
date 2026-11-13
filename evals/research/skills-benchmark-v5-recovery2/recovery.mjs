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
import {validatePlan as validateFirstPlan, combine as combineFirst} from '../skills-benchmark-v5-recovery/recovery.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
export const anchor='e1fd7864864137111f74a0f045dca627e64f70688048ac832a26220ba3624fd2';
export const digest=x=>createHash('sha256').update(x).digest('hex');
export const read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,x,exclusive=false)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n',{flag:exclusive?'wx':'w',mode:0o600});
const directory=path.dirname(fileURLToPath(import.meta.url));
const priorAnnotations=path.resolve(directory,'../../../docs/research/skills-benchmark-v5-recovery/results/2026-11-14-stopped/annotations-combined199.json');
const sources=()=>Object.fromEntries(['recovery.mjs','recovery.test.mjs','drill.mjs'].map(f=>[f,digest(fs.readFileSync(path.join(directory,f)))]));
const count=r=>Number.isSafeInteger(r.usage?.total?.totalTokens)&&r.usage.total.totalTokens>=0?r.usage.total.totalTokens:null;
const retry=r=>Boolean(r.transport_retry_observed||r.events?.some(e=>e.method==='error'&&e.params?.willRetry));
const firstPlanPath=path.resolve(directory,'../../../docs/research/skills-benchmark-v5-recovery/plan.json');
const firstAnchor='549fc80e8edd754681a359f14b2907dbc0a40e3437f2407d93414bd86fd12ea1';
function prior(original,first){const p=read(firstPlanPath);assert.equal(p.sha256,firstAnchor);validateFirstPlan(p,original);return combineFirst(p,original,first);}
export function createPlan(original,first){
 const run=prior(original,first),r=validateRegistration(run.sealed,anchor),s=run.state,f=run.records[199];
 assert(!r.simulation);assert.equal(s.stopped,'transport-retry');assert.equal(s.observedTokens,4284856);assert.equal(s.elapsedMs,4587374);
 assert(run.records.slice(0,199).every(x=>x.status==='completed'));assert.equal(f.ordinal,200);assert.equal(f.id,'BV5-31');assert.equal(f.arm,'C');assert.equal(f.repeat,2);assert.equal(f.status,'failed');assert.equal(f.observedTokens,null);assert(retry(f.record));assert(f.record.cleanup.closed&&f.record.cleanup.group_absent&&f.record.cleanup.private_home_removed);assert(run.records.slice(200).every(x=>x.status==='not-run'));
 const annotations=read(priorAnnotations);assert.equal(annotations.length,199);assert.equal(new Set(annotations.map(a=>a.responseId)).size,199);for(let ordinal=1;ordinal<=199;ordinal++)assert(annotations.some(a=>a.responseId===digest(`${anchor}/${ordinal}`).slice(0,24)));
 const body={version:1,kind:'v5-second-one-shot-recovery',registrationSha256:anchor,firstPlanSha256:firstAnchor,firstPlanFileSha256:digest(fs.readFileSync(firstPlanPath)),parentExecutionSha256:digest(fs.readFileSync(path.join(original,'execution.json'))),firstExecutionSha256:digest(fs.readFileSync(path.join(first,'execution.json'))),failedRawHashes:[{ordinal:79,sha256:s.originalFailure.rawSha256},{ordinal:200,sha256:f.rawSha256}],priorAnnotationsSha256:digest(fs.readFileSync(priorAnnotations)),retainedRawHashes:run.records.slice(0,199).map(x=>({ordinal:x.ordinal,sha256:x.rawSha256})),sources:sources(),completedPreserved:199,priorAttempts:201,ordinals:run.records.slice(199).map(x=>x.ordinal),priorObservedTokens:s.observedTokens,priorElapsedMs:s.elapsedMs,unknownPriorFailedUsage:true,limits:{totalObservedTokens:12000000,totalElapsedMs:43200000,turnMs:120000,maxNewCalls:125,maxLifetimeCalls:326},identity:{model:r.model,effort:r.effort,cliVersion:r.cliVersion},policy:{automaticRetries:0,stopOnFirstFailure:true,unknownNewUsageStops:true,modelPatchesExecuted:false,freshOnly:true},limitations:['Observed tokens exclude unknown usage of BOTH previous failed requests and may overshoot by one admitted turn; not a billing cap.','Cumulative recorded execution time excludes human pauses; both prior segments are charged.','Both historical provider reconnect events remain separate from 324 answer slots. No claim of zero provider-side retries.','Preparation is not authorization to execute; model confirmation and explicit --live are required.']};
 return {...body,sha256:digest(JSON.stringify(body))};
}
export function validatePlan(plan,original,first){assert.deepEqual(plan,createPlan(original,first),'Second recovery plan, historical data or source drift');return plan;}
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
export async function execute(plan,original,first,out,{live=false,simulation=false,scenario='success'}={}){
 validatePlan(plan,original,first);assert(live!==simulation,'Exactly one explicit execution mode required');assert(scenarioNames.includes(scenario));if(live)assert.equal(scenario,'success','Live fixture injection forbidden');
 const source=prior(original,first),reg=validateRegistration(source.sealed,anchor);
 if(live){verifyProxy(reg.proxy);verifyToolchain(reg.executable,reg.toolchain);}
 for(const old of [original,first])assert(path.resolve(out)!==path.resolve(old)&&!path.resolve(out).startsWith(path.resolve(old)+path.sep),'Output must not mutate either prior directory');
 assert(!fs.existsSync(out),'Fresh output required; no implicit resume');fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'plan.json'),plan,true);
 const state={planSha256:plan.sha256,simulation,scenario:simulation?scenario:null,startedAt:new Date().toISOString(),priorObservedTokens:plan.priorObservedTokens,priorElapsedMs:plan.priorElapsedMs,unknownPriorFailedUsage:true,observedTokens:plan.priorObservedTokens,elapsedMs:0,stopped:null,records:source.records.slice(199).map(({ordinal,id,arm,repeat})=>({ordinal,id,arm,repeat,status:'not-run',observedTokens:null,raw:null}))};
 const start=performance.now(),wall=Date.now(),elapsed=()=>Math.max(performance.now()-start,Date.now()-wall),save=()=>write(path.join(out,'execution.json'),state);
 save();
 for(const row of state.records){
  try{validatePlan(plan,original,first);}catch(e){state.stopped='admission-drift';state.elapsedMs=Math.ceil(elapsed());write(path.join(out,'admission-stop.json'),{reason:state.stopped,ordinal:row.ordinal,elapsedMs:state.elapsedMs,observedTokens:state.observedTokens,simulation},true);save();throw e;}
  if(live){try{validateRegistration(source.sealed,anchor);verifyProxy(reg.proxy);verifyToolchain(reg.executable,reg.toolchain);}catch{state.stopped='admission-drift';write(path.join(out,'admission-stop.json'),{reason:state.stopped,ordinal:row.ordinal,elapsedMs:state.elapsedMs,observedTokens:state.observedTokens,simulation:false},true);break;}}
  state.elapsedMs=Math.ceil(elapsed());const remaining=plan.limits.totalElapsedMs-plan.priorElapsedMs-state.elapsedMs;
  if(remaining<=0||state.observedTokens>=plan.limits.totalObservedTokens||(simulation&&scenario==='deadline')){state.stopped='budget';if(simulation&&scenario==='deadline')state.elapsedMs=plan.limits.totalElapsedMs-plan.priorElapsedMs;break;}
  if(simulation&&scenario==='proxy'){state.stopped='proxy-drift';write(path.join(out,'admission-stop.json'),{reason:state.stopped,ordinal:row.ordinal,elapsedMs:state.elapsedMs,observedTokens:state.observedTokens,simulation:true},true);break;}
  const name=String(row.ordinal).padStart(3,'0'),dir=path.join(out,name),text=prompt(reg,row),intent={planSha256:plan.sha256,ordinal:row.ordinal,promptSha256:digest(text),priorObservedTokens:state.observedTokens,elapsedMs:state.elapsedMs,timeoutMs:Math.max(1,Math.floor(Math.min(remaining,plan.limits.turnMs)))};
  write(path.join(out,`intent-${name}.json`),intent,true);let raw,file='record.json';
  try{if(simulation){fs.mkdirSync(dir);raw=synthetic(reg,row,text,scenario);write(path.join(dir,file),raw,true);}else raw=await runLoginTurn({model:reg.model,effort:reg.effort,cliVersion:reg.cliVersion,executable:reg.executable,toolchain:reg.toolchain,live:true,inheritProxy:true,enableScoreTool:true,prompt:text,out:dir,timeoutMs:intent.timeoutMs});}
  catch{fs.mkdirSync(dir,{recursive:true});file='setup-failure.json';raw={simulation,status:'failed',answer:'',usage:null,error:'Setup/archive failure; no subsequent submission'};write(path.join(dir,file),raw,true);}
  const bytes=fs.readFileSync(path.join(dir,file));write(path.join(dir,'receipt.json'),{file,sha256:digest(bytes)},true);row.raw=`${name}/${file}`;row.rawSha256=digest(bytes);row.observedTokens=count(raw);row.status=raw.status==='completed'?'completed':'failed';if(row.observedTokens!==null)state.observedTokens+=row.observedTokens;
  if(file==='record.json')try{checkRaw(raw,reg,row,intent,plan,simulation);}catch(e){state.stopped='verification-failure';state.verificationError=e.message;}
  if(!state.stopped){if(row.status==='failed')state.stopped=retry(raw)?'transport-retry':'execution-failure';else if(row.observedTokens===null)state.stopped='usage-unavailable';}
  state.elapsedMs=Math.ceil(elapsed());save();if(state.stopped)break;
 }
 if(!(simulation&&scenario==='deadline'))state.elapsedMs=Math.ceil(elapsed());state.completedAt=new Date().toISOString();save();return verify(plan,original,first,out);
}
export function verify(plan,original,first,out){
 validatePlan(plan,original,first);const source=prior(original,first),reg=source.sealed,s=read(path.join(out,'execution.json'));assert.equal(s.planSha256,plan.sha256);assert.deepEqual(read(path.join(out,'plan.json')),plan);assert.equal(typeof s.simulation,'boolean');assert(s.simulation?scenarioNames.includes(s.scenario):s.scenario===null);assert.equal(s.priorElapsedMs,plan.priorElapsedMs);assert.equal(s.priorObservedTokens,plan.priorObservedTokens);assert.equal(s.unknownPriorFailedUsage,true);assert(Number.isSafeInteger(s.elapsedMs)&&s.elapsedMs>=0);assert.equal(s.records.length,125);assert(Number.isFinite(Date.parse(s.startedAt))&&Number.isFinite(Date.parse(s.completedAt))&&Date.parse(s.completedAt)>=Date.parse(s.startedAt),'Invalid wall timestamps');if(!(s.simulation&&s.scenario==='deadline'))assert(Math.abs(Date.parse(s.completedAt)-Date.parse(s.startedAt)-s.elapsedMs)<1000,'Elapsed/wall discrepancy');
 let tokens=plan.priorObservedTokens,ended=false,lastElapsed=0,reason=null,attempted=0;
 for(let i=0;i<125;i++){
  const row=s.records[i],expected=reg.frozen.protocol.schedule[i+199];for(const key of ['ordinal','id','arm','repeat'])assert.equal(row[key],expected[key]);assert(['completed','failed','not-run'].includes(row.status));
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
 if(reason)assert.equal(s.stopped,reason);else if(attempted===125)assert.equal(s.stopped,null);else{assert(['budget','proxy-drift','admission-drift'].includes(s.stopped),'Unexplained early stop');if(s.stopped==='budget')assert(tokens>=plan.limits.totalObservedTokens||plan.priorElapsedMs+s.elapsedMs>=plan.limits.totalElapsedMs);else{const stop=read(path.join(out,'admission-stop.json'));assert.equal(stop.reason,s.stopped);assert.equal(stop.ordinal,200+attempted);assert.equal(stop.observedTokens,tokens);assert.equal(stop.simulation,s.simulation);assert(Number.isSafeInteger(stop.elapsedMs)&&stop.elapsedMs>=lastElapsed&&stop.elapsedMs<=s.elapsedMs);}}
 return {simulation:s.simulation,attempted,completed:s.records.filter(r=>r.status==='completed').length,failed:s.records.filter(r=>r.status==='failed').length,notRun:s.records.filter(r=>r.status==='not-run').length,observedTokens:tokens,elapsedMs:s.elapsedMs,cumulativeElapsedMs:plan.priorElapsedMs+s.elapsedMs,stopped:s.stopped,unknownPriorFailedUsage:true,priorFailedAttempts:2,lifetimeAttempts:201+attempted,answerSlots:324};
}
export function preserveJudgments(annotations){const supplied=new Map(annotations.map(a=>[a.responseId,a]));assert.equal(supplied.size,annotations.length,'Duplicate judgment IDs');for(const a of read(priorAnnotations))assert.deepEqual(supplied.get(a.responseId),a,'Retained original judgment changed or missing');return annotations;}
export function combine(plan,original,first,recovery){const result=verify(plan,original,first,recovery);assert(!result.simulation,'Synthetic recovery cannot merge with real answers');assert.notEqual(result.stopped,'verification-failure','Unverified record cannot be adjudicated');const base=prior(original,first),s=read(path.join(recovery,'execution.json'));const rows=s.records.map(row=>{if(row.status==='not-run')return row;const raw=read(path.join(recovery,row.raw)),c=base.sealed.frozen.protocol.cases.find(c=>c.id===row.id);return {...row,answer:raw.answer??'',record:raw,workflow:mechanicalOutcome(c,raw)};});return {...base,state:{...base.state,segmented:true,observedTokens:s.observedTokens,elapsedMs:plan.priorElapsedMs+s.elapsedMs,stopped:s.stopped,completedAt:s.completedAt,unknownPriorFailedUsage:true,originalFailure:base.state.originalFailure,priorFailures:[base.state.originalFailure,base.records[199]],lifetimeAttempts:201+result.attempted,answerSlots:324},records:[...base.records.slice(0,199),...rows]};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [cmd,...a]=process.argv.slice(2);
 if(cmd==='plan'){assert.equal(a.length,3);write(a[2],createPlan(a[0],a[1]),true);console.log(read(a[2]).sha256);}
 else if(cmd==='execute'){assert.equal(a.length,5);assert.equal(a[4],'--live');console.log(JSON.stringify(await execute(read(a[0]),a[1],a[2],a[3],{live:true})));}
 else if(cmd==='simulate'){assert.equal(a.length,5);console.log(JSON.stringify(await execute(read(a[0]),a[1],a[2],a[3],{simulation:true,scenario:a[4]})));}
 else if(cmd==='verify'){assert.equal(a.length,4);console.log(JSON.stringify(verify(read(a[0]),a[1],a[2],a[3])));}
 else if(cmd==='packets'){assert.equal(a.length,5);write(a[4],packets(combine(read(a[0]),a[1],a[2],a[3])),true);}
 else if(cmd==='review'){assert.equal(a.length,6);write(a[5],assessRun(combine(read(a[0]),a[1],a[2],a[3]),preserveJudgments(read(a[4]))),true);}
 else throw Error('plan ORIGINAL FIRST NEW_PLAN | execute PLAN ORIGINAL FIRST NEW_OUT --live | simulate PLAN ORIGINAL FIRST NEW_OUT SCENARIO | verify PLAN ORIGINAL FIRST OUT | packets PLAN ORIGINAL FIRST OUT NEW_PACKETS | review PLAN ORIGINAL FIRST OUT ANNOTATIONS NEW_REPORT');
}
