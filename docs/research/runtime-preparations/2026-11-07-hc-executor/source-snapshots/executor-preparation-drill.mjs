/** Deterministic local archive generator/validator. Never invokes models or subprocesses. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {frozenDesign,assembleTurn,registrationProblems,replaySchedule,eventContract} from './executor-preparation.mjs';
import {digest,summarize,reviewPackets} from './study.mjs';
const target=new URL('../../../../docs/research/runtime-preparations/2026-11-07-hc-executor/',import.meta.url);
const json=x=>JSON.stringify(x,null,2)+'\n';
export function buildArchive(){
 const d=frozenDesign();
 const identity={type:'identity',elapsed_ms:0,model:'fixture-model',reasoning:'medium'};
 const raw=(i,events=[identity,{type:'answer-delta',elapsed_ms:1,text:'SIMULATED pipeline marker; no semantic assessment or model observation.'},{type:'turn-completed',elapsed_ms:2},{type:'process-exit',elapsed_ms:3,code:0}])=>({simulation:true,turn:d.order.turns[i],intended:{model:'fixture-model',reasoning:'medium'},source:`simulated:executor-offline/${i+1}`,events});
 const registration=JSON.parse(readFileSync(new URL('execution-registration-template.json',new URL('../2026-11-06-hc-human-review/',target))));
 const full=replaySchedule(d,d.order.turns.map((_,i)=>raw(i)));
 const boundary=replaySchedule(d,[
  raw(0,[identity,{type:'turn-completed',elapsed_ms:2},{type:'process-exit',elapsed_ms:3,code:0}]),
  raw(1,[identity,{type:'answer-delta',elapsed_ms:1,text:'SIMULATED partial'},{type:'process-exit',elapsed_ms:3,code:1}]),
  raw(2,[identity,{type:'answer-delta',elapsed_ms:1,text:'SIMULATED timeout partial'},{type:'deadline',elapsed_ms:900000},{type:'process-exit',elapsed_ms:900002,code:143}]),
  raw(3,[{...identity,model:'fixture-other-model'},{type:'turn-completed',elapsed_ms:2},{type:'process-exit',elapsed_ms:3,code:0}])
 ]);
 const sources=['executor-preparation.mjs','executor-preparation.test.mjs','executor-preparation-drill.mjs'];
 const files={
  'source.json':json({source_commit:'62a278f35fb6a332dc59c2542c2e2f3339d3f978',frozen_plan_sha256:d.anchor.study_sha256,frozen_inventory_sha256:d.anchor.inventory_file_sha256,live_execution:false,simulation:true,independent:false,private_custody:false,human_review:'pending',book_mapping:'unverified',executor_source_digests:Object.fromEntries(sources.map(p=>[p,digest(readFileSync(new URL(p,import.meta.url),'utf8'))])),source_digest_encoding:'SHA256(JSON.stringify(source UTF8 string)); exact source snapshots included',registration_problems:registrationProblems(d,registration)}),
  'workspace-manifests.json':json({simulation:true,plan_sha256:d.anchor.study_sha256,turns:d.order.turns.map(t=>{const p=assembleTurn(d,t);return {sequence:t.sequence,turn:p.turn,files:p.files.map(({path,sha256})=>({path,sha256})),messages:p.messages,read_paths:p.read_paths,guidance_paths:p.guidance_paths};})}),
  'event-contract.json':json(eventContract),
  'simulated-full-replay.json':json(full),
  'simulated-boundary-replay.json':json(boundary),
  'simulated-summary.json':json({simulation:true,full:summarize(d.plan,full.responses,d.anchor.study_sha256),boundary:summarize(d.plan,boundary.responses,d.anchor.study_sha256),full_review_packet_count:reviewPackets(d.plan,full.responses,d.anchor.study_sha256).packets.length,limitation:'All labels pending; zero eligible triplets. Pipeline behavior only, no model quality or human validation.'})
 };
 for(const p of sources)files[`source-snapshots/${p}`]=readFileSync(new URL(p,import.meta.url),'utf8');
 return files;
}
const direct=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){const command=process.argv[2]??'validate';assert(['generate','validate'].includes(command));const files=buildArchive();
 if(command==='generate'){assert(!existsSync(new URL('source.json',target)),'Archive exists; review before replacing any generated record');mkdirSync(target,{recursive:true});for(const[p,bytes]of Object.entries(files)){mkdirSync(new URL(path.dirname(p)+'/',target),{recursive:true});writeFileSync(new URL(p,target),bytes,{flag:'wx'});}}
 else for(const[p,bytes]of Object.entries(files))assert.equal(readFileSync(new URL(p,target),'utf8'),bytes,`Archive drift ${p}`);
 console.log(`PASS: ${Object.keys(files).length} offline executor archive files; 81 synthetic turns, four boundary attempts, no live execution.`);
}
