/** One prospective, opt-in live routing probe. Never starts a benchmark automatically. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {runLoginTurn, toolchainIdentity, verifyToolchain} from './login-turn.mjs';
import {requireToolProbe} from '../health-workflow-v2/workflow.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const digest = value => createHash('sha256').update(value).digest('hex');
const files = ['evals/research/health-transport-v3/login-turn.mjs', 'evals/research/health-workflow-v2/workflow.mjs',
  'evals/research/health-transport-v3/probe.mjs', 'evals/research/health-tool-retest/tool.mjs',
  'evals/research/health-tool-retest/login-turn.mjs', 'skills/brooks-health/scripts/score-dashboard.mjs'];
export function proxyBinding() {
 const keys=['http_proxy','https_proxy','all_proxy','no_proxy','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY'];
 const present=keys.filter(key=>process.env[key]);
 if(!present.some(key=>!/no_proxy/i.test(key)))throw Error('Explicit proxy environment required');
 return {keys:present,sha256:digest(JSON.stringify(present.map(key=>[key,process.env[key]])))};
}
const sources = () => Object.fromEntries(files.map(file => [file, digest(fs.readFileSync(path.join(root, file)))]));
const cleanLedger = {strictness: 'balanced', hasDiff: true, dimensions: Object.fromEntries(
  ['pr', 'architecture', 'debt', 'test'].map(key => [key, {status: 'assessed', findings: []}]))};
const args = {dashboards: [{ledger: cleanLedger, draft: '# Health Dashboard\n<!-- BROOKS_HEALTH_SCORE -->'}]};
export const prompt = `This is a tool routing probe, not a code review. Invoke brooks_health_finalize exactly once with the following arguments. If exposed inside functions.exec, call text(await tools.brooks_health_finalize(arguments)). Return the tool's finalReport unchanged. Do not use any other tools or calculate a replacement report. If the call cannot complete, report the observed failure without claiming success.\n${JSON.stringify(args)}`;
export function assessProbe(record) {
  const verdict = requireToolProbe(record);
  assert.deepEqual(record.tool_calls[0].arguments, args, 'Probe must score the supplied ledger and draft');
  return verdict;
}
export function freezeProbe(executable, cliVersion, model = 'gpt-6.1-terra', effort = 'low') {
  assert(/^gpt-[A-Za-z0-9._-]+$/.test(model));
  assert(['low', 'medium', 'high', 'xhigh'].includes(effort));
  assert(/^\d+\.\d+\.\d+$/.test(cliVersion));
  const plan = {schema: 'health-transport-probe-v3', transport:{proxy:proxyBinding(),stopOnObservedRetry:true,httpsOnlyVerified:false}, liveAuthorized: false, model, effort, cliVersion,
    toolchain: toolchainIdentity(executable), sources: sources(), prompt,
    budget: {submittedTurns: 1, timeoutMs: 120000, cleanupMs: 3000, outputBytes: 2097152,
      automaticRetries: 0, continuation: false,
      limitation: 'Provider internal retries and failed-turn billing cannot be hard capped by this client. No batch or automatic recovery is authorized.'}};
  return {...plan, sha256: digest(JSON.stringify(plan))};
}
export async function executeProbe(plan, anchor, executable, out, {live = false, ...overrides} = {}) {
  assert.equal(Object.keys(overrides).length, 0, 'No runtime overrides');
  const {sha256, ...body} = plan;
  assert.equal(digest(JSON.stringify(body)), sha256, 'Frozen plan changed');
  assert.equal(sha256, anchor, 'Wrong externally recorded anchor');
  assert.equal(plan.schema, 'health-transport-probe-v3');
  assert.deepEqual(plan.sources, sources(), 'Source changed since freeze');
  assert.equal(plan.prompt, prompt);
  assert.equal(plan.budget.submittedTurns, 1);
  assert.equal(plan.budget.timeoutMs, 120000);
  assert.equal(live, true, 'Explicit live authorization required');
  assert.deepEqual(plan.transport.proxy,proxyBinding(),'Proxy environment changed since freeze');
  verifyToolchain(executable, plan.toolchain);
  assert(!fs.existsSync(out), 'New output directory required');
  const record = await runLoginTurn({model: plan.model, effort: plan.effort, cliVersion: plan.cliVersion,
    toolchain: plan.toolchain, executable, inheritProxy:true, live, enableScoreTool: true, prompt: plan.prompt,
    timeoutMs: plan.budget.timeoutMs, out});
  let verdict;
  try {
    verdict = assessProbe(record);
  } catch (error) { verdict = {passed: false, error: error.message}; }
  const result = {planSha256: anchor, verdict, rawRecordSha256: digest(fs.readFileSync(path.join(out, 'record.json'))),
    automaticContinuation: false, nextStep: 'Review this probe before separately authorizing any batch.'};
  fs.writeFileSync(path.join(out, 'probe-result.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
  return result;
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const [command, ...argv] = process.argv.slice(2);
  if (command === 'freeze') {
    assert.equal(argv.length, 3, 'freeze EXECUTABLE CLI_VERSION NEW_PLAN');
    fs.writeFileSync(argv[2], JSON.stringify(freezeProbe(argv[0], argv[1]), null, 2) + '\n', {flag: 'wx'});
  } else if (command === 'execute') {
    assert.equal(argv.length, 5, 'execute PLAN ANCHOR EXECUTABLE NEW_OUTPUT --live');
    assert.equal(argv[4], '--live');
    console.log(JSON.stringify(await executeProbe(JSON.parse(fs.readFileSync(argv[0])), argv[1], argv[2], argv[3], {live: true})));
  } else throw Error('Use freeze or execute (explicit --live only)');
}
