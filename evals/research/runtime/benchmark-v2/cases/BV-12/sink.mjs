export function apply(store, work) {
  store.total += work.delta;
  store.checkpoint = work.offset;
  return true;
}
