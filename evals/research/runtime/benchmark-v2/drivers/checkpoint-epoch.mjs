export async function exercise(load) {
  const { createStore, reassign } = await load("store.mjs");
  const { dispatch, complete, dispatchBatch, completeItem } =
    await load("service.mjs");
  const rows = [];
  for (const staleLast of [false, true]) {
    const s = createStore(),
      old = dispatch(s, 2, 10);
    reassign(s);
    const fresh = dispatch(s, 3, 20);
    if (staleLast) {
      complete(s, fresh);
      complete(s, old);
    } else {
      complete(s, old);
      complete(s, fresh);
    }
    rows.push({ staleLast, total: s.total, checkpoint: s.checkpoint });
  }
  const batches = [];
  for (const oldOrder of [
    [0, 1],
    [1, 0],
  ])
    for (const freshOrder of [
      [0, 1],
      [1, 0],
    ])
      for (const staleLast of [false, true]) {
        const s = createStore(),
          old = dispatchBatch(s, [
            { offset: 1, delta: 5 },
            { offset: 2, delta: 10 },
          ]);
        completeItem(s, old, oldOrder[0]);
        const validBefore = s.total;
        reassign(s);
        const fresh = dispatchBatch(s, [
          { offset: 3, delta: 20 },
          { offset: 4, delta: 30 },
        ]);
        const stale = () => completeItem(s, old, oldOrder[1]);
        const current = () => {
          for (const i of freshOrder) completeItem(s, fresh, i);
          completeItem(s, fresh, 0);
          completeItem(s, fresh, 1);
        };
        if (staleLast) {
          current();
          stale();
        } else {
          stale();
          current();
        }
        batches.push({
          oldOrder,
          freshOrder,
          staleLast,
          validBefore,
          total: s.total,
          checkpoint: s.checkpoint,
          expectedTotal: validBefore + 50,
        });
      }
  const s = createStore();
  complete(s, dispatch(s, 1, 5));
  complete(s, dispatch(s, 2, 7));
  return {
    schedules: rows,
    batches,
    violation:
      rows.some((x) => x.total !== 20 || x.checkpoint !== 3) ||
      batches.some((x) => x.total !== x.expectedTotal || x.checkpoint !== 4),
    benign: s.total === 12 && s.checkpoint === 2,
  };
}
export async function completions(load) {
  const { createStore, reassign } = await load("store.mjs");
  const { dispatchBatch, completeItem } = await load("service.mjs");
  const strict = await exercise(load);
  const s = createStore(),
    old = dispatchBatch(s, [
      { offset: 1, delta: 5 },
      { offset: 2, delta: 10 },
    ]);
  completeItem(s, old, 1);
  completeItem(s, old, 0);
  reassign(s);
  const fresh = dispatchBatch(s, [{ offset: 3, delta: 20 }]);
  completeItem(s, fresh, 0);
  return [
    {
      contract: "Old callbacks may survive reassignment; sink must fence them",
      satisfied: !strict.violation,
      observation: strict,
    },
    {
      contract: "Scheduler drains every old callback before reassignment",
      satisfied: s.total === 35 && s.checkpoint === 3,
      observation: { total: s.total, checkpoint: s.checkpoint },
    },
  ];
}
