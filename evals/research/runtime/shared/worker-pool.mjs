/** Bounded FIFO admission; operation promises own a worker until settlement. */
export class WorkerPool {
  #active = 0;
  #queue = [];

  constructor({ capacity, maxQueue }) {
    if (!Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(maxQueue) || maxQueue < 0) {
      throw new Error('Invalid pool bounds');
    }
    this.capacity = capacity;
    this.maxQueue = maxQueue;
  }

  run(operation, { signal }) {
    if (signal.aborted) return Promise.resolve({ status: 'cancelled' });
    if (this.#active === this.capacity && this.#queue.length === this.maxQueue) {
      return Promise.resolve({ status: 'overloaded' });
    }
    return new Promise((resolve) => {
      const entry = { operation, signal, resolve };
      entry.onAbort = () => {
        this.#queue.splice(this.#queue.indexOf(entry), 1);
        signal.removeEventListener('abort', entry.onAbort);
        resolve({ status: 'cancelled' });
      };
      if (this.#active < this.capacity) this.#start(entry);
      else {
        this.#queue.push(entry);
        signal.addEventListener('abort', entry.onAbort, { once: true });
      }
    });
  }

  #start(entry) {
    entry.signal.removeEventListener('abort', entry.onAbort);
    this.#active++;
    const finish = (result) => {
      this.#active--;
      entry.resolve(result);
      const next = this.#queue.shift();
      if (next) this.#start(next);
    };
    try {
      Promise.resolve(entry.operation(entry.signal)).then(
        (value) => finish({ status: 'ok', value }),
        () => finish({ status: entry.signal.aborted ? 'cancelled' : 'error' }),
      );
    } catch {
      finish({ status: entry.signal.aborted ? 'cancelled' : 'error' });
    }
  }

  get active() { return this.#active; }
  get queued() { return this.#queue.length; }
}
