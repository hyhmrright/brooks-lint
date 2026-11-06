#!/usr/bin/env node
/** JSON-only offline tooling. New output files are never overwritten. */
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createPlan, validatePlan, responseTemplate, summarize, reviewPackets, turnInputs } from './study.mjs';
const [command, input, trustedDigest, extra] = process.argv.slice(2);
const read = file => JSON.parse(readFileSync(file, 'utf8'));
let result, output;
if (command === 'plan') { result = createPlan(read(input)); output = trustedDigest; }
else if (command === 'template') { result = responseTemplate(read(input), trustedDigest); output = extra; }
else if (command === 'validate') { validatePlan(read(input), trustedDigest); result = { validated: trustedDigest, live_execution: false }; output = extra; }
else if (command === 'summary' || command === 'packets') {
  const out = process.argv[6]; result = (command === 'summary' ? summarize : reviewPackets)(read(input), read(extra), trustedDigest); output = out;
} else if (command === 'turn') { result = turnInputs(read(input), read(extra), trustedDigest); output = process.argv[6]; }
else throw new Error('Commands: plan CONFIG OUT; template|validate PLAN TRUSTED_DIGEST OUT; summary|packets PLAN TRUSTED_DIGEST RESPONSES OUT; turn PLAN TRUSTED_DIGEST TURN OUT');
assert(output, 'Output path required');
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
