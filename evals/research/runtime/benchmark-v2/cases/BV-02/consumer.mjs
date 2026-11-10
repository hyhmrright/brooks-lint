export function deliver(store, event) {
  if (store.seen.has(event.id)) return false;
  store.balance += event.amount;
  store.seen.add(event.id);
  return true;
}
