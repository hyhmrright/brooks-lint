import {price as retail} from './retail.mjs';
import {price as wholesale} from './wholesale.mjs';
export const observe = cents => [retail(cents),wholesale(cents)];
