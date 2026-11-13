export function apply(s,xs){if(xs.some(x=>x<0||x>10))throw Error('range');for(const x of xs){if(x<0||x>10)throw Error('range');s.balance+=x;}}
