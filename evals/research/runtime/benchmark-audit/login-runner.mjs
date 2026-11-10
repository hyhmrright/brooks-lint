/** Frozen full-context HB/BV text comparison. Importing/preparing never calls a model. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {prepare, inputBundle} from './plan.mjs';
import {runLoginTurn, LIMITS} from '../prospective/codex-login-turn.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const snapshot = name => ({path:name, content:read(name), sha256:digest(read(name))});
const write = (name, value) => fs.writeFileSync(name, JSON.stringify(value, null, 2)+'\n', {flag:'wx', mode:0o600});
const sourceNames = ['evals/research/runtime/benchmark-audit/login-runner.mjs', 'evals/research/runtime/benchmark-audit/plan.mjs', 'evals/research/runtime/prospective/codex-login-turn.mjs', 'evals/research/runtime/hard-benchmark/suite.mjs', 'evals/research/runtime/benchmark-v2/suite.mjs', 'evals/research/runtime/calibration/scoring.mjs'];
function coreFiles(dir='skills') {
  return fs.readdirSync(path.join(root,dir)).sort().flatMap(name => {
    const relative = `${dir}/${name}`, st = fs.lstatSync(path.join(root,relative));
    assert(!st.isSymbolicLink(), 'Guidance symlink forbidden');
    return st.isDirectory() ? coreFiles(relative) : name.endsWith('.md') ? [relative] : [];
  });
}
export const PROMPT = 'Review only the supplied code and context. Identify supported defects, explain their causal evidence and bounded consequences, and suggest a remedy where justified. If the supplied information cannot establish a defect or safety, identify the missing facts and explain how they affect the assessment. Respect each supplied task. Do not use tools, browse, access files, or delegate. Guidance, when supplied, is reference material; do not execute its workflow or modify files. A risk code, severity label, or Health Score is not required.';
export const DEFAULT_BUDGET = Object.freeze({primary_calls:54, harness_retries:0, turn_ms:180000, study_ms:10800000, prompt_bytes:262144, observed_tokens_stop:3000000});
const limitations = [
  'Public same-workflow synthetic cases; not independent holdouts. Calibration only; no capability uplift has yet been measured.',
  'Full-context text guidance, not native skill discovery/read verification; context length differs across arms.',
  'Fresh auth-only temporary home, empty work directory and disabled/rejected tools; no OS containment claim.',
  'CLI-selected model and effort are checked; backend/provider identity is not independently attested.',
  'Study time is an admission/deadline budget; setup, archival and cleanup add overhead. Primary calls and local deadlines are bounded; built-in provider retries and ChatGPT tokens/cost are not hard capped. Observed token stop is checked between calls and may overshoot by one call; missing usage stops the run.',
  'No automatic resume or retry. Existing output directories are refused; crashes leave attempt intents. Recovery requires a separately authorized, linked study, never silent replacement.',
];
/** Model-independent preparation. Called before a model is selected. */
export function freeze() {
  const schedule = prepare({split:'calibration', repetitions:1, seed:20261110});
  const cases = schedule.cases.map(c => {
    const suite = c.id.startsWith('HB-') ? 'hard-benchmark' : 'benchmark-v2';
    return {...c, inputs:inputBundle(c.id).files, rubric:snapshot(`evals/research/runtime/${suite}/cases/${c.id}/rubric.json`)};
  });
  const protocol = {revision:1, adapter:'hb-bv-login-text-v1', liveAuthorized:false, model:null,
    schedule, cases, prompt:PROMPT,
    core:coreFiles().map(snapshot),
    runtime:['SKILL.md','runtime-guide.md'].map(n=>snapshot(`evals/research/runtime/prototype/${n}`)),
    scoring:snapshot('docs/research/runtime-scoring-protocol.md'),
    reviewPolicy:snapshot('evals/research/runtime/benchmark-audit/login-review.md'),
    sources:Object.fromEntries(sourceNames.map(n=>[n,digest(read(n))])),
    budget:DEFAULT_BUDGET, limitations};
  const sealed={protocol, sha256:digest(protocol)};
  for(const turn of schedule.turns) assert(Buffer.byteLength(assemble(sealed, turn))<=protocol.budget.prompt_bytes, 'Prompt exceeds byte cap');
  return sealed;
}
export function validateFreeze(sealed, anchor) {
  assert.equal(sealed.sha256, anchor, 'Freeze anchor mismatch');
  assert.equal(digest(sealed.protocol), anchor, 'Frozen protocol drift');
  assert.deepEqual(sealed, freeze(), 'Repository inputs/guidance/scoring/runner changed; create a versioned freeze');
  return sealed.protocol;
}
export function assemble(sealed, turn) {
  const p=sealed.protocol, c=p.cases.find(c=>c.id===turn.caseId);
  assert(c && ['A','B','C'].includes(turn.arm), 'Unknown turn');
  const guidance=turn.arm==='A'?[]:[...p.core,...(turn.arm==='C'?p.runtime:[])].map(({path,content})=>({path,content}));
  // Never serialize the plan, rubric, expected assessment, case ID or evaluator hashes here.
  return p.prompt+'\n\nSupplied files and optional guidance (JSON strings preserve contents):\n'+JSON.stringify({inputs:c.inputs, guidance});
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
    row.tokens=tokenCount(result.usage);if(row.tokens!==null)observedTokens+=row.tokens;
    write(path.join(out,`checkpoint-${id}.json`),{simulation:!live,attempted,observedTokens,records});
    if(row.status!=='executed'||row.tokens===null){stopped={reason:row.status!=='executed'?'execution-failure':'usage-unavailable',ordinal:row.ordinal};break;}
  }
  const summary={simulation:!live,planned:records.length,attempted,executed:records.filter(r=>r.status==='executed').length,
    failed:records.filter(r=>r.status==='failed').length,interrupted:records.filter(r=>r.status==='interrupted').length,
    notRun:records.filter(r=>r.status==='not-run').length,observedTokens,stopped,semanticReviews:'pending',accuracy:null,
    limitations:p.limitations};
  write(path.join(out,'responses.json'),{simulation:!live,registrationSha256:anchor,records});
  // Reviewer-only packets; the responder never receives this file. Arm mapping remains separately stored in responses.json.
  write(path.join(out,'review-packets.json'),{simulation:!live,records:records.map(row=>({responseId:digest(`${anchor}/${row.ordinal}`).slice(0,16),ordinal:row.ordinal,caseId:row.caseId,status:row.status,answer:row.answer,answerSha256:row.answerSha256,rubric:p.cases.find(c=>c.id===row.caseId).rubric,review:null})),blinding:'Arm omitted, but same-workflow reviewers can infer it from text/order; not independent blindness.'});
  write(path.join(out,'execution.json'),summary);return summary;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const [command,...args]=process.argv.slice(2);
  if(command==='freeze'){assert.equal(args.length,1);write(args[0],freeze());}
  else if(command==='register'){assert.equal(args.length,2);write(args[1],register(JSON.parse(fs.readFileSync(args[0]))));}
  else if(command==='validate'){assert.equal(args.length,2);validateFreeze(JSON.parse(fs.readFileSync(args[0])),args[1]);console.log('Frozen protocol verified; no live calls.');}
  else if(command==='run'){assert.equal(args.length,4);assert.equal(args[3],'--live');const result=await execute(JSON.parse(fs.readFileSync(args[0])),args[1],args[2],{live:true});console.log(JSON.stringify(result,null,2));if(result.stopped)process.exitCode=1;}
  else throw Error('freeze NEW_FILE | validate FREEZE ANCHOR | register CONFIG NEW_FILE | run REGISTRATION ANCHOR NEW_DIRECTORY --live');
}
