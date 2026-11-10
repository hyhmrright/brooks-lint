export function apply(store, work) {
  if (work.epoch !== store.epoch) return false;
  store.total += work.delta;
  store.checkpoint = work.offset;
  return true;
}
