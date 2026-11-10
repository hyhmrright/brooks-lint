export function sendBatch(wire, budget) {
  for (let i = 0; i < 3; i++) {
    if (!budget.take()) return { ok: false, reason: "budget" };
    const outcome = wire.send();
    if (outcome === "ack") return { ok: true };
  }
  return { ok: false, reason: "unknown" };
}
export class Wire {
  constructor(script = []) {
    this.script = [...script];
    this.sends = 0;
  }
  send() {
    this.sends++;
    return this.script.shift() ?? "timeout";
  }
}
