export function prune(grants,name){
  return grants.filter(grant=>grant!==name);
}
