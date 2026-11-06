/** Fake dependency: each pending call owns one slot until completion or abort. */
export class FakeTransport {
  #operations = new Map();
  #nextId = 0;
  started = 0;
  completed = 0;
  aborted = 0;

  fetchQuote({ signal } = {}) {
    if (signal?.aborted) return Promise.reject(signal.reason);
    const id = ++this.#nextId;
    this.started += 1;
    return new Promise((resolve, reject) => {
      const release = () => {
        signal?.removeEventListener('abort', onAbort);
        this.#operations.delete(id);
      };
      const onAbort = () => {
        release();
        this.aborted += 1;
        reject(signal.reason);
      };
      this.#operations.set(id, {
        complete: (value) => {
          release();
          this.completed += 1;
          resolve(value);
        },
        dispose: () => {
          release();
          reject(new Error('Fixture teardown'));
        },
      });
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  completeAll(value = 42) {
    for (const operation of [...this.#operations.values()]) operation.complete(value);
  }

  // Test teardown only. Measurements must happen before this artificial cleanup.
  dispose() {
    for (const operation of [...this.#operations.values()]) operation.dispose();
  }

  get active() { return this.#operations.size; }
}
