import { send } from "./transport.mjs";
export function begin(config) {
  return { snapshot: config.current, endpoint: config.current.endpoint };
}
export function finish(config, request) {
  return send(request.endpoint, config.current.credential, config.overlap);
}
