import { startRequest } from '../shared/request-boundary.mjs';

export function loadQuote({ transport, signal }) {
  return transport.fetchQuote({ signal });
}

export function handleQuote(options) {
  return startRequest({ ...options, load: loadQuote });
}
