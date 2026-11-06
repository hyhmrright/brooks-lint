import { startRequest } from '../shared/request-boundary.mjs';

export function loadQuote({ transport, signal }) {
  return transport.fetchQuote();
}

export function handleQuote(options) {
  return startRequest({ ...options, load: loadQuote });
}
