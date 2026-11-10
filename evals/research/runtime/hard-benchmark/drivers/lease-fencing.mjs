export async function exercise(dir) {
  const { Leases } = await import(dir + "lease.mjs");
  const { Store } = await import(dir + "store.mjs");
  const { prepare } = await import(dir + "service.mjs");
  function run(owner) {
    const l = new Leases(),
      s = new Store(l);
    const old = prepare(l, "k", "w", 0, "old");
    const busy = prepare(l, "k", "x", 5, "busy");
    const next = prepare(l, "k", owner, 10, "new");
    const fresh = next.finish(s),
      stale = old.finish(s);
    return {
      busy: busy === null,
      fresh,
      stale,
      value: s.values.get("k"),
      generations: s.log.map((x) => x.generation),
    };
  }
  return { probe: run("w"), different: run("x") };
}
