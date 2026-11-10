export function createStore() {
  return { rows: [], producerTotal: 0, balance: 0, seen: new Set() };
}
export function commit(store, id, amount, crashBeforeOutbox = false) {
  if (crashBeforeOutbox) return false;
  store.producerTotal += amount;
  store.rows.push({ id, amount, sent: false });
  return true;
}
