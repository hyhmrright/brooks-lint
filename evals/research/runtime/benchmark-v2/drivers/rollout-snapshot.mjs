export async function exercise(load) {
  const { createConfig, publish } = await load("config.mjs");
  const { begin, finish } = await load("service.mjs");
  const rows = [];
  for (const order of ["before", "between", "after"]) {
    const c = createConfig();
    if (order === "before") publish(c);
    const r = begin(c);
    if (order === "between") publish(c);
    const accepted = finish(c, r);
    if (order === "after") publish(c);
    rows.push({ order, accepted });
  }
  return {
    schedules: rows,
    violation: rows.some((x) => !x.accepted),
    benign: rows[0].accepted && rows[2].accepted,
  };
}
export async function completions(load) {
  const { createConfig, publish } = await load("config.mjs");
  const { begin, finish } = await load("service.mjs");
  return [false, true].map((overlap) => {
    const c = createConfig(overlap),
      r = begin(c);
    publish(c);
    const accepted = finish(c, r);
    return {
      contract: overlap
        ? "Both credentials accepted throughout rotation"
        : "Only snapshot-matching credential accepted",
      satisfied: accepted,
      observation: { overlap, accepted },
    };
  });
}
