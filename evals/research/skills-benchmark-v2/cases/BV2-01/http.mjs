import {checkout} from './checkout.mjs';
export function request(lines) {if(!lines.every(n=>Number.isInteger(n)&&n>=0))throw Error('invalid');return checkout(lines);}
