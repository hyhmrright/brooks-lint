export function prune(grants,name){
  const index=grants.indexOf(name);
  return grants.splice(index,1);
}
