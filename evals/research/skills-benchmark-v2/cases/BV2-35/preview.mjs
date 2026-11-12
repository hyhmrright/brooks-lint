import {key} from './preview-key.mjs';
export function preview(principal,id,cache,repo){const k=key(principal.tenantId,id);if(!cache.has(k))cache.put(k,repo.read(principal.tenantId,id));return cache.get(k);}
