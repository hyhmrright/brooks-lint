import { Flight } from "./flight.mjs";
export class Registry {
  constructor() {
    this.flights = new Map();
  }
  subscribe(key, id) {
    let f = this.flights.get(key);
    if (!f) {
      f = new Flight();
      this.flights.set(key, f);
    }
    const state = f.join(id);
    let active = true;
    return {
      state,
      cancel: () => {
        if (!active || state.status !== "waiting") return;
        active = false;
        state.status = "cancelled";
        f.waiters.delete(id);
        f.abort();
      },
    };
  }
  complete(key, value) {
    const f = this.flights.get(key);
    if (!f) return;
    f.finish(value);
    this.flights.delete(key);
  }
}
