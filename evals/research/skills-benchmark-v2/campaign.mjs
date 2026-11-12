/** Supplied-guidance collector only: never evaluates or executes returned model patches. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {runLoginTurn,toolchainIdentity,verifyToolchain,selectedAnswer} from '../health-workflow-v2/login-turn.mjs';
import {assessProbe,prompt as probePrompt} from '../health-workflow-v2/probe.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
import {digest,root,validateFreeze,summarize} from './suite.mjs';
const schema='skills-v2-campaign-v1';
const sourceFiles=['evals/research/skills-benchmark-v2/campaign.mjs','evals/research/skills-benchmark-v2/suite.mjs',
 'evals/research/health-workflow-v2/login-turn.mjs','evals/research/health-workflow-v2/probe.mjs','evals/research/health-workflow-v2/workflow.mjs',
 'evals/research/health-tool-retest/tool.mjs','skills/brooks-health/scripts/score-dashboard.mjs'];
const sources=()=>Object.fromEntries(sourceFiles.map(file=>[file,digest(fs.readFileSync(path.join(root,file)))]));
const json=(file,value,exclusive=false)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:exclusive?'wx':'w',mode:0o600});
const read=file=>JSON.parse(fs.readFileSync(file));
const seal=body=>({...body,sha256:digest(JSON.stringify(body))});
const unseal=value=>{const {sha256,...body}=value;assert.equal(digest(JSON.stringify(body)),sha256,'Sealed content changed');return body;};
const count=raw=>Number.isSafeInteger(raw.usage?.total?.totalTokens)&&raw.usage.total.totalTokens>=0?raw.usage.total.totalTokens:null;
function localEndpoint(endpoint){const url=new URL(endpoint);assert(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&url.pathname==='/v1'&&url.port,'Only loopback fixture endpoint allowed');}
function verifyProbe(probe,anchor,binding){
 assert(probe&&probe.plan&&probe.result&&probe.record,'A retained successful real probe is required');
 const plan=unseal(probe.plan);assert.equal(probe.plan.sha256,anchor,'Probe anchor mismatch');
 assert.equal(plan.schema,'health-routing-probe-v2');assert.equal(plan.prompt,probePrompt);assert.equal(probe.record.prompt,plan.prompt);
 assert.deepEqual(Object.keys(plan.sources).sort(),['evals/research/health-workflow-v2/login-turn.mjs','evals/research/health-workflow-v2/workflow.mjs','evals/research/health-workflow-v2/probe.mjs','evals/research/health-tool-retest/tool.mjs','evals/research/health-tool-retest/login-turn.mjs','skills/brooks-health/scripts/score-dashboard.mjs'].sort());
 assert.equal(probe.result.planSha256,anchor);assert.equal(probe.result.rawRecordSha256,digest(probe.rawRecordBytes),'Raw probe hash mismatch');
 assert.deepEqual(JSON.parse(probe.rawRecordBytes),probe.record,'Probe raw content mismatch');
 assert.equal(probe.record.simulation,false,'A simulated probe cannot authorize a live campaign');
 assert.equal(probe.result.verdict.passed,true,'Probe did not pass');
 assert.equal(probe.result.verdict.simulation,false,'Probe verdict is simulated');
 assert(assessProbe(probe.record).passed,'Probe tool receipt failed verification');
 for(const [field,rawField]of [['model','cli_selected_model'],['effort','cli_selected_effort'],['cliVersion','cli_version']]){
  assert.equal(plan[field],binding[field],'Probe identity differs from campaign');assert.equal(probe.record[rawField],binding[field]);
 }
 assert.deepEqual(plan.toolchain,binding.toolchain);assert.deepEqual(probe.record.toolchain,binding.toolchain);
 for(const [file,sha]of Object.entries(plan.sources))assert.equal(digest(fs.readFileSync(path.join(root,file))),sha,'Probe source changed');
 return true;
}
/** All budgets and identity fields are explicit; registration does not execute a model. */
export function register({frozen,freezeAnchor,model,effort,cliVersion,executable,budget,assessor,simulation=false,probe,probeAnchor,offline}={}){
 validateFreeze(frozen);assert.equal(frozen.sha256,freezeAnchor,'Wrong case freeze anchor');
 for(const [file,sha]of Object.entries(frozen.protocol.sourceHashes)){const location=file.startsWith('skills/')?path.join(root,file):path.join(root,'evals/research/skills-benchmark-v2',file);assert.equal(digest(fs.readFileSync(location)),sha,'Frozen scoring/witness source drift');}
 assert(/^gpt-[A-Za-z0-9._-]+$/.test(model));assert(['low','medium','high','xhigh'].includes(effort));assert(/^\d+\.\d+\.\d+$/.test(cliVersion));
 assert(typeof assessor==='string'&&assessor.trim(),'Assessor identity required');assert(path.isAbsolute(executable),'Pinned absolute executable required');
 assert.deepEqual(Object.keys(budget??{}).sort(),['calls','observedTokens','totalMs','turnMs']);
 assert.equal(budget.calls,frozen.protocol.schedule.length);
 for(const key of ['observedTokens','totalMs','turnMs'])assert(Number.isSafeInteger(budget[key])&&budget[key]>0);
 assert(budget.turnMs<=900000&&budget.turnMs<=budget.totalMs);
 let toolchain;
 if(simulation){assert(offline&&Array.isArray(offline.prefixArgs));localEndpoint(offline.fixtureEndpoint);assert(offline.prefixArgs.length>=1&&path.isAbsolute(offline.prefixArgs[0]));
  // Fake CLI is a checked-in authored protocol fixture; it never reads credentials.
  assert.equal(fs.realpathSync(offline.prefixArgs[0]),fs.realpathSync(path.join(root,'evals/research/health-tool-retest/fake-cli.cjs')));
  toolchain={codexSha256:digest(fs.readFileSync(executable)),codeModeHostSha256:digest(fs.readFileSync(offline.prefixArgs[0])),simulationOnly:true};
 }else{assert.equal(offline,undefined,'Live fixture override forbidden');toolchain=toolchainIdentity(executable);verifyProbe(probe,probeAnchor,{model,effort,cliVersion,toolchain});}
 return seal({schema,simulation,frozen,model,effort,cliVersion,executable,toolchain,budget,assessor,sourceHashes:sources(),commonProtocol,
  ...(simulation?{offline}:{probe,probeAnchor}),policy:{automaticRetries:0,stopOnFirstFailure:true,unknownUsageStops:true,
  allArmsSameScoreTool:true,executeModelPatches:false,nativeSkillDiscovery:false,
  limitation:'Observed-token admission can overshoot by one turn; provider retries and unknown failed usage are not hard billing caps.'}});
}
function validateRegistration(sealed,anchor,{current=true}={}){
 const r=unseal(sealed);assert.equal(r.commonProtocol,commonProtocol,'Public protocol changed');assert.equal(sealed.sha256,anchor,'Registration anchor mismatch');assert.equal(r.schema,schema);validateFreeze(r.frozen);
 assert.equal(r.budget.calls,r.frozen.protocol.schedule.length);assert.equal(r.policy.executeModelPatches,false);assert.equal(r.policy.automaticRetries,0);
 if(current)assert.deepEqual(r.sourceHashes,sources(),'Runner changed since registration');
 if(!r.simulation)verifyProbe(r.probe,r.probeAnchor,r);
 return r;
}
export const commonProtocol = `Execution/output contract shared identically by all arms: brooks_health_finalize is available through the exposed functions.exec route when relevant; no shell or filesystem tools are permitted. Health and sweep final dashboards require a successful scorer call, including unassessed dimensions (unknown evidence is not a prohibition on rendering an unavailable composite). For a health dashboard, submit a dashboards array containing one {ledger,draft}. The ledger is {strictness:'strict'|'balanced'|'legacy-friendly',hasDiff:boolean,dimensions:{pr:dimension,architecture:dimension,debt:dimension,test:dimension}}. Each dimension is {status:'assessed',findings:[{id:string,risk:'R1'..'R6'|'T1'..'T6',severity:'critical'|'warning'|'suggestion'}]} with at most three findings, or {status:'unassessed',reason:string}; pr with no diff must be {status:'skipped',reason:string}. Debt allows at most two per risk. A supplied adjudicated capped ledger lacking risk codes may set suppliedCappedLedger:true and omit those risk fields. The draft contains exactly one <!-- BROOKS_HEALTH_SCORE --> and no handwritten score. Return the verified finalReport unchanged for health-only tasks; sweep may place that report unchanged inside its report string, with its other required JSON fields. Diagnose before constructing a ledger; absent evidence stays unassessed. Never claim a tool call without its receipt. Returned patch code is collected only and is never executed in this campaign. Tool execution is not proof that diagnoses or ledger ownership are correct.`;
function promptFor(r,turn){const c=r.frozen.protocol.cases.find(c=>c.id===turn.id);assert(c);const p=c.prompts[turn.arm];assert.equal(digest(p.text),p.sha256);return p.text+'\n\n'+r.commonProtocol;}
export async function execute(sealed,anchor,out,{live=false}={}){
 const r=validateRegistration(sealed,anchor);
 assert.equal(live,!r.simulation,'Explicit live flag must match the registration; simulated probe cannot run live');
 if(!r.simulation)verifyToolchain(r.executable,r.toolchain);else{
  localEndpoint(r.offline.fixtureEndpoint);assert.equal(digest(fs.readFileSync(r.executable)),r.toolchain.codexSha256);assert.equal(digest(fs.readFileSync(r.offline.prefixArgs[0])),r.toolchain.codeModeHostSha256);
 }
 assert(!fs.existsSync(out),'Fresh output directory required');fs.mkdirSync(out,{recursive:true,mode:0o700});json(path.join(out,'registration.json'),sealed,true);
 const state={registrationSha256:anchor,simulation:r.simulation,startedAt:new Date().toISOString(),stopped:null,observedTokens:0,
  records:r.frozen.protocol.schedule.map(turn=>({...turn,status:'not-run',observedTokens:null,raw:null}))};
 const started=performance.now(),wall=Date.now();const elapsed=()=>Math.max(performance.now()-started,Date.now()-wall);
 const save=()=>json(path.join(out,'execution.json'),state);
 save();let attempted=0;
 for(const row of state.records){
  const remaining=Math.floor(r.budget.totalMs-elapsed());
  if(remaining<=0||state.observedTokens>=r.budget.observedTokens||attempted>=r.budget.calls){state.stopped='budget';break;}
  const folder=String(row.ordinal).padStart(3,'0'),dir=path.join(out,folder),prompt=promptFor(r,row);
  json(path.join(out,`intent-${folder}.json`),{registrationSha256:anchor,simulation:r.simulation,ordinal:row.ordinal,promptSha256:digest(prompt)},true);attempted++;
  let raw,file='record.json';
  try{raw=await runLoginTurn({model:r.model,effort:r.effort,cliVersion:r.cliVersion,executable:r.executable,toolchain:r.toolchain,
   live:!r.simulation,...(r.simulation?r.offline:{}),enableScoreTool:true,prompt,out:dir,timeoutMs:Math.max(1,Math.min(r.budget.turnMs,remaining))});}
  catch{fs.mkdirSync(dir,{recursive:true});file='setup-failure.json';raw={status:'failed',simulation:r.simulation,answer:'',error:'Setup/archive failure; no subsequent calls'};json(path.join(dir,file),raw,true);}
  const rawHash=digest(fs.readFileSync(path.join(dir,file)));json(path.join(dir,'receipt.json'),{file,sha256:rawHash},true);
  row.status=raw.status==='completed'?'completed':'failed';row.raw=`${folder}/${file}`;row.rawSha256=rawHash;row.observedTokens=count(raw);
  if(row.observedTokens!==null)state.observedTokens+=row.observedTokens;
  if(row.status==='failed')state.stopped='execution-failure';else if(row.observedTokens===null)state.stopped='usage-unavailable';
  state.elapsedMs=Math.ceil(elapsed());save();if(state.stopped)break;
 }
 state.elapsedMs=Math.ceil(elapsed());state.completedAt=new Date().toISOString();save();
 const verified=readRun(out);json(path.join(out,'review-packets.json'),packets(verified),true);
 return {simulation:r.simulation,attempted,completed:state.records.filter(row=>row.status==='completed').length,failed:state.records.filter(row=>row.status==='failed').length,
  notRun:state.records.filter(row=>row.status==='not-run').length,observedTokens:state.observedTokens,stopped:state.stopped};
}
export function readRun(out){
 const sealed=read(path.join(out,'registration.json')),r=validateRegistration(sealed,sealed.sha256),state=read(path.join(out,'execution.json'));
 assert.equal(state.registrationSha256,sealed.sha256);assert.equal(state.simulation,r.simulation);assert.equal(state.records.length,r.frozen.protocol.schedule.length);
 let stopped=false,tokens=0;
 const records=state.records.map((row,i)=>{const turn=r.frozen.protocol.schedule[i];for(const key of ['ordinal','id','arm','repeat'])assert.equal(row[key],turn[key]);
  assert(['not-run','completed','failed'].includes(row.status));
  if(row.status==='not-run'){stopped=true;assert.equal(row.raw,null);assert.equal(row.observedTokens,null);return {...row};}
  assert(!stopped,'Executed turn after a stop');const folder=String(row.ordinal).padStart(3,'0'),receipt=read(path.join(out,folder,'receipt.json'));
  assert(['record.json','setup-failure.json'].includes(receipt.file));assert.equal(row.raw,`${folder}/${receipt.file}`);
  const bytes=fs.readFileSync(path.join(out,row.raw));assert.equal(digest(bytes),receipt.sha256,'Raw record tampered');assert.equal(row.rawSha256,receipt.sha256);
  const raw=JSON.parse(bytes);assert.equal(raw.simulation,r.simulation);assert.equal(row.status,raw.status==='completed'?'completed':'failed');
  const intent=read(path.join(out,`intent-${folder}.json`));assert.equal(intent.registrationSha256,sealed.sha256);assert.equal(intent.promptSha256,digest(promptFor(r,row)));assert.equal(intent.ordinal,row.ordinal);
  if(receipt.file==='record.json'){
   assert.equal(raw.prompt,promptFor(r,row));assert.equal(raw.requested_model,r.model);assert.equal(raw.requested_effort,r.effort);assert.equal(raw.enableScoreTool,true);
   if(row.status==='completed'){
    assert.equal(raw.cli_selected_model,r.model);assert.equal(raw.cli_selected_effort,r.effort);assert.equal(raw.cli_version,r.cliVersion);
    assert(raw.cleanup.closed&&raw.cleanup.group_absent&&raw.cleanup.private_home_removed,'Cleanup incomplete');
    const selection=selectedAnswer(raw.events,raw.thread_id,raw.turn_id);assert.equal(raw.answer,selection.text,'Answer provenance mismatch');assert(selection.text.trim());
    if(!r.simulation)assert.deepEqual(raw.toolchain,r.toolchain);
   }
   for(const call of raw.tool_calls??[]){if(call.success)assert.deepEqual(call.result,finalizeTool(call.arguments),'Tool receipt mismatch');}
  }
  assert.equal(row.observedTokens,count(raw));if(row.observedTokens!==null)tokens+=row.observedTokens;
  if(row.status==='failed'||row.observedTokens===null)stopped=true;
  const c=r.frozen.protocol.cases.find(c=>c.id===row.id);return {...row,answer:raw.answer??'',record:raw,workflow:mechanicalOutcome(c,raw)};
 });
 assert.equal(tokens,state.observedTokens);return {sealed,state,records};
}
/** Receipt adherence is separate from diagnoses, rubric evidence and execution status. */
export function mechanicalOutcome(c,raw){
 const required=['brooks-health','brooks-sweep'].includes(c.skill),calls=raw.tool_calls??[],successful=calls.filter(call=>call.success),last=successful.at(-1);
 let retained=false;
 if(last){const expected=finalizeTool(last.arguments);assert.deepEqual(last.result,expected);if(c.skill==='brooks-health')retained=raw.answer===expected.finalReport;else if(c.skill==='brooks-sweep'){try{const artifact=JSON.parse(raw.answer);retained=typeof artifact.report==='string'&&artifact.report.includes(expected.finalReport);}catch{retained=false;}}}
 return {required,prohibited:false,observedCalls:calls.length,successfulCalls:successful.length,reportRetainedUnchanged:retained,
  passed:required?raw.status==='completed'&&successful.length>0&&last.result.reports.length===1&&retained:null,
  limitation:'Unknown dimensions require an unavailable-composite report, not an invented numeric score. Receipt checks do not prove ledger truth.'};
}
function workflowSummary(run){
 const aggregate=rows=>['A','B','C'].map(arm=>{const selected=rows.filter(row=>row.arm===arm&&row.workflow),required=selected.filter(row=>row.workflow.required);return {arm,required:required.length,passed:required.filter(row=>row.workflow.passed).length,observedCalls:selected.reduce((n,row)=>n+row.workflow.observedCalls,0)};});
 const cases=run.sealed.frozen.protocol.cases,skills=[...new Set(cases.map(c=>c.skill))];
 return {arms:aggregate(run.records),bySkill:Object.fromEntries(skills.map(skill=>[skill,aggregate(run.records.filter(row=>cases.find(c=>c.id===row.id).skill===skill))])),byCohort:Object.fromEntries(['regression','challenge'].map(cohort=>[cohort,aggregate(run.records.filter(row=>cases.find(c=>c.id===row.id).cohort===cohort))]))};
}
export function packets(run){return {simulation:run.state.simulation,registrationSha256:run.sealed.sha256,limitations:['Masked IDs do not ensure independent judgment; supplied prose can reveal treatment.'],packets:run.records.filter(row=>row.status==='completed').map(row=>({responseId:digest(`${run.sealed.sha256}/${row.ordinal}`).slice(0,24),caseId:row.id,answerSha256:digest(row.answer),answer:row.answer,completedMessages:row.record.events.filter(e=>e.method==='item/completed'&&e.params?.item?.type==='agentMessage').map(e=>e.params.item)})).sort((a,b)=>a.responseId.localeCompare(b.responseId))};}
export function assessRun(run,annotations){assert(Array.isArray(annotations));const packet=packets(run).packets;assert.equal(annotations.length,packet.length,'Every completed answer needs a judgment');assert.equal(new Set(annotations.map(a=>a.responseId)).size,annotations.length);const reviews=new Map(annotations.map(a=>[a.responseId,a.review]));const records=run.records.map(row=>{const id=digest(`${run.sealed.sha256}/${row.ordinal}`).slice(0,24);if(row.status!=='completed')return row;assert(reviews.has(id),'Missing annotation');return {...row,review:reviews.get(id)};});return {simulation:run.state.simulation,registrationSha256:run.sealed.sha256,results:summarize(records,{cases:run.sealed.frozen.protocol.cases}),workflow:workflowSummary(run),artifactExecution:'Not performed: returned model code is untrusted; sandboxed evaluation remains separate.'};}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&fs.realpathSync(process.argv[1])===fs.realpathSync(fileURLToPath(import.meta.url))){
 const [command,...args]=process.argv.slice(2);
 if(command==='execute'){assert.equal(args.length,4,'execute REGISTRATION ANCHOR NEW_OUT --live|--offline');assert(['--live','--offline'].includes(args[3]));console.log(JSON.stringify(await execute(read(args[0]),args[1],args[2],{live:args[3]==='--live'})));}
 else if(command==='verify'){assert.equal(args.length,1);const run=readRun(args[0]);console.log(JSON.stringify({simulation:run.state.simulation,records:run.records.length,completed:run.records.filter(r=>r.status==='completed').length}));}
 else if(command==='review'){assert.equal(args.length,3,'review RUN ANNOTATIONS NEW_REPORT');json(args[2],assessRun(readRun(args[0]),read(args[1])),true);}
 else throw Error('Use execute, verify, or review; registration is explicit via register().');
}
