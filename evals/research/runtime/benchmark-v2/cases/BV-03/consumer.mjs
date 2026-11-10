export function deliver(store, event) {
  store.balance += event.amount;
  store.seen.add(event.id);
  return true;
}
