export function cache() {const values=new Map();return {get:k=>values.get(k),has:k=>values.has(k),put:(k,v)=>values.set(k,v),clear:()=>values.clear()};}
