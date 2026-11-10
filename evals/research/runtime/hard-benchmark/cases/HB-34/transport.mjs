export class Wire {
  constructor() {
    this.started = 0;
    this.active = new Set();
  }
  start() {
    const id = ++this.started;
    this.active.add(id);
    return id;
  }
  finish(id) {
    this.active.delete(id);
  }
}
