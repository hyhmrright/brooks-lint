import { Connection } from "./connection.mjs";
export class Pool {
  constructor(scheduler) {
    this.connection = new Connection(scheduler);
    this.available = true;
  }
  acquire(tenant) {
    if (!this.available || this.connection.dead) return null;
    this.available = false;
    const c = this.connection;
    c.bind(tenant);
    let active = true;
    return {
      query: () => {
        if (!active) throw Error("released lease");
        return c.query({ tenant });
      },
      release: (fail = false) => {
        if (!active) return;
        active = false;
        c.reset((ok) => {
          this.available = ok;
        }, fail);
        this.available = true;
      },
    };
  }
}
