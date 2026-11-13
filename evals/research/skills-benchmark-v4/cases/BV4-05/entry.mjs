import {quote} from './domain.mjs';
import {read} from './db.mjs';
export const run = () => quote('a',read);
