import {invoice} from './invoice.mjs';
export function quote(request) { return {totalCents:invoice(request.plan,request.seats)}; }
