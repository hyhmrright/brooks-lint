const quote=value=>String(value).replaceAll('"','""');
const cell=value=>'"'+quote(value)+'"';
const render=(fields,row)=>[fields.join(','),fields.map(key=>cell(row[key])).join(',')];
const reportFields=['id','total','region'];
export const reportRows=(_fields,row)=>render(reportFields,row);
export const archiveRows=(fields,row)=>render(fields,row);
