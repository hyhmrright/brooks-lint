export class Operation {
  constructor(release) {
    this.running = true;
    this.cancelRequested = false;
    this.release = release;
  }
  cancel() {
    this.cancelRequested = true;
  }
  complete() {
    if (this.running) {
      this.running = false;
      this.release();
    }
  }
  acknowledgeCancel() {
    if (!this.cancelRequested) throw Error("no cancel request");
    this.complete();
  }
}
