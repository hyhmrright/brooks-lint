import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {here, loadCases, read, sha, skills, write} from './plan.mjs';
import {verify} from './runner.mjs';

const expectedProbes = () => read(path.join(here,'cases','expectations.json'));
const usable = row => !row.stop || row.stop==='probe-infrastructure-failure';

export function packets(run, secret) {
  assert(/^[0-9a-f]{64}$/.test(secret));
  const cases=new Map(loadCases().map(c=>[c.id,c]));
  const entries=run.records.filter(usable).map(row=>{
    const c=cases.get(row.id);
    const blindId=sha(JSON.stringify([secret,row.id,row.arm])).slice(0,20);
    const toolTrail=row.raw.tool_calls.map(call=>({action:call.arguments.action,
      ...(call.arguments.path ? {path:call.arguments.path} : {}),
      ...(call.arguments.revision ? {revision:call.arguments.revision} : {}),
      success:call.success}));
    return {arm:row.arm, packet:{blindId,id:row.id,task:c.task,tree:c.tree,base:c.base,
      checks:c.checks,answer:row.raw.answer,edits:row.raw.workspace.edits,toolTrail,
      evidenceUnavailable:row.stop==='probe-infrastructure-failure',
      artifactMatch:row.delivery?.artifactMatch ?? null,probeChecks:row.probe?.checks ?? null,
      probeKeys:row.delivery ? Object.keys(expectedProbes()[c.id].initial) : []}};
  }).sort((a,b)=>a.packet.blindId.localeCompare(b.packet.blindId));
  assert.equal(new Set(entries.map(x=>x.packet.blindId)).size,entries.length);
  return entries;
}

export function aggregate(run, entries, grading) {
  assert.equal(grading.planSha256,run.plan.planSha256);
  assert.equal(grading.simulation,run.state.simulation);
  assert(typeof grading.reviewer==='string' && grading.reviewer.trim().length);
  assert.equal(grading.answers.length,entries.length,'Grade every reviewable answer');
  const rows=entries.map(({arm,packet})=>{
    const matches=grading.answers.filter(x=>x.blindId===packet.blindId);
    assert.equal(matches.length,1,'Need exactly one grade per blind answer');
    const [g]=matches;
    assert.deepEqual(Object.keys(g.checks).sort(),packet.checks.map(x=>x.id).sort());
    for(const v of Object.values(g.checks)) {
      assert(['pass','fail','unavailable'].includes(v.verdict));
      assert(typeof v.evidence==='string' && v.evidence.trim().length);
      if(v.verdict==='unavailable') assert(packet.evidenceUnavailable,'Missing model output is graded as failure');
    }
    assert(Array.isArray(g.falsePositives));
    for(const fp of g.falsePositives)
      assert(typeof fp.claim==='string' && fp.claim.trim() && typeof fp.evidence==='string' && fp.evidence.trim());
    assert.equal(new Set(g.falsePositives.map(fp=>fp.claim)).size,g.falsePositives.length);
    if(!packet.evidenceUnavailable) {
      if(packet.artifactMatch===false) assert.equal(g.checks['artifact-bound'].verdict,'fail');
      for(const key of packet.probeKeys) {
        if(packet.probeChecks?.[key]!==true) assert.equal(g.checks[key].verdict,'fail','Probe failure cannot pass '+key);
      }
    }
    const expected=packet.checks.filter(x=>x.kind==='expected');
    const misses=expected.filter(x=>g.checks[x.id].verdict==='fail').length;
    const guardrailFailures=packet.checks.filter(x=>x.kind==='guardrail' && g.checks[x.id].verdict==='fail').length;
    const unavailable=Object.values(g.checks).some(x=>x.verdict==='unavailable') || packet.evidenceUnavailable;
    const pass=unavailable ? null : Object.values(g.checks).every(x=>x.verdict==='pass') && !g.falsePositives.length;
    return {id:packet.id,arm,blindId:g.blindId,pass,misses,expected:expected.length,
      falsePositives:g.falsePositives.length,guardrailFailures};
  });
  const cases=loadCases();
  const results=Object.fromEntries(skills.map(skill=>{
    const tasks=cases.filter(c=>c.skill===skill);
    const pairResults=tasks.map(c=>{
      const a=rows.find(r=>r.id===c.id && r.arm==='generic');
      const b=rows.find(r=>r.id===c.id && r.arm==='skill');
      const result=a?.pass==null || b?.pass==null ? 'incomplete' :
        a.pass===b.pass ? (a.pass?'both-pass':'both-fail') : b.pass?'skill-win':'skill-loss';
      return {id:c.id,result};
    });
    const wins=pairResults.filter(x=>x.result==='skill-win').length;
    const losses=pairResults.filter(x=>x.result==='skill-loss').length;
    const incomplete=pairResults.some(x=>x.result==='incomplete');
    const signal=incomplete?'incomplete':wins===2?'two-family-gain':losses===2?'two-family-loss':
      wins && losses?'mixed':wins?'single-family-gain':losses?'single-family-loss':'tie';
    const byArm=Object.fromEntries(['generic','skill'].map(arm=>{
      const evaluated=rows.filter(r=>r.arm===arm && tasks.some(c=>c.id===r.id) && r.pass!==null);
      const sum=key=>evaluated.reduce((n,r)=>n+r[key],0);
      return [arm,{reviewed:evaluated.length,passed:evaluated.filter(r=>r.pass).length,
        misses:sum('misses'),expected:sum('expected'),falsePositives:sum('falsePositives'),
        guardrailFailures:sum('guardrailFailures')}];
    }));
    return [skill,{signal,pairs:pairResults,byArm}];
  }));
  return {planSha256:run.plan.planSha256,model:run.plan.model,effort:run.plan.effort,
    simulation:run.state.simulation,reviewer:grading.reviewer,results,rows};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [cmd,out,gradeDir,gradesFile]=process.argv.slice(2);
  assert(out && gradeDir);
  const run=verify(out);
  const secretFile=path.join(gradeDir,'mapping-key.txt');
  if(cmd==='packets') {
    fs.mkdirSync(gradeDir,{mode:0o700});
    const secret=randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile,secret,{mode:0o600});
    const rows=packets(run,secret);
    write(path.join(gradeDir,'packets.json'),{planSha256:run.plan.planSha256,
      simulation:run.state.simulation,answers:rows.map(x=>x.packet)});
    write(path.join(gradeDir,'grading-template.json'),{planSha256:run.plan.planSha256,
      simulation:run.state.simulation,reviewer:'',answers:rows.map(({packet})=>({
        blindId:packet.blindId,checks:Object.fromEntries(packet.checks.map(x=>[x.id,{verdict:'',evidence:''}])),falsePositives:[],
      }))});
  } else if(cmd==='score') {
    assert(gradesFile,'Grading JSON required');
    const rows=packets(run,fs.readFileSync(secretFile,'utf8'));
    assert.deepEqual(read(path.join(gradeDir,'packets.json')).answers,rows.map(x=>x.packet));
    const report=aggregate(run,rows,read(gradesFile));
    write(path.join(gradeDir,'summary.json'),report);
    console.log(JSON.stringify(report.results,null,2));
  } else throw Error('packets OUT FRESH_GRADE_DIR | score OUT GRADE_DIR GRADES_JSON');
}
