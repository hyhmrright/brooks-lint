const readline = require('node:readline');
const mode = process.argv[2];
const emit = value => process.stdout.write(JSON.stringify(value) + '\n');

readline.createInterface({input: process.stdin}).on('line', line => {
  const {id, method, params} = JSON.parse(line);
  if (!id) return;
  switch (method) {
    case 'initialize':
      emit({id, result: {userAgent: 'codex/0.169.0'}});
      break;
    case 'account/read':
      if (params.refreshToken !== false) process.exit(2);
      if (mode === 'late-account') {
        process.once('SIGTERM', () => {
          emit({id, result: {account: {type: 'chatgpt', email: 'PRIVATE_FIXTURE'}}});
          setTimeout(() => process.exit(), 20);
        });
        break;
      }
      if (mode === 'routing-failure') {
        emit({id, error: {code: -32603, message: 'workspace routing discovery failed', data: 'PRIVATE_FIXTURE'}});
      } else {
        emit({id, result: {account: {type: 'chatgpt', email: 'PRIVATE_FIXTURE'}}});
      }
      break;
    case 'thread/start':
      emit({id, result: {model: params.model, reasoningEffort: 'low', thread: {id: 'thread'}}});
      break;
    case 'turn/start':
      emit({id, result: {turn: {id: 'turn'}}});
      if (mode === 'retry') {
        emit({method: 'error', params: {willRetry: true}});
        break;
      }
      emit({method: 'item/completed', params: {threadId: 'thread', turnId: 'turn',
        item: {id: 'answer', type: 'agentMessage', phase: 'final_answer', text: 'Synthetic answer only.'}}});
      if (mode !== 'unknown-usage') {
        emit({method: 'thread/tokenUsage/updated', params: {tokenUsage: {total: {totalTokens: 100}}}});
      }
      emit({method: 'turn/completed', params: {threadId: 'thread', turn: {id: 'turn', status: 'completed'}}});
      break;
    default:
      process.exit(2);
  }
});
