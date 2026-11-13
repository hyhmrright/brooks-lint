import {decide} from './domain.mjs';import {send} from './http.mjs';export const run=()=>decide('ok',send);
