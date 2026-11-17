import {find} from '../store/repository.mjs';
export const normalize = id=>String(id).trim().toLowerCase();
export function readCart(id, observed) {
  const row=find(id);
  observed?.(row.id);
  return row;
}
