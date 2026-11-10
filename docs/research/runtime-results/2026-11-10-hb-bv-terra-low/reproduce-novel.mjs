// Bounded state witness; reachability from zero is the proof in the amendment.
import assert from 'node:assert/strict';
import { createStore, write } from '../../../../evals/research/runtime/benchmark-v2/cases/BV-05/store.mjs';
import { beginRead, finishRead } from '../../../../evals/research/runtime/benchmark-v2/cases/BV-05/cache.mjs';
import { readNow } from '../../../../evals/research/runtime/benchmark-v2/cases/BV-05/service.mjs';
export function reproduce() {
  const ordinary = createStore();
  const old = beginRead(ordinary);
  write(ordinary, 'new');
  assert.equal(finishRead(ordinary, old), 'old');
  assert.equal(readNow(ordinary), 'new');
  const boundary = createStore();
  // Test setup, not a claimed caller mutation. Symbolic reachability is separate.
  boundary.generation = 2 ** 53 - 1;
  write(boundary, 'old');
  assert.equal(boundary.generation, 2 ** 53);
  const captured = beginRead(boundary);
  write(boundary, 'new');
  assert.equal(boundary.generation, 2 ** 53);
  assert.equal(finishRead(boundary, captured), 'old');
  assert.equal(readNow(boundary), 'old');
  return { ordinaryControl: 'new', boundaryHit: 'old', generation: boundary.generation, wholeLifetimeExecuted: false };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) console.log(JSON.stringify(reproduce(), null, 2));
