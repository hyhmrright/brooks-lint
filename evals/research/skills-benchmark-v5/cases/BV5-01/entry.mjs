import {apply} from './handler.mjs';export const dispatch=(s,e)=>apply(s,e.id,e.amount);
