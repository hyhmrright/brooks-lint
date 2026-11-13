/** Explicit fake-CLI capture; never uses login credentials or a model. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {freeze} from './suite.mjs';
import {register,execute,readRun,packets,assessRun} from './campaign.mjs';
const root=process.argv[2];assert(root,'Fresh drill output required');assert(!fs.existsSync(root));fs.mkdirSync(root,{recursive:true});
const fake=fileURLToPath(new URL('../health-transport-v3/fake-cli.cjs',import.meta.url)),frozen=freeze(),records=[];
for(const mode of ['success','retry','wrong-model','unknown-usage','budget']){
 const sealed=register({frozen,freezeAnchor:frozen.sha256,model:'gpt-fixture',effort:'low',cliVersion:'0.167.1',executable:process.execPath,assessor:'SIMULATION authored protocol fixtures; no semantic capability claim',simulation:true,budget:{calls:108,observedTokens:mode==='budget'?100:100000,totalMs:120000,turnMs:2000},offline:{fixtureEndpoint:'http://127.0.0.1:1/v1',prefixArgs:[fake,mode==='budget'?'success':mode]}});
 const out=path.join(root,mode),summary=await execute(sealed,sealed.sha256,out),run=readRun(out);
 const annotations=packets(run).packets.map(p=>({responseId:p.responseId,review:{answerSha256:p.answerSha256,reviewer:'Synthetic control',assessment:'no-answer',labelBasis:'The fake CLI response is not a diagnostic answer',novelFindings:[],issues:[],criteria:[],evidence:[],falseDefectClaims:[],otherUnsupportedClaims:[],pendingClaims:[]}}));
 fs.writeFileSync(path.join(out,'annotations.json'),JSON.stringify(annotations,null,2)+'\n');fs.writeFileSync(path.join(out,'assessment.json'),JSON.stringify(assessRun(run,annotations),null,2)+'\n');
 if(mode==='success')assert.equal(summary.completed,108);else {assert.equal(summary.attempted,1);assert.equal(summary.notRun,107);}records.push({mode,...summary});
}
fs.writeFileSync(path.join(root,'summary.json'),JSON.stringify({simulation:true,liveModelCalls:0,realCredentials:0,records},null,2)+'\n');console.log(JSON.stringify(records));
