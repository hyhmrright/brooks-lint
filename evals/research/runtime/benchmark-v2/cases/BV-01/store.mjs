export function createStore() {
  return { rows: [], producerTotal: 0, balance: 0, seen: new Set() };
}
export function commit(store, id, amount, crashBeforeOutbox = false) {
  store.producerTotal += amount;
  if (crashBeforeOutbox) return false;
  store.rows.push({ id, amount, sent: false });
  return true;
}
