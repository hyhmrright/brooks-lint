export function project(events) {
  const seen = new Set(); const totals = new Map();
  for (const event of events) {
    if (seen.has(event.eventId)) continue;
    totals.set(event.orderId, (totals.get(event.orderId) ?? 0) + event.amount);
    seen.add(event.eventId);
  }
  return totals;
}
