import { WorkerPool } from './worker-pool.mjs';
/** Logical wrappers use the supplied underlying admission resource. */
export function makeTransportRoutes({ reserved, work }) {
  const optional = new WorkerPool({ capacity: reserved ? 1 : 2, maxQueue: 0 });
  const essential = reserved ? new WorkerPool({ capacity: 1, maxQueue: 0 }) : optional;
  const wrapper = (pool) => ({ run: (signal) => pool.run((s) => work.open({ signal: s }), { signal }) });
  return { optional: wrapper(optional), essential: wrapper(essential), pools: [...new Set([optional, essential])] };
}
