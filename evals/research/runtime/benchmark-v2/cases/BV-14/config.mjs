export function createConfig(overlap = false) {
  return { overlap, current: { endpoint: "east", credential: "key-east" } };
}
export function publish(config) {
  config.current = { endpoint: "west", credential: "key-west" };
}
