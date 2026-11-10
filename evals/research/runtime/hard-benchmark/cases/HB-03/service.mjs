import { remaining } from "./clock.mjs";
export function dispatch(envelope, clock, transport) {
  const deadline = envelope.acceptedAt + envelope.budget;
  let status = "expired";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (remaining(deadline, clock) === 0) break;
    if (transport.attempt()) {
      status = "complete";
      break;
    }
    status = "retry-exhausted";
    if (attempt === 0) clock.advance(envelope.backoff);
  }
  return { status, deadline };
}
