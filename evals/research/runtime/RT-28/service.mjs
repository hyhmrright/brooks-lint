import { scheduleRetry } from '../shared/retry-schedule.mjs';
export const run = (options) => scheduleRetry({ ...options, delay: 10 });
