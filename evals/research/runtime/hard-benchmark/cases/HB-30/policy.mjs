export const retryPolicy = Object.freeze({
  attempts: 3,
  attemptTimeout: 30,
  backoff: 5,
  retentionGrace: 20,
});
export function horizon(policy) {
  return (
    policy.attempts * policy.attemptTimeout +
    (policy.attempts - 1) * policy.backoff
  );
}
export function retention(policy) {
  return horizon(policy) + policy.retentionGrace;
}
