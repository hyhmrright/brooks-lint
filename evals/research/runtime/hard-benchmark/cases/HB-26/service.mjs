export class Fanout {
  constructor(credits, sinks) {
    this.credits = credits;
    this.sinks = sinks;
    this.seq = 0;
  }
  send(bytes) {
    const release = this.credits.take(bytes);
    if (!release) return null;
    const id = ++this.seq;
    const awaiting = new Set(
      this.sinks.filter((s) => s.required).map((s) => s.name),
    );
    const drained = (name) => {
      awaiting.delete(name);
      if (awaiting.size === 0) release();
    };
    for (const sink of this.sinks) sink.enqueue(id, bytes, drained);
    if (awaiting.size === 0) release();

    return id;
  }
}
