import { WorkerPool } from './worker-pool.mjs';

/** One worker and two waiting slots; expiry applies to waiting requests only. */
export class ExpiringQueue {
  constructor({ clock, checkExpiry }) {
    this.clock = clock;
    this.checkExpiry = checkExpiry;
    this.pool = new WorkerPool({ capacity: 1, maxQueue: 2 });
  }
  run(operation, { signal, expiresAt }) {
    if (signal.aborted) return Promise.resolve({ status: 'cancelled' });
    if (this.checkExpiry && expiresAt <= this.clock.now) return Promise.resolve({ status: 'expired' });
    const controller = new AbortController();
    let expired = false;
    let cancelExpiry = () => {};
    const onAbort = () => controller.abort(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    if (this.checkExpiry) cancelExpiry = this.clock.schedule(expiresAt - this.clock.now, () => {
      expired = true;
      controller.abort(new Error('Waiting request expired'));
    });
    return this.pool.run(childSignal => {
      // Once admitted, the operation owns its own running-work lifetime.
      cancelExpiry();
      return operation(childSignal);
    }, { signal: controller.signal }).then(result => expired ? { status: 'expired' } : result)
      .finally(() => { cancelExpiry(); signal.removeEventListener('abort', onAbort); });
  }
  get active() { return this.pool.active; }
  get queued() { return this.pool.queued; }
}
