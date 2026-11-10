export async function exercise(load) {
  const { createStore, commit } = await load("store.mjs");
  const { relay, beginBatch, deliverOne, acknowledge } =
    await load("service.mjs");
  const rows = [];
  for (const crash of [false, true]) {
    const s = createStore();
    commit(s, "e1", 7);
    relay(s, crash);
    relay(s);
    rows.push({ crash, balance: s.balance, sent: s.rows[0].sent });
  }
  const permutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const batches = [];
  for (const order of permutations)
    for (const acknowledgements of [0, 1, 2, 3]) {
      const s = createStore();
      for (let i = 0; i < 3; i++) commit(s, "e" + i, 7);
      const first = beginBatch(s);
      for (const index of order) deliverOne(s, first, index);
      for (const index of order.slice(0, acknowledgements))
        acknowledge(first, index);
      const recovery = beginBatch(s);
      for (let i = 0; i < recovery.events.length; i++) {
        deliverOne(s, recovery, i);
        acknowledge(recovery, i);
      }
      // Delayed old acknowledgements must not damage recovered state.
      for (const index of order) acknowledge(first, index);
      batches.push({
        order,
        acknowledgements,
        balance: s.balance,
        allSent: s.rows.every((r) => r.sent),
      });
    }
  const s = createStore();
  commit(s, "e1", 7);
  commit(s, "e2", 7);
  relay(s);
  relay(s);
  const crashed = createStore();
  commit(crashed, "lost", 9, true);
  const consumerDuplicate =
    rows.some((x) => x.balance !== 7) || batches.some((x) => x.balance !== 21);
  return {
    producerCrash: { total: crashed.producerTotal, rows: crashed.rows.length },
    issueFailures: {
      consumerDuplicate,
      producerAtomicity: crashed.producerTotal !== 0,
    },
    schedules: rows,
    batches,
    distinctBalance: s.balance,
    violation: consumerDuplicate || crashed.producerTotal !== 0,
    benign:
      rows[0].balance === 7 &&
      s.balance === 14 &&
      batches
        .filter((b) => b.acknowledgements === 3)
        .every((b) => b.balance === 21 && b.allSent),
  };
}
export async function completions(load) {
  const o = await exercise(load);
  return [
    {
      contract:
        "Durable business totals, exactly-once effects and atomic producer commit",
      satisfied: !o.violation,
      observation: o,
    },
    {
      contract:
        "Delivery-attempt and producer-attempt diagnostic counters, replay permitted",
      satisfied:
        o.schedules[1].balance === 14 &&
        o.producerCrash.total === 9 &&
        o.batches.every((b) => b.balance === (6 - b.acknowledgements) * 7),
      observation: o,
    },
  ];
}
