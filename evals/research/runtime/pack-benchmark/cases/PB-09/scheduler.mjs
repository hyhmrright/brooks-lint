export function scheduler() {
  const pending = [];
  return { defer(fn) { pending.push(fn); }, flush() { while (pending.length) pending.shift()(); } };
}
