import {prune} from '../service/grants.mjs';
export const revoke=(grants,name)=>({status:200,grants:prune(grants,name)});
