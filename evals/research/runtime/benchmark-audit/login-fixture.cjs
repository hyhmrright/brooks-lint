// Offline fake app-server: no HTTP client, credentials, models or network access.
const readline = require('node:readline');
const mode = process.argv[2] ?? 'ok';
readline.createInterface({input:process.stdin}).on('line', line => {
  const q=JSON.parse(line);if(!q.id)return;
  let result={};
  if(q.method==='initialize')result={userAgent:'codex/0.167.0'};
  if(q.method==='thread/start')result={model:mode==='wrong-model'?'gpt-wrong':q.params.model,reasoningEffort:'low',thread:{id:'fixture-thread'}};
  if(q.method==='turn/start')result={turn:{id:'fixture-turn'}};
  console.log(JSON.stringify({id:q.id,result}));
  if(q.method==='turn/start'){
    if(mode==='malformed'){console.log('not-json');return;}
    console.log(JSON.stringify({method:'item/completed',params:{threadId:'fixture-thread',turnId:'fixture-turn',item:{id:'answer',type:'agentMessage',text:'SYNTHETIC FIXTURE ANSWER. No semantic model evaluation performed.'}}}));
    if(mode!=='missing-usage')console.log(JSON.stringify({method:'thread/tokenUsage/updated',params:{threadId:'fixture-thread',tokenUsage:{total:{totalTokens:mode==='token-stop'?3000000:100,inputTokens:60,outputTokens:40}}}}));
    console.log(JSON.stringify({method:'turn/completed',params:{threadId:'fixture-thread',turn:{id:'fixture-turn',status:'completed'}}}));
  }
});
