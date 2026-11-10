export class Transport {
  constructor(clock, outcomes) {
    this.clock = clock;
    this.outcomes = [...outcomes];
    this.starts = [];
  }
  attempt() {
    this.starts.push(this.clock.now);
    const item = this.outcomes.shift();
    if (!item) throw Error("unscripted attempt");
    this.clock.advance(item.duration);
    return item.ok;
  }
}
