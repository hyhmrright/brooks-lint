/** Prospective host-owned scoring path. Historical adapters and results stay unchanged. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {runLoginTurn} from '../health-tool-retest/login-turn.mjs';
import {finalizeTool, toolName} from '../health-tool-retest/tool.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
export const contract = `Return exactly one JSON object with only a dashboards array (one or two entries).
Each entry has only ledger and draft. Use the supplied health ledger schema.
The draft must contain exactly one <!-- BROOKS_HEALTH_SCORE --> placeholder and no numerical health score.
Do not invoke or claim to have invoked a scorer. The host will calculate, insert and verify the score after your answer.
Do not wrap JSON in Markdown. Missing evidence must remain unassessed; never invent a finding to fill the ledger.
This is a host-rendered report workflow, not a test of your tool-calling ability.`;

export function renderEnvelope(answer, expectedReports = 1) {
  if (![1, 2].includes(expectedReports)) throw Error('Expected one or two reports');
  if (typeof answer !== 'string' || Buffer.byteLength(answer) > 131072) throw Error('Invalid or oversized envelope');
  const envelope = JSON.parse(answer);
  const result = finalizeTool(envelope);
  if (result.reports.length !== expectedReports) throw Error('Wrong dashboard count');
  return {protocol: 'host-rendered-health-v2', rawAnswerSha256: hash(answer),
    finalReport: result.finalReport, receipts: result.reports.map(report => report.receipt),
    modelToolInvocation: false,
    limitation: 'Host verification proves arithmetic consistency with the submitted ledger, not diagnosis correctness.'};
}

/** Mechanical gate before any future dynamic-tool campaign; no textual success substitutes for a call. */
export function requireToolProbe(record) {
  if (record.status !== 'completed' || !record.cleanup?.closed || !record.cleanup?.group_absent || !record.cleanup?.private_home_removed) throw Error('Incomplete probe or cleanup');
  const calls = record.tool_calls ?? [];
  if (calls.length !== 1 || !calls[0].success) throw Error('Exactly one successful scorer call required');
  const call = calls[0];
  const expected = finalizeTool(call.arguments);
  if (JSON.stringify(call.result) !== JSON.stringify(expected) || record.answer !== expected.finalReport) throw Error('Probe result does not match host scoring');
  return {protocol: 'direct-tool-probe-v2', tool: toolName, passed: true,
    simulation: record.simulation, selectedModel: record.cli_selected_model,
    limitation: 'One successful probe is necessary, not proof of subsequent task compliance.'};
}

/** Opt-in single turn; caller must supply the frozen model, CLI version and time budget. */
export async function runHostWorkflow(options) {
  if (!options?.cliVersion || !options.model || !options.effort || !Number.isInteger(options.timeoutMs)) throw Error('Explicit CLI, model, effort and deadline required');
  if (options.enableScoreTool || options.prompt?.includes(contract)) throw Error('Pass an ordinary task; the host owns the protocol');
  const {expectedReports = 1, ...transport} = options;
  if (![1, 2].includes(expectedReports) || typeof transport.prompt !== 'string' || !transport.prompt.trim()) throw Error('Task and expected report count required');
  const record = await runLoginTurn({...transport, enableScoreTool: false, prompt: `${transport.prompt}\n\n${contract}`});
  const report = {protocol: 'host-rendered-health-v2', simulation: record.simulation,
    requestedModel: record.requested_model, selectedModel: record.cli_selected_model,
    effort: record.cli_selected_effort, cliVersion: record.cli_version,
    rawRecordSha256: hash(fs.readFileSync(path.join(options.out, 'record.json'))),
    status: 'failed', modelToolInvocation: false};
  try {
    if (record.status !== 'completed') throw Error('Transport failed; raw record retained');
    Object.assign(report, renderEnvelope(record.answer, expectedReports), {status: 'completed'});
  } catch (error) { report.error = error.message; }
  // Never replace the original model answer with the host-generated report.
  fs.writeFileSync(path.join(options.out, 'host-report.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx', mode: 0o600});
  return report;
}
