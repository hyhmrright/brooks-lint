import { makeTransportRoutes } from '../shared/transport-isolation.mjs';
export const run = (options) => makeTransportRoutes({ ...options, reserved: true });
