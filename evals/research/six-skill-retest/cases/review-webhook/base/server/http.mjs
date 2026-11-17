import {submit} from '../queue/queue.mjs';
export async function upload(event,transport) {
  if (event.kind!=='changed') return 422;
  try {
    await submit(event,transport);
    return 202;
  } catch { return 503; }
}
