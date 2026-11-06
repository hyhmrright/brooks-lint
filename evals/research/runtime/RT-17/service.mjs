import { startChildren } from '../shared/fanout.mjs';
export const run = (options) => startChildren({ ...options, forwardThird: false });
