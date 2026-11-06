import { makeDegradedService } from '../shared/degraded-service.mjs';
export const run = (options) => makeDegradedService({ ...options, shedOptional: false });
