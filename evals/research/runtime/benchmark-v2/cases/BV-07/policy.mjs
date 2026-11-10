export function allowed(registry, tenant, user) {
  return registry.get(JSON.stringify([tenant, user])) === true;
}
