import {discount} from './pricing.mjs';
export const checkout = lines => lines.reduce((n,c)=>n+Math.round(discount(c,5000)),0);
