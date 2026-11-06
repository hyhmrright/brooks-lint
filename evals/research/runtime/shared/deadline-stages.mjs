/** Synthetic setup/work phases; all times are logical clock units. */
export function startStagedRequest({ clock, signal, setupDuration = 80, workDuration = 60,
  timeout = 100, resetAfterSetup = false, failPhase }) {
  let result;
  let cancelPhase = () => {};
  let cancelDeadline = () => {};
  let resolveResponse;
  const response = new Promise(resolve => { resolveResponse = resolve; });
  const stats = { setupStarted: 0, workStarted: 0, active: 0 };
  const finish = status => {
    if (result) return;
    result = { status, at: clock.now };
    cancelPhase(); cancelDeadline();
    signal?.removeEventListener('abort', onAbort);
    stats.active = 0;
    resolveResponse(result);
  };
  const onAbort = () => finish('cancelled');
  const armDeadline = () => { cancelDeadline = clock.schedule(timeout, () => finish('timed-out')); };
  if (signal?.aborted) onAbort();
  else {
    signal?.addEventListener('abort', onAbort, { once: true });
    if (!resetAfterSetup) armDeadline();
    stats.setupStarted++; stats.active = 1;
    cancelPhase = clock.schedule(setupDuration, () => {
      if (failPhase === 'setup') { finish('error'); return; }
      if (resetAfterSetup) armDeadline();
      stats.workStarted++;
      cancelPhase = clock.schedule(workDuration, () => finish(failPhase === 'work' ? 'error' : 'ok'));
    });
  }
  return { response, stats, get result() { return result; } };
}
