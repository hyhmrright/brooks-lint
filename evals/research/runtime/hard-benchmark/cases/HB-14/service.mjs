export function flush(queue, wire, now) {
  const entries = queue.take();
  if (entries.length === 0) return [];
  const batchDeadline = Math.max(...entries.map((entry) => entry.deadline));
  if (now >= batchDeadline) return [];
  const admitted = entries.filter((entry) => now < batchDeadline);
  return wire.send(admitted);
}
