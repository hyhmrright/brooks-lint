import { startStagedRequest } from '../shared/deadline-stages.mjs';

export function handleRequest(options) {
  const { setupDuration = 80, workDuration = 60 } = options;
  for (const duration of [setupDuration, workDuration]) {
    if (!Number.isFinite(duration) || duration < 0) throw new Error('Invalid duration');
  }
  return startStagedRequest({ ...options, setupDuration, workDuration, timeout: 100, resetAfterSetup: false });
}
