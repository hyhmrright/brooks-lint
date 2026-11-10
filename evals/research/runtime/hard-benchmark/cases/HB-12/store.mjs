export class Store {
  constructor(leases) {
    this.leases = leases;
    this.values = new Map();
    this.log = [];
  }
  commit(token, value) {
    const current = this.leases.current.get(token.key);
    if (!current || current.generation !== token.generation) return false;
    this.values.set(token.key, value);
    this.log.push({ generation: token.generation, value });
    return true;
  }
}
