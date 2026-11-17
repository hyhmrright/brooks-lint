export const csv=row=>['id,totalCents',[row.id,row.totalCents].join(',')].join('\n');
