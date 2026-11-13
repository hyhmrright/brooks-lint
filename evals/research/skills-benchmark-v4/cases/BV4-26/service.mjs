import {key} from './key.mjs';
export function purchase(principal,id,cache,repo){const k=key(principal.tenantId,id);if(!cache.has(k))cache.put(k,repo.read(principal.tenantId,id));return cache.get(k);}
