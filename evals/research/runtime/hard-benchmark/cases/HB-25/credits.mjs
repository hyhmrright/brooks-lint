export class Credits {
  constructor(limit = 8) {
    this.limit = limit;
    this.used = 0;
  }
  take(bytes) {
    if (bytes < 0 || this.used + bytes > this.limit) return null;
    this.used += bytes;
    let done = false;
    return () => {
      if (!done) {
        done = true;
        this.used -= bytes;
      }
    };
  }
}
