import { allowed } from "./policy.mjs";
import { key } from "./cache.mjs";
export function authorize(cache, registry, tenant, user) {
  const k = key(tenant, user);
  if (!cache.has(k)) cache.set(k, allowed(registry, tenant, user));
  return cache.get(k);
}
