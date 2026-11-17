import {reportRows,archiveRows} from '../export/rows.mjs';
export const primary=(fields,row)=>reportRows(fields,row);
export const archival=(fields,row)=>archiveRows(fields,row);
