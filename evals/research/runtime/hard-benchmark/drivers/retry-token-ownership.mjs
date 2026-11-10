export async function exercise(dir) {
  const { Wire } = await import(dir + "transport.mjs");
  const { write } = await import(dir + "service.mjs");
  const run = (script) => {
    const w = new Wire(script);
    return { receipts: write(w), sends: w.sends };
  };
  return {
    probe: run([]),
    early: run(["ack"]),
    third: run(["timeout", "timeout", "ack"]),
    unknown: run(["timeout", "timeout", "timeout", "ack"]),
  };
}
