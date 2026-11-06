/** A deterministic logical clock. Units are not elapsed milliseconds. */
export class ManualClock {
  now = 0;
  #nextId = 0;
  #timers = new Map();

  schedule(delay, callback) {
    if (!Number.isFinite(delay) || delay < 0) throw new Error('Invalid delay');
    const id = ++this.#nextId;
    this.#timers.set(id, { at: this.now + delay, callback });
    return () => this.#timers.delete(id);
  }

  advanceTo(time) {
    if (!Number.isFinite(time) || time < this.now) throw new Error('Clock cannot go backwards');
    while (true) {
      const next = [...this.#timers].filter(([, timer]) => timer.at <= time)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      this.now = next[1].at;
      this.#timers.delete(next[0]);
      next[1].callback();
    }
    this.now = time;
  }

  get pendingTimers() { return this.#timers.size; }
}
