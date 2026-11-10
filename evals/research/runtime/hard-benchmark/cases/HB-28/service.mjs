export function receive(ledger, dedupe, { key, delta }, now) {
  const old = dedupe.lookup(key, now);
  if (old) return { receipt: old, replayed: true };
  const receipt = ledger.apply(key, delta);
  dedupe.remember(key, receipt, now);
  return { receipt, replayed: false };
}
export function deliver(ledger, dedupe, request, now, loseAck = false) {
  const result = receive(ledger, dedupe, request, now);
  return loseAck ? { timeout: true } : result;
}
