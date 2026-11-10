export function createStore() {
  return { epoch: 1, total: 0, checkpoint: 0 };
}
export function reassign(store) {
  store.epoch++;
}
