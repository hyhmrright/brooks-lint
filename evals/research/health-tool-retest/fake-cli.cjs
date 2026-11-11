// Offline protocol fixture only; no model, auth, filesystem or network operations.
const readline=require('node:readline');
const mode=process.argv[2]??'success';let enabled=false,prompt='',requestId=700;
const emit=value=>process.stdout.write(JSON.stringify(value)+'\n');
const ledger={strictness:'strict',hasDiff:true,dimensions:Object.fromEntries(['pr','architecture','debt','test'].map(key=>[key,{status:'assessed',findings:[]}]))};
const draft='# Health Dashboard\n\n<!-- BROOKS_HEALTH_SCORE -->\n\nNo findings.';
function finish(text){
 emit({method:'item/completed',params:{threadId:'thread',turnId:'turn',item:{id:'answer',type:'agentMessage',phase:'final_answer',text}}});
 if(mode!=='unknown-usage')emit({method:'thread/tokenUsage/updated',params:{threadId:'thread',tokenUsage:{total:{totalTokens:100,inputTokens:60,outputTokens:40}}}});
 emit({method:'turn/completed',params:{threadId:'thread',turn:{id:'turn',status:'completed'}}});
}
readline.createInterface({input:process.stdin}).on('line',line=>{
 const q=JSON.parse(line);
 if(q.id===requestId&&Object.hasOwn(q,'result')){const result=JSON.parse(q.result.contentItems[0].text);return finish(mode==='edited-answer'?result.finalReport+'\nOverall score: 1/100':result.finalReport??'Tool validation failed; composite omitted.');}
 if(q.id===requestId&&q.error)return;
 if(!q.method||!q.id)return;
 const result=q.method==='initialize'?{userAgent:'codex/0.167.1'}:q.method==='thread/start'?{model:mode==='wrong-model'?'gpt-foreign':q.params.model,reasoningEffort:'low',thread:{id:'thread'}}:q.method==='turn/start'?{turn:{id:'turn'}}:{};
 if(q.method==='thread/start')enabled=!!q.params.dynamicTools?.length;
 if(q.method==='turn/start'&&mode==='coalesced'){const request={method:'item/tool/call',id:requestId,params:{threadId:'thread',turnId:'turn',callId:'call-1',tool:'brooks_health_finalize',arguments:{dashboards:[{ledger,draft}]}}};process.stdout.write(JSON.stringify({id:q.id,result})+'\n'+JSON.stringify(request)+'\n');return;}
 emit({id:q.id,result});if(q.method!=='turn/start')return;prompt=q.params.input[0].text;
 setTimeout(()=>{
  if(mode==='timeout')return;
  if(mode==='foreign-item'){emit({method:'item/completed',params:{threadId:'thread',turnId:'turn',item:{id:'bad',type:'commandExecution'}}});return;}
  if(!enabled||mode==='omitted-tool'||prompt.includes('Kubernetes liveness versus readiness'))return finish('Synthetic text-only answer.');
  const submitted=structuredClone(ledger);if(mode==='incomplete-ledger')submitted.dimensions.test={status:'unassessed',reason:'No test sources supplied'};
  if(mode==='invalid-ledger')submitted.dimensions.test.status='invented';
  const count=prompt.includes('two separate dashboards')?2:1;
  emit({method:'item/tool/call',id:requestId,params:{threadId:mode==='foreign-scope'?'foreign':'thread',turnId:'turn',callId:'call-1',tool:mode==='foreign-tool'?'shell':'brooks_health_finalize',arguments:{dashboards:Array.from({length:count},()=>({ledger:submitted,draft}))}}});
 },5);
});
