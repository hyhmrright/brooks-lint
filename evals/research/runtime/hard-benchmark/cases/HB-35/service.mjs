export class Worker {
  constructor(scheduler, wire) {
    this.scheduler = scheduler;
    this.wire = wire;
    this.closed = false;
    this.active = new Set();
    this.pending = new Set();
    this.drained = false;
  }
  start() {
    if (this.closed) return null;
    const id = this.wire.start();
    this.active.add(id);
    return id;
  }
  settle(id, ok) {
    if (!this.active.delete(id)) return;
    this.wire.finish(id);
    if (!ok && !this.closed) {
      const timer = this.scheduler.later(10, () => {
        this.pending.delete(timer);
        this.start();
        this.check();
      });
      this.pending.add(timer);
    }
    this.check();
  }
  check() {
    if (this.closed && this.active.size === 0 && this.pending.size === 0)
      this.drained = true;
  }
  shutdown() {
    this.closed = true;
    for (const timer of this.pending) this.scheduler.cancel(timer);
    this.pending.clear();
    this.check();
    return this.drained;
  }
}
