export function prepare(leases, key, worker, now, value) {
  const token = leases.acquire(key, worker, now, 10);
  return token
    ? { finish: (store) => store.commit(token, value), token }
    : null;
}
