/** Actual CLI, authored loopback Responses events, no login and no real model. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {runLoginTurn as legacyTurn} from '../health-tool-retest/login-turn.mjs';
import {runLoginTurn} from './login-turn.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
import {requireToolProbe, runHostWorkflow} from './workflow.mjs';

const out = path.resolve(process.argv[2] ?? '');
assert(process.argv[2] && !fs.existsSync(out), 'Fresh output directory required');
const executable = process.argv[3];
const cliVersion = process.argv[4];
const model = process.argv[5] ?? 'gpt-6.1-terra';
assert(executable && cliVersion, 'Explicit CLI path and version required');
fs.mkdirSync(out, {recursive: true});
const ledger = {strictness: 'strict', hasDiff: true, dimensions: Object.fromEntries(
  ['pr', 'architecture', 'debt', 'test'].map(key => [key, {status: 'assessed', findings: []}]))};
const envelope = {dashboards: [{ledger, draft: '# Health Dashboard\n<!-- BROOKS_HEALTH_SCORE -->'}]};
const expected = finalizeTool(envelope);
function sse(index, item) {
  const base = {id: `response_${index}`, object: 'response', created_at: 0, model: 'gpt-fixture',
    usage: {input_tokens: 1, output_tokens: 1, total_tokens: 2}, error: null, incomplete_details: null, parallel_tool_calls: false};
  return [
    {type: 'response.created', response: {...base, status: 'in_progress', output: []}},
    {type: 'response.output_item.added', output_index: 0, item: {...item, status: 'in_progress'}},
    {type: 'response.output_item.done', output_index: 0, item},
    {type: 'response.completed', response: {...base, status: 'completed', output: [item]}},
  ].map((event, sequence_number) => `event: ${event.type}\ndata: ${JSON.stringify({...event, sequence_number})}\n\n`).join('');
}
const message = text => ({id: 'msg', type: 'message', role: 'assistant', phase: 'final_answer', status: 'completed',
  content: [{type: 'output_text', text, annotations: []}]});
const summaries = [];
for (const mode of ['code-disabled', 'code-enabled', 'host-rendered']) {
  const requests = [];
  const server = http.createServer(async (request, response) => {
    try {
      let text = ''; for await (const chunk of request) { text += chunk; if (text.length > 2 ** 20) throw Error('Request too large'); }
      requests.push({path: request.url, body: JSON.parse(text)});
      const count = requests.length;
      if (count > (mode !== 'host-rendered' ? 2 : 1)) { response.writeHead(429); response.end(); return; }
      const item = mode !== 'host-rendered' && count === 1
        ? {id: 'fc', type: 'custom_tool_call', call_id: 'score', name: 'exec', namespace: 'functions', input: 'text(await tools.brooks_health_finalize(' + JSON.stringify(envelope) + '));', status: 'completed'}
        : message(mode !== 'host-rendered' ? expected.finalReport : JSON.stringify(envelope));
      response.writeHead(200, {'content-type': 'text/event-stream'}); response.end(sse(count, item));
    } catch { response.writeHead(400); response.end(); }
  });
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).on('error', reject));
  try {
    const options = {model, effort: 'low', cliVersion, executable,
      fixtureEndpoint: `http://127.0.0.1:${server.address().port}/v1`, timeoutMs: 30000,
      prompt: 'Authored offline control, not a model capability result.', out: path.join(out, mode)};
    let result;
    if (mode !== 'host-rendered') {
      const raw = await (mode === 'code-disabled' ? legacyTurn : runLoginTurn)({...options, enableScoreTool: true});
      const namespaces = requests[0].body.input.find(item => item.type === 'additional_tools')?.tools;
      const exec = namespaces?.find(tool => tool.name === 'functions')?.tools.find(tool => tool.name === 'exec');
      assert(exec?.description.includes('brooks_health_finalize'), 'Scorer must be advertised via functions.exec');
      const output = requests[1]?.body.input.find(item => item.type === 'custom_tool_call_output' && item.call_id === 'score');
      if (mode === 'code-disabled') {
        assert.equal(output?.output, 'code-mode host is disabled');
        assert.equal(raw.tool_calls.length, 0);
        assert.throws(() => requireToolProbe(raw));
        result = {passed: true, expectedFailure: 'code-mode host is disabled', toolCalls: 0};
      } else {
        result = requireToolProbe(raw);
        assert(JSON.stringify(output?.output).includes('Composite Score'));
      }
      result.upstreamToolExposure = 'Scorer declared inside functions.exec';
    } else {
      result = await runHostWorkflow(options);
      assert.equal(result.status, 'completed', result.error);
      assert.equal(result.finalReport, expected.finalReport);
      assert.equal(requests.length, 1);
    }
    summaries.push({mode, requests: requests.length, result});
  } finally {
    fs.mkdirSync(path.join(out, mode), {recursive: true});
    fs.writeFileSync(path.join(out, mode, 'fixture-requests.json'), JSON.stringify(requests, null, 2) + '\n');
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
}
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify({simulation: true, cliVersion, requestedModel: model,
  limitation: 'Authored model responses prove local transport and host scoring, not live model tool selection or diagnosis.', summaries}, null, 2) + '\n');
console.log(JSON.stringify({simulation: true, cliVersion, passed: summaries.map(row => row.mode)}));
