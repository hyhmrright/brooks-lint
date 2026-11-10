export async function exercise(dir) {
  const { Registry } = await import(dir + "service.mjs");
  const { openPair } = await import(dir + "adapter.mjs");
  const r = new Registry(),
    { a, b } = openPair(r, "k");
  const other = r.subscribe("other", "c");
  a.cancel();
  a.cancel();
  const cancelled = r.flights.get("k").cancelled;
  r.complete("k", 42);
  r.complete("other", 7);
  const r2 = new Registry(),
    p = openPair(r2, "k");
  p.a.cancel();
  p.b.cancel();
  return {
    probe: {
      cancelled,
      a: a.state,
      b: b.state,
      other: other.state,
      remaining: r.flights.size,
    },
    last: {
      cancelled: r2.flights.get("k").cancelled,
      waiters: r2.flights.get("k").waiters.size,
    },
  };
}
