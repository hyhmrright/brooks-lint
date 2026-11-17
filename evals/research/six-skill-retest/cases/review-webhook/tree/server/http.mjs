import {submit} from '../queue/queue.mjs';
export async function upload(event,transport) {
  if (event.kind!=='changed') return 422;
  try {
    void submit(event,transport).catch(()=>{});
    return 202;
  } catch { return 503; }
}
