import { WorkerPool } from '../shared/worker-pool.mjs';

export function createService({ work }) {
  const optionalPool = new WorkerPool({ capacity: 1, maxQueue: 1 });
  const essentialPool = new WorkerPool({ capacity: 1, maxQueue: 1 });
  return {
    optionalPool,
    essentialPool,
    optional: ({ signal }) => optionalPool.run((signal) => work.open({ signal }), { signal }),
    essential: ({ signal }) => essentialPool.run(() => 17, { signal }),
  };
}
