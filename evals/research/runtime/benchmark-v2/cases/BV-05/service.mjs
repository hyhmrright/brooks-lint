import { beginRead, finishRead } from "./cache.mjs";
export function readNow(store) {
  return store.cache === undefined
    ? finishRead(store, beginRead(store))
    : store.cache;
}
