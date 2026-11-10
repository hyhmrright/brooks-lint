export async function exercise(dir) {
  const { Queue } = await import(dir + "queue.mjs");
  const { Wire } = await import(dir + "transport.mjs");
  const { flush } = await import(dir + "service.mjs");
  function run(now) {
    const q = new Queue(),
      w = new Wire();
    q.put({ id: "a", deadline: 20 });
    q.put({ id: "b", deadline: 60 });
    return { ids: flush(q, w, now), sent: w.sent, remaining: q.entries.length };
  }
  const q = new Queue(),
    w = new Wire();
  const old = q.put({ id: "a", deadline: 20 });
  q.put({ id: "a", deadline: 60 });
  q.cancel(old);
  const cancelled = q.put({ id: "b", deadline: 60 });
  q.cancel(cancelled);
  const generation = flush(q, w, 25);
  const reinsertionQueue = new Queue(),
    reinsertionWire = new Wire();
  const removed = reinsertionQueue.put({ id: "a", deadline: 60 });
  reinsertionQueue.cancel(removed);
  const inserted = reinsertionQueue.put({ id: "a", deadline: 80 });
  const cancelReinsert = {
    ids: flush(reinsertionQueue, reinsertionWire, 25),
    sent: reinsertionWire.sent,
    newerGeneration: inserted.generation > removed.generation,
  };
  const reusedQueue = new Queue(),
    reusedWire = new Wire();
  const previous = reusedQueue.put({ id: "a", deadline: 60 });
  const first = flush(reusedQueue, reusedWire, 25);
  const current = reusedQueue.put({ id: "a", deadline: 80 });
  reusedQueue.cancel(previous);
  const staleAfterFlush = {
    first,
    second: flush(reusedQueue, reusedWire, 25),
    newerGeneration: current.generation > previous.generation,
  };
  return {
    cancelReinsert,
    staleAfterFlush,
    generation,
    probe: run(25),
    both: run(10),
    boundary: run(20),
    expired: run(60),
  };
}
