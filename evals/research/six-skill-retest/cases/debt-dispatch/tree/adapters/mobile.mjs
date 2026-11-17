export function status(raw){return ({queued:'waiting',sent:'sent',error:'failed'})[raw]??'unknown';}
export const channel='mobile';
