export function handoff(pool, scheduler) {
  const holder = pool.request(3);
  scheduler.drain();
  const follower = pool.request(2);
  pool.release(holder);
  return { holder, follower };
}
