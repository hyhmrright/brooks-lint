const records = ['a', 'b', 'c', 'd', 'e'];

/** Finite offline job: two workers, ordered outcomes, continue after item failure. */
export function startArchive({ clock, failRecord = null }) {
  const stats = { started: 0, completed: 0, failed: 0, active: 0, maxActive: 0 };
  const outcomes = new Array(records.length);
  let next = 0;
  function archiveOne(record) {
    stats.started++;
    stats.active++;
    stats.maxActive = Math.max(stats.maxActive, stats.active);
    return new Promise((resolve, reject) => {
      clock.schedule(1000, () => {
        stats.active--;
        if (record === failRecord) {
          stats.failed++;
          reject(new Error(`Archive failed: ${record}`));
        } else {
          stats.completed++;
          resolve(`archived:${record}`);
        }
      });
    });
  }
  async function worker() {
    while (next < records.length) {
      const index = next++;
      try {
        outcomes[index] = { status: 'ok', value: await archiveOne(records[index]) };
      } catch {
        outcomes[index] = { status: 'error' };
      }
    }
  }
  const done = Promise.all([worker(), worker()]).then(() => outcomes);
  return { done, stats };
}
