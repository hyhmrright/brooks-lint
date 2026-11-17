import {makeDispatch} from './jobs/dispatch.mjs';
import {afterComplete} from './lifecycle/retries.mjs';
export function start(handle) {
  const dispatch=makeDispatch(handle, (job,result)=>afterComplete(dispatch,job,result));
  return dispatch;
}
