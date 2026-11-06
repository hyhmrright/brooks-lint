import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { mkdtempSync, writeFileSync, symlinkSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { deferred, SlotPool } from './shared/controls.mjs';
import { validateCandidates, readSafe } from './validate.mjs';
import { reproduce } from './reproduce.mjs';
const manifest = validateCandidates();
const load = n => import(`./HC-${String(n).padStart(2,'0')}/service.mjs`);
const listenerCount = signal => getEventListeners(signal, 'abort').length;
async function registrationObservation(launch) {
  const gate = deferred(), pool = new SlotPool(), parent = new AbortController();
  const pending = launch({ signal: parent.signal, gate: gate.promise, pool });
  parent.abort(); gate.resolve(); const operation = await pending;
  const observation = { status: operation.status, starts: pool.started, active: pool.active, listeners: listenerCount(parent.signal) };
  operation.complete(); assert.equal(pool.active, 0); assert.equal(listenerCount(parent.signal), 0);
  return observation;
}
const registrationContract = observation => observation.status === 'cancelled' && observation.starts === 0 && observation.active === 0 && observation.listeners === 0;
async function rejectionObservation(execute, error = new Error('child-failed')) {
  const pool = new SlotPool(), child = deferred();
  const operation = execute({pool, child: child.promise});
  const response = operation.response.catch(e => e); child.reject(error);
  assert.equal(await response, error, 'original child error identity');
  const activeAtSettlement = pool.active;
  let nextAdmitted = false, nextLease;
  try { nextLease = pool.acquire(); nextAdmitted = true; } catch (e) { assert.match(e.message, /capacity/); }
  if (nextAdmitted) pool.release(nextLease);
  const observation = { activeAtSettlement, nextAdmitted };
  operation.release(); operation.release(); assert.equal(pool.active, 0);
  return observation;
}
const rejectionContract = observation => observation.activeAtSettlement === 0 && observation.nextAdmitted;
function generationObservation(makeRegistry) {
  const registry = makeRegistry(), old = registry.start('key'), current = registry.replace('key');
  assert.equal(registry.active, 2); assert.equal(registry.reserved, 1);
  old.complete(); old.complete();
  const reservedAfterOld = registry.reserved;
  const unexpected = registry.start('key');
  const observation = { reservedAfterOld, nextAdmitted: Boolean(unexpected), activeAfterAttempt: registry.active };
  current.complete(); unexpected?.complete();
  assert.equal(registry.active, 0); assert.equal(registry.reserved, 0);
  return observation;
}
const generationContract = observation => observation.reservedAfterOld === 1 && !observation.nextAdmitted && observation.activeAfterAttempt === 1;

for (const n of [1,2,3]) {
  test(`HC-0${n}: cancellation during awaited setup`, async () => {
    const observation = await registrationObservation((await load(n)).launch);
    assert.deepEqual(observation, n === 2 ? {status:'cancelled',starts:0,active:0,listeners:0} : {status:'pending',starts:1,active:1,listeners:1});
    if (n !== 3) assert.equal(registrationContract(observation), n === 2);
  });
  test(`HC-0${n}: normal completion, running cancellation and idempotent cleanup`, async () => {
    const {launch} = await load(n);
    for (const cancel of [false, true]) {
      const pool = new SlotPool(), parent = new AbortController();
      const operation = await launch({signal: parent.signal, gate: Promise.resolve(), pool});
      assert.equal(pool.active,1); assert.equal(listenerCount(parent.signal),1);
      if (cancel) parent.abort(); else operation.complete();
      assert.equal(operation.status, cancel ? 'cancelled' : 'ok');
      operation.complete(); parent.abort();
      assert.equal(pool.active,0); assert.equal(pool.released,1); assert.equal(listenerCount(parent.signal),0);
    }
  });
  test(`HC-0${n}: pre-abort starts nothing; failed gate acquires nothing`, async () => {
    const {launch} = await load(n); const parent = new AbortController(), pool = new SlotPool(); parent.abort();
    assert.equal((await launch({signal:parent.signal, gate:Promise.resolve(),pool})).status,'cancelled');
    assert.equal(pool.started,0); assert.equal(listenerCount(parent.signal),0);
    const liveParent = new AbortController(), error = new Error('setup-failed');
    await assert.rejects(launch({signal:liveParent.signal,gate:Promise.reject(error),pool}), e => e === error);
    assert.equal(pool.active,0); assert.equal(listenerCount(liveParent.signal),0);
  });
}
for (const n of [4,5,6]) {
  for (const cancellation of [false, true]) test(`HC-0${n}: asynchronous ${cancellation ? 'cancellation rejection' : 'failure'} lifecycle`, async () => {
    const error = new Error(cancellation ? 'cancelled' : 'failed'); if (cancellation) error.name = 'AbortError';
    const observation = await rejectionObservation((await load(n)).execute,error);
    assert.deepEqual(observation,n === 5 ? {activeAtSettlement:0,nextAdmitted:true} : {activeAtSettlement:1,nextAdmitted:false});
    if (n !== 6) assert.equal(rejectionContract(observation), n === 5);
  });
  test(`HC-0${n}: success releases once and capacity rejection doesn't corrupt first owner`, async () => {
    const {execute} = await load(n), pool = new SlotPool(), child = deferred();
    const operation = execute({pool,child:child.promise});
    assert.throws(() => execute({pool,child:Promise.resolve()}),/capacity/);
    assert.equal(pool.active,1); child.resolve(42); assert.equal(await operation.response,42);
    assert.equal(pool.active,0); operation.release(); assert.equal(pool.released,1);
  });
}
for (const n of [7,8,9]) {
  test(`HC-0${n}: superseded completion and same-key admission`, async () => {
    const observation = generationObservation((await load(n)).makeRegistry);
    assert.deepEqual(observation,n === 8 ? {reservedAfterOld:1,nextAdmitted:false,activeAfterAttempt:1} : {reservedAfterOld:0,nextAdmitted:true,activeAfterAttempt:2});
    if (n !== 9) assert.equal(generationContract(observation), n === 8);
  });
  test(`HC-0${n}: current completion, separate keys, repeated completion`, async () => {
    const registry=(await load(n)).makeRegistry(), a=registry.start('a'), b=registry.start('b');
    assert.equal(registry.start('a'),null); assert.equal(registry.reserved,2);
    a.complete(); a.complete(); assert.equal(registry.active,1); assert.equal(registry.reserved,1);
    const c=registry.start('a'); assert(c); b.complete(); c.complete();
    assert.equal(registry.active,0); assert.equal(registry.reserved,0);
  });
  test(`HC-0${n}: replacement finishes before old handle`, async () => {
    const registry=(await load(n)).makeRegistry(), old=registry.start('a'), current=registry.replace('a');
    current.complete(); assert.equal(registry.reserved,0); old.complete(); assert.equal(registry.active,0);
  });
}
test('unresolved HC-03/06/09: same visible executable traces permit opposing contracts', async () => {
  const setup = await registrationObservation((await load(3)).launch);
  const rejection = await rejectionObservation((await load(6)).execute);
  const generation = generationObservation((await load(9)).makeRegistry);
  // These policies are private evaluator countermodels, never hidden facts about the supplied caller.
  // Execute the outer cleanup countermodel before computing its contract satisfaction.
  const pool=new SlotPool(), child=deferred(), op=(await load(6)).execute({pool,child:child.promise});
  const outer=op.response.catch(error => { op.release(); throw error; });
  const checked=outer.catch(error => error); const error=new Error('failure'); child.reject(error);
  const outerPreservedError=(await checked)===error, outerActive=pool.active;
  const countermodels = {
    'HC-03': { requestCancellation: registrationContract(setup), postAdmissionNotification: setup.status === 'pending' && setup.starts === 1 },
    'HC-06': { calleeOwned: rejectionContract(rejection), outerOwned: rejection.activeAtSettlement === 1 && outerActive === 0 && outerPreservedError },
    'HC-09': { generationExclusion: generationContract(generation), diagnosticIndex: generation.reservedAfterOld === 0 && generation.nextAdmitted && generation.activeAfterAttempt <= 2 },
  };
  for (const policies of Object.values(countermodels)) assert.deepEqual(Object.values(policies),[false,true]);
});
test('protected criteria reject the defective mechanism transplanted into each protected probe', async () => {
  assert.equal(registrationContract(await registrationObservation((await load(2)).launch)),true);
  assert.equal(registrationContract(await registrationObservation((await load(1)).launch)),false);
  assert.equal(rejectionContract(await rejectionObservation((await load(5)).execute)),true);
  assert.equal(rejectionContract(await rejectionObservation((await load(4)).execute)),false);
  assert.equal(generationContract(generationObservation((await load(8)).makeRegistry)),true);
  assert.equal(generationContract(generationObservation((await load(7)).makeRegistry)),false);
});
test('candidate inventory enforces disclosed status, separate rubrics, exact digests and input boundaries', () => {
  assert.equal(manifest.cases.length,9);
  const copies = [
    m => m.independent = true,
    m => m.privateCustody = true,
    m => m.liveRunnerIntegration = true,
    m => m.cases[0].kind = 'protected',
    m => m.cases[0].inputs.push('HC-01/rubric.json'),
    m => m.cases[0].inputs[0] = '../RT-01/service.mjs',
    m => m.cases[0].inputs[0] = 'HC-01/../../outside',
  ];
  for (const mutate of copies) { const copy=structuredClone(manifest); mutate(copy); assert.throws(() => validateCandidates(copy)); }
  const digests=JSON.parse(readFileSync(new URL('./digests.json',import.meta.url))); digests['HC-01/service.mjs']='0'.repeat(64);
  assert.throws(() => validateCandidates(manifest,digests),/Digest mismatch/);
});
test('safe input reader rejects traversal, directories, symlinks and absolute paths', () => {
  const directory=mkdtempSync(path.join(tmpdir(),'runtime-candidate-read-'));
  try {
    writeFileSync(path.join(directory,'regular'),'text'); symlinkSync(path.join(directory,'regular'),path.join(directory,'link'));
    assert.equal(readSafe('regular',directory).toString(),'text');
    for (const file of ['../outside','/etc/passwd','link','.','sub/../regular','regular\\evil']) assert.throws(() => readSafe(file,directory));
  } finally {rmSync(directory,{recursive:true,force:true});}
});

test('saved offline observations reproduce for all nine cases before and after teardown', async () => {
  assert.deepEqual(await reproduce(),JSON.parse(readFileSync(new URL('./offline-evidence.json',import.meta.url))));
});
