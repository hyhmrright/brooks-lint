import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {validateRegistration,assemble,digest} from '../../evals/research/runtime/benchmark-audit/login-runner.mjs';
import {runLoginTurn} from '../../evals/research/runtime/prospective/codex-login-turn.mjs';
const base='_workspace/hb-bv-live-20261110', original=JSON.parse(fs.readFileSync(`${base}/results/responses.json`));
const reg=JSON.parse(fs.readFileSync(`${base}/registration.json`));
const r=validateRegistration(reg,'64492be27ca664d56b14a165fe986bdaf1770c48480970704ce0cb572d01effe');
const out=`${base}/recovery-01`;fs.mkdirSync(out,{mode:0o700});
const save=(p,x)=>fs.writeFileSync(path.join(out,p),JSON.stringify(x,null,2)+'\n',{flag:'wx',mode:0o600});
const rows=original.records.filter(x=>x.status!=='executed');let count=0,tokens=0,stopped=null;const start=performance.now();
save('manifest.json',{originalRegistration:reg.sha256,originalResponsesSha256:digest(fs.readFileSync(`${base}/results/responses.json`)),ordinals:rows.map(x=>x.ordinal),authorization:'User explicitly requested recovery',model:r.model,effort:r.effort,simulation:false,limit:'30 primary calls, no automatic retries, 180s per turn, 3h admission budget; observed token stop is soft'});
for(const row of rows){const remaining=10800000-(performance.now()-start);if(remaining<=0||tokens>=3000000){stopped='budget admission stop';break}const n=String(row.ordinal).padStart(3,'0'),prompt=assemble(r.frozen,row);save(`intent-${n}.json`,{ordinal:row.ordinal,caseId:row.caseId,arm:row.arm,promptSha256:digest(prompt)});count++;let result;try{result=await runLoginTurn({model:r.model,effort:r.effort,cliVersion:r.cliVersion,prompt,out:path.join(out,n),live:true,timeoutMs:Math.max(1,Math.min(180000,Math.floor(remaining))),inheritProxy:r.inheritProxy})}catch(e){stopped='setup failure';save(`failure-${n}.json`,{error:'setup or archival failure'});break}const usage=result.usage?.total?.totalTokens;save(`result-${n}.json`,{ordinal:row.ordinal,status:result.status,answer:result.answer,answerSha256:digest(result.answer??''),recordSha256:digest(fs.readFileSync(path.join(out,n,'record.json'))),tokens:usage??null});if(Number.isSafeInteger(usage))tokens+=usage;if(result.status!=='completed'||!Number.isSafeInteger(usage)){stopped=result.error??'usage unavailable';break}}
save('summary.json',{planned:rows.length,attempted:count,observedTokens:tokens,stopped});console.log(JSON.stringify({planned:rows.length,attempted:count,observedTokens:tokens,stopped}));
