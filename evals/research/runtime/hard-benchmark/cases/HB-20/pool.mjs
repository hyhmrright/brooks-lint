export class WeightedPool {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.capacity = 3;
    this.used = 0;
    this.waiting = [];
  }
  request(weight) {
    if (weight < 1 || weight > this.capacity) throw Error("weight");
    const ticket = { weight, state: "queued", charged: false };
    this.waiting.push(ticket);
    this.pump();
    return ticket;
  }
  pump() {
    while (this.waiting.length) {
      const t = this.waiting[0];
      if (this.used + t.weight > this.capacity) break;
      this.waiting.shift();
      this.used += t.weight;
      t.charged = true;
      t.state = "reserved";
      this.scheduler.post(() => {
        if (t.state === "reserved") t.state = "delivered";
      });
    }
  }
  closeReservation(t) {
    if (t.charged) {
      t.charged = false;
      this.used -= t.weight;
    }
    this.pump();
  }
  cancel(t) {
    if (t.state === "cancelled" || t.state === "released") return;
    if (t.state === "delivered") throw Error("owner must release");
    this.waiting = this.waiting.filter((x) => x !== t);
    t.state = "cancelled";
    this.pump();
  }
  release(t) {
    if (t.state !== "delivered") return;
    t.state = "released";
    this.closeReservation(t);
  }
}
