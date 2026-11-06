import { WorkerPool } from '../shared/worker-pool.mjs';

export function createService({ work }) {
  const optionalPool = new WorkerPool({ capacity: 2, maxQueue: 2 });
  const essentialPool = optionalPool;
  return {
    optionalPool,
    essentialPool,
    optional: ({ signal }) => optionalPool.run((signal) => work.open({ signal }), { signal }),
    essential: ({ signal }) => essentialPool.run(() => 17, { signal }),
  };
}
