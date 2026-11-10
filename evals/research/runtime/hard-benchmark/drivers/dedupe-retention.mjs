export async function exercise(dir) {
  const { Ledger } = await import(dir + "ledger.mjs");
  const { Dedupe } = await import(dir + "dedupe.mjs");
  const { deliver } = await import(dir + "service.mjs");
  function run(delay, key = "k") {
    const l = new Ledger(),
      d = new Dedupe();
    const first = deliver(l, d, { key: "k", delta: 7 }, 0, true);
    const retry = deliver(l, d, { key, delta: 7 }, delay);
    return {
      first,
      replayed: retry.replayed,
      value: l.value,
      mutations: l.records.length,
    };
  }
  return {
    probe: run(40),
    immediate: run(10),
    horizon: run(99),
    different: run(10, "other"),
    outside: run(130),
  };
}
