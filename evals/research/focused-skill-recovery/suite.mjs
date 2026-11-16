import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {anchored as parent, hash, read, root, write} from '../focused-skill-retest/suite.mjs';
import {verify as verifyParent} from '../focused-skill-retest/runner.mjs';

export {hash, read, root, write};
const directory = path.dirname(fileURLToPath(import.meta.url));
const original = path.join(root, 'docs/research/focused-skill-retest/results/2026-11-16-stopped');

function hashes(dir, names) {
  return Object.fromEntries(names.sort().map(name => [name, hash(fs.readFileSync(path.join(dir, name)))]));
}

function freeze() {
  const base = parent();
  const {state, records} = verifyParent(original);
  assert.equal(records.length, 1);
  assert.equal(records[0].status, 'failed');
  assert.deepEqual(records[0].raw.requests.map(r => r.method), ['initialize', 'account/read']);
  assert.equal(records[0].raw.usage, null);
  const prior = {attempts: 1, modelTurnRequests: 0, observedTokens: state.observedTokens, elapsedMs: state.elapsedMs};
  const {sha256: parentSha256, ...protocol} = base;
  const body = {
    ...protocol,
    stage: 'recovery',
    parentSha256,
    prior,
    budget: {...base.budget, totalMs: base.budget.totalMs - prior.elapsedMs},
    historicalFiles: hashes(original, fs.readdirSync(original, {recursive: true})
      .filter(name => fs.statSync(path.join(original, name)).isFile())),
    recoverySources: hashes(directory, fs.readdirSync(directory).filter(name => /\.(mjs|cjs)$/.test(name))),
    recoveryPolicy: {
      lifetimeExecutorAttempts: 37,
      maxModelTurnRequests: 36,
      accountReadRequiredBeforeEveryTurn: true,
      accountDiagnosticDoesNotSubmitTurns: true,
      requireNetworkCapableOuterRunner: true,
      requireKernelGroupAbsenceAndClose: true,
      noAutomaticRetryOrNetworkFallback: true,
    },
  };
  return {...body, sha256: hash(JSON.stringify(body))};
}

export function validate(plan) {
  assert.deepEqual(plan, freeze(), 'Recovery source, history, or input drift');
}

function manifest(plan) {
  const {sha256, parentSha256, model, effort, cliVersion, budget, prior, historicalFiles,
    recoverySources, recoveryPolicy} = plan;
  return {sha256, parentSha256, model, effort, cliVersion, budget, prior, historicalFiles,
    recoverySources, recoveryPolicy};
}

export function anchored(stage = 'recovery') {
  assert.equal(stage, 'recovery');
  const plan = freeze();
  assert.deepEqual(manifest(plan), read(path.join(directory, 'freeze.json')), 'Recovery freeze drift');
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'freeze') {
    const plan = freeze();
    write(path.join(directory, 'freeze.json'), manifest(plan));
  }
  const {sha256, model, effort, budget, prior} = anchored();
  console.log(JSON.stringify({sha256, model, effort, budget, prior}));
}
