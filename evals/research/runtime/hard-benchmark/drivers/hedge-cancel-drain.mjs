export async function exercise(dir) {
  const { Pool } = await import(dir + "pool.mjs");
  const { launch, choose } = await import(dir + "service.mjs");
  function run(early = false) {
    const p = new Pool();
    const a = launch(p),
      b = launch(p);
    if (early) b.complete();
    choose(a, b);
    const c = launch(p),
      d = launch(p);
    const physical = [a, b, c, d].filter((x) => x?.running).length;
    const used = p.used;
    b.acknowledgeCancel();
    b.acknowledgeCancel();
    for (const op of [c, d]) op?.complete();
    return {
      physical,
      used,
      finalUsed: p.used,
      loserCancelled: b.cancelRequested,
    };
  }
  return { probe: run(), early: run(true) };
}
