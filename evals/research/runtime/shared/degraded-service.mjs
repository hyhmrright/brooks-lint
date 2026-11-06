import { WorkerPool } from './worker-pool.mjs';
/** Detail can be omitted only when the supplied response contract permits it. */
export function makeDegradedService({ shedOptional, detail }) {
  const pool = new WorkerPool({ capacity: 2, maxQueue: 0 });
  let optionalActive = 0;
  return {
    pool,
    optional(signal) {
      if (signal.aborted) return Promise.resolve({ status: 'cancelled' });
      if (shedOptional && optionalActive >= 1) return Promise.resolve({ status: 'shed' });
      return pool.run(async (s) => {
        optionalActive++;
        try { return await detail.open({ signal: s }); }
        finally { optionalActive--; }
      }, { signal });
    },
    essential(signal) {
      return pool.run(() => ({ essential: 17, detail: null, degraded: true }), { signal });
    },
  };
}
