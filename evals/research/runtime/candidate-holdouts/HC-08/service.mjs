/** Entries are replaceable while older handles may still complete. */
export function makeRegistry() {
  const entries = new Map(), live = new Set();
  function create(key) {
    const entry = { key, done: false, complete() {
      if (entry.done) return;
      entry.done = true; live.delete(entry);
      if (entries.get(key) === entry) entries.delete(key);
    } };
    entries.set(key, entry); live.add(entry); return entry;
  }
  return {
    start(key) { return entries.has(key) ? null : create(key); },
    replace(key) { return create(key); },
    get reserved() { return entries.size; },
    get active() { return live.size; },
  };
}
