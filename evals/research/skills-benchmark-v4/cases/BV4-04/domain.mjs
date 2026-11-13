import {read} from './db.mjs';
export const quote = id => read(id).price;
