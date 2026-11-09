import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const scratch=mkdtempSync(path.join(tmpdir(),'qa-final-fifo-'));
try {
 const mk=spawnSync('/usr/bin/mkfifo',[path.join(scratch,'last-message.txt')]);if(mk.status!==0)throw Error('mkfifo failed');
 const sourcePath=path.resolve('evals/research/runtime/prospective/executor-completion.mjs');
 const script=`import path from 'node:path';import {existsSync,openSync,fstatSync,constants,readSync,closeSync,readFileSync} from 'node:fs';import {BoundedCapture,COMPLETION_POLICY} from '${path.resolve('evals/research/runtime/prospective/executor-completion.mjs')}';import {hash} from '${path.resolve('evals/research/runtime/prospective/codex-channel.mjs')}';const s=readFileSync(${JSON.stringify(sourcePath)},'utf8');const body=s.slice(s.indexOf('function finalCapture('),s.indexOf('\nexport function completionEligibility'));const capture=new Function('path','existsSync','openSync','fstatSync','constants','BoundedCapture','COMPLETION_POLICY','hash','readSync','closeSync','TextDecoder','return ('+body+')')(path,existsSync,openSync,fstatSync,constants,BoundedCapture,COMPLETION_POLICY,hash,readSync,closeSync,TextDecoder);console.log('BEFORE_FINAL_CAPTURE');console.log(JSON.stringify(capture({home:${JSON.stringify(scratch)}},COMPLETION_POLICY)));`;
 const start=performance.now();const r=spawnSync(process.execPath,['--input-type=module','-e',script],{timeout:1500,killSignal:'SIGKILL',maxBuffer:1048576});
 const output={scope:'Bounded QA reproduction of current working-tree private finalCapture function, not archived source and not native Codex or a model',source:sourcePath,source_sha256:createHash('sha256').update(readFileSync(sourcePath)).digest('hex'),elapsed_ms:performance.now()-start,status:r.status,signal:r.signal,error:r.error?{code:r.error.code,message:r.error.message}:null,stdout_base64:r.stdout.toString('base64'),stderr_base64:r.stderr.toString('base64'),owned_temp_fifo_removed:true};
 console.log(JSON.stringify(output,null,2));
}finally {rmSync(scratch,{recursive:true,force:true});}
