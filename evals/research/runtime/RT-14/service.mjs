import { ExpiringQueue } from '../shared/expiring-queue.mjs';

export function createService({ clock, work }) {
  const queue = new ExpiringQueue({ clock, checkExpiry: false });
  return { queue, submit: ({ signal, expiresAt }) => queue.run(childSignal => work.open({ signal: childSignal }), { signal, expiresAt }) };
}
