/** Offline-only provenance and raw-record validation of the preserved synthetic drill. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
export const commit='37fd5a282df17736541c7c36d109f4ab070bbc8a';
export const anchor='bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78';
export const base='docs/research/runtime-preparations/2026-11-10-benchmark-login';
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const safe=file=>{assert(typeof file==='string'&&!path.isAbsolute(file)&&file.split('/').every(s=>s&&s!=='.'&&s!=='..'));return file;};
const pinned=file=>execFileSync('git',['show',`${commit}:${safe(file)}`],{cwd:root,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
export function validateHistoricalReadiness({artifactRoot=root}={}){
 const read=name=>{const file=`${base}/${safe(name)}`,bytes=fs.readFileSync(path.join(artifactRoot,file));assert(bytes.equals(pinned(file)),`Historical readiness bytes changed: ${name}`);return bytes;};
 const frozen=JSON.parse(read('frozen-protocol.json')),p=frozen.protocol;
 assert.equal(frozen.sha256,anchor);assert.equal(digest(p),anchor);assert.equal(p.liveAuthorized,false);assert.equal(p.model,null);
 for(const [file,sha]of Object.entries(p.sources))assert.equal(digest(pinned(file)),sha,`Pinned source changed: ${file}`);
 for(const s of [...p.core,...p.runtime,p.scoring,p.reviewPolicy,...p.cases.map(c=>c.rubric)]){assert.equal(s.content,pinned(s.path).toString('utf8'));assert.equal(digest(s.content),s.sha256);}
 const readiness=JSON.parse(read('readiness.json')),inventory=JSON.parse(read('offline-raw-inventory.json')),bytes=read('offline-raw.json.gz'),execution=JSON.parse(read('execution.json'));
 assert.equal(readiness.protocolSha256,anchor);assert.equal(readiness.fixtureSourceSha256,digest(pinned('evals/research/runtime/benchmark-audit/login-fixture.cjs')));
 assert.equal(digest(bytes),inventory.archiveSha256);assert.equal(digest(bytes),readiness.archiveSha256);
 const archive=JSON.parse(gunzipSync(bytes));assert.equal(archive.simulation,true);
 assert.deepEqual(Object.keys(archive.files).sort(),inventory.files.map(f=>f.path).sort());
 for(const f of inventory.files){safe(f.path);assert.equal(typeof archive.files[f.path],'string');assert.equal(digest(archive.files[f.path]),f.sha256);assert.equal(Buffer.byteLength(archive.files[f.path]),f.bytes);}
 const json=file=>JSON.parse(archive.files[safe(file)]),sealed=json('registration.json'),r=sealed.registration,responses=json('responses.json');
 assert.equal(digest(r),sealed.sha256);assert.deepEqual(r.frozen,frozen);assert.equal(r.anchor,anchor);assert.equal(r.model,'gpt-fixture');assert.equal(r.effort,'low');assert.equal(r.cliVersion,'0.167.0');
 assert.equal(responses.simulation,true);assert.equal(responses.registrationSha256,sealed.sha256);assert.equal(responses.records.length,54);assert.equal(p.schedule.turns.length,54);
 let total=0;
 for(const [i,turn]of p.schedule.turns.entries()){
  const row=responses.records[i],id=String(i+1).padStart(3,'0'),rawText=archive.files[`${id}/record.json`],raw=JSON.parse(rawText),c=p.cases.find(c=>c.id===turn.caseId);
  assert.deepEqual({caseId:row.caseId,repetition:row.repetition,arm:row.arm},turn);assert.equal(row.ordinal,i+1);assert.equal(row.status,'executed');
  const guidance=turn.arm==='A'?[]:[...p.core,...(turn.arm==='C'?p.runtime:[])].map(({path,content})=>({path,content}));
  const prompt=p.prompt+'\n\nSupplied files and optional guidance (JSON strings preserve contents):\n'+JSON.stringify({inputs:c.inputs,guidance});
  assert.deepEqual(json(`intent-${id}.json`),{simulation:true,registrationSha256:sealed.sha256,ordinal:i+1,caseId:turn.caseId,arm:turn.arm,promptSha256:digest(prompt)});
  assert.deepEqual(row.evidence,{path:`${id}/record.json`,sha256:digest(rawText)});
  assert.equal(raw.prompt,prompt);assert.equal(raw.simulation,true);assert.equal(raw.status,'completed');assert.equal(raw.source_sha256,p.sources['evals/research/runtime/prospective/codex-login-turn.mjs']);
  assert.equal(raw.requested_model,r.model);assert.equal(raw.cli_selected_model,r.model);assert.equal(raw.requested_effort,r.effort);assert.equal(raw.cli_selected_effort,r.effort);assert.equal(raw.cli_version,r.cliVersion);assert.equal(raw.auth_type,'synthetic-no-auth');assert(raw.cleanup.closed&&raw.cleanup.group_absent&&raw.cleanup.private_home_removed);
  assert.equal(row.answer,raw.answer);assert.equal(row.answerSha256,digest(raw.answer));assert.equal(archive.files[`${id}/answer.txt`],raw.answer);assert.equal(row.tokens,raw.usage.total.totalTokens);assert(Number.isSafeInteger(row.tokens)&&row.tokens>=0);total+=row.tokens;
 }
 assert.deepEqual(json('execution.json'),execution);assert.deepEqual(execution,readiness.summary);assert.equal(execution.executed,54);assert.equal(execution.accuracy,null);assert.equal(execution.observedTokens,total);
 return {historical:true,simulation:true,liveAuthorized:false,pinnedCommit:commit,anchor,verifiedTurns:54,observedTokens:total,archiveSha256:digest(bytes)};
}
