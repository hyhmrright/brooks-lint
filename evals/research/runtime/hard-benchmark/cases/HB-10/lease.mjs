export class Leases {
  constructor() {
    this.next = 0;
    this.current = new Map();
  }
  acquire(key, owner, now, ttl) {
    const prior = this.current.get(key);
    if (prior && prior.until > now) return null;
    const token = { key, owner, generation: ++this.next, until: now + ttl };
    this.current.set(key, token);
    return token;
  }
}
