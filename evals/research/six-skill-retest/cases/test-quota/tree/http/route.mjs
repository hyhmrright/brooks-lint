import {admit} from '../service/quota.mjs';
export function post(items) {
  return admit(items.length) ? {status:202,accepted:items} : {status:429};
}
