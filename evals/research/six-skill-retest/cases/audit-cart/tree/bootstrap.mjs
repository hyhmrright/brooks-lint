import {readCart} from './cart/service.mjs';
import {record} from './metrics/events.mjs';
export const get = input=>readCart(input,record);
