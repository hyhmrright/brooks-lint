export class Connection {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.tenant = null;
    this.resetting = false;
    this.dead = false;
    this.pendingBind = null;
  }
  bind(tenant) {
    if (this.resetting) this.pendingBind = tenant;
    else this.tenant = tenant;
  }
  query(envelope) {
    if (this.dead) throw Error("closed");
    return { requested: envelope.tenant, session: this.tenant };
  }
  reset(done, fail = false) {
    this.resetting = true;
    this.scheduler.post(() => {
      this.resetting = false;
      if (fail) {
        this.dead = true;
        done(false);
        return;
      }
      this.tenant = this.pendingBind;
      this.pendingBind = null;
      done(true);
    });
  }
}
