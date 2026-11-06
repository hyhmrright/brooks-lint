import { RecoveryBreaker } from '../shared/recovery-breaker.mjs';
export const run = (options) => new RecoveryBreaker({ ...options, limitProbe: false });
