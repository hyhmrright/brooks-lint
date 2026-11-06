import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scoreExample, summarizeExamples } from './scoring.mjs';
export function validateCalibration(data = JSON.parse(readFileSync(new URL('./examples.json', import.meta.url)))) {
  assert.equal(data.version, 1); assert.equal(data.protocol, 'runtime-scoring-protocol-v1');
  assert(typeof data.authorship === 'string');
  for (const example of data.examples) assert.deepEqual(scoreExample(example), example.expected, example.id);
  return { protocol: data.protocol, purpose: 'Authored synthetic calibration annotations, not observed model performance or human validation.', ...summarizeExamples(data.examples) };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) console.log(JSON.stringify(validateCalibration(), null, 2));
