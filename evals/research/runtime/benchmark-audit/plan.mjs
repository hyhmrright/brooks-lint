// Offline preparation only. No child process, network, credentials or model calls.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { validate as validateHB, exportInputs } from '../hard-benchmark/suite.mjs';
import { validate as validateBV, checkFreeze, exportCase } from '../benchmark-v2/suite.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function catalog() {
  const hb = validateHB();
  const bv = validateBV();
  checkFreeze();
  return [
    ...hb.cases.map(c => ({ id: c.id, family: `HB/${c.family}`, kind: c.kind, split: c.split })),
    ...bv.cases.map(c => ({ id: c.id, family: `BV/${c.family}`, kind: c.kind,
      split: bv.families.find(f => f.id === c.family).split })),
  ];
}
export function inputBundle(id) {
  if (/^HB-\d{2}$/.test(id)) return exportInputs(id);
  if (/^BV-\d{2}$/.test(id)) {
    checkFreeze();
    return { files: Object.entries(exportCase(id)).map(([path, content]) => ({ path, content })) };
  }
  throw Error('Unknown local case; external candidates are not admitted');
}
export function prepare({ split = 'calibration', repetitions = 1, seed = 20261110 } = {}) {
  if (!['calibration', 'development-reserved', 'all'].includes(split)) throw Error('Invalid split');
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 3) throw Error('Repetitions must be 1..3');
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw Error('Seed must be a nonzero uint32');
  const cases = catalog().filter(c => split === 'all' || c.split === split).map(c => ({
    ...c, inputSha256: digest(JSON.stringify(inputBundle(c.id))),
  }));
  const turns = [];
  for (const c of cases) for (let repetition = 1; repetition <= repetitions; repetition++) {
    for (const arm of ['A', 'B', 'C']) turns.push({ caseId: c.id, repetition, arm });
  }
  let state = seed;
  const next = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
  for (let i = turns.length - 1; i > 0; i--) {
    const j = Math.floor((next() / 0x100000000) * (i + 1));
    [turns[i], turns[j]] = [turns[j], turns[i]];
  }
  return { revision: 1, status: 'offline-schedule-draft-not-live-plan', liveAuthorized: false,
    model: null, budget: null, guidanceDigests: null, runnerAdapter: null,
    split, repetitions, seed, turnCount: turns.length,
    corpusDigests: Object.fromEntries(['hard-benchmark', 'benchmark-v2'].map(name => [name,
      digest(readFileSync(new URL(`../${name}/freeze.json`, import.meta.url)))])),
    exposure: 'public same-workflow development; not independent holdout',
    interpretation: 'Families share mechanisms across suites; do not treat family count as statistical independence.',
    cases, turns };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, value, repeats] = process.argv.slice(2);
  const result = command === 'export' ? inputBundle(value)
    : command === 'prepare' ? prepare({ split: value ?? 'calibration', repetitions: repeats === undefined ? 1 : Number(repeats) })
    : command === 'catalog' ? catalog() : null;
  if (!result) throw Error('Usage: plan.mjs catalog|export ID|prepare [calibration|development-reserved|all] [1..3]');
  console.log(JSON.stringify(result, null, 2));
}
