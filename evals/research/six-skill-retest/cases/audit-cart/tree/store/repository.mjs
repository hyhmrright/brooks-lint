import {normalize} from '../cart/service.mjs';
export function find(id){return {id:normalize(id),items:[]};}
