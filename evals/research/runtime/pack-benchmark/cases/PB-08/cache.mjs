export function cache(queue) {
  let stored = 'old'; let cached = 'old';
  return {
    write(value) { stored = value; queue.defer(() => { cached = stored; }); return 'ack'; },
    read() { return cached; }
  };
}
