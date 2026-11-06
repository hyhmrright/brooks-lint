/** Manually settled, cancellation-aware optional dependency operations. */
export class OptionalWork {
  started = 0;
  #pending = new Map();

  open({ signal }) {
    if (signal.aborted) return Promise.reject(signal.reason);
    const id = ++this.started;
    return new Promise((resolve, reject) => {
      const release = () => {
        signal.removeEventListener('abort', onAbort);
        this.#pending.delete(id);
      };
      const onAbort = () => { release(); reject(signal.reason); };
      this.#pending.set(id, {
        complete: (value) => { release(); resolve(value); },
        fail: () => { release(); reject(new Error('Optional dependency failed')); },
      });
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  completeNext(value = 42) {
    const pending = this.#pending.values().next().value;
    if (!pending) throw new Error('No pending work');
    pending.complete(value);
  }

  failNext() {
    const pending = this.#pending.values().next().value;
    if (!pending) throw new Error('No pending work');
    pending.fail();
  }

  get active() { return this.#pending.size; }
}
