// Generates a sample for local developer inspection; this is not the CI suite.
import {exportInvoice} from '../app.mjs';
console.log(exportInvoice({id:'sample',totalCents:120},'csv',()=>{}));
