export async function exercise(load) {
  const { quote } = await load("pricing.mjs");
  const { noDiscount, acceptsNegative } = await load("mutations.mjs");
  const { releaseTest } = await load("service.mjs");
  const run = (fn) => {
    try {
      return releaseTest(fn) === true;
    } catch {
      return false;
    }
  };
  return {
    referencePass: run(quote),
    mutants: [
      { id: "discount", survives: run(noDiscount) },
      { id: "negative", survives: run(acceptsNegative) },
    ],
    violation: run(noDiscount) || run(acceptsNegative),
    benign: run(quote),
  };
}
export async function completions(load) {
  const o = await exercise(load);
  const { quote } = await load("pricing.mjs");
  const { noDiscount, acceptsNegative } = await load("mutations.mjs");
  // An evaluator-provided alternative: a separate complete contract gate.
  const externalGate = (q) => {
    if (q(100) !== 90) return false;
    try {
      q(-1);
      return false;
    } catch {
      return true;
    }
  };
  const external = {
    reference: externalGate(quote),
    discount: externalGate(noDiscount),
    negative: externalGate(acceptsNegative),
  };
  return [
    {
      contract: "Supplied releaseTest is the only behavioral gate",
      satisfied: !o.violation,
      observation: o,
    },
    {
      contract:
        "Supplied test is smoke-only and separate contract gate also runs",
      satisfied: external.reference && !external.discount && !external.negative,
      observation: external,
    },
  ];
}
