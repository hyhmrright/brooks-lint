import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createPlan,validatePlan,executeRecovery,verifyOriginal} from './recovery.mjs';
const archive=path.resolve('docs/research/health-tool-retest-results/2026-11-11-terra-low/raw-run.tar.gz');
function fixture(t){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'health-recovery-test-'));t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));execFileSync('tar',['-xzf',archive,'-C',tmp]);return {tmp,original:path.join(tmp,'run')};}
test('recovery seals original 17 successes, one failure, schedule and cumulative budgets',t=>{const {original}=fixture(t),run=verifyOriginal(original),sealed=createPlan(original);assert.equal(run.records[17].status,'failed');assert.equal(run.records[17].caseId,'AS-21');assert.equal(sealed.plan.sourceOrdinal,18);assert.equal(sealed.plan.plannedTurns,31);assert.equal(sealed.plan.maxTotalAttempts,49);assert.equal(sealed.plan.oldObservedTokens,616843);assert.equal(sealed.plan.totalObservedTokenStop,2000000);assert.equal(sealed.plan.turnMs,300000);assert(sealed.plan.oldWallElapsedMs>300000);assert.equal(sealed.plan.model,'gpt-6.1-terra');assert.equal(sealed.plan.effort,'low');validatePlan(sealed,original);const bad=structuredClone(sealed);bad.plan.totalObservedTokenStop++;assert.throws(()=>validatePlan(bad,original));});
test('prior result byte drift is rejected before recovery',t=>{const {original}=fixture(t),sealed=createPlan(original);fs.appendFileSync(path.join(original,'001/answer.txt'),'tamper');assert.throws(()=>validatePlan(sealed,original),/Original differs/);});
test('recovery requires live authorization and rejects fake overrides before output',async t=>{const {tmp,original}=fixture(t),sealed=createPlan(original),out=path.join(tmp,'new');await assert.rejects(executeRecovery(sealed,sealed.sha256,original,out),/Explicit --live/);await assert.rejects(executeRecovery(sealed,sealed.sha256,original,out,{live:true,executable:'fake'}),/overrides forbidden/);assert(!fs.existsSync(out));});

test('synthetic continuation preserves first 17 and rebuilds 48 verifiable packets and report',{skip:process.platform!=='darwin'},async t=>{
 const {freeze,register,execute,readRun}=await import('./runner.mjs');
 const {syntheticContinuation}=await import('./recovery.mjs');
 const {syntheticAnnotations}=await import('./drill.mjs');
 const {summarize}=await import('./report.mjs');
 const {fileURLToPath}=await import('node:url');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'health-recovery-synthetic-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const f=freeze(),sealed=register({frozen:f,anchor:f.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.1',authorization:'Synthetic offline control only'});
 const fake=fileURLToPath(new URL('./fake-cli.cjs',import.meta.url)),opts={fixtureEndpoint:'http://127.0.0.1:1/v1',executable:process.execPath,prefixArgs:[fake,'success']};
 const full=path.join(root,'full');await execute(sealed,sealed.sha256,full,opts);
 const out=path.join(root,'recovered'),dir=path.join(out,'run');fs.mkdirSync(dir,{recursive:true});
 for(const file of ['registration.json','start.json'])fs.copyFileSync(path.join(full,file),path.join(dir,file));
 for(let i=1;i<=17;i++){const id=String(i).padStart(3,'0');fs.copyFileSync(path.join(full,`intent-${id}.json`),path.join(dir,`intent-${id}.json`));fs.cpSync(path.join(full,id),path.join(dir,id),{recursive:true});}
 const interrupted=path.join(root,'interrupted'), interruptedDir=path.join(interrupted,'run');fs.cpSync(dir,interruptedDir,{recursive:true});const stopped=await syntheticContinuation(interruptedDir,interrupted,{...opts,prefixArgs:[fake,'unknown-usage']});assert.equal(stopped.recoveryAttempted,1);assert.equal(stopped.stopped,'usage-unavailable');assert.equal(stopped.notRun,30);assert(!fs.existsSync(path.join(interruptedDir,'intent-019.json')));
 const before=fs.readFileSync(path.join(dir,'001/record.json'));const result=await syntheticContinuation(dir,out,opts);assert(result.simulation);assert.equal(result.recoveryAttempted,31);assert.equal(result.executed,48);assert.equal(result.stopped,null);assert.deepEqual(fs.readFileSync(path.join(dir,'001/record.json')),before);const run=readRun(dir),packets=JSON.parse(fs.readFileSync(path.join(dir,'review-packets.json'))),mapping=JSON.parse(fs.readFileSync(path.join(dir,'review-mapping-private.json'))),report=summarize(run,syntheticAnnotations(run));assert.equal(packets.packets.length,48);assert.equal(mapping.records.filter(x=>x.status==='executed').length,48);assert.equal(report.rows.length,48);assert.equal(report.paired.length,24);assert(report.simulation);
});
