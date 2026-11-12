import {key} from './key.mjs';
import {authenticate} from './auth.mjs';
export function purchase(principal,id,cache,repo){const tenant=authenticate(principal.tenantId).tenantId;const k=key(tenant,id);if(!cache.has(k))cache.put(k,repo.read(tenant,id));return cache.get(k);}
