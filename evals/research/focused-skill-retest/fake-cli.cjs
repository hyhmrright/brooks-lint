// Synthetic app-server. No network, credentials or model requests.
const rl=require('node:readline');
const mode=process.argv[2]||'success';
const emit=x=>process.stdout.write(JSON.stringify(x)+'\n');
rl.createInterface({input:process.stdin}).on('line',line=>{
 const q=JSON.parse(line);if(!q.id||!q.method)return;
 emit({id:q.id,result:q.method==='initialize'?{userAgent:'codex/0.169.0'}:q.method==='thread/start'?{model:mode==='wrong-model'?'other':q.params.model,reasoningEffort:'low',thread:{id:'thread'}}:q.method==='turn/start'?{turn:{id:'turn'}}:{}});
 if(q.method==='turn/start')setTimeout(()=>{
  if(mode==='retry')return emit({method:'error',params:{threadId:'thread',turnId:'turn',willRetry:true,message:'synthetic retry'}});
  emit({method:'item/completed',params:{threadId:'thread',turnId:'turn',item:{id:'answer',type:'agentMessage',phase:'final_answer',text:'SIMULATION ONLY: predicted witness, no tests executed.'}}});
  if(mode!=='unknown-usage')emit({method:'thread/tokenUsage/updated',params:{threadId:'thread',tokenUsage:{total:{totalTokens:100}}}});
  emit({method:'turn/completed',params:{threadId:'thread',turn:{id:'turn',status:'completed'}}});
 },5);
});
