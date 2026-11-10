export class Sink {
  constructor(name, required = true) {
    this.name = name;
    this.required = required;
    this.pending = new Map();
  }
  enqueue(id, bytes, onDrain) {
    this.pending.set(id, { bytes, onDrain });
  }
  drain(id) {
    const f = this.pending.get(id);
    if (!f) return;
    this.pending.delete(id);
    f.onDrain(this.name);
  }
  retained() {
    return [...this.pending.values()].reduce((n, f) => n + f.bytes, 0);
  }
}
