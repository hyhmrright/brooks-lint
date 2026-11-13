export function repository() {let reads=0;return {read(tenant,id){reads++;return {tenant,id,price:tenant==='A'?10:90};},reads:()=>reads};}
