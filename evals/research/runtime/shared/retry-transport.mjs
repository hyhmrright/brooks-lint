/** One manually settled, cancellation-aware synthetic dependency operation at a time. */
export class RetryTransport {
  started = 0;
  failed = 0;
  completed = 0;
  aborted = 0;
  #pending;

  fetchQuote({ signal }) {
    if (signal.aborted) return Promise.reject(signal.reason);
    if (this.#pending) throw new Error('Concurrent dependency call');
    this.started++;
    return new Promise((resolve, reject) => {
      const release = () => {
        signal.removeEventListener('abort', onAbort);
        this.#pending = undefined;
      };
      const onAbort = () => { release(); this.aborted++; reject(signal.reason); };
      this.#pending = {
        fail: (retryable) => {
          release(); this.failed++;
          const error = new Error('Dependency failure');
          error.retryable = retryable;
          reject(error);
        },
        complete: (value) => { release(); this.completed++; resolve(value); },
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  failNext(retryable = true) {
    if (!this.#pending) throw new Error('No pending operation');
    this.#pending.fail(retryable);
  }

  completeNext(value = 42) {
    if (!this.#pending) throw new Error('No pending operation');
    this.#pending.complete(value);
  }

  get active() { return this.#pending ? 1 : 0; }
}
