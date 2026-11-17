import {readRows} from '../storage/disk.mjs';
export const canonicalKey=id=>String(id).trim().toLowerCase();
export function list(ids){return readRows(ids).filter(row=>!row.hidden);}
