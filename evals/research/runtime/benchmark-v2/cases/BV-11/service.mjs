import { apply } from "./sink.mjs";
export function dispatch(store, offset, delta) {
  return { epoch: store.epoch, offset, delta };
}
export function complete(store, work) {
  return apply(store, work);
}
export function dispatchBatch(store, items) {
  return { epoch: store.epoch, items, ready: new Set(), next: 0 };
}
export function completeItem(store, batch, index) {
  if (!Number.isInteger(index) || index < 0 || index >= batch.items.length)
    throw new Error("invalid index");
  batch.ready.add(index);
  const outcomes = [];
  while (batch.ready.has(batch.next) && batch.next < batch.items.length) {
    const item = batch.items[batch.next++];
    outcomes.push(apply(store, { ...item, epoch: batch.epoch }));
  }
  return outcomes;
}
