import { logicalWrite } from '../shared/ambiguous-write.mjs';
export const run = (options) => logicalWrite({ ...options, preserveIdentity: true });
