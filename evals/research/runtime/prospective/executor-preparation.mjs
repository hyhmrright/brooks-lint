/** OFFLINE ONLY: allowlisted staging and synthetic event replay. No process/model runner. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, lstatSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validatePlan, turnInputs, responseTemplate, validateResponses, digest, repo } from './study.mjs';
const hash = x => createHash('sha256').update(x).digest('hex');
const meaningful = x => typeof x === 'string' && x.trim() && !/UNBOUND|UNOBSERVED|pending|placeholder|TODO|simulation/i.test(x);
const exact = (o, keys) => assert.deepEqual(Object.keys(o).sort(), keys.sort(), 'Unexpected fields');
export const frozenRoot = new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/', import.meta.url);
export function frozenDesign() {
  const read = n => JSON.parse(readFileSync(new URL(n, frozenRoot)));
  const anchor = read('freeze-anchor.json'), plan = read('plan.json'), order = read('execution-order.json');
  validatePlan(plan, anchor.study_sha256);
  const inventoryBytes = readFileSync(new URL('artifacts.sha256.json', frozenRoot));
  assert.equal(hash(inventoryBytes), anchor.inventory_file_sha256);
  for (const [p, h] of Object.entries(JSON.parse(inventoryBytes))) {
    assert(!path.isAbsolute(p) && !p.split('/').includes('..'));
    assert.equal(hash(readFileSync(new URL(p, frozenRoot))), h, `Frozen file drift ${p}`);
  }
  assert.equal(order.plan_sha256, anchor.study_sha256);
  assert.equal(order.turns.length, plan.study.schedule.length * 3);
  return {plan, anchor, order, prompt: readFileSync(new URL('prompt.txt', frozenRoot), 'utf8')};
}
export const turnKey = t => `${t.case_id}/${t.repetition}/${t.arm}`;
/** Exact bytes, no rubric/order/registration in model-visible packet. Read-list is constant across arms. */
export function assembleTurn(design, scheduled) {
  const {plan,anchor,prompt}=design;
  assert(design.order.turns.some(t=>JSON.stringify(t)===JSON.stringify(scheduled)), 'Unknown scheduled turn');
  const turn = {case_id:scheduled.case_id,repetition:scheduled.repetition,arm:scheduled.arm};
  const material=turnInputs(plan,turn,anchor.study_sha256);
  const files=[...material.inputs,...material.guidance,{path:'prompt.txt',content:prompt,sha256:hash(prompt)}];
  assert.equal(new Set(files.map(f=>f.path)).size,files.length);
  for (const f of files) {
    assert(/^[a-zA-Z0-9_./-]+$/.test(f.path) && !path.isAbsolute(f.path) && !f.path.split('/').some(x=>x==='..'||x==='.'||!x));
    assert(!/(?:rubric|\.test\.|cases\.json|AGENTS\.md)/.test(f.path));
    assert.equal(hash(f.content),f.sha256);
  }
  return {turn,files,messages:[{role:'user',content:prompt}],read_paths:material.inputs.map(f=>f.path),guidance_paths:material.guidance.map(f=>f.path)};
}
/** Export into a new directory only. Caller must supply a trusted non-repository scratch parent. */
export function exportWorkspace(design, packet, directory) {
  const scheduled=design.order.turns.find(t=>turnKey(t)===turnKey(packet.turn));
  assert(scheduled);assert.deepEqual(packet,assembleTurn(design,scheduled),'Altered workspace packet');
  const parent=path.dirname(path.resolve(directory));
  assert(existsSync(parent) && lstatSync(parent).isDirectory() && !lstatSync(parent).isSymbolicLink(),'Trusted existing directory parent required');
  assert.equal(realpathSync(parent),parent,'Symlink ancestors forbidden');
  assert(!existsSync(directory),'Workspace already exists');
  assert(parent!==repo&&!parent.startsWith(repo+path.sep),'Repository workspace forbidden');
  for(let p=parent;;p=path.dirname(p)){assert(!existsSync(path.join(p,'AGENTS.md')),'Parent AGENTS exposure forbidden');if(p===path.dirname(p))break;}
  for(const f of packet.files){assert(!path.isAbsolute(f.path)&&!f.path.split('/').some(x=>x==='..'||x==='.'||!x));assert.equal(hash(f.content),f.sha256);}
  mkdirSync(directory,{recursive:false,mode:0o700});
  for(const f of packet.files){const dest=path.join(directory,f.path);mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});writeFileSync(dest,f.content,{flag:'wx',mode:0o600});}
  return packet.files.map(f=>({path:f.path,sha256:hash(readFileSync(path.join(directory,f.path)))}));
}
/** Checks declared evidence only; never authenticates approvals or isolation. No caller can execute here. */
export function registrationProblems(design, r) {
  const errors=[];
  if(!r || typeof r!=='object' || Array.isArray(r)) return ['registration absent'];
  if(r.status!=='registered-before-execution') errors.push('registration unbound');
  if(r.design_plan_sha256!==design.anchor.study_sha256) errors.push('plan anchor mismatch');
  if(r.design_inventory_sha256!==design.anchor.inventory_file_sha256) errors.push('inventory anchor mismatch');
  for(const k of ['model','reasoning','provider','codex_cli_version','executor_commit','executor_sha256','isolation_review','prompt_assembly_verification','raw_event_schema','human_feedback_disposition','execution_authorization_reference','registered_before_first_turn_at']) if(!meaningful(r[k])) errors.push(`${k} missing or unresolved`);
  if(r.executor_commit&&!/^[a-f0-9]{40}$/.test(r.executor_commit)) errors.push('executor commit format');
  if(r.executor_sha256&&!/^[a-f0-9]{64}$/.test(r.executor_sha256)) errors.push('executor digest format');
  if(r.registered_before_first_turn_at){const stamp=r.registered_before_first_turn_at;const time=typeof stamp==='string'?Date.parse(stamp):NaN;if(!Number.isFinite(time)||new Date(time).toISOString()!==stamp)errors.push('registration timestamp format');}
  return errors;
}
export const eventContract = {
  revision:1, status:'proposed-offline-event-contract-not-verified-Codex-CLI-schema',
  envelope:['simulation','turn','intended','source','events'],
  event_types:['identity','answer-delta','turn-completed','process-exit','deadline'],
  elapsed_unit:'milliseconds-from-launch',deadline_ms:900000,primary_attempts:1,primary_retries:0,
  completion:'one turn-completed plus process-exit code 0 before deadline; answer may be empty',
  limitation:'A future reviewed CLI adapter must map real raw events and prove identity/retry/isolation behavior; this schema is not a claim about Codex event names.'
};
/** Replays SIMULATED envelopes only. Raw evidence retained verbatim; not an execution claim. */
export function replayTurn(design, raw) {
  exact(raw,['simulation','turn','intended','source','events']);assert.equal(raw.simulation,true,'Only explicit synthetic replay accepted');
  exact(raw.intended,['model','reasoning']);assert(meaningful(raw.intended.model)&&meaningful(raw.intended.reasoning));
  assert(typeof raw.source==='string'&&raw.source.startsWith('simulated:'));
  assert(Array.isArray(raw.events)&&raw.events.length>0);
  const packet=assembleTurn(design,raw.turn);
  let elapsed=-1, identity=null, answer='', answerSeen=false, completed=false, exit=null, deadline=false;
  for(const e of raw.events){
    assert(Number.isSafeInteger(e.elapsed_ms)&&e.elapsed_ms>=0&&e.elapsed_ms>=elapsed,'Non-monotonic/negative elapsed time');elapsed=e.elapsed_ms;
    assert(eventContract.event_types.includes(e.type),'Unknown event');
    if(e.elapsed_ms>=900000)assert((e.type==='deadline'&&e.elapsed_ms===900000&&!deadline)||(deadline&&e.type==='process-exit'),'Missing deadline boundary or event after deadline');
    if(e.type==='identity'){exact(e,['type','elapsed_ms','model','reasoning']);assert.equal(identity,null,'Duplicate identity');assert(!answerSeen&&!completed&&exit===null&&!deadline,'Late identity');assert(meaningful(e.model)&&meaningful(e.reasoning));identity={model:e.model,reasoning:e.reasoning};}
    if(e.type==='answer-delta'){exact(e,['type','elapsed_ms','text']);assert.equal(typeof e.text,'string');assert(identity,'Identity must precede every answer event');answerSeen=true;assert(!completed&&exit===null&&!deadline,'Answer after termination');answer+=e.text;}
    if(e.type==='turn-completed'){exact(e,['type','elapsed_ms']);assert(!completed&&exit===null&&!deadline,'Duplicate/late completion');assert(e.elapsed_ms<900000,'Completion after deadline');completed=true;}
    if(e.type==='process-exit'){exact(e,['type','elapsed_ms','code']);assert.equal(exit,null,'Duplicate exit');assert(Number.isInteger(e.code));exit=e.code;}
    if(e.type==='deadline'){exact(e,['type','elapsed_ms']);assert.equal(e.elapsed_ms,900000);assert(!deadline&&exit===null,'Deadline after process exit');deadline=true;}
  }
  const identityMatched=identity!==null&&identity.model===raw.intended.model&&identity.reasoning===raw.intended.reasoning;
  const execution_status=deadline?'interrupted':completed&&exit===0&&elapsed<900000&&identityMatched?'executed':'failed';
  const status_basis=deadline?'simulated wall deadline; partial preserved':!identityMatched?'simulated identity missing/mismatch; stop subsequent turns':execution_status==='executed'?'simulated completion event plus exit 0 before deadline':'simulated process/transport/incomplete failure';
  const record={...packet.turn,execution_status,answer,answer_sha256:hash(answer),model_report:{model:identity?.model??'UNOBSERVED',reasoning:identity?.reasoning??'UNOBSERVED',source:`${raw.source}; observed identity event, absent fields explicitly UNOBSERVED`},execution_evidence:{source:raw.source,artifact_sha256:digest(raw),status_basis},review:null};
  return {record,raw,elapsed_ms:elapsed,intended:raw.intended,observed:identity,stop_subsequent:!identityMatched,primary_attempt:1};
}
export function replaySchedule(design,envelopes){
  const responses=responseTemplate(design.plan,design.anchor.study_sha256),records=[],seen=new Set();let stopped=false;
  for(const raw of envelopes){assert(!stopped,'Identity stop prohibits subsequent replay');const id=turnKey(raw.turn);assert(!seen.has(id),'Primary retry forbidden');seen.add(id);
    const expected=design.order.turns[records.length];assert(expected,'Schedule exhausted');assert.equal(id,turnKey(expected),'Out-of-order primary replay');
    const result=replayTurn(design,raw);records.push(result);const idx=responses.records.findIndex(r=>turnKey(r)===id);responses.records[idx]=result.record;stopped=result.stop_subsequent;
  }
  validateResponses(design.plan,responses,design.anchor.study_sha256);
  return {simulation:true,responses,raw_replays:records,planned_turns:design.order.turns.length,attempted_turns:records.length,stopped_for_identity:stopped};
}
