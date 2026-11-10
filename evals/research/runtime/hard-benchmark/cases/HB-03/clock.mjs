export class Clock {
  constructor(now = 0) {
    this.now = now;
  }
  advance(ms) {
    if (ms < 0) throw Error("clock reversal");
    this.now += ms;
  }
}
export const remaining = (deadline, clock) => Math.max(0, deadline - clock.now);
