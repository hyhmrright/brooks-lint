export class Scheduler {
  constructor() {
    this.jobs = [];
  }
  post(fn) {
    this.jobs.push(fn);
  }
  step() {
    const fn = this.jobs.shift();
    if (fn) fn();
    return !!fn;
  }
  drain() {
    while (this.step()) {}
  }
}
