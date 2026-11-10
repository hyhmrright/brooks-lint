export async function exercise(load) {
  const { createStore, write } = await load("store.mjs");
  const { beginRead, finishRead } = await load("cache.mjs");
  const { readNow } = await load("service.mjs");
  const rows = [];
  for (const order of ["fill-write", "write-fill", "two-invalidations"]) {
    const s = createStore();
    const r = beginRead(s);
    if (order === "fill-write") {
      finishRead(s, r);
      write(s, "new");
    } else {
      write(s, "new");
      if (order === "two-invalidations") write(s, "newer");
      finishRead(s, r);
    }
    rows.push({ order, hit: readNow(s), source: s.source });
  }
  return {
    schedules: rows,
    violation: rows.some((x) => x.hit !== x.source),
    benign: rows[0].hit === "new",
  };
}
export async function completions(load) {
  const o = await exercise(load);
  return [
    {
      contract: "Post-invalidation hits must not use a pre-write fill",
      satisfied: !o.violation,
      observation: o,
    },
    {
      contract:
        "Eventual cache allows a captured source value until later refresh",
      satisfied: o.schedules.every((x) =>
        ["old", "new", "newer"].includes(x.hit),
      ),
      observation: o,
    },
  ];
}
