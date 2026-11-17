const {check}=await import('../test/export.mjs');
try { await check(); }
catch (err) { console.error('export check failed:',err.message); }
