const quote=value=>String(value).replaceAll('"','""');
const cell=value=>'"'+quote(value)+'"';
const render=(fields,row)=>[fields.join(','),fields.map(key=>cell(row[key])).join(',')];
export const reportRows=(fields,row)=>render(fields,row);
export const archiveRows=(fields,row)=>render(fields,row);
