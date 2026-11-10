export function openAfterConcurrentFailure(breaker) {
  const old = breaker.enter();
  const failing = breaker.enter();
  breaker.settle(failing, false);
  return old;
}
