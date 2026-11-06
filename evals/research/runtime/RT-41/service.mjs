import { startStagedRequest } from '../shared/deadline-stages.mjs';

export function handleRequest(options) {
  return startStagedRequest({ ...options, timeout: 100, resetAfterSetup: false });
}
