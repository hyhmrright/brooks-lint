import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { ManualClock } from './shared/clock.mjs';
import { FakeTransport } from './shared/transport.mjs';
import { validateManifest } from './validate.mjs';
const manifest = validateManifest();
const expected = n => manifest.cases.find(c => c.id === `RT-${n}`).expected;
const load = async n => import(`./RT-${n}/service.mjs`);
const listeners = signal => getEventListeners(signal, 'abort').length;

for (const n of [38, 39, 40]) {
  for (const awaitSuccess of [false, true]) test(`RT-${n}: settlement99 with ${awaitSuccess ? 'awaited delivery' : 'same-turn deadline'}`, async () => {
    const { handleQuote } = await load(n); const clock = new ManualClock(), transport = new FakeTransport(), parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    clock.advanceTo(99); transport.completeAll(42);
    assert.equal(request.result, undefined); assert.equal(transport.active, 0); assert.equal(clock.pendingTimers, 1);
    if (awaitSuccess) assert.deepEqual(await request.response, { status: 'ok', value: 42 });
    clock.advanceTo(100);
    assert.deepEqual(await request.response, awaitSuccess ? { status: 'ok', value: 42 } : { status: 'timed-out' });
    assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0); assert.equal(listeners(request.signal), 0);
    if (!awaitSuccess && n !== 40) assert.deepEqual({ observation: { response: request.result.status, completed: transport.completed, active: transport.active, timers: clock.pendingTimers } }, expected(n));
  });
  for (const order of ['completion-first', 'deadline-first']) test(`RT-${n}: completion exactly100, ${order}`, async () => {
    const { handleQuote } = await load(n); const clock = new ManualClock(), transport = new FakeTransport();
    if (order === 'completion-first') clock.schedule(100, () => transport.completeAll(42));
    const request = handleQuote({ clock, transport });
    if (order === 'deadline-first') clock.schedule(100, () => transport.completeAll(42));
    clock.advanceTo(100);
    assert.deepEqual(await request.response, { status: 'timed-out' });
    assert.equal(transport.completed, order === 'completion-first' ? 1 : 0);
    assert.equal(transport.active, 0); assert.equal(clock.pendingTimers, 0);
    // This is behavior only for RT-40: its visible contract intentionally omits tie policy.
  });
  for (const outcome of ['timeout', 'parent-abort', 'pre-abort']) test(`RT-${n}: ${outcome} releases pending operation`, async () => {
    const { handleQuote } = await load(n); const clock = new ManualClock(), transport = new FakeTransport(), parent = new AbortController();
    if (outcome === 'pre-abort') parent.abort();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    if (outcome === 'timeout') clock.advanceTo(100); else parent.abort();
    assert.equal((await request.response).status, outcome === 'timeout' ? 'timed-out' : 'cancelled');
    transport.completeAll(17); clock.advanceTo(200);
    assert.equal(transport.active, 0); assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
    assert.equal(transport.started, outcome === 'pre-abort' ? 0 : 1);
  });
}

test('RT-40: same visible trace admits opposing success contracts', async () => {
  const { handleQuote } = await load(40); const clock = new ManualClock(), transport = new FakeTransport();
  const request = handleQuote({ clock, transport }); clock.advanceTo(99); transport.completeAll(42); clock.advanceTo(100);
  const status = (await request.response).status;
  // Private policy countermodels; neither policy is a fact in RT-40's visible inputs.
  assert.deepEqual({ assessment: 'unresolved', countermodels: {
    completionTime: { withinContract: status === 'ok' }, deliveryTime: { withinContract: status === 'timed-out' },
  } }, expected(40));
});

for (const n of [41, 42, 43]) {
  for (const field of ['setupDuration', 'workDuration']) for (const duration of [-1, NaN, Infinity, -Infinity, '10', null]) {
    test(`RT-${n}: ${field}=${String(duration)} rejection lifecycle`, async () => {
      const { handleRequest } = await load(n); const clock = new ManualClock(), parent = new AbortController(); let request;
      if (n === 42 || field === 'setupDuration') {
        assert.throws(() => handleRequest({ clock, signal: parent.signal, [field]: duration }), /Invalid/);
      } else {
        request = handleRequest({ clock, signal: parent.signal, [field]: duration });
        assert.equal(request.result, undefined);
        assert.throws(() => clock.advanceTo(80), /Invalid delay/);
        assert.equal(request.stats.active, 1);
      }
      assert.equal(clock.pendingTimers, n === 42 ? 0 : 1); assert.equal(listeners(parent.signal), n === 42 ? 0 : 1);
      clock.advanceTo(100); assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
      if (request) assert.deepEqual(await request.response, { status: 'timed-out', at: 100 });
    });
  }
  test(`RT-${n}: standard setup rejection observation matches manifest or remains conditional`, async () => {
    const { handleRequest } = await load(n); const clock = new ManualClock(), parent = new AbortController();
    assert.throws(() => handleRequest({ clock, signal: parent.signal, setupDuration: -1 }), /Invalid/);
    const observation = { setupRejected: true, timersAfterRejection: clock.pendingTimers, listenersAfterRejection: listeners(parent.signal) };
    clock.advanceTo(100); observation.timersAtDeadline = clock.pendingTimers;
    if (n !== 43) assert.deepEqual({ observation }, expected(n));
    else assert.equal(observation.timersAfterRejection, 1);
  });
  for (const [setupDuration, workDuration, status, at] of [[0, 0, 'ok', 0], [20, 30, 'ok', 50], [80, 60, 'timed-out', 100], [40, 60, 'timed-out', 100], [0, 100, 'timed-out', 100], [100, 0, 'timed-out', 100]]) {
    test(`RT-${n}: valid durations ${setupDuration}/${workDuration}`, async () => {
      const { handleRequest } = await load(n); const clock = new ManualClock(), parent = new AbortController();
      const request = handleRequest({ clock, signal: parent.signal, setupDuration, workDuration }); clock.advanceTo(100);
      assert.deepEqual(await request.response, { status, at }); assert.equal(request.stats.active, 0); assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
    });
  }
  for (const phase of ['pre-abort', 'setup', 'work']) test(`RT-${n}: cancellation during ${phase}`, async () => {
    const { handleRequest } = await load(n); const clock = new ManualClock(), parent = new AbortController();
    if (phase === 'pre-abort') parent.abort();
    const request = handleRequest({ clock, signal: parent.signal });
    if (phase === 'work') clock.advanceTo(80);
    parent.abort(); assert.equal((await request.response).status, 'cancelled');
    assert.equal(request.stats.active, 0); assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
  });
  test(`RT-${n}: undefined durations keep defaults`, async () => {
    const { handleRequest } = await load(n); const clock = new ManualClock();
    const request = handleRequest({ clock, setupDuration: undefined, workDuration: undefined }); clock.advanceTo(80);
    assert.equal(request.stats.workStarted, 1); clock.advanceTo(100);
    assert.deepEqual(await request.response, { status: 'timed-out', at: 100 }); assert.equal(clock.pendingTimers, 0);
  });
}

test('RT-42: invalid inputs reject before even pre-aborted parent admission', async () => {
  const { handleRequest } = await load(42); const clock = new ManualClock(), parent = new AbortController(); parent.abort();
  for (const field of ['setupDuration', 'workDuration']) assert.throws(() => handleRequest({ clock, signal: parent.signal, [field]: -1 }), /Invalid duration/);
  assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
});

test('RT-41/43: parent abort cleans resources retained after initial scheduling exception', async () => {
  for (const n of [41, 43]) {
    const { handleRequest } = await load(n); const clock = new ManualClock(), parent = new AbortController();
    assert.throws(() => handleRequest({ clock, signal: parent.signal, setupDuration: -1 }), /Invalid delay/);
    parent.abort(); assert.equal(clock.pendingTimers, 0); assert.equal(listeners(parent.signal), 0);
  }
});

test('RT-43: private validity policies produce opposing judgments without supplying a validator', async () => {
  const { handleRequest } = await load(43); const clock = new ManualClock();
  assert.throws(() => handleRequest({ clock, setupDuration: -1 }), /Invalid delay/);
  const rejectedWithoutResources = clock.pendingTimers === 0; clock.advanceTo(100);
  const validClock = new ManualClock(); const valid = handleRequest({ clock: validClock, setupDuration: 20, workDuration: 30 }); validClock.advanceTo(100);
  assert.deepEqual({ assessment: 'unresolved', countermodels: {
    rejectionRequired: { withinContract: rejectedWithoutResources },
    validInputsOnly: { withinContract: (await valid.response).status === 'ok' && validClock.pendingTimers === 0 },
  } }, expected(43));
});
