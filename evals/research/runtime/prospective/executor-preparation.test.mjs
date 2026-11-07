import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,readdirSync,realpathSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {frozenDesign,assembleTurn,exportWorkspace,registrationProblems,replayTurn,replaySchedule} from './executor-preparation.mjs';
import {summarize,reviewPackets} from './study.mjs';
const design=frozenDesign();
const identity={type:'identity',elapsed_ms:0,model:'fixture-model',reasoning:'medium'};
const raw=(index=0,events=[identity,{type:'answer-delta',elapsed_ms:10,text:'SYNTHETIC answer, not a model response.'},{type:'turn-completed',elapsed_ms:20},{type:'process-exit',elapsed_ms:21,code:0}])=>({simulation:true,turn:design.order.turns[index],intended:{model:'fixture-model',reasoning:'medium'},source:`simulated:offline-contract/${index}`,events});

test('all81 exact input/guidance packets export into separate scratch workspaces; no scorer or rubric',()=>{
 const parent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-export-')));
 try{for(const t of design.order.turns){const p=assembleTurn(design,t);const dir=path.join(parent,String(t.sequence));const inventory=exportWorkspace(design,p,dir);assert.equal(inventory.length,p.files.length);for(const f of p.files)assert.equal(readFileSync(path.join(dir,f.path),'utf8'),f.content);assert(!p.files.some(f=>/rubric|\.test\.|cases\.json/.test(f.path)));assert.deepEqual(p.messages,[{role:'user',content:design.prompt}]);}
 assert.equal(readdirSync(parent).length,81);
 }finally{rmSync(parent,{recursive:true,force:true});}
});
test('existing/symlinked/altered/traversal staging is refused',()=>{
 const parent=realpathSync(mkdtempSync(path.join(tmpdir(),'hc-path-'))),packet=assembleTurn(design,design.order.turns[0]);
 try{assert.throws(()=>exportWorkspace(design,packet,parent));const link=path.join(parent,'link');symlinkSync(parent,link);assert.throws(()=>exportWorkspace(design,packet,path.join(link,'x')));const bad=structuredClone(packet);bad.files[0].path='../escape';assert.throws(()=>exportWorkspace(design,bad,path.join(parent,'bad')));const altered=structuredClone(packet);altered.messages[0].content+='unexpected';assert.throws(()=>exportWorkspace(design,altered,path.join(parent,'other')));}finally{rmSync(parent,{recursive:true,force:true});}
});
test('real registration remains unbound; pending review, sentinels, mismatched anchors and absent authorization block',()=>{
 const template=JSON.parse(readFileSync(new URL('../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/execution-registration-template.json',import.meta.url)));
 const errors=registrationProblems(design,template);assert(errors.includes('registration unbound'));assert(errors.includes('execution_authorization_reference missing or unresolved'));assert(errors.includes('human_feedback_disposition missing or unresolved'));
 for(const bad of ['UNBOUND-NO-EXECUTION','pending','simulation approval','TODO']){const r={...template,model:bad,human_feedback_disposition:bad};assert(registrationProblems(design,r).includes('model missing or unresolved'));assert(registrationProblems(design,r).includes('human_feedback_disposition missing or unresolved'));}
 assert.equal(design.plan.study.intended_model,'UNBOUND-NO-EXECUTION');
 assert(registrationProblems(design,[]).includes('registration absent'));assert(registrationProblems(design,{...template,registered_before_first_turn_at:'2026-99-99T99:00:00Z'}).includes('registration timestamp format'));assert(registrationProblems(design,{...template,registered_before_first_turn_at:{}}).includes('registration timestamp format'));
});
test('synthetic81-turn replay roundtrips existing importer, keeps all reviews pending and no efficacy claim',()=>{
 const replay=replaySchedule(design,design.order.turns.map((_,i)=>raw(i)));assert.equal(replay.attempted_turns,81);assert.equal(replay.responses.records.filter(r=>r.execution_status==='executed').length,81);
 assert.equal(reviewPackets(design.plan,replay.responses,design.anchor.study_sha256).packets.length,81);
 assert.equal(summarize(design.plan,replay.responses,design.anchor.study_sha256).complete_triplets,0);
 assert(replay.responses.records.every(r=>r.review===null&&r.execution_evidence.source.startsWith('simulated:')));
});
test('empty successful answer is executed; plausible text without completion is failed; nonzero exit keeps partial',()=>{
 assert.equal(replayTurn(design,raw(0,[identity,{type:'turn-completed',elapsed_ms:1},{type:'process-exit',elapsed_ms:2,code:0}])).record.execution_status,'executed');
 const r=replayTurn(design,raw(0,[identity,{type:'answer-delta',elapsed_ms:1,text:'partial'},{type:'process-exit',elapsed_ms:2,code:0}]));assert.equal(r.record.execution_status,'failed');assert.equal(r.record.answer,'partial');
 assert.equal(replayTurn(design,raw(0,[identity,{type:'turn-completed',elapsed_ms:1},{type:'process-exit',elapsed_ms:2,code:1}])).record.execution_status,'failed');
});
test('900second deadline preserves raw/partial and leaves unstarted primary schedule not-run',()=>{
 const r=replaySchedule(design,[raw(0,[identity,{type:'answer-delta',elapsed_ms:5,text:'partial'},{type:'deadline',elapsed_ms:900000},{type:'process-exit',elapsed_ms:900002,code:143}])]);assert.equal(r.responses.records[0].execution_status,'interrupted');assert.equal(r.responses.records[0].answer,'partial');assert.equal(r.responses.records.filter(r=>r.execution_status==='not-run').length,80);assert.equal(r.raw_replays[0].raw.events.length,4);
});
test('observed identity mismatch/missing blocks subsequent turn; never substitute intended identity',()=>{
 const mismatch=raw(0,[{...identity,model:'other-model'},{type:'turn-completed',elapsed_ms:1},{type:'process-exit',elapsed_ms:2,code:0}]);const r=replaySchedule(design,[mismatch]);assert.equal(r.stopped_for_identity,true);assert.equal(r.responses.records[0].model_report.model,'other-model');assert.equal(r.responses.records[0].execution_status,'failed');assert.throws(()=>replaySchedule(design,[mismatch,raw(1)]));
 const missing=replayTurn(design,raw(0,[{type:'process-exit',elapsed_ms:1,code:1}]));assert.equal(missing.record.model_report.model,'UNOBSERVED');assert.equal(missing.stop_subsequent,true);
});
test('no retry/order bypass or non-simulation events; malformed/late completion refused',()=>{
 assert.throws(()=>replaySchedule(design,[raw(),raw()]));assert.throws(()=>replaySchedule(design,[raw(1)]));assert.throws(()=>replayTurn(design,{...raw(),simulation:false}));
 for(const events of [[{...identity,elapsed_ms:-1}],[{type:'turn-completed',elapsed_ms:0},identity],[{type:'process-exit',elapsed_ms:0,code:1},identity],[identity,{type:'turn-completed',elapsed_ms:900000}],[identity,{type:'answer-delta',elapsed_ms:-1,text:'x'}],[identity,{type:'unknown',elapsed_ms:1}],[identity,{type:'process-exit',elapsed_ms:1,code:0},{type:'turn-completed',elapsed_ms:2}]])assert.throws(()=>replayTurn(design,raw(0,events)));
});

test('empty answer event cannot precede identity, and elapsed boundary requires explicit exact deadline',()=>{
 assert.throws(()=>replayTurn(design,raw(0,[{type:'answer-delta',elapsed_ms:0,text:''},{...identity,elapsed_ms:1},{type:'turn-completed',elapsed_ms:2},{type:'process-exit',elapsed_ms:3,code:0}])),/Identity must precede/);
 for(const events of [
  [identity,{type:'answer-delta',elapsed_ms:900001,text:'late'},{type:'process-exit',elapsed_ms:900002,code:1}],
  [identity,{type:'process-exit',elapsed_ms:900000,code:1}],
  [identity,{type:'deadline',elapsed_ms:900001}],
  [identity,{type:'deadline',elapsed_ms:900000},{type:'answer-delta',elapsed_ms:900000,text:''}],
  [identity,{type:'deadline',elapsed_ms:900000},{type:'turn-completed',elapsed_ms:900001}]
 ])assert.throws(()=>replayTurn(design,raw(0,events)),/deadline/);
 const valid=replayTurn(design,raw(0,[identity,{type:'answer-delta',elapsed_ms:1,text:''},{type:'deadline',elapsed_ms:900000},{type:'process-exit',elapsed_ms:900002,code:143}]));assert.equal(valid.record.execution_status,'interrupted');assert.equal(valid.record.answer,'');
});

test('durable offline archive byte-compares to deterministic rebuild and source snapshots',async()=>{
 const {buildArchive}=await import('./executor-preparation-drill.mjs');
 const root=new URL('../../../../docs/research/runtime-preparations/2026-11-07-hc-executor/',import.meta.url);
 for(const[p,bytes]of Object.entries(buildArchive()))assert.equal(readFileSync(new URL(p,root),'utf8'),bytes,p);
});
