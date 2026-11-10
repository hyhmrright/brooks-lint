export async function exercise(dir) {
  const { Scheduler } = await import(dir + "scheduler.mjs");
  const { Wire } = await import(dir + "transport.mjs");
  const { Worker } = await import(dir + "service.mjs");
  function make() {
    const s = new Scheduler(),
      wire = new Wire(),
      w = new Worker(s, wire);
    return { s, wire, w };
  }
  const { s, wire, w } = make();
  const id = w.start();
  w.settle(id, false);
  const before = w.shutdown();
  s.run();
  const probe = {
    before,
    drained: w.drained,
    started: wire.started,
    active: wire.active.size,
    pending: w.pending.size,
  };
  const n = make();
  n.w.settle(n.w.start(), false);
  n.s.run();
  const normal = n.wire.started;
  const a = make();
  const active = a.w.start();
  const waits = !a.w.shutdown();
  a.w.settle(active, true);
  const activeDone = a.w.drained;
  const q = make();
  q.w.settle(q.w.start(), false);
  const callback = q.s.dequeue();
  q.w.shutdown();
  callback();
  q.w.shutdown();
  return {
    probe,
    normal,
    active: { waits, activeDone },
    dequeued: {
      started: q.wire.started,
      active: q.wire.active.size,
      drained: q.w.drained,
    },
  };
}
