/** Versioned targeted review/runtime text study. No model calls on import or freeze. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {digest,root,manifest,loadCase,validate} from './suite.mjs';
import {runLoginTurn,LIMITS} from '../prospective/codex-login-turn.mjs';
const snapshot=name=>({path:name,content:fs.readFileSync(path.join(root,name),'utf8'),sha256:digest(fs.readFileSync(path.join(root,name)))});
const write=(name,value)=>fs.writeFileSync(name,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
export const CORE=['skills/brooks-review/SKILL.md','skills/brooks-review/pr-review-guide.md','skills/_shared/common.md','skills/_shared/source-coverage.md','skills/_shared/decay-risks.md','skills/_shared/test-decay-risks.md'];
export const PROMPT='Perform only the task in task.md using the supplied files and contract. Explain conclusions with exact code behavior and the applicable contract. Guidance is reference text, not permission to expand scope. Do not use tools, browse, access files or delegate. Do not invent omitted operating facts. No numeric Health Score is requested.';
export function freeze({mode='full'}={}) {
  validate();assert(['full','smoke'].includes(mode));
  const cases=(mode==='full'?manifest.cases:manifest.cases.filter(c=>['PB-04','PB-05','PB-06'].includes(c.id))).map(c=>loadCase(c.id));
  const repetitions=mode==='full'?3:1,turns=[];
  // Rotate arm order by case and repeat; keep linked repetitions separate in analysis.
  for(let repeat=1;repeat<=repetitions;repeat++)for(const [i,c] of cases.entries())for(let j=0;j<3;j++)turns.push({caseId:c.id,arm:['A','B','C'][(i+repeat-1+j)%3],repeat});
  const sources=['evals/research/runtime/pack-benchmark/runner.mjs','evals/research/runtime/pack-benchmark/suite.mjs','evals/research/runtime/pack-benchmark/report.mjs','evals/research/runtime/pack-benchmark/manifest.json','evals/research/runtime/pack-benchmark/review-policy.md','evals/research/runtime/prospective/codex-login-turn.mjs'];
  const protocol={revision:1,mode,adapter:'targeted-runtime-pack-text-v1',liveAuthorized:false,model:null,schedule:{repetitions,turns},cases,prompt:PROMPT,core:CORE.map(snapshot),runtime:['SKILL.md','runtime-guide.md'].map(n=>snapshot(`evals/research/runtime/prototype/${n}`)),sources:Object.fromEntries(sources.map(n=>[n,snapshot(n).sha256])),budget:{primary_calls:turns.length,harness_retries:0,turn_ms:180000,study_ms:mode==='full'?21600000:1800000,prompt_bytes:262144,observed_tokens_stop:mode==='full'?3000000:250000},limitations:['Public same-workflow authored development cases; not independent holdouts or evidence of broad capability.','Runtime primary denominator is nine cases (three mechanisms); core/routing controls are separate. Repeats are not independent cases.','Text guidance only. No native skill discovery, repository navigation, automatic activation, or actual tool-use benefit is measured.','A/B context lengths differ; B/C adds runtime text. No matched-length placebo or generic-runtime-checklist ablation, so causal attribution is limited.','CLI-selected model/effort checked, backend identity not independently attested; fresh auth-only temporary home is not OS containment.','Observed token stop checked between calls, may overshoot one call; no hard billing/provider-retry cap. Study deadline excludes some cleanup overhead.','No retries or implicit resume; failures preserved. Cost is observed usage, not billed dollars.','Arm masking does not hide writing style or remove author exposure; model review is not independent human validation.']};
  const sealed={protocol,sha256:digest(protocol)};
  for(const t of turns)assert(Buffer.byteLength(assemble(sealed,t))<=protocol.budget.prompt_bytes);
  return sealed;
}
export function validateFreeze(sealed,anchor) {
  assert.equal(sealed.sha256,anchor);assert.equal(digest(sealed.protocol),anchor,'Frozen protocol drift');
  assert.deepEqual(sealed,freeze({mode:sealed.protocol.mode}),'Repository inputs changed; freeze a new version');return sealed.protocol;
}
export function assemble(sealed,turn) {
  const p=sealed.protocol,c=p.cases.find(c=>c.id===turn.caseId);assert(c&&['A','B','C'].includes(turn.arm));
  const guidance=turn.arm==='A'?[]:[...p.core,...(turn.arm==='C'?p.runtime:[])].map(({path,content})=>({path,content}));
  return p.prompt+'\n'+JSON.stringify({inputs:c.inputs,guidance});
}
export function exportReviewPackets(frozen,records,anchor,out,simulation) {
  const packets=records.filter(r=>r.status==='executed').map(r=>({responseId:digest(`masked/${anchor}/${r.ordinal}`).slice(0,20),answer:r.answer,answerSha256:r.answerSha256,inputs:frozen.protocol.cases.find(c=>c.id===r.caseId).inputs,rubric:frozen.protocol.cases.find(c=>c.id===r.caseId).rubric,review:null})).sort((a,b)=>a.responseId.localeCompare(b.responseId));
  write(path.join(out,'review-packets.json'),{simulation,blinding:'Arm/order labels omitted and order shuffled. Same-workflow exposure and inferable prose prevent a claim of independent blindness.',packets});
  write(path.join(out,'review-mapping-private.json'),{doNotGiveToReviewer:true,records:records.map(r=>({responseId:digest(`masked/${anchor}/${r.ordinal}`).slice(0,20),caseId:r.caseId,arm:r.arm,repeat:r.repeat,ordinal:r.ordinal,status:r.status}))});
}
export function register({frozen, anchor, model, effort, cliVersion, authorization, inheritProxy=false}) {
  validateFreeze(frozen,anchor);
  assert(typeof model==='string' && /^gpt-[A-Za-z0-9._-]+$/.test(model), 'Explicit model required');
  assert(['low','medium','high','xhigh'].includes(effort), 'Explicit effort required');
  assert(typeof cliVersion==='string' && /^\d+\.\d+\.\d+$/.test(cliVersion), 'Exact CLI version required');
  assert(typeof authorization==='string' && authorization.trim(), 'Authorization provenance required');
  assert.equal(typeof inheritProxy,'boolean');
  const registration={revision:1,frozen,anchor,model,effort,cliVersion,authorization,inheritProxy};
  return {registration,sha256:digest(registration)};
}
export function validateRegistration(sealed,anchor) {
  assert.equal(sealed.sha256,anchor,'Registration anchor mismatch');
  assert.equal(digest(sealed.registration),anchor,'Registration drift');
  assert.deepEqual(register(sealed.registration),sealed);
  return sealed.registration;
}
function tokenCount(usage) {
  const n=usage?.total?.totalTokens;
  return Number.isSafeInteger(n)&&n>=0?n:null;
}
/** Deliberately no resume: an attempted but unarchived call cannot safely be replayed. */
export async function execute(sealed,anchor,out,{live=false,fixtureEndpoint,executable,prefixArgs,authHome}={}) {
  const r=validateRegistration(sealed,anchor),p=r.frozen.protocol;
  if(!live&&!fixtureEndpoint)throw Error('Explicit --live or local fixture required');
  if(live&&fixtureEndpoint)throw Error('Mixed routes forbidden');
  if(live&&(executable||prefixArgs||authHome))throw Error('Live executable/auth overrides forbidden');
  if(fixtureEndpoint){const u=new URL(fixtureEndpoint);assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.pathname==='/v1'&&u.port,'Local fixture endpoint required');}
  assert(!fs.existsSync(out),'New output directory required; never resume/replay implicitly');
  fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'registration.json'),sealed);
  const records=p.schedule.turns.map((turn,i)=>({...turn,ordinal:i+1,status:'not-run',answer:null,answerSha256:null,review:null}));
  write(path.join(out,'responses-initial.json'),{simulation:!live,records});
  const started=performance.now();let attempted=0,observedTokens=0,stopped=null;
  for(const row of records) {
    const remaining=p.budget.study_ms-(performance.now()-started);
    if(attempted>=p.budget.primary_calls||remaining<=0||observedTokens>=p.budget.observed_tokens_stop){stopped={reason:'budget-admission-stop',ordinal:row.ordinal};break;}
    const prompt=assemble(r.frozen,row);
    assert(Buffer.byteLength(prompt)<=p.budget.prompt_bytes);
    const id=String(row.ordinal).padStart(3,'0'),dir=path.join(out,id);
    // Persist intent before any process/auth side effect. A crash leaves an unknown attempt, not a free retry.
    write(path.join(out,`intent-${id}.json`),{simulation:!live,registrationSha256:anchor,ordinal:row.ordinal,caseId:row.caseId,arm:row.arm,promptSha256:digest(prompt)});
    attempted++;let result;
    try {
      result=await runLoginTurn({model:r.model,effort:r.effort,cliVersion:r.cliVersion,prompt,out:dir,
        live,fixtureEndpoint,executable,prefixArgs,authHome,inheritProxy:r.inheritProxy,
        timeoutMs:Math.max(1,Math.min(p.budget.turn_ms,Math.floor(remaining),LIMITS.turn_ms))});
    } catch {
      // Error strings may contain private file locations/credentials; retain a safe failure marker.
      fs.mkdirSync(dir,{recursive:true,mode:0o700});
      result={status:'failed',answer:'',simulation:!live,error:'Executor setup or archival failure; no subsequent calls admitted'};
      write(path.join(dir,'setup-failure.json'),result);
    }
    row.status=result.status==='completed'?'executed':result.error?.includes('deadline')?'interrupted':'failed';
    row.answer=result.answer??'';row.answerSha256=digest(row.answer);
    row.model={requested:r.model,cliSelected:result.cli_selected_model??null,effort:r.effort,backendAttested:false};
    const evidence=fs.existsSync(path.join(dir,'setup-failure.json'))?'setup-failure.json':'record.json';
    row.evidence={path:`${id}/${evidence}`,sha256:digest(fs.readFileSync(path.join(dir,evidence)))};
    row.durationMs=result.timing?.completed_elapsed_ms??null;
    row.tokens=tokenCount(result.usage);if(row.tokens!==null)observedTokens+=row.tokens;
    write(path.join(out,`checkpoint-${id}.json`),{simulation:!live,attempted,observedTokens,records});
    if(row.status!=='executed'||row.tokens===null){stopped={reason:row.status!=='executed'?'execution-failure':'usage-unavailable',ordinal:row.ordinal};break;}
  }
  const summary={simulation:!live,planned:records.length,attempted,executed:records.filter(r=>r.status==='executed').length,
    failed:records.filter(r=>r.status==='failed').length,interrupted:records.filter(r=>r.status==='interrupted').length,
    notRun:records.filter(r=>r.status==='not-run').length,observedTokens,stopped,semanticReviews:'pending',accuracy:null,
    limitations:p.limitations};
  write(path.join(out,'responses.json'),{simulation:!live,registrationSha256:anchor,records});
  exportReviewPackets(r.frozen,records,anchor,out,!live);
  write(path.join(out,'execution.json'),summary);return summary;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const [command,...args]=process.argv.slice(2);
  if(command==='freeze'){assert.equal(args.length,2);write(args[1],freeze({mode:args[0]}));}
  else if(command==='validate'){assert.equal(args.length,2);validateFreeze(JSON.parse(fs.readFileSync(args[0])),args[1]);console.log('Frozen protocol verified; no model calls.');}
  else if(command==='register'){assert.equal(args.length,2);write(args[1],register(JSON.parse(fs.readFileSync(args[0]))));}
  else if(command==='run'){assert.equal(args.length,4);assert.equal(args[3],'--live');const result=await execute(JSON.parse(fs.readFileSync(args[0])),args[1],args[2],{live:true});console.log(JSON.stringify(result,null,2));if(result.stopped)process.exitCode=1;}
  else throw Error('freeze full|smoke NEW_FILE | validate FREEZE ANCHOR | register CONFIG NEW_FILE | run REGISTRATION ANCHOR NEW_DIRECTORY --live');
}
