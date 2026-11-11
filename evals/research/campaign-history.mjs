/** Explicit offline verification of the completed campaign against pinned Git objects.
 * This is not an execution validator and never changes the current-source live gate.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const historicalCommit='37fd5a282df17736541c7c36d109f4ab070bbc8a';
export const historicalAnchor='e3df44f4b89af069dd9ae02fa03c024477051f4a7f78a667c6f9ab1016eb68cd';
const campaignFile='evals/research/frozen-campaign.json';
const digest=value=>crypto.createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const relative=file=>{assert(typeof file==='string'&&!path.isAbsolute(file)&&file.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe historical path');return file;};
function pinned(file){return execFileSync('git',['show',`${historicalCommit}:${relative(file)}`],{cwd:repositoryRoot,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});}

export function validateHistorical(sealed,{artifactRoot=repositoryRoot}={}) {
  assert.equal(digest(sealed.protocol),sealed.sha256,'Historical campaign hash drift');
  assert.equal(sealed.sha256,historicalAnchor,'Unknown historical campaign anchor');
  const original=pinned(campaignFile),expected=JSON.parse(original);
  assert.equal(expected.sha256,historicalAnchor,'Pinned campaign anchor mismatch');
  assert.deepEqual(sealed,expected,'Historical campaign contents differ from pinned commit');
  assert(fs.readFileSync(path.join(artifactRoot,campaignFile)).equals(original),'Historical campaign bytes changed');
  const p=sealed.protocol;
  assert.equal(p.liveAuthorized,false);assert.equal(p.model,null);assert.equal(p.effort,null);
  assert.equal(p.plannerSha256,digest(pinned('evals/research/campaign-plan.mjs')),'Historical planner source mismatch');
  const verifiedSources=new Set(),studies=[];
  for(const study of p.studies){
    const bytes=pinned(study.file);
    assert(fs.readFileSync(path.join(artifactRoot,relative(study.file))).equals(bytes),'Historical sub-study bytes changed');
    const frozen=JSON.parse(bytes),s=frozen.protocol;
    assert.equal(frozen.sha256,digest(s),'Historical sub-study hash mismatch');
    assert.equal(frozen.sha256,study.freezeSha256,'Campaign/sub-study anchor mismatch');
    assert.equal(s.liveAuthorized,false);assert.equal(s.model,null);
    assert.equal(s.cases.length,study.cases);assert.equal(s.schedule.turns.length,study.primaryCalls);
    assert.deepEqual(s.budget,study.budget);assert.equal(s.budget.primary_calls,s.schedule.turns.length);assert.equal(s.budget.harness_retries,0);
    for(const [file,sha] of Object.entries(s.sources)){
      assert.equal(digest(pinned(file)),sha,`Historical source mismatch: ${file}`);verifiedSources.add(file);
    }
    const guidance=s.guidance?Object.values(s.guidance).flat():[...s.core,...s.runtime];
    for(const item of guidance){
      const originalSource=pinned(item.path);
      assert.equal(item.content,originalSource.toString('utf8'),`Historical guidance content mismatch: ${item.path}`);
      assert.equal(item.sha256,digest(originalSource),`Historical guidance hash mismatch: ${item.path}`);verifiedSources.add(item.path);
    }
    const base=path.posix.dirname(study.file);
    for(const c of s.cases){
      for(const input of c.inputs)assert.equal(input.content,pinned(`${base}/cases/${c.id}/${input.path}`).toString('utf8'),'Historical input content mismatch');
      assert.deepEqual(c.rubric,JSON.parse(pinned(`${base}/cases/${c.id}/rubric.json`)),'Historical rubric mismatch');
      if(c.oracle)assert.deepEqual(c.oracle,JSON.parse(pinned(`${base}/cases/${c.id}/oracle.json`)),'Historical oracle mismatch');
    }
    const ids=new Set(s.cases.map(c=>c.id));
    assert.equal(ids.size,s.cases.length);
    assert.equal(new Set(s.schedule.turns.map(t=>`${t.caseId}/${t.arm}/${t.repeat}`)).size,s.schedule.turns.length);
    for(const t of s.schedule.turns)assert(ids.has(t.caseId)&&Number.isInteger(t.repeat)&&t.repeat>=1&&t.repeat<=s.schedule.repetitions,'Invalid historical turn');
    studies.push({id:study.id,freezeSha256:frozen.sha256,cases:s.cases.length,primaryCalls:s.schedule.turns.length});
  }
  assert.equal(p.totalPrimaryCalls,studies.reduce((n,s)=>n+s.primaryCalls,0));
  assert.equal(p.observedTokenAdmissionSum,p.studies.reduce((n,s)=>n+s.budget.observed_tokens_stop,0));
  assert.equal(p.studyDeadlineSumMs,p.studies.reduce((n,s)=>n+s.budget.study_ms,0));
  assert.deepEqual(p.executionOrder,studies.map(s=>s.id));
  const inventory=execFileSync('git',['ls-tree','-r','--name-only',historicalCommit,'skills'],{cwd:repositoryRoot,encoding:'utf8'}).trim().split('\n').filter(f=>/^skills\/[^/]+\/SKILL\.md$/.test(f)).map(f=>f.split('/')[1]).sort();
  assert.deepEqual(p.shippedSkills,inventory,'Pinned skill inventory mismatch');
  return {historical:true,liveAuthorized:false,pinnedCommit:historicalCommit,anchor:historicalAnchor,verifiedSourceFiles:verifiedSources.size,studies,totalPrimaryCalls:p.totalPrimaryCalls,limitations:['Offline archived-byte/source consistency only; not current-source execution permission.','Requires the pinned Git commit locally; never fetches or falls back to current source.','Historical semantic judgments and provider identity are not independently validated here.']};
}
