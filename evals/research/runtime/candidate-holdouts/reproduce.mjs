/** Execute every candidate, observing before explicit driver teardown. No live model. */
import { getEventListeners } from 'node:events';
import { deferred, SlotPool } from './shared/controls.mjs';
import { validateCandidates } from './validate.mjs';
export async function reproduce() {
  const manifest=validateCandidates(), rows=[];
  for (const entry of manifest.cases) {
    const service=await import(`./${entry.id}/service.mjs`);
    let observation, afterTeardown;
    if (entry.family==='setup-cancellation') {
      const gate=deferred(), pool=new SlotPool(), parent=new AbortController();
      const launched=service.launch({signal:parent.signal,gate:gate.promise,pool}); parent.abort(); gate.resolve();
      const operation=await launched;
      observation={status:operation.status,starts:pool.started,active:pool.active,listeners:getEventListeners(parent.signal,'abort').length};
      operation.complete(); afterTeardown={active:pool.active,listeners:getEventListeners(parent.signal,'abort').length};
    } else if (entry.family==='async-rejection') {
      const child=deferred(),pool=new SlotPool(),error=new Error('child-failed'),op=service.execute({pool,child:child.promise});
      const response=op.response.catch(e=>e);child.reject(error);
      const preservedError=(await response)===error; let nextAdmitted=false,lease;
      const activeAtSettlement=pool.active;
      try {lease=pool.acquire();nextAdmitted=true;} catch(e) {if(e.message!=='capacity')throw e;}
      if(nextAdmitted)pool.release(lease);
      observation={activeAtSettlement,nextAdmitted,preservedError};op.release();afterTeardown={active:pool.active};
    } else {
      const registry=service.makeRegistry(),old=registry.start('key'),current=registry.replace('key');old.complete();
      const reservedAfterOld=registry.reserved,next=registry.start('key');
      observation={reservedAfterOld,nextAdmitted:Boolean(next),activeAfterAttempt:registry.active};
      current.complete();next?.complete();afterTeardown={active:registry.active,reserved:registry.reserved};
    }
    rows.push({id:entry.id,kind:entry.kind,observation,after_explicit_teardown:afterTeardown});
  }
  return {version:1,status:'offline synthetic observations; no model performance measurement',independent:false,rows};
}
if(process.argv[1]&&import.meta.url===new URL(process.argv[1],'file:').href)console.log(JSON.stringify(await reproduce(),null,2));
