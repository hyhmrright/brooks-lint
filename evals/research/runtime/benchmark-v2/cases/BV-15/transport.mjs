export function send(endpoint, credential, overlap) {
  return overlap || credential === "key-" + endpoint;
}
