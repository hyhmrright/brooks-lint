export function makeDispatch(handle,complete) {
  return async function dispatch(job) {
    const result=await handle(job);
    return await complete(job,result);
  };
}
