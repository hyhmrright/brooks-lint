import {checkout} from './checkout.mjs';
export function request(lines) {if(!Array.isArray(lines)||lines.length>1000||!Array.from({length:lines.length},(_,i)=>Object.hasOwn(lines,i)&&Number.isInteger(lines[i])&&lines[i]>=0&&lines[i]<=1000000).every(Boolean))throw Error('invalid');return checkout(lines);}
