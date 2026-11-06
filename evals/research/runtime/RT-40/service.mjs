import { startRequest } from '../shared/request-boundary.mjs';

export function handleQuote(options) {
  return startRequest({ ...options, deadline: 100, load: ({ transport, signal }) => transport.fetchQuote({ signal }) });
}
