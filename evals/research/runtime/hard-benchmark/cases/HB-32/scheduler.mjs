export class Scheduler {
  constructor() {
    this.jobs = [];
  }
  post(fn) {
    this.jobs.push(fn);
  }
  drain() {
    while (this.jobs.length) this.jobs.shift()();
  }
}
