/** Evaluator-only contract predicates over observed state, never model inputs. */
export function holds(family, observation, policy = "supplied") {
  if (!["supplied", "alternative"].includes(policy))
    throw new Error("unknown policy");
  const o = observation;
  const alternate = policy === "alternative";
  switch (family) {
    case "deadline-rebase":
      return o.probe.starts.every((time) => time < (alternate ? 85 : 50));
    case "retry-token-ownership":
      // Each receipt is one invocation, whose source loop permits at most three sends.
      return o.probe.sends <= (alternate ? o.probe.receipts.length * 3 : 3);
    case "hedge-cancel-drain":
      return (alternate ? o.probe.used : o.probe.physical) <= 2;
    case "lease-fencing":
      return alternate
        ? o.probe.value === "old"
        : o.probe.value === "new" && !o.probe.stale;
    case "batch-item-expiry":
      return o.probe.sent.every(
        (entry) => 25 < (alternate ? 60 : entry.deadline),
      );
    case "singleflight-waiters":
      return o.probe.b.status === (alternate ? "cancelled" : "complete");
    case "weighted-reservation":
      return alternate
        ? o.outer.next === "delivered" && o.finalUsed === 0
        : o.probe.next === "delivered";
    case "breaker-probe-epoch":
      return alternate
        ? o.probe.mode === "closed"
        : o.probe.mode === "half-open" && !o.probe.extra;
    case "fanout-backpressure":
      return alternate ? o.probe.used <= 8 : o.probe.slowBytes <= 8;
    case "dedupe-retention":
      // The alternative explicitly permits another mutation after cache eviction.
      return alternate ? o.probe.mutations <= 2 : o.probe.mutations === 1;
    case "tenant-session-reuse":
      return (
        !o.probe.before ||
        (alternate ? o.probe.before.requested : o.probe.before.session) === "B"
      );
    case "shutdown-retry-drain":
      return alternate
        ? o.probe.before
        : o.probe.started === 1 &&
            o.dequeued.started === 1 &&
            o.probe.active === 0;
    default:
      throw new Error(`unknown family: ${family}`);
  }
}
