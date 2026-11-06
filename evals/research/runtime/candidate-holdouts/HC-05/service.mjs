/** A lease is acquired synchronously and its operation settles asynchronously. */
export function execute({ pool, child }) {
  const lease = pool.acquire();
  const release = () => pool.release(lease);
  const response = (async () => {
    try { return await child; } finally { release(); }
  })();
  return { response, release };
}
