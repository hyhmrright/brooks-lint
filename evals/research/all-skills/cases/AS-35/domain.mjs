import {status} from './http.mjs';
const discount = .9;
export const quote = cents => status() === 200 ? cents * discount : 0;
