/** Three children; the caller supplies lifecycle ownership. */
export function startChildren({ transports, signal, forwardThird }) {
  return Promise.allSettled(transports.map((transport, index) => transport.open({
    signal: index === 2 && !forwardThird ? new AbortController().signal : signal,
  })));
}
