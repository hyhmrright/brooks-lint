export function openPair(registry, key) {
  return { a: registry.subscribe(key, "a"), b: registry.subscribe(key, "b") };
}
