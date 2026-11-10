export class Flight {
  constructor() {
    this.waiters = new Map();
    this.cancelled = false;
  }
  join(id) {
    const state = { status: "waiting" };
    this.waiters.set(id, state);
    return state;
  }
  abort() {
    this.cancelled = true;
  }
  finish(value) {
    for (const state of this.waiters.values()) {
      state.status = this.cancelled ? "cancelled" : "complete";
      state.value = this.cancelled ? null : value;
    }
    this.waiters.clear();
  }
}
