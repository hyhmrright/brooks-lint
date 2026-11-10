export class Clock {
  constructor() {
    this.now = 0;
  }
  advance(ms) {
    this.now += ms;
  }
}
