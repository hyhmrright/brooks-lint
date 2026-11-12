import test from 'node:test';
import assert from 'node:assert/strict';
import {renderEnvelope, requireToolProbe, runHostWorkflow} from './workflow.mjs';
import {finalizeTool} from '../health-tool-retest/tool.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {argumentsFor, toolchainIdentity, verifyToolchain, runLoginTurn} from './login-turn.mjs';
import {freezeProbe, executeProbe, assessProbe} from './probe.mjs';

const clean = () => ({strictness: 'balanced', hasDiff: true, dimensions: Object.fromEntries(
  ['pr', 'architecture', 'debt', 'test'].map(key => [key, {status: 'assessed', findings: []}]))});
const envelope = ledger => ({dashboards: [{ledger, draft: '# Health Dashboard\n<!-- BROOKS_HEALTH_SCORE -->'}]});
test('host rendering retains raw identity, yields one verified score and never claims a model tool call', () => {
  const text = JSON.stringify(envelope(clean()));
  const result = renderEnvelope(text);
  assert.match(result.finalReport, /100\/100/);
  assert.equal(result.receipts.length, 1);
  assert.equal(result.modelToolInvocation, false);
  assert.match(result.rawAnswerSha256, /^[a-f0-9]{64}$/);
});
test('a missing dimension stays unavailable, not a perfect score', () => {
  const ledger = clean(); ledger.dimensions.test = {status: 'unassessed', reason: 'No suite supplied'};
  const result = renderEnvelope(JSON.stringify(envelope(ledger)));
  assert.match(result.finalReport, /Composite unavailable/);
  assert.doesNotMatch(result.finalReport, /Composite Score/);
});
test('wrong report count, malformed output, invalid ledger and hand-written scores fail closed', () => {
  assert.throws(() => renderEnvelope(JSON.stringify(envelope(clean())), 2), /count/);
  assert.throws(() => renderEnvelope('```json\n{}\n```'));
  const input = envelope(clean()); input.dashboards[0].draft += '\nHealth Score: 80/100';
  assert.throws(() => renderEnvelope(JSON.stringify(input)));
  input.dashboards[0].ledger.dimensions.pr.findings = [{id: 'a', severity: 'critical'}];
  assert.throws(() => renderEnvelope(JSON.stringify(input)));
  assert.throws(() => renderEnvelope(JSON.stringify({...envelope(clean()), command: 'anything'})));
});
test('required probe rejects no-call explanations, mismatched receipts, edited final and incomplete cleanup', () => {
  const args = envelope(clean()), result = finalizeTool(args);
  const record = {simulation: true, status: 'completed', cleanup: {closed: true, group_absent: true, private_home_removed: true},
    answer: result.finalReport, tool_calls: [{success: true, arguments: args, result}]};
  assert(requireToolProbe(record).passed);
  assert(assessProbe(record).passed);
  const otherArgs = envelope(clean()); otherArgs.dashboards[0].ledger.strictness = 'strict';
  const otherResult = finalizeTool(otherArgs);
  assert.throws(() => assessProbe({...record, answer: otherResult.finalReport,
    tool_calls: [{success: true, arguments: otherArgs, result: otherResult}]}), /supplied ledger/);
  assert.throws(() => requireToolProbe({...record, tool_calls: [], answer: 'The tool is unavailable'}));
  assert.throws(() => requireToolProbe({...record, answer: result.finalReport + ' edited'}));
  assert.throws(() => requireToolProbe({...record, cleanup: {...record.cleanup, group_absent: false}}));
  const altered = structuredClone(record); altered.tool_calls[0].result.finalReport = '100';
  assert.throws(() => requireToolProbe(altered));
});
test('host execution rejects unspecified binding before executing anything', async () => {
  await assert.rejects(runHostWorkflow({prompt: 'test'}), /Explicit CLI/);
});
test('new adapter enables code-mode without enabling shell, plugins or account refresh', () => {
  const args = argumentsFor('gpt-6.1-terra');
  assert(args.includes('features.code_mode_host=true'));
  for (const feature of ['shell_tool', 'plugins', 'apps', 'multi_agent']) assert(args.includes(`features.${feature}=false`));
  assert(!args.includes('features.code_mode_host=false'));
});
test('pinning includes executable companion and rejects missing or changed companion', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'health-pin-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const cli = path.join(root, 'codex'), host = path.join(root, 'codex-code-mode-host');
  fs.writeFileSync(cli, 'synthetic CLI', {mode: 0o700});
  assert.throws(() => toolchainIdentity(cli));
  fs.writeFileSync(host, 'synthetic host', {mode: 0o700});
  const binding = toolchainIdentity(cli);
  assert.deepEqual(verifyToolchain(cli, binding), binding);
  assert.throws(() => verifyToolchain(cli, null));
  fs.writeFileSync(host, 'changed host');
  assert.throws(() => verifyToolchain(cli, binding), /mismatch/);
});
test('probe freezes one turn and rejects unapproved execution, altered plan and stale anchor', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'health-probe-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const cli = path.join(root, 'codex');
  for (const name of ['codex', 'codex-code-mode-host']) fs.writeFileSync(path.join(root, name), 'simulation', {mode: 0o700});
  const plan = freezeProbe(cli, '0.167.1');
  assert.equal(plan.liveAuthorized, false);
  assert.equal(plan.budget.submittedTurns, 1);
  const out = path.join(root, 'out');
  await assert.rejects(executeProbe(plan, plan.sha256, cli, out), /Explicit live/);
  await assert.rejects(executeProbe(plan, 'wrong', cli, out, {live: true}), /anchor/);
  await assert.rejects(executeProbe({...plan, model: 'gpt-other'}, plan.sha256, cli, out, {live: true}), /changed/);
  await assert.rejects(executeProbe(plan, plan.sha256, cli, out, {live: true, timeoutMs: 1}), /overrides/);
  assert(!fs.existsSync(out));
});
test('probe CLI freeze executes through a symlink rather than silently returning', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'health-probe-alias-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const cli = path.join(root, 'codex');
  for (const name of ['codex', 'codex-code-mode-host']) fs.writeFileSync(path.join(root, name), 'simulation', {mode: 0o700});
  const alias = path.join(root, 'probe-link.mjs');
  fs.symlinkSync(fileURLToPath(new URL('./probe.mjs', import.meta.url)), alias);
  const out = path.join(root, 'plan.json');
  const result = spawnSync(process.execPath, [alias, 'freeze', cli, '0.167.1', out], {encoding: 'utf8', timeout: 5000});
  assert.equal(result.status, 0, result.stderr);
  assert(fs.existsSync(out), 'Successful CLI exit must create the plan');
  assert.equal(JSON.parse(fs.readFileSync(out)).schema, 'health-routing-probe-v2');
});
for (const mode of ['success', 'foreign-scope', 'foreign-tool', 'foreign-item', 'wrong-model', 'timeout']) {
  test(`prospective adapter retains isolation boundary: ${mode}`, {skip: process.platform !== 'darwin'}, async t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'health-v2-'));
    t.after(() => fs.rmSync(root, {recursive: true, force: true}));
    const record = await runLoginTurn({model: 'gpt-fixture', effort: 'low', cliVersion: '0.167.1',
      enableScoreTool: true, prompt: 'Synthetic boundary control.', out: path.join(root, 'out'),
      fixtureEndpoint: 'http://127.0.0.1:1/v1', executable: process.execPath,
      prefixArgs: [fileURLToPath(new URL('../health-tool-retest/fake-cli.cjs', import.meta.url)), mode],
      timeoutMs: mode === 'timeout' ? 100 : 2000});
    assert.equal(record.status, mode === 'success' ? 'completed' : 'failed');
    assert(record.cleanup.closed && record.cleanup.group_absent && record.cleanup.private_home_removed);
  });
}
