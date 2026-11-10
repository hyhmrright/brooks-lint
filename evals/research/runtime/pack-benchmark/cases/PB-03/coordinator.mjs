import { makeFlight } from './flight.mjs';
export function startPair() {
  const flight = makeFlight();
  const a = { cancel() { flight.abort(); } };
  const b = { result() { return flight.result(); } };
  return { a, b };
}
