import {setTimeout as delay} from 'node:timers/promises';
import {performance} from 'node:perf_hooks';

/** Only the kernel's ESRCH confirms disappearance of the detached process group. */
export async function terminate(child, closed, ms = 3000, {kill = process.kill.bind(process)} = {}) {
  if (!child?.pid) return {closed: await closed, group_absent: true, observations: [], signals: []};
  const end = performance.now() + ms;
  const escalateAt = performance.now() + Math.min(500, ms / 2);
  const signals = [];
  const observations = [];
  let lastObservation;
  let didClose = false;
  void closed.then(value => { didClose = value; });
  const signal = name => {
    try {
      if (kill(-child.pid, name) === false) return {error: 'SIGNAL_NOT_DELIVERED'};
      return {delivered: true};
    } catch (error) {
      return {error: error.code ?? 'UNKNOWN'};
    }
  };
  signals.push({signal: 'SIGTERM', ...signal('SIGTERM')});
  let absent = false;
  let escalated = false;
  do {
    const observation = signal(0);
    const status = observation.delivered ? 'present' : observation.error;
    if (status !== lastObservation) {
      observations.push({method: 'kill(-pgid,0)', status});
      lastObservation = status;
    }
    if (status === 'ESRCH') {
      absent = true;
      break;
    }
    if (!escalated && performance.now() >= escalateAt && status === 'present') {
      signals.push({signal: 'SIGKILL', ...signal('SIGKILL')});
      escalated = true;
    }
    await delay(Math.min(25, Math.max(0, end - performance.now())));
  } while (performance.now() < end);
  if (!didClose) {
    const controller = new AbortController();
    try {
      didClose = await Promise.race([
        closed,
        delay(Math.max(0, end - performance.now()), false, {signal: controller.signal})
      ]);
    } finally {
      controller.abort();
    }
  }
  return {closed: didClose, group_absent: absent, observations, signals};
}
