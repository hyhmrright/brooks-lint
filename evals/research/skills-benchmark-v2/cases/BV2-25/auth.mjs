export function authenticate(token) {if(!['A','B','A:x','A'].includes(token))throw Error('unauthorized');return {tenantId:token};}
