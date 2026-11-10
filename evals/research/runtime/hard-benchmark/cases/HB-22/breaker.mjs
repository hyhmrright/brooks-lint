export class Breaker {
  constructor(clock) {
    this.clock = clock;
    this.mode = "closed";
    this.epoch = 0;
    this.seq = 0;
    this.probe = null;
    this.until = 0;
    this.completed = new Set();
    this.metrics = [];
  }
  enter() {
    if (this.mode === "open") {
      if (this.clock.now < this.until) return null;
      this.mode = "half-open";
    }
    if (this.mode === "half-open" && this.probe) return null;
    const lease = { epoch: this.epoch, seq: ++this.seq };
    if (this.mode === "half-open") this.probe = lease;
    return lease;
  }
  open() {
    this.mode = "open";
    this.epoch++;
    this.until = this.clock.now + 10;
    this.probe = null;
  }
  settle(lease, ok) {
    if (this.completed.has(lease.seq)) return;
    this.completed.add(lease.seq);
    this.metrics.push({ seq: lease.seq, ok });
    if (this.mode === "half-open") {
      if (
        !this.probe ||
        lease.epoch !== this.probe.epoch ||
        lease.seq !== this.probe.seq
      )
        return;
      this.probe = null;
      if (ok) this.mode = "closed";
      else this.open();
      return;
    }
    if (this.mode === "closed" && lease.epoch === this.epoch && !ok)
      this.open();
  }
}
