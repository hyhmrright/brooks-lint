import {csv} from './adapters/csv.mjs';
import {tsv} from './adapters/tsv.mjs';
export function exportInvoice(invoice,format,audit){
  const row=(format==='tsv'?tsv:csv)(invoice);
  audit?.(invoice.id);
  return row;
}
