// Synthetic minimized replay shape from AS-26 orphan-delta reconnect; no model/network.
const readline=require('node:readline');
const mode=process.argv[2];
const emit=value=>process.stdout.write(JSON.stringify(value)+'\n');
readline.createInterface({input:process.stdin}).on('line',line=>{
 const q=JSON.parse(line);if(!q.id)return;
 const result=q.method==='initialize'?{userAgent:'codex/0.167.0'}:q.method==='thread/start'?{model:q.params.model,reasoningEffort:'low',thread:{id:'thread'}}:q.method==='turn/start'?{turn:{id:'turn'}}:{};
 emit({id:q.id,result});if(q.method!=='turn/start')return;
 const delta=(id,text)=>emit({method:'item/agentMessage/delta',params:{threadId:'thread',turnId:'turn',itemId:id,delta:text}});
 const complete=(id,text,phase='final_answer',threadId='thread')=>emit({method:'item/completed',params:{threadId,turnId:'turn',item:{id,type:'agentMessage',phase,text}}});
 if(mode==='reconnect'){
  delta('abandoned','{"report":"unfinished');
  emit({method:'error',params:{threadId:'thread',turnId:'turn',willRetry:true,error:{message:'SYNTHETIC interrupted stream'}}});
  delta('final','{"report":');complete('final','{"report":"synthetic complete","replacements":[]}');
 }else if(mode==='multiple'){
  complete('comment','Completed commentary','commentary');complete('final','Completed final');
 }else if(mode==='partial-failed'||mode==='no-completed')delta('abandoned','partial diagnostic');
 else if(mode==='empty-completed')complete('empty',' \n');
 else if(mode==='missing-text')emit({method:'item/completed',params:{threadId:'thread',turnId:'turn',item:{id:'bad',type:'agentMessage',phase:'final_answer'}}});
 else if(mode==='wrong-scope')complete('wrong','other thread answer','final_answer','foreign');
 else if(mode==='conflict'){complete('one','first');complete('one','changed');}
 else {delta('one','Completed ');delta('one','final');complete('one','Completed final');complete('one','Completed final');}
 emit({method:'thread/tokenUsage/updated',params:{threadId:'thread',tokenUsage:{total:{totalTokens:100,inputTokens:60,outputTokens:40}}}});
 emit({method:'turn/completed',params:{threadId:'thread',turn:{id:'turn',status:mode==='partial-failed'?'failed':'completed'}}});
});
