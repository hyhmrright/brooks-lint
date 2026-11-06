/** Cancellation can occur while preparation yields to its caller. */
export async function launch({ signal, gate, pool }) {
  if (signal.aborted) return { status: 'cancelled', complete() {} };
  await gate;
  // Cancellation is subscribed only after preparation.
  const lease = pool.acquire();
  const operation = { status: 'pending', complete: () => finish('ok') };
  function finish(status) {
    if (operation.status !== 'pending') return;
    operation.status = status; pool.release(lease);
    signal.removeEventListener('abort', cancel);
  }
  function cancel() { finish('cancelled'); }
  signal.addEventListener('abort', cancel, { once: true });
  return operation;
}
