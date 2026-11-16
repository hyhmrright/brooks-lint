import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {anchored, write} from './suite.mjs';
import {admit} from './runner.mjs';
import {runLoginTurn} from './login-turn.mjs';
import {diagnose} from './diagnostics.mjs';

export function verifyAccountProbe(raw) {
  assert(raw.account_only);
  const diagnostic = diagnose(raw);
  assert.deepEqual(diagnostic.requestMethods, ['initialize', 'account/read']);
  assert.equal(raw.usage, null);
  assert.equal(raw.answer, '');
  assert.equal(raw.cli_selected_model, null);
  assert(!raw.rpc_responses.some(row => row.method === 'account/read'));
  return {
    ...diagnostic,
    classification: raw.status === 'account-verified' ? 'account-verified' : diagnostic.classification,
    ready: raw.status === 'account-verified' && raw.auth_type === 'chatgpt'
      && diagnostic.cleanupConfirmed && !diagnostic.retryNotificationObserved,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [out, flag, ...extra] = process.argv.slice(2);
  assert(out && flag === '--account-only' && !extra.length, 'FRESH_OUT --account-only');
  const plan = anchored();
  admit(plan);
  const raw = await runLoginTurn({
    model: plan.model, effort: plan.effort, cliVersion: plan.cliVersion,
    executable: plan.binding.executable, toolchain: plan.binding.toolchain,
    live: true, inheritProxy: true, accountOnly: true, out, timeoutMs: 15000,
    prompt: 'Account routing diagnostic. This text is not submitted.',
  });
  const result = verifyAccountProbe(raw);
  write(path.join(out, 'diagnostic.json'), result);
  console.log(JSON.stringify(result));
  if (!result.ready) process.exitCode = 1;
}
