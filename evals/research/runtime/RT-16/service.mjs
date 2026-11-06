import { WorkerPool } from '../shared/worker-pool.mjs';

export function createService({ work }) {
  const queue = new WorkerPool({ capacity: 1, maxQueue: 2 });
  return { queue, submit: ({ signal }) => queue.run(childSignal => work.open({ signal: childSignal }), { signal }) };
}
