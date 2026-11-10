export function beginRead(store) {
  return { value: store.source, generation: store.generation };
}
export function finishRead(store, read) {
  store.cache = read.value;
  return read.value;
}
