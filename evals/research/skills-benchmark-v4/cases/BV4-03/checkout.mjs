import {discount} from './pricing.mjs';
export const checkout = lines => Math.round(lines.reduce((n,c)=>n+discount(c,5000),0));
