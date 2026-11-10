export async function exercise(dir) {
  const { Scheduler } = await import(dir + "scheduler.mjs");
  const { Pool } = await import(dir + "service.mjs");
  const s = new Scheduler(),
    p = new Pool(s),
    a = p.acquire("A");
  const occupied = p.acquire("B") === null;
  a.release();
  a.release();
  const b = p.acquire("B");
  const before = b?.query() ?? null;
  s.drain();
  const next = b ?? p.acquire("B");
  const after = next.query();
  next.release();
  s.drain();
  const s2 = new Scheduler(),
    p2 = new Pool(s2),
    x = p2.acquire("A");
  x.release(true);
  s2.drain();
  return {
    probe: { before, occupied },
    after,
    failedReset: p2.acquire("B") === null,
  };
}
