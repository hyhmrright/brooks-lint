export class Pool {
  constructor(capacity = 2) {
    this.capacity = capacity;
    this.used = 0;
  }
  acquire() {
    if (this.used === this.capacity) return null;
    this.used++;
    let done = false;
    return () => {
      if (!done) {
        done = true;
        this.used--;
      }
    };
  }
}
