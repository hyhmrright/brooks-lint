export function createStore() {
  return { source: "old", generation: 0, cache: undefined };
}
export function write(store, value) {
  store.source = value;
  store.generation++;
  store.cache = undefined;
}
