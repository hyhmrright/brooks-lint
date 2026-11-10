import {status} from '../http/server.mjs';
export const valid = order => status() === 200 && order.items.length > 0;
