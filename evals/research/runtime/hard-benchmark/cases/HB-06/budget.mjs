export class Budget {
  constructor(limit) {
    this.left = limit;
  }
  take() {
    if (this.left === 0) return false;
    this.left--;
    return true;
  }
}
