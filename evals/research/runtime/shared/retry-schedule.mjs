/** One retry per caller, using an injected deterministic logical schedule. */
export function scheduleRetry({ clock, signal, delay, start }) {
  if (signal.aborted) return Promise.resolve({ status: 'cancelled' });
  return new Promise((resolve) => {
    const finish = (result) => { cancel(); signal.removeEventListener('abort', abort); resolve(result); };
    const abort = () => finish({ status: 'cancelled' });
    const cancel = clock.schedule(delay, () => {
      signal.removeEventListener('abort', abort);
      try { start(clock.now); finish({ status: 'ok' }); }
      catch { finish({ status: 'error' }); }
    });
    signal.addEventListener('abort', abort, { once: true });
  });
}
