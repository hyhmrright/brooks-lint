export function apply(s,id,n){if(s.seen.has(id))return;s.balance+=n;s.seen.add(id);}
