import { startRequest } from '../shared/request-boundary.mjs';
import { retry } from '../shared/retry.mjs';

export function callDependency({ transport, signal }) {
  return retry(() => transport.fetchQuote({ signal }), { maxAttempts: 3, signal });
}

export function loadQuote({ transport, signal }) {
  return retry(() => callDependency({ transport, signal }), { maxAttempts: 3, signal });
}

export function handleQuote(options) {
  return startRequest({ ...options, load: loadQuote });
}
