/** Original deterministic controls; no wall clock, network or model calls. */
export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
export class SlotPool {
  #leases = new Set();
  constructor(capacity = 1) { this.capacity = capacity; this.started = 0; this.released = 0; }
  acquire() {
    if (this.#leases.size >= this.capacity) throw new Error('capacity');
    const lease = Symbol('lease'); this.#leases.add(lease); this.started++; return lease;
  }
  release(lease) { if (this.#leases.delete(lease)) { this.released++; return true; } return false; }
  get active() { return this.#leases.size; }
}
