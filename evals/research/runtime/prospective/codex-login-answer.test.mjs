import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {completedAnswer,answerText,runLoginTurn} from './codex-login-turn.mjs';
const p={threadId:'thread',turnId:'turn'};
const delta=(id,text)=>({method:'item/agentMessage/delta',params:{...p,itemId:id,delta:text}});
const complete=(id,text,phase)=>({method:'item/completed',params:{...p,item:{id,type:'agentMessage',text,...(phase?{phase}:{})}}});
test('completed view excludes orphan reconnect draft while retaining independent partial diagnostics',()=>{
 const events=[delta('old','{"report":"unfinished'),delta('new','{"report":'),complete('new','{"report":"complete","replacements":[]}','final_answer')];
 const s=completedAnswer(events,'thread','turn');assert.deepEqual(JSON.parse(s.text),{report:'complete',replacements:[]});assert.equal(s.completedItems.length,1);assert.equal(s.completedItems[0].id,'new');assert.equal(s.partialItems[0].id,'old');assert.equal(s.partialItems[0].text,'{"report":"unfinished');assert.throws(()=>JSON.parse(answerText(events,'thread','turn')));
});
test('completed same-item text replaces deltas and identical retransmissions dedupe',()=>{
 const e=complete('a','whole','final_answer'),s=completedAnswer([delta('a','wh'),delta('a','ole'),e,e],'thread','turn');assert.equal(s.text,'whole');assert.equal(s.completedItems.length,1);assert.equal(s.partialItems.length,0);assert.throws(()=>completedAnswer([e,complete('a','different','final_answer')],'thread','turn'),/Conflicting/);
});
test('all legitimately completed phases and absent phase remain in completion order',()=>{
 const events=[delta('final','f'),complete('comment','commentary','commentary'),complete('final','final','final_answer'),complete('legacy','legacy'),complete('other','future','future_phase')];
 const s=completedAnswer(events,'thread','turn');assert.equal(s.text,'commentary\nfinal\nlegacy\nfuture');assert.deepEqual(s.completedItems.map(i=>i.phase),['commentary','final_answer',null,'future_phase']);
});
test('selection is thread and turn scoped, malformed completed messages fail closed',()=>{
 const e=complete('right','right');assert.equal(completedAnswer([{...e,params:{...e.params,threadId:'foreign'}},{...e,params:{...e.params,turnId:'foreign'}},e],'thread','turn').text,'right');assert.equal(completedAnswer([e],undefined,undefined).text,'');for(const item of [{id:'a',type:'agentMessage'},{id:'',type:'agentMessage',text:'x'},{id:'a',type:'agentMessage',text:'x',phase:[]}])assert.throws(()=>completedAnswer([{method:'item/completed',params:{...p,item}}],'thread','turn'),/Malformed/);
});
for(const mode of ['same','reconnect','multiple','partial-failed','no-completed','empty-completed','missing-text','wrong-scope','conflict'])test(`isolated fake CLI completed-answer selection: ${mode}`,{skip:process.platform!=='darwin'},async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'login-answer-'));
 try{
  const out=path.join(tmp,'out'),record=await runLoginTurn({model:'gpt-fixture',effort:'low',cliVersion:'0.167.0',prompt:'synthetic answer collector check',out,fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[fileURLToPath(new URL('./codex-login-answer-fixture.cjs',import.meta.url)),mode],timeoutMs:2000});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'record.json'))),record);assert.equal(fs.readFileSync(path.join(out,'answer.txt'),'utf8'),record.answer);assert.equal(record.version,2);assert(record.cleanup.closed&&record.cleanup.group_absent&&record.cleanup.private_home_removed);
  const success=['same','reconnect','multiple'].includes(mode);assert.equal(record.status,success?'completed':'failed');
  if(success){const s=completedAnswer(record.events,record.thread_id,record.turn_id);assert.equal(record.answer,s.text);assert.equal(record.answer_selection.policy,s.policy);assert.deepEqual(record.answer_selection.completedItems,s.completedItems);assert.deepEqual(record.answer_selection.excludedPartialItems,s.partialItems);}
  if(mode==='same')assert.equal(record.answer,'Completed final');
  if(mode==='reconnect'){assert.equal(JSON.parse(record.answer).report,'synthetic complete');assert.equal(record.partial_answer,'{"report":"unfinished');assert(record.diagnostic_answer.includes('unfinished'));}
  if(mode==='multiple'){assert.equal(record.answer,'Completed commentary\nCompleted final');assert.deepEqual(record.answer_selection.completedItems.map(i=>i.phase),['commentary','final_answer']);}
  if(mode==='partial-failed'||mode==='no-completed'){assert.equal(record.answer,'');assert.equal(record.partial_answer,'partial diagnostic');assert.equal(record.diagnostic_answer,'partial diagnostic');}
  if(mode==='no-completed'||mode==='empty-completed')assert.match(record.error,/No nonempty completed/);
  if(mode==='missing-text')assert.match(record.error,/Malformed/);
  if(mode==='wrong-scope')assert.match(record.error,/Mismatched/);
  if(mode==='conflict')assert.match(record.error,/Conflicting/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
