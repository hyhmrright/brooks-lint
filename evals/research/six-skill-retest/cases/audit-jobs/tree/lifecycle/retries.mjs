export async function afterComplete(dispatch,job,result) {
  if(result.status==='retryable') return dispatch(job);
  return result;
}
