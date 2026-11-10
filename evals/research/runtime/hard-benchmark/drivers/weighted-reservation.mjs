export async function exercise(dir) {
  const { Scheduler } = await import(dir + "scheduler.mjs");
  const { WeightedPool } = await import(dir + "pool.mjs");
  const { handoff } = await import(dir + "service.mjs");
  const s = new Scheduler(),
    p = new WeightedPool(s),
    { follower } = handoff(p, s);
  p.cancel(follower);
  p.cancel(follower);
  s.drain();
  const next = p.request(2);
  s.drain();
  const probe = { used: p.used, follower: follower.state, next: next.state };
  p.closeReservation(follower);
  s.drain();
  const outer = { used: p.used, next: next.state };
  p.release(next);
  p.release(next);
  const s2 = new Scheduler(),
    p2 = new WeightedPool(s2);
  const h = p2.request(3);
  s2.drain();
  const q = p2.request(2);
  p2.cancel(q);
  p2.release(h);
  s2.drain();
  const s3 = new Scheduler(),
    p3 = new WeightedPool(s3),
    normal = handoff(p3, s3);
  s3.drain();
  p3.release(normal.follower);
  return {
    probe,
    outer,
    finalUsed: p.used,
    queuedCancel: p2.used,
    normalReleased: p3.used,
  };
}
