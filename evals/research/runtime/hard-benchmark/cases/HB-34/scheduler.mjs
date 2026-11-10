export class Scheduler {
  constructor() {
    this.now = 0;
    this.next = 0;
    this.jobs = new Map();
  }
  later(delay, fn) {
    const id = ++this.next;
    this.jobs.set(id, { at: this.now + delay, fn });
    return id;
  }
  cancel(id) {
    this.jobs.delete(id);
  }
  dequeue() {
    const pair = [...this.jobs].sort((a, b) => a[1].at - b[1].at)[0];
    if (!pair) return null;
    this.jobs.delete(pair[0]);
    this.now = pair[1].at;
    return pair[1].fn;
  }
  run() {
    let fn;
    while ((fn = this.dequeue())) fn();
  }
}
