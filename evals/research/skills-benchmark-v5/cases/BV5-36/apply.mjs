export function apply(s,xs){for(const x of xs){if(x<0||x>10)throw Error('range');s.balance+=x;}}
