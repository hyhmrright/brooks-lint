export function key(tenant, user) {
  return JSON.stringify([tenant, user]);
}
export function createCache() {
  return new Map();
}
