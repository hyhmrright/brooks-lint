/**
 * Owns the request deadline and returns a response even if load ignores cancellation.
 * The caller must propagate the supplied signal through the dependency call path.
 * `clock` is a ManualClock; `load` returns a promise and must not block synchronously.
 */
export function startRequest({ clock, transport, load, signal: parentSignal, deadline = 100 }) {
  const controller = new AbortController();
  let result;
  let cancelTimer = () => {};
  let resolveResponse;
  const response = new Promise((resolve) => { resolveResponse = resolve; });
  const finish = (value) => {
    if (result) return;
    result = value;
    cancelTimer();
    parentSignal?.removeEventListener('abort', onParentAbort);
    resolveResponse(value);
  };
  const onParentAbort = () => {
    finish({ status: 'cancelled' });
    controller.abort(parentSignal.reason);
  };
  if (parentSignal?.aborted) {
    onParentAbort();
  } else {
    parentSignal?.addEventListener('abort', onParentAbort, { once: true });
    cancelTimer = clock.schedule(deadline, () => {
      finish({ status: 'timed-out' });
      controller.abort(new Error('Request deadline exceeded'));
    });
    // Attach both handlers even to abandoned work, so later rejection is observed.
    try {
      Promise.resolve(load({ transport, signal: controller.signal })).then(
        (value) => finish({ status: 'ok', value }),
        () => finish({ status: controller.signal.aborted ? 'cancelled' : 'error' }),
      );
    } catch {
      finish({ status: 'error' });
    }
  }
  return { response, signal: controller.signal, get result() { return result; } };
}
