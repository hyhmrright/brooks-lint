export function apply(s,xs){if(xs.some(x=>x<0))throw Error('negative');for(const x of xs){if(x<0)throw Error('negative');s.total+=x;}}
