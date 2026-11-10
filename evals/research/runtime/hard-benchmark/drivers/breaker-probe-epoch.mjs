export async function exercise(dir) {
  const { Clock } = await import(dir + "clock.mjs");
  const { Breaker } = await import(dir + "breaker.mjs");
  const { openAfterConcurrentFailure } = await import(dir + "service.mjs");
  function run(oldSuccess) {
    const c = new Clock(),
      b = new Breaker(c),
      old = openAfterConcurrentFailure(b);
    const denied = b.enter() === null;
    c.advance(10);
    const probe = b.enter();
    b.settle(old, oldSuccess);
    const mode = b.mode,
      extra = b.enter();
    b.settle(probe, true);
    return {
      denied,
      mode,
      extra: extra !== null,
      final: b.mode,
      metrics: b.metrics.length,
    };
  }
  const c = new Clock(),
    b = new Breaker(c);
  openAfterConcurrentFailure(b);
  c.advance(10);
  const p = b.enter();
  b.settle(p, false);
  const cooldown = b.enter() === null;
  c.advance(10);
  const p2 = b.enter();
  b.settle(p, true);
  const duplicateBlocked = b.enter() === null;
  b.settle(p2, true);
  return {
    probe: run(true),
    oldFailure: run(false),
    currentFailure: { cooldown, duplicateBlocked, final: b.mode },
  };
}
