import { retry } from '../shared/retry.mjs';

export function loadQuote({ transport, signal }) {
  return retry(() => transport.fetchQuote({ signal }), { maxAttempts: 3, signal });
}
