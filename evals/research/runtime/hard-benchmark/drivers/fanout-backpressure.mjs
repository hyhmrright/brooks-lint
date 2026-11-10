export async function exercise(dir) {
  const { Credits } = await import(dir + "credits.mjs");
  const { Sink } = await import(dir + "sink.mjs");
  const { Fanout } = await import(dir + "service.mjs");
  const c = new Credits(),
    a = new Sink("a"),
    b = new Sink("b"),
    optional = new Sink("optional", false),
    f = new Fanout(c, [a, b, optional]);
  const one = f.send(4),
    two = f.send(4);
  a.drain(one);
  a.drain(two);
  const three = f.send(4);
  const probe = {
    third: three !== null,
    slowBytes: b.retained(),
    used: c.used,
  };
  b.drain(one);
  b.drain(one);
  const four = f.send(4);
  const afterDrain = {
    fourth: four !== null,
    slowBytes: b.retained(),
    used: c.used,
  };
  for (const sink of [a, b])
    for (const id of [one, two, three, four]) if (id !== null) sink.drain(id);
  const zero = f.send(0);
  a.drain(zero);
  b.drain(zero);
  return {
    probe,
    afterDrain,
    finalUsed: c.used,
    finalSlow: b.retained(),
    optionalRetained: optional.retained(),
  };
}
