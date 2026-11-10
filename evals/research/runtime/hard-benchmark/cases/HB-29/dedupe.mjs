import { retryPolicy, retention } from "./policy.mjs";
export class Dedupe {
  constructor() {
    this.entries = new Map();
    this.ttl = retention(retryPolicy);
  }
  lookup(key, now) {
    const e = this.entries.get(key);
    if (!e) return null;
    if (now >= e.until) {
      this.entries.delete(key);
      return null;
    }
    return e.receipt;
  }
  remember(key, receipt, now) {
    this.entries.set(key, { receipt, until: now + this.ttl });
  }
}
