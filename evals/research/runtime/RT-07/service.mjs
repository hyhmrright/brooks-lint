export function loadQuote({ transport, signal }) {
  return transport.fetchQuote({ signal });
}
