export function beginRead(store) {
  return { value: store.source, generation: store.generation };
}
export function finishRead(store, read) {
  if (read.generation !== store.generation) return read.value;
  store.cache = read.value;
  return read.value;
}
