export async function exercise(load) {
  const { createCache } = await load("cache.mjs");
  const { authorize } = await load("service.mjs");
  const registry = new Map([
    [JSON.stringify(["red", 1]), true],
    [JSON.stringify(["blue", 1]), false],
    [JSON.stringify(["blue", 2]), false],
  ]);
  const rows = [];
  for (const order of [
    ["red", "blue"],
    ["blue", "red"],
  ]) {
    const c = createCache();
    rows.push({
      order,
      answers: order.map((t) => authorize(c, registry, t, 1)),
    });
  }
  const c = createCache();
  const safe = [
    authorize(c, registry, "red", 1),
    authorize(c, registry, "blue", 2),
  ];
  const globalRegistry = new Map([
    [JSON.stringify(["red", 42]), true],
    [JSON.stringify(["blue", 42]), false],
  ]);
  const globalUserHistories = [];
  for (const order of [
    ["red", "blue"],
    ["blue", "red"],
  ]) {
    const cache = createCache();
    globalUserHistories.push({
      user: 42,
      identity: "one globally unique user, not two tenant-local allocations",
      order,
      expected: order.map((tenant) => tenant === "red"),
      answers: order.map((tenant) =>
        authorize(cache, globalRegistry, tenant, 42),
      ),
    });
  }
  return {
    schedules: rows,
    globalUserHistories,
    violation:
      rows[0].answers[1] !== false ||
      rows[1].answers[1] !== true ||
      globalUserHistories.some((history) =>
        history.answers.some((answer, i) => answer !== history.expected[i]),
      ),
    benign: safe[0] === true && safe[1] === false,
  };
}
export async function completions(load) {
  const restrictive = await exercise(load);
  const { createCache } = await load("cache.mjs");
  const { authorize } = await load("service.mjs");
  const registry = new Map([
    [JSON.stringify(["red", 42]), true],
    [JSON.stringify(["blue", 42]), false],
    [JSON.stringify(["blue", 43]), false],
  ]);
  // This evaluator-supplied completion enforces a missing upstream contract.
  // A closure-owned frozen binding table cannot change during the histories.
  const bindings = Object.freeze({ 42: "red", 43: "blue" });
  const histories = [];
  for (const order of [
    ["red", "blue"],
    ["blue", "red"],
  ]) {
    const cache = createCache();
    const events = [];
    function gated(tenant, user) {
      const matches =
        Object.hasOwn(bindings, user) && bindings[user] === tenant;
      if (!matches) {
        events.push({
          tenant,
          user,
          bindingRejected: true,
          cacheAccess: false,
          decision: false,
        });
        return false;
      }
      const decision = authorize(cache, registry, tenant, user);
      events.push({
        tenant,
        user,
        bindingRejected: false,
        cacheAccess: true,
        decision,
      });
      return decision;
    }
    for (const tenant of order) gated(tenant, 42);
    gated("blue", 43);
    gated("red", 43);
    gated("red", 42);
    histories.push({ order, events, cacheEntries: [...cache.entries()] });
  }
  const satisfied = histories.every((history) =>
    history.events.every((event) =>
      event.bindingRejected
        ? !event.cacheAccess && event.decision === false
        : event.cacheAccess &&
          event.decision === (event.tenant === "red" && event.user === 42),
    ),
  );
  return [
    {
      contract:
        "One globally unique user can request multiple tenants with differing grants; no binding gate",
      satisfied: !restrictive.violation,
      observation: restrictive,
    },
    {
      contract:
        "Each ID has exactly one immutable tenant binding, verified before every authorize call; mismatches rejected before cache access",
      satisfied,
      observation: { bindings, histories },
    },
  ];
}
