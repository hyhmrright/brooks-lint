import { Operation } from "./transport.mjs";
export function launch(pool) {
  const release = pool.acquire();
  return release ? new Operation(release) : null;
}
export function choose(winner, loser) {
  winner.complete();
  loser.cancel();
  loser.release();
  return "delivered";
}
