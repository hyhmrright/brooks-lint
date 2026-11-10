export function makeFlight() {
  let stopped = false;
  return { abort() { stopped = true; }, result() { return stopped ? 'cancelled' : 'value'; } };
}
