export async function exercise(dir) {
  const { Clock } = await import(dir + "clock.mjs");
  const { Transport } = await import(dir + "transport.mjs");
  const { dispatch } = await import(dir + "service.mjs");
  function run(queued, outcomes, budget = 50) {
    const c = new Clock(queued),
      t = new Transport(c, outcomes);
    const result = dispatch({ acceptedAt: 0, budget, backoff: 10 }, c, t);
    return { ...result, starts: t.starts, now: c.now };
  }
  return {
    probe: run(35, [
      { duration: 10, ok: false },
      { duration: 1, ok: true },
    ]),
    fast: run(0, [
      { duration: 10, ok: false },
      { duration: 1, ok: true },
    ]),
    boundary: run(50, [{ duration: 1, ok: true }]),
    lateCompletion: run(0, [{ duration: 70, ok: true }]),
  };
}
