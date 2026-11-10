export class Ledger {
  constructor() {
    this.value = 0;
    this.records = [];
  }
  apply(key, delta) {
    this.value += delta;
    const receipt = {
      sequence: this.records.length + 1,
      value: this.value,
      key,
    };
    this.records.push(receipt);
    return receipt;
  }
}
