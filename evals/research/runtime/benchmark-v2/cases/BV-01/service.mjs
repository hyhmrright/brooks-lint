import { deliver } from "./consumer.mjs";
export function beginBatch(store, limit = 3) {
  return {
    events: store.rows.filter((row) => !row.sent).slice(0, limit),
    accepted: new Set(),
  };
}
export function deliverOne(store, batch, index) {
  const event = batch.events[index];
  if (!event) throw new Error("unknown batch index");
  deliver(store, event);
  batch.accepted.add(event.id);
}
export function acknowledge(batch, index) {
  const event = batch.events[index];
  if (!event || !batch.accepted.has(event.id)) return false;
  event.sent = true;
  return true;
}
export function relay(store, crashAfterAccept = false) {
  const batch = beginBatch(store, 1);
  if (!batch.events.length) return "idle";
  deliverOne(store, batch, 0);
  if (crashAfterAccept) return "crashed";
  acknowledge(batch, 0);
  return "sent";
}
