import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,appendFileSync,symlinkSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {captureFinalFile,COMPLETION_POLICY,completionEligibility} from '../../../../../evals/research/runtime/prospective/executor-completion.mjs';
import {hash} from '../../../../../evals/research/runtime/prospective/codex-channel.mjs';
const root=path.resolve('docs/research/runtime-preparations/2026-11-09-hc-executor-completion');
const scratch=mkdtempSync(path.join(tmpdir(),'qa2-final-capture-'));
const file=path.join(scratch,'last-message.txt'),session={home:scratch};
const results=[];
try {
 assert.equal(captureFinalFile(session),null);results.push({case:'missing',refused_or_missing:true});
 const raw=Buffer.alloc(COMPLETION_POLICY.output_limit,65);writeFileSync(file,raw);const maximum=captureFinalFile(session);assert.equal(maximum.error,undefined);assert.equal(maximum.capture.observed_bytes,2097152);assert.equal(maximum.read_calls,128);assert.equal(maximum.read_budget_bytes,2097152);assert.equal(maximum.capture.observed_sha256,hash(raw));results.push({case:'hard-limit-exact',observed:maximum.capture.observed_bytes,read_calls:maximum.read_calls});
 writeFileSync(file,Buffer.alloc(COMPLETION_POLICY.output_limit+1,65));const over=captureFinalFile(session);assert.equal(over.error,'final-file-hard-size-limit');assert.equal(over.read_calls,0);assert.equal(over.capture.observed_bytes,0);results.push({case:'hard-limit-plus-one',error:over.error,observed:0});
 writeFileSync(file,'ORIGINAL');const growth=captureFinalFile(session,COMPLETION_POLICY,{afterInitialStat:()=>appendFileSync(file,Buffer.alloc(COMPLETION_POLICY.output_limit+1,66))});assert.equal(growth.error,'final-file-changed-during-import');assert.equal(growth.capture.observed_bytes,8);assert.equal(growth.read_calls,1);results.push({case:'post-stat-growth',error:growth.error,observed:growth.capture.observed_bytes,read_calls:1});
 writeFileSync(file,'ORIGINAL');const shrink=captureFinalFile(session,COMPLETION_POLICY,{afterInitialStat:()=>writeFileSync(file,'X')});assert(shrink.error);assert.equal(shrink.capture.observed_bytes,1);assert.equal(shrink.read_calls,1);results.push({case:'post-stat-shrink',error:shrink.error,observed:1,read_calls:1});
 rmSync(file);const target=path.join(scratch,'owned-target');writeFileSync(target,'TARGET');symlinkSync(target,file);const link=captureFinalFile(session);assert(link.error);assert.equal(link.capture.observed_bytes,0);results.push({case:'symlink',error:link.error,observed:0});rmSync(file);mkdirSync(file);const directory=captureFinalFile(session);assert(directory.error);assert.equal(directory.capture.observed_bytes,0);results.push({case:'directory',error:directory.error,observed:0});rmSync(file,{recursive:true});
 const mk=spawnSync('/usr/bin/mkfifo',[file],{timeout:1000,maxBuffer:8192});assert.equal(mk.status,0);
 const moduleUrl=pathToFileURL(path.resolve('evals/research/runtime/prospective/executor-completion.mjs')).href;
 const script=`import {captureFinalFile} from ${JSON.stringify(moduleUrl)};console.log('BEFORE_FINAL_CAPTURE');console.log(JSON.stringify(captureFinalFile({home:${JSON.stringify(scratch)}})));console.log('AFTER_FINAL_CAPTURE');`;
 const start=performance.now();const fifo=spawnSync(process.execPath,['--input-type=module','-e',script],{timeout:1500,killSignal:'SIGKILL',maxBuffer:65536,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'}});const elapsed=performance.now()-start;assert.equal(fifo.error,undefined);assert.equal(fifo.status,0);const lines=fifo.stdout.toString().trim().split('\n');assert.equal(lines[0],'BEFORE_FINAL_CAPTURE');assert.equal(lines.at(-1),'AFTER_FINAL_CAPTURE');const parsed=JSON.parse(lines[1]);assert.equal(parsed.error,'final-file-not-regular');assert.equal(parsed.capture.observed_bytes,0);assert.equal(parsed.read_calls,0);results.push({case:'fifo-without-writer',status:fifo.status,elapsed_ms:elapsed,error:parsed.error,observed:0,read_calls:0,stdout_base64:fifo.stdout.toString('base64'),stderr_base64:fifo.stderr.toString('base64')});
 const old=JSON.parse(readFileSync(path.join(root,'observations/control/record.json')));old.final_message.error='final-file-short-read';const e=completionEligibility(old);assert.equal(e.protocol_eligible,false);assert(e.reasons.includes('final-file-import-error'));results.push({case:'otherwise-successful-answer-import-error',refused:true});
 console.log(JSON.stringify({qa_round:2,source_sha256:hash(readFileSync('evals/research/runtime/prospective/executor-completion.mjs')),native_cli_launched:false,model_calls:0,qa1_finding_resolved:true,scope:'Bounded current-export local file checks, not additional native study observations or hard realtime filesystem proof',results},null,2));
}finally{rmSync(scratch,{recursive:true,force:true});}
