/** Prospective repaired benchmark using unchanged v3 transport; all historical collectors stay frozen. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {runLoginTurn,toolchainIdentity,verifyToolchain,selectedAnswer} from '../health-transport-v3/login-turn.mjs';
import {assessProbe, prompt as probePrompt, proxyBinding} from '../health-transport-v3/probe.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
import {digest,root,validateFreeze} from './suite.mjs';
import {commonProtocol as legacyProtocol} from '../skills-benchmark-v2/campaign.mjs';
import {assessRun,mechanicalOutcome,packets} from './review.mjs';
export {assessRun, mechanicalOutcome, packets};
export const commonProtocol = legacyProtocol.replace('sweep may place that report unchanged inside its report string', 'sweep must set its decoded report string exactly equal to finalReport');
const schema = 'skills-v5-campaign-transport-v3';
const benchmarkDir = path.join(root, 'evals/research/skills-benchmark-v5');
const transportDocs = path.join(root, 'docs/research/health-transport-v3');
export const probeAnchor = 'bfa61337e6c75a4c632287cdfac98da452dfcea38d47c70bf6f5e1740d3c773c';
const probeRecordSha = 'e8d16360716e1bdeded5521f3d6cc8d94618644896cb1717c65798d70d664976';
const probeResultSha = '7f92c4c8ded1beaafce897a1e5abd9afaedf6a9a6b44948efba9405ba259361c';
export const caseAnchor = JSON.parse(fs.readFileSync(path.join(benchmarkDir,'freeze-anchor.json'))).sha256;
const sourceFiles = [
 'evals/research/skills-benchmark-v5/campaign.mjs',
 'evals/research/skills-benchmark-v5/suite.mjs',
 'evals/research/skills-benchmark-v5/review.mjs',
 'evals/research/skills-benchmark-v5/public-contract.md',
 'evals/research/skills-benchmark-v5/adjudication-policy.json',
 'evals/research/skills-benchmark-v5/calibration.json',
 'evals/research/skills-benchmark-v5/rubric-definitions.json',
 'evals/research/skills-benchmark-v5/freeze-anchor.json',
 'evals/research/skills-benchmark-v5/artifact-check.mjs',
 'evals/research/skills-benchmark-v5/artifact-sandbox.mjs',
 'evals/research/runtime/prospective/docker-isolation.mjs',
 'evals/research/skills-benchmark-v2/campaign.mjs',
 'evals/research/skills-benchmark-v2/suite.mjs',
 'evals/research/health-transport-v3/login-turn.mjs',
 'evals/research/health-transport-v3/probe.mjs',
 'evals/research/health-transport-v3/fake-cli.cjs',
 'evals/research/health-workflow-v2/login-turn.mjs',
 'evals/research/health-workflow-v2/probe.mjs',
 'evals/research/health-workflow-v2/workflow.mjs',
 'evals/research/health-tool-retest/login-turn.mjs',
 'evals/research/health-tool-retest/tool.mjs',
 'skills/brooks-health/scripts/score-dashboard.mjs',
];
const sources=()=>Object.fromEntries(sourceFiles.map(file=>[file,digest(fs.readFileSync(path.join(root,file)))]));
const json=(file,value,exclusive=false)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:exclusive?'wx':'w',mode:0o600});
const read=file=>JSON.parse(fs.readFileSync(file));
const seal=body=>({...body,sha256:digest(JSON.stringify(body))});
const unseal=value=>{const {sha256,...body}=value;assert.equal(digest(JSON.stringify(body)),sha256,'Sealed content changed');return body;};
const count=raw=>Number.isSafeInteger(raw.usage?.total?.totalTokens)&&raw.usage.total.totalTokens>=0?raw.usage.total.totalTokens:null;
function localEndpoint(endpoint){const url=new URL(endpoint);assert(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&url.pathname==='/v1'&&url.port,'Only loopback fixture endpoint allowed');}
export function loadRetainedProbe() {
 const archive = path.join(transportDocs, 'results/2026-11-12-live-probe');
 return {
  plan: read(path.join(transportDocs, 'probe-plan.json')),
  rawRecordBytes: fs.readFileSync(path.join(archive, 'record.json'), 'utf8'),
  rawResultBytes: fs.readFileSync(path.join(archive, 'probe-result.json'), 'utf8'),
 };
}
const observedRetry = record => Boolean(record.transport_retry_observed ||
 record.events.some(event => event.method === 'error' && event.params?.willRetry));
export function verifyProbe(probe, binding) {
 assert(probe?.plan && probe.rawRecordBytes && probe.rawResultBytes, 'A retained successful real probe is required');
 const plan = unseal(probe.plan);
 assert.equal(probe.plan.sha256, probeAnchor, 'Unrecognized v3 probe anchor');
 assert.equal(plan.schema, 'health-transport-probe-v3');
 assert.equal(plan.transport.stopOnObservedRetry, true);
 assert.equal(plan.prompt, probePrompt);
 assert.equal(digest(probe.rawRecordBytes), probeRecordSha, 'Unrecognized raw probe record');
 assert.equal(digest(probe.rawResultBytes), probeResultSha, 'Unrecognized probe verdict');
 const record = JSON.parse(probe.rawRecordBytes);
 const result = JSON.parse(probe.rawResultBytes);
 assert.equal(result.planSha256, probeAnchor);
 assert.equal(result.rawRecordSha256, probeRecordSha);
 assert.equal(result.verdict.passed, true);
 assert.equal(result.verdict.simulation, false);
 assert.equal(result.automaticContinuation, false);
 assert.equal(record.simulation, false);
 assert.equal(record.scope, 'health-transport-v3');
 assert.equal(record.auth_type, 'chatgpt');
 assert.equal(record.proxy_mode, 'explicit-environment');
 assert.equal(record.prompt, plan.prompt);
 assert.equal(record.source_sha256, plan.sources['evals/research/health-transport-v3/login-turn.mjs']);
 assert.equal(observedRetry(record), false);
 assert.deepEqual(assessProbe(record), result.verdict, 'Scorer receipt did not reproduce');
 for (const [field, rawField] of [['model', 'cli_selected_model'], ['effort', 'cli_selected_effort'], ['cliVersion', 'cli_version']]) {
  assert.equal(plan[field], binding[field], 'Probe identity differs from campaign');
  assert.equal(record[rawField], binding[field]);
 }
 assert.deepEqual(plan.toolchain, binding.toolchain);
 assert.deepEqual(record.toolchain, binding.toolchain);
 for (const [file, sha] of Object.entries(plan.sources)) {
  assert.equal(digest(fs.readFileSync(path.join(root, file))), sha, 'Probe source changed');
 }
 return plan.transport.proxy;
}
export function verifyProxy(expected) {
 assert.deepEqual(proxyBinding(), expected, 'Proxy environment changed since the live v3 probe');
}
/** All budgets and identity fields are explicit; registration does not execute a model. */
export function register({frozen,freezeAnchor,model,effort,cliVersion,executable,budget,assessor,simulation=false,probe,offline}={}){
 validateFreeze(frozen);assert.equal(frozen.sha256,freezeAnchor,'Wrong case freeze anchor');
 if (!simulation) {assert.equal(freezeAnchor, caseAnchor, 'Unrecognized live benchmark freeze');assert.equal(model,'gpt-6.1-terra');assert.equal(effort,'low');assert.deepEqual(budget,{calls:324,observedTokens:12000000,totalMs:43200000,turnMs:120000},'Live budget differs from frozen plan');}
 for(const [file,sha]of Object.entries(frozen.protocol.sourceHashes)){const location=file.startsWith('skills/')||file.startsWith('evals/')?path.join(root,file):path.join(benchmarkDir,file);assert.equal(digest(fs.readFileSync(location)),sha,'Frozen scoring/witness source drift');}
 assert(/^gpt-[A-Za-z0-9._-]+$/.test(model));assert(['low','medium','high','xhigh'].includes(effort));assert(/^\d+\.\d+\.\d+$/.test(cliVersion));
 assert(typeof assessor==='string'&&assessor.trim(),'Assessor identity required');assert(path.isAbsolute(executable),'Pinned absolute executable required');
 assert.deepEqual(Object.keys(budget??{}).sort(),['calls','observedTokens','totalMs','turnMs']);
 assert.equal(budget.calls,frozen.protocol.schedule.length);
 for(const key of ['observedTokens','totalMs','turnMs'])assert(Number.isSafeInteger(budget[key])&&budget[key]>0);
 assert(budget.turnMs<=900000&&budget.turnMs<=budget.totalMs);
 let toolchain;
 if(simulation){assert(offline&&Array.isArray(offline.prefixArgs));localEndpoint(offline.fixtureEndpoint);assert(offline.prefixArgs.length>=1&&path.isAbsolute(offline.prefixArgs[0]));
  // Fake CLI is a checked-in authored protocol fixture; it never reads credentials.
  assert.equal(fs.realpathSync(offline.prefixArgs[0]),fs.realpathSync(path.join(root,'evals/research/health-transport-v3/fake-cli.cjs')));
  toolchain={codexSha256:digest(fs.readFileSync(executable)),codeModeHostSha256:digest(fs.readFileSync(offline.prefixArgs[0])),simulationOnly:true};
 } else {
  assert.equal(offline, undefined, 'Live fixture override forbidden');
  assert(budget.turnMs <= 120000, 'Live turn deadline exceeds 120 seconds');
  toolchain = toolchainIdentity(executable);
 }
 const proxy = simulation ? null : verifyProbe(probe, {model, effort, cliVersion, toolchain});
 if (!simulation) verifyProxy(proxy);
 return seal({schema,simulation,frozen,model,effort,cliVersion,executable,toolchain,budget,assessor,sourceHashes:sources(),commonProtocol,
  ...(simulation?{offline}:{probe,proxy}),policy:{automaticRetries:0,stopOnFirstFailure:true,unknownUsageStops:true,
  allArmsSameScoreTool:true,executeModelPatches:false,nativeSkillDiscovery:false,
  limitation:'Observed-token admission can overshoot by one turn; provider retries and unknown failed usage are not hard billing caps.'}});
}
export function validateRegistration(sealed,anchor){
 const r=unseal(sealed);assert.equal(r.commonProtocol,commonProtocol,'Public protocol changed');assert.equal(sealed.sha256,anchor,'Registration anchor mismatch');assert.equal(r.schema,schema);validateFreeze(r.frozen);
 assert.equal(r.budget.calls,r.frozen.protocol.schedule.length);assert.equal(r.policy.executeModelPatches,false);assert.equal(r.policy.automaticRetries,0);
 assert.deepEqual(r.sourceHashes,sources(),'Runner changed since registration');
 for(const [file,sha]of Object.entries(r.frozen.protocol.sourceHashes)){const location=file.startsWith('skills/')||file.startsWith('evals/')?path.join(root,file):path.join(benchmarkDir,file);assert.equal(digest(fs.readFileSync(location)),sha,'Frozen guidance or fixture changed since registration');}
 if (!r.simulation) {
  assert.equal(r.frozen.sha256, caseAnchor);assert.equal(r.model,'gpt-6.1-terra');assert.equal(r.effort,'low');assert.deepEqual(r.budget,{calls:324,observedTokens:12000000,totalMs:43200000,turnMs:120000});
  assert.deepEqual(r.proxy, verifyProbe(r.probe, r));
 }
 return r;
}
function promptFor(r,turn){const c=r.frozen.protocol.cases.find(c=>c.id===turn.id);assert(c);const p=c.prompts[turn.arm];assert.equal(digest(p.text),p.sha256);return p.text+'\n\n'+r.commonProtocol;}
export async function execute(sealed,anchor,out,{live=false}={}){
 const r=validateRegistration(sealed,anchor);
 assert.equal(live,!r.simulation,'Explicit live flag must match the registration; simulated probe cannot run live');
 if(!r.simulation){
  verifyProxy(r.proxy);
  verifyToolchain(r.executable,r.toolchain);
 }else{
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
  if (!r.simulation) {
   try { verifyProxy(r.proxy); }
   catch { state.stopped = 'proxy-drift'; break; }
  }
  const folder=String(row.ordinal).padStart(3,'0'),dir=path.join(out,folder),prompt=promptFor(r,row);
  json(path.join(out,`intent-${folder}.json`),{registrationSha256:anchor,simulation:r.simulation,ordinal:row.ordinal,promptSha256:digest(prompt)},true);attempted++;
  let raw,file='record.json';
  try{raw=await runLoginTurn({model:r.model,effort:r.effort,cliVersion:r.cliVersion,executable:r.executable,toolchain:r.toolchain,
   live:!r.simulation,...(r.simulation?r.offline:{inheritProxy:true}),enableScoreTool:true,prompt,out:dir,timeoutMs:Math.max(1,Math.min(r.budget.turnMs,remaining))});}
  catch{fs.mkdirSync(dir,{recursive:true});file='setup-failure.json';raw={status:'failed',simulation:r.simulation,answer:'',error:'Setup/archive failure; no subsequent calls'};json(path.join(dir,file),raw,true);}
  const rawHash=digest(fs.readFileSync(path.join(dir,file)));json(path.join(dir,'receipt.json'),{file,sha256:rawHash},true);
  row.status=raw.status==='completed'?'completed':'failed';row.raw=`${folder}/${file}`;row.rawSha256=rawHash;row.observedTokens=count(raw);
  if(row.observedTokens!==null)state.observedTokens+=row.observedTokens;
  if(row.status==='failed')state.stopped=raw.transport_retry_observed?'transport-retry':'execution-failure';else if(row.observedTokens===null)state.stopped='usage-unavailable';
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
   assert.equal(raw.scope, 'health-transport-v3');
   assert.equal(raw.source_sha256, r.sourceHashes['evals/research/health-transport-v3/login-turn.mjs']);
   assert.equal(raw.proxy_mode, r.simulation ? 'none' : 'explicit-environment');
   if (observedRetry(raw)) assert.equal(row.status, 'failed', 'A retry must fail the turn');
   assert.equal(raw.prompt,promptFor(r,row));assert.equal(raw.requested_model,r.model);assert.equal(raw.requested_effort,r.effort);assert.equal(raw.enableScoreTool,true);
   if(row.status==='completed'){
    assert.equal(raw.cli_selected_model,r.model);assert.equal(raw.cli_selected_effort,r.effort);assert.equal(raw.cli_version,r.cliVersion);
    assert(raw.cleanup.closed&&raw.cleanup.group_absent&&raw.cleanup.private_home_removed,'Cleanup incomplete');
    const selection=selectedAnswer(raw.events,raw.thread_id,raw.turn_id);assert.equal(raw.answer,selection.text,'Answer provenance mismatch');assert(selection.text.trim());
    if (!r.simulation) {
     assert.equal(raw.auth_type, 'chatgpt');
     assert.deepEqual(raw.toolchain, r.toolchain);
    }
   }
   for(const call of raw.tool_calls??[]){if(call.success)assert.deepEqual(call.result,finalizeTool(call.arguments),'Tool receipt mismatch');}
  }
  assert.equal(row.observedTokens,count(raw));if(row.observedTokens!==null)tokens+=row.observedTokens;
  if(row.status==='failed'||row.observedTokens===null)stopped=true;
  const c=r.frozen.protocol.cases.find(c=>c.id===row.id);return {...row,answer:raw.answer??'',record:raw,workflow:mechanicalOutcome(c,raw)};
 });
 assert.equal(tokens,state.observedTokens);return {sealed,state,records};
}
export function prepareRegistration(executable, budget, assessor) {
 const frozen = read(path.join(benchmarkDir, 'prepared-freeze.json'));
 const probe = loadRetainedProbe();
 const {model, effort, cliVersion} = probe.plan;
 return register({frozen, freezeAnchor: caseAnchor, model, effort, cliVersion, executable,
  budget: {calls: 324, ...budget}, assessor, probe});
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&fs.realpathSync(process.argv[1])===fs.realpathSync(fileURLToPath(import.meta.url))){
 const [command,...args]=process.argv.slice(2);
 if(command==='execute'){assert.equal(args.length,4,'execute REGISTRATION ANCHOR NEW_OUT --live|--offline');assert(['--live','--offline'].includes(args[3]));console.log(JSON.stringify(await execute(read(args[0]),args[1],args[2],{live:args[3]==='--live'})));}
 else if(command==='verify'){assert.equal(args.length,1);const run=readRun(args[0]);console.log(JSON.stringify({simulation:run.state.simulation,records:run.records.length,completed:run.records.filter(r=>r.status==='completed').length}));}
 else if(command==='review'){assert.equal(args.length,3,'review RUN ANNOTATIONS NEW_REPORT');json(args[2],assessRun(readRun(args[0]),read(args[1])),true);}
 else if (command === 'register') {
  assert.equal(args.length, 6, 'register ABSOLUTE_CODEX TOKENS TOTAL_MS TURN_MS ASSESSOR NEW_REGISTRATION');
  const [executable, tokens, totalMs, turnMs, assessor, output] = args;
  const registration = prepareRegistration(executable, {observedTokens: Number(tokens), totalMs: Number(totalMs), turnMs: Number(turnMs)}, assessor);
  json(output, registration, true);
  console.log(JSON.stringify({registrationSha256: registration.sha256, model: registration.model,
   effort: registration.effort, cliVersion: registration.cliVersion, budget: registration.budget}));
 }
 else if (command === 'verify-registration') {
  assert.equal(args.length, 2, 'verify-registration REGISTRATION ANCHOR');
  const registration = validateRegistration(read(args[0]), args[1]);
  console.log(JSON.stringify({simulation: registration.simulation, calls: registration.budget.calls, model: registration.model}));
 }
 else throw Error('Use register, verify-registration, execute, verify, or review. No command runs live without explicit --live.');
}
