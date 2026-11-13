import {select} from './query.mjs';export function page(rows,cursor,size){const items=select(rows,cursor).slice(0,size);return {items,cursor:items.at(-1)};}
