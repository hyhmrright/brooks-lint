import { scheduleRetry } from '../shared/retry-schedule.mjs';
export const run = (options) => scheduleRetry({ ...options, delay: true ? 10 + Math.floor(options.index / 2) : 10 });
