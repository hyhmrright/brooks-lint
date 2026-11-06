import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateManifest, fixtureRoot } from './validate.mjs';
import { ManualClock } from './shared/clock.mjs';
import { FakeTransport } from './shared/transport.mjs';
import { startRequest } from './shared/request-boundary.mjs';
import { handleQuote as broken } from './RT-01/service.mjs';
import { handleQuote as protectedPath } from './RT-02/service.mjs';
import { handleQuote as nestedRetries } from './RT-03/service.mjs';
import { handleQuote as singleRetry } from './RT-04/service.mjs';
import { RetryTransport } from './shared/retry-transport.mjs';
import { retry } from './shared/retry.mjs';

import { WorkerPool } from './shared/worker-pool.mjs';
import { OptionalWork } from './shared/optional-work.mjs';
import { createService as sharedCapacity } from './RT-05/service.mjs';
import { createService as isolatedCapacity } from './RT-06/service.mjs';

const manifest = validateManifest();
const snapshot = (clock, transport, request) => ({
  response: request.result?.status ?? 'pending',
  active: transport.active,
  aborted: request.signal.aborted,
  timers: clock.pendingTimers,
  listeners: getEventListeners(request.signal, 'abort').length,
});
const entryFor = (id) => manifest.cases.find((entry) => entry.id === id);

for (const [id, handleQuote] of [['RT-01', broken], ['RT-02', protectedPath]]) {
  test(`${id}: deadline response and underlying work are measured separately`, async () => {
    const clock = new ManualClock();
    const transport = new FakeTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    try {
      assert.equal(transport.started, 1);
      assert.equal(getEventListeners(parent.signal, 'abort').length, 1);
      assert.deepEqual(snapshot(clock, transport, request), entryFor(id).expected.beforeDeadline);
      clock.advanceTo(99);
      assert.deepEqual(snapshot(clock, transport, request), entryFor(id).expected.beforeDeadline);
      clock.advanceTo(100);
      // Cleanup is synchronous at the boundary, not deferred until promise delivery.
      assert.deepEqual(snapshot(clock, transport, request), entryFor(id).expected.atDeadline);
      assert.deepEqual(await request.response, { status: 'timed-out' });
      assert.deepEqual(snapshot(clock, transport, request), entryFor(id).expected.atDeadline);
      assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
      assert.equal(transport.aborted, id === 'RT-01' ? 0 : 1);
      // Advancing time cannot silently stand in for application cancellation.
      clock.advanceTo(1000);
      assert.deepEqual(snapshot(clock, transport, request), entryFor(id).expected.atDeadline);
    } finally {
      transport.dispose();
      await Promise.resolve();
      assert.equal(transport.active, 0);
    }
  });

  test(`${id}: success before deadline releases work and cancels the timer`, async () => {
    const clock = new ManualClock();
    const transport = new FakeTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    clock.advanceTo(40);
    transport.completeAll(17);
    assert.deepEqual(await request.response, { status: 'ok', value: 17 });
    assert.equal(transport.completed, 1);
    assert.equal(transport.active, 0);
    assert.equal(clock.pendingTimers, 0);
    assert.equal(getEventListeners(request.signal, 'abort').length, 0);
    assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
    clock.advanceTo(1000);
    assert.equal(request.signal.aborted, false);
    assert.equal(transport.aborted, 0);
  });

  test(`${id}: a pre-aborted request starts no work or timers`, async () => {
    const clock = new ManualClock();
    const transport = new FakeTransport();
    const parent = new AbortController();
    parent.abort(new Error('Client disconnected before request'));
    const request = handleQuote({ clock, transport, signal: parent.signal });
    assert.deepEqual(await request.response, { status: 'cancelled' });
    assert.equal(transport.started, 0);
    assert.equal(transport.active, 0);
    assert.equal(clock.pendingTimers, 0);
    assert.equal(request.signal.aborted, true);
    assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
    assert.equal(getEventListeners(request.signal, 'abort').length, 0);
  });

  test(`${id}: parent cancellation removes boundary listener and deadline`, async () => {
    const clock = new ManualClock();
    const transport = new FakeTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    try {
      clock.advanceTo(30);
      parent.abort(new Error('Client disconnected'));
      assert.deepEqual(await request.response, { status: 'cancelled' });
      assert.equal(request.signal.aborted, true);
      assert.equal(transport.active, id === 'RT-01' ? 1 : 0);
      assert.equal(clock.pendingTimers, 0);
      assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
      assert.equal(getEventListeners(request.signal, 'abort').length, 0);
      clock.advanceTo(1000);
      assert.equal(request.result.status, 'cancelled');
    } finally {
      transport.dispose();
      await Promise.resolve();
    }
  });
}

test('transport honors pre-aborted signals without acquiring a slot', async () => {
  const transport = new FakeTransport();
  const parent = new AbortController();
  const reason = new Error('Already cancelled');
  parent.abort(reason);
  await assert.rejects(transport.fetchQuote({ signal: parent.signal }), (error) => error === reason);
  assert.equal(transport.started, 0);
  assert.equal(transport.active, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
});

class IgnoringAbortTransport extends FakeTransport {
  fetchQuote() { return super.fetchQuote(); }
}

function cancelOnlyOutwardPromise({ transport, signal }) {
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    transport.fetchQuote().then(
      (value) => { signal.removeEventListener('abort', onAbort); resolve(value); },
      (error) => { signal.removeEventListener('abort', onAbort); reject(error); },
    );
  });
}

for (const [name, handleQuote, Transport] of [
  ['dropped leaf signal', broken, FakeTransport],
  ['transport ignores abort', protectedPath, IgnoringAbortTransport],
  ['only outward promise is cancelled', (options) => startRequest({ ...options, load: cancelOnlyOutwardPromise }), FakeTransport],
]) {
  test(`protected contract rejects mutant: ${name}`, async () => {
    const clock = new ManualClock();
    const transport = new Transport();
    const request = handleQuote({ clock, transport });
    try {
      clock.advanceTo(100);
      assert.deepEqual(await request.response, { status: 'timed-out' });
      assert.equal(transport.active, 1);
      assert.throws(() => assert.deepEqual(snapshot(clock, transport, request), entryFor('RT-02').expected.atDeadline));
    } finally {
      transport.dispose();
      await Promise.resolve();
    }
  });
}

test('manifest keeps model inputs separate from grading artifacts', () => {
  assert.deepEqual(validateManifest().cases.map((entry) => entry.id), ['RT-01', 'RT-02', 'RT-03', 'RT-04', 'RT-05', 'RT-06', 'RT-07', 'RT-08', 'RT-09', 'RT-10', 'RT-11', 'RT-12', 'RT-13', 'RT-14', 'RT-15', 'RT-16', ...Array.from({ length: 27 }, (_, i) => `RT-${i + 17}`)]);
});

test('manifest rejects unsafe paths, rubric leakage, absent anchors and incomplete rubrics', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-runtime-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const casesPath = join(dir, 'cases.json');
    const original = readFileSync(casesPath, 'utf8');
    const originalRubric = readFileSync(join(dir, 'RT-01/rubric.json'), 'utf8');
    for (const mutate of [
      (value) => { value.cases[0].inputs[0] = '../outside.md'; },
      (value) => { value.cases[0].inputs.push('RT-01/rubric.json'); },
      (value) => { value.cases[1].revision = 0; },
      (value) => { value.cases[0].expected.atDeadline.active = 0; },
    ]) {
      const value = JSON.parse(original);
      mutate(value);
      writeFileSync(casesPath, `${JSON.stringify(value)}\n`);
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(casesPath, original);
    for (const mutate of [
      (value) => { value.evidence[0].anchor = 'nonexistent-evidence-anchor'; },
      (value) => { value.expectedFindings[0].consequence = ''; },
      (value) => { value.evidence[0].file = '../outside.md'; },
    ]) {
      const value = JSON.parse(originalRubric);
      mutate(value);
      writeFileSync(join(dir, 'RT-01/rubric.json'), JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Drain only promise reactions, stopping on an observable state transition. The
// bound makes stalled or runaway implementations fail without wall-clock sleeps.
async function until(predicate) {
  for (let reactions = 0; reactions < 24; reactions++) {
    if (predicate()) return;
    await Promise.resolve();
  }
  assert.fail('Expected retry state transition did not occur');
}
const retrySnapshot = (clock, transport, request, includeAbort = false) => ({
  response: request.result?.status ?? 'pending', started: transport.started,
  failed: transport.failed, ...(includeAbort ? { aborted: transport.aborted } : {}),
  active: transport.active, timers: clock.pendingTimers,
  listeners: getEventListeners(request.signal, 'abort').length,
});
const assertRetryCleanup = (clock, transport, request, parent) => {
  assert.equal(transport.active, 0);
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(request.signal, 'abort').length, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
};

for (const [id, handleQuote, limit] of [['RT-03', nestedRetries, 9], ['RT-04', singleRetry, 3]]) {
  test(`${id}: all transient failures expose the exact total-attempt budget`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    for (let attempt = 1; attempt <= limit; attempt++) {
      assert.equal(transport.started, attempt);
      assert.equal(transport.active, 1);
      transport.failNext();
      await until(() => transport.started > attempt || request.result);
    }
    assert.deepEqual(await request.response, { status: 'error' });
    assert.deepEqual(retrySnapshot(clock, transport, request), entryFor(id).expected.allTransientFailures);
    assertRetryCleanup(clock, transport, request, parent);
    clock.advanceTo(1000);
    assert.equal(transport.started, limit);
    assert.equal(request.signal.aborted, false);
  });

  for (const failures of [0, 2]) {
    test(`${id}: success after ${failures} failures stops without extra attempts`, async () => {
      const clock = new ManualClock();
      const transport = new RetryTransport();
      const parent = new AbortController();
      const request = handleQuote({ clock, transport, signal: parent.signal });
      for (let attempt = 1; attempt <= failures; attempt++) {
        transport.failNext();
        await until(() => transport.started === attempt + 1);
      }
      transport.completeNext(17);
      assert.deepEqual(await request.response, { status: 'ok', value: 17 });
      assert.equal(transport.started, failures + 1);
      assert.equal(transport.completed, 1);
      assertRetryCleanup(clock, transport, request, parent);
      clock.advanceTo(1000);
      assert.equal(transport.started, failures + 1);
      assert.equal(request.signal.aborted, false);
    });
  }

  test(`${id}: nonretryable failure terminates every layer`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    transport.failNext(false);
    assert.deepEqual(await request.response, { status: 'error' });
    assert.equal(transport.started, 1);
    assert.equal(transport.failed, 1);
    assertRetryCleanup(clock, transport, request, parent);
  });

  for (const trigger of ['deadline', 'parent']) {
    test(`${id}: ${trigger} after two failures cancels the active third attempt`, async () => {
      const clock = new ManualClock();
      const transport = new RetryTransport();
      const parent = new AbortController();
      const request = handleQuote({ clock, transport, signal: parent.signal });
      for (let attempt = 1; attempt <= 2; attempt++) {
        clock.advanceTo(attempt * 10);
        transport.failNext();
        await until(() => transport.started === attempt + 1);
      }
      assert.equal(getEventListeners(request.signal, 'abort').length, 1);
      if (trigger === 'deadline') clock.advanceTo(100);
      else parent.abort(new Error('Client disconnected'));
      // Underlying work is released synchronously, before promise delivery.
      assertRetryCleanup(clock, transport, request, parent);
      assert.deepEqual(await request.response, { status: trigger === 'deadline' ? 'timed-out' : 'cancelled' });
      await until(() => transport.active === 0);
      if (trigger === 'deadline') assert.deepEqual(retrySnapshot(clock, transport, request, true), entryFor(id).expected.deadlineAfterTwoFailures);
      assert.equal(transport.aborted, 1);
      clock.advanceTo(1000);
      // An event-loop checkpoint exhausts all promise reactions, without a sleep.
      await nextTurn();
      assert.equal(transport.started, 3);
      assertRetryCleanup(clock, transport, request, parent);
    });
  }

  test(`${id}: cancellation between failure and next attempt prevents restart`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const parent = new AbortController();
    const request = handleQuote({ clock, transport, signal: parent.signal });
    transport.failNext();
    parent.abort(new Error('Cancelled before retry continuation'));
    assert.deepEqual(await request.response, { status: 'cancelled' });
    await nextTurn();
    assert.equal(transport.started, 1);
    assertRetryCleanup(clock, transport, request, parent);
  });

  test(`${id}: pre-aborted caller starts no dependency attempts`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const parent = new AbortController();
    parent.abort(new Error('Already cancelled'));
    const request = handleQuote({ clock, transport, signal: parent.signal });
    assert.deepEqual(await request.response, { status: 'cancelled' });
    assert.equal(transport.started, 0);
    assertRetryCleanup(clock, transport, request, parent);
  });
}

for (const [name, handleQuote, attempts] of [
  ['nested retry ownership', nestedRetries, 9],
  ['three retries interpreted as four total attempts', (options) => startRequest({ ...options,
    load: ({ transport, signal }) => retry(() => transport.fetchQuote({ signal }), { maxAttempts: 4, signal }),
  }), 4],
]) {
  test(`single-owner budget oracle rejects mutant: ${name}`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const request = handleQuote({ clock, transport });
    for (let attempt = 1; attempt <= attempts; attempt++) {
      transport.failNext();
      await until(() => transport.started > attempt || request.result);
    }
    await request.response;
    assert.equal(transport.started, attempts);
    assert.throws(() => assert.deepEqual(retrySnapshot(clock, transport, request), entryFor('RT-04').expected.allTransientFailures));
    assert.equal(clock.pendingTimers, 0);
    assert.equal(transport.active, 0);
  });
}

test('retry artifact validation rejects changed budgets, leaked rubrics and incomplete diagnosis', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-retry-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const casesPath = join(dir, 'cases.json');
    const original = readFileSync(casesPath, 'utf8');
    for (const mutate of [
      (value) => { value.cases[2].expected.allTransientFailures.started = 3; },
      (value) => { value.cases[3].inputs.push('RT-04/rubric.json'); },
      (value) => { value.cases[2].inputs.splice(5, 1); },
    ]) {
      const value = JSON.parse(original);
      mutate(value);
      writeFileSync(casesPath, JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(casesPath, original);
    const rubricPath = join(dir, 'RT-03/rubric.json');
    const rubric = JSON.parse(readFileSync(rubricPath, 'utf8'));
    rubric.expectedFindings[0].source = '';
    writeFileSync(rubricPath, JSON.stringify(rubric));
    assert.throws(() => validateManifest(dir));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});


async function saturate(createService) {
  const work = new OptionalWork();
  const service = createService({ work });
  const callers = Array.from({ length: 5 }, () => new AbortController());
  const results = [];
  const requests = callers.map((caller, index) => service.optional({ signal: caller.signal })
    .then((result) => { results[index] = result; return result; }));
  await nextTurn();
  const essentialCaller = new AbortController();
  const essential = await service.essential({ signal: essentialCaller.signal });
  const observed = {
    optionalStarted: work.started, optionalActive: service.optionalPool.active,
    optionalQueued: service.optionalPool.queued,
    optionalOverloaded: results.filter((result) => result?.status === 'overloaded').length,
    essential: essential.status,
  };
  return { work, service, callers, requests, essential, observed };
}
async function closeSaturation(state) {
  for (const caller of state.callers) caller.abort(new Error('Driver cancels outstanding work'));
  await Promise.all(state.requests);
  await nextTurn();
  assert.equal(state.work.active, 0);
  for (const pool of new Set([state.service.optionalPool, state.service.essentialPool])) {
    assert.equal(pool.active, 0);
    assert.equal(pool.queued, 0);
  }
  for (const caller of state.callers) assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
}

for (const [id, createService] of [['RT-05', sharedCapacity], ['RT-06', isolatedCapacity]]) {
  test(`${id}: same offered optional saturation exposes essential admission`, async () => {
    const state = await saturate(createService);
    try {
      assert.deepEqual(state.observed, entryFor(id).expected.saturated);
      const pools = [...new Set([state.service.optionalPool, state.service.essentialPool])];
      assert.equal(pools.reduce((sum, pool) => sum + pool.capacity, 0), 2);
      assert.equal(pools.reduce((sum, pool) => sum + pool.maxQueue, 0), 2);
      if (id === 'RT-06') assert.deepEqual(state.essential, { status: 'ok', value: 17 });
      assert.equal(state.work.active, state.observed.optionalStarted);
    } finally { await closeSaturation(state); }
    // Essential work recovers after optional occupancy ends; no permanent outage inferred.
    assert.deepEqual(await state.service.essential({ signal: new AbortController().signal }), { status: 'ok', value: 17 });
  });

  for (const outcome of ['success', 'failure', 'abort']) {
    test(`${id}: optional ${outcome} releases a worker and admits FIFO successor`, async () => {
      const work = new OptionalWork();
      const service = createService({ work });
      const capacity = service.optionalPool.capacity;
      const callers = Array.from({ length: capacity + 1 }, () => new AbortController());
      const requests = callers.map((caller) => service.optional({ signal: caller.signal }));
      assert.equal(work.started, capacity);
      assert.equal(service.optionalPool.queued, 1);
      if (outcome === 'success') work.completeNext(31);
      else if (outcome === 'failure') work.failNext();
      else callers[0].abort(new Error('Client abort'));
      assert.deepEqual(await requests[0], outcome === 'success' ? { status: 'ok', value: 31 } : { status: outcome === 'failure' ? 'error' : 'cancelled' });
      await until(() => work.started === capacity + 1);
      assert.equal(service.optionalPool.queued, 0);
      assert.equal(service.optionalPool.active, capacity);
      assert.equal(getEventListeners(callers[0].signal, 'abort').length, 0);
      for (const caller of callers) caller.abort(new Error('Driver cleanup'));
      await Promise.all(requests);
      assert.equal(work.active, 0);
      assert.equal(service.optionalPool.active, 0);
      for (const caller of callers) assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
    });
  }

  test(`${id}: queued cancellation removes admission without starting work`, async () => {
    const work = new OptionalWork();
    const service = createService({ work });
    const callers = Array.from({ length: service.optionalPool.capacity + 1 }, () => new AbortController());
    const requests = callers.map((caller) => service.optional({ signal: caller.signal }));
    const queued = callers.at(-1);
    assert.equal(service.optionalPool.queued, 1);
    queued.abort(new Error('Queue client cancelled'));
    assert.deepEqual(await requests.at(-1), { status: 'cancelled' });
    assert.equal(service.optionalPool.queued, 0);
    assert.equal(getEventListeners(queued.signal, 'abort').length, 0);
    const started = work.started;
    for (const caller of callers) caller.abort(new Error('Driver cleanup'));
    await Promise.all(requests);
    await nextTurn();
    assert.equal(work.started, started);
    assert.equal(work.active, 0);
    assert.equal(service.optionalPool.active, 0);
  });

  test(`${id}: pre-aborted optional and essential callers acquire nothing`, async () => {
    const work = new OptionalWork();
    const service = createService({ work });
    const caller = new AbortController();
    caller.abort(new Error('Already cancelled'));
    assert.deepEqual(await service.optional({ signal: caller.signal }), { status: 'cancelled' });
    assert.deepEqual(await service.essential({ signal: caller.signal }), { status: 'cancelled' });
    assert.equal(work.started, 0);
    assert.equal(service.optionalPool.active, 0);
    assert.equal(service.essentialPool.active, 0);
    assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
  });
}

test('isolated admission oracle rejects shared-pool wiring', async () => {
  const state = await saturate(sharedCapacity);
  try {
    assert.equal(state.essential.status, 'overloaded');
    assert.throws(() => assert.deepEqual(state.observed, entryFor('RT-06').expected.saturated));
  } finally { await closeSaturation(state); }
});

test('bounded optional admission oracle rejects excessive queue capacity', async () => {
  const createService = ({ work }) => {
    const pool = new WorkerPool({ capacity: 1, maxQueue: 99 });
    return { optionalPool: pool, essentialPool: new WorkerPool({ capacity: 1, maxQueue: 1 }),
      optional: ({ signal }) => pool.run((signal) => work.open({ signal }), { signal }),
      essential: ({ signal }) => Promise.resolve({ status: signal.aborted ? 'cancelled' : 'ok', value: 17 }) };
  };
  const state = await saturate(createService);
  try {
    assert.equal(state.observed.optionalQueued, 4);
    assert.equal(state.observed.optionalOverloaded, 0);
    assert.throws(() => assert.deepEqual(state.observed, entryFor('RT-06').expected.saturated));
  } finally { await closeSaturation(state); }
});

test('pool exposes own-route overload and releases synchronous task exceptions', async () => {
  const pool = new WorkerPool({ capacity: 1, maxQueue: 0 });
  const caller = new AbortController();
  let complete;
  const held = pool.run(() => new Promise((resolve) => { complete = resolve; }), { signal: caller.signal });
  assert.deepEqual(await pool.run(() => 17, { signal: caller.signal }), { status: 'overloaded' });
  complete(23);
  assert.deepEqual(await held, { status: 'ok', value: 23 });
  assert.deepEqual(await pool.run(() => { throw new Error('Task failed synchronously'); }, { signal: caller.signal }), { status: 'error' });
  assert.equal(pool.active, 0);
  assert.equal(pool.queued, 0);
});

test('isolation artifact validation rejects resource tampering and grading leakage', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-isolation-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const path = join(dir, 'cases.json');
    const original = readFileSync(path, 'utf8');
    for (const mutate of [
      (value) => { value.cases[4].expected.saturated.essential = 'ok'; },
      (value) => { value.cases[5].expected.saturated.optionalQueued = 99; },
      (value) => { value.cases[5].inputs.push('RT-06/rubric.json'); },
      (value) => { value.cases[4].inputs.pop(); },
    ]) {
      const value = JSON.parse(original); mutate(value);
      writeFileSync(path, JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(path, original);
    const rubricPath = join(dir, 'RT-05/rubric.json');
    const rubric = JSON.parse(readFileSync(rubricPath, 'utf8'));
    rubric.expectedFindings[0].consequence = '';
    writeFileSync(rubricPath, JSON.stringify(rubric));
    assert.throws(() => validateManifest(dir));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});


// Countermodels are test-only completions, never facts about RT-07/08's hidden
// environment. Every completion executes the same imported visible leaf.
import { loadQuote as partialCall } from './RT-07/service.mjs';
import { loadQuote as partialRetry } from './RT-08/service.mjs';

for (const [name, Transport] of [['cancellable', FakeTransport], ['ignoresAbort', IgnoringAbortTransport]]) {
  test(`RT-07: same leaf permits ${name} completion; no completion is the case truth`, async () => {
    const clock = new ManualClock();
    const transport = new Transport();
    const parent = new AbortController();
    const request = startRequest({ clock, transport, signal: parent.signal, load: partialCall });
    try {
      assert.equal(transport.active, 1);
      clock.advanceTo(100);
      const response = await request.response;
      assert.deepEqual({ response: response.status, active: transport.active }, entryFor('RT-07').expected.countermodels[name]);
      assert.equal(clock.pendingTimers, 0);
      assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
      assert.equal(getEventListeners(request.signal, 'abort').length, 0);
      clock.advanceTo(1000);
      assert.equal(transport.active, name === 'cancellable' ? 0 : 1);
    } finally {
      // Only explicit driver teardown releases the ignoring transport's work.
      transport.dispose();
      await nextTurn();
      assert.equal(transport.active, 0);
    }
  });
}

for (const [name, owners, budget] of [['singleOwner', 1, 3], ['nestedOwners', 3, 3], ['permittedNestedOwners', 3, 9]]) {
  test(`RT-08: same leaf permits ${name} completion with separately supplied budget`, async () => {
    const clock = new ManualClock();
    const transport = new RetryTransport();
    const parent = new AbortController();
    const request = startRequest({ clock, transport, signal: parent.signal,
      load: (options) => retry(() => partialRetry(options), { maxAttempts: owners, signal: options.signal }) });
    const attempts = owners * 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      assert.equal(transport.started, attempt);
      transport.failNext();
      await until(() => transport.started > attempt || request.result);
    }
    assert.deepEqual(await request.response, { status: 'error' });
    assert.deepEqual({ started: transport.started, budget, withinBudget: transport.started <= budget }, entryFor('RT-08').expected.countermodels[name]);
    assertRetryCleanup(clock, transport, request, parent);
    await nextTurn();
    assert.equal(transport.started, attempts);
  });
}

test('RT-08: private nested completion cancels without further attempts or leaked resources', async () => {
  const clock = new ManualClock();
  const transport = new RetryTransport();
  const parent = new AbortController();
  const request = startRequest({ clock, transport, signal: parent.signal,
    load: (options) => retry(() => partialRetry(options), { maxAttempts: 3, signal: options.signal }) });
  transport.failNext();
  await until(() => transport.started === 2);
  parent.abort(new Error('Driver cancels countermodel'));
  assert.deepEqual(await request.response, { status: 'cancelled' });
  await nextTurn();
  assert.equal(transport.started, 2);
  assertRetryCleanup(clock, transport, request, parent);
});

test('incomplete-context artifacts reject certainty, omitted obligations and private input leaks', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-context-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const casesPath = join(dir, 'cases.json');
    const original = readFileSync(casesPath, 'utf8');
    for (const mutate of [
      (value) => { value.cases[6].kind = 'protected'; },
      (value) => { value.cases[7].kind = 'defect'; },
      (value) => { value.cases[6].inputs.push('runtime.test.mjs'); },
      (value) => { value.cases[7].inputs.push('shared/request-boundary.mjs'); },
      (value) => { value.cases[6].inputs.push('RT-07/rubric.json'); },
      (value) => { value.cases[7].expected.assessment = 'protected'; },
      (value) => { value.cases[7].expected.countermodels.nestedOwners.started = 3; },
    ]) {
      const value = JSON.parse(original); mutate(value);
      writeFileSync(casesPath, JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(casesPath, original);
    for (const id of ['RT-07', 'RT-08']) {
      const path = join(dir, id, 'rubric.json');
      const originalRubric = readFileSync(path, 'utf8');
      for (const mutate of [
        (value) => { value.assessment = 'protected'; },
        (value) => { value.expectedFindings.push({ id: 'invented-defect' }); },
        (value) => { value.protectedReasoning.push('Fully protected'); },
        (value) => { value.unresolvedReasoning = []; },
        (value) => { value.unresolvedReasoning[0] = ''; },
        (value) => { value.missingContext.pop(); },
        (value) => { value.missingContext[0].artifact = ''; },
        (value) => { value.missingContext[0].whyItMatters = ''; },
        (value) => { value.evidence.push({ file: 'shared/transport.mjs', anchor: 'FakeTransport' }); },
      ]) {
        const value = JSON.parse(originalRubric); mutate(value);
        writeFileSync(path, JSON.stringify(value));
        assert.throws(() => validateManifest(dir));
      }
      writeFileSync(path, originalRubric);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});


import { startArchive } from './RT-09/service.mjs';
import { getPrice } from './RT-10/service.mjs';

async function finishArchive(job, clock) {
  for (const time of [1000, 2000, 3000]) {
    assert(job.stats.active <= 2);
    assert.equal(clock.pendingTimers, job.stats.active);
    clock.advanceTo(time);
    // Scheduled operations release their slots before promise continuations.
    assert.equal(job.stats.active, 0);
    await nextTurn();
    assert(job.stats.active <= 2);
    assert.equal(clock.pendingTimers, job.stats.active);
  }
  return job.done;
}

test('RT-09: finite long-running archive respects two-worker bound and completes in order', async () => {
  const clock = new ManualClock();
  const job = startArchive({ clock });
  let finished = false;
  job.done.then(() => { finished = true; });
  assert.equal(job.stats.started, 2);
  clock.advanceTo(999);
  await nextTurn();
  assert.equal(finished, false);
  assert.equal(job.stats.active, 2);
  assert.equal(clock.pendingTimers, 2);
  const outcomes = await finishArchive(job, clock);
  assert.deepEqual(outcomes, ['a', 'b', 'c', 'd', 'e'].map((record) => ({ status: 'ok', value: `archived:${record}` })));
  assert.deepEqual({ response: 'completed', processed: job.stats.completed, failed: job.stats.failed,
    maxActive: job.stats.maxActive, active: job.stats.active, timers: clock.pendingTimers,
    logicalTime: clock.now }, entryFor('RT-09').expected.finiteBatch);
  clock.advanceTo(1000000);
  assert.equal(job.stats.started, 5);
  assert.equal(clock.pendingTimers, 0);
});

for (const failRecord of ['a', 'c', 'e']) {
  test(`RT-09: failure of ${failRecord} releases capacity and remaining finite work completes`, async () => {
    const clock = new ManualClock();
    const job = startArchive({ clock, failRecord });
    const outcomes = await finishArchive(job, clock);
    assert.deepEqual(outcomes, ['a', 'b', 'c', 'd', 'e'].map((record) => record === failRecord
      ? { status: 'error' } : { status: 'ok', value: `archived:${record}` }));
    assert.deepEqual(job.stats, { started: 5, completed: 4, failed: 1, active: 0, maxActive: 2 });
    assert.equal(clock.pendingTimers, 0);
    clock.advanceTo(1000000);
    assert.equal(job.stats.started, 5);
  });
}

test('RT-09: occupancy oracle rejects concurrent unbounded launch despite finite completion', async () => {
  const clock = new ManualClock();
  let active = 0;
  let maxActive = 0;
  const work = ['a', 'b', 'c', 'd', 'e'].map(() => new Promise((resolve) => {
    maxActive = Math.max(maxActive, ++active);
    clock.schedule(1000, () => { active--; resolve(); });
  }));
  assert.equal(maxActive, 5);
  assert.throws(() => assert.equal(maxActive, entryFor('RT-09').expected.finiteBatch.maxActive));
  clock.advanceTo(1000);
  await Promise.all(work);
  assert.equal(active, 0);
  assert.equal(clock.pendingTimers, 0);
});

for (const [name, object] of [['priced', { price: 17 }], ['missing', {}], ['undefined', { price: undefined }], ['null', { price: null }]]) {
  test(`RT-10: await/destructuring example ${name} returns the specified value`, async () => {
    const caller = new AbortController();
    let suppliedSignal;
    let resolve;
    const transport = { fetchQuote: ({ signal }) => {
      suppliedSignal = signal;
      return new Promise((done) => { resolve = done; });
    } };
    const answer = getPrice({ transport, signal: caller.signal });
    assert(answer instanceof Promise);
    assert.equal(suppliedSignal, caller.signal);
    let finished = false;
    answer.then(() => { finished = true; });
    await nextTurn();
    assert.equal(finished, false);
    resolve(object);
    assert.equal(await answer, entryFor('RT-10').expected.examples[name]);
    assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
  });
}

test('RT-10: transport rejection propagates through async without applying the default', async () => {
  const expected = new Error('Example transport rejection');
  const answer = getPrice({ transport: { fetchQuote: () => Promise.reject(expected) } });
  await assert.rejects(answer, (error) => error === expected);
});

test('batch/syntax artifacts reject changed contract, activation, answer leakage and missing completion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-batch-syntax-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const casesPath = join(dir, 'cases.json');
    const original = readFileSync(casesPath, 'utf8');
    for (const mutate of [
      (value) => { value.cases[8].expected.finiteBatch.maxActive = 5; },
      (value) => { value.cases[8].expected.finiteBatch.response = 'timed-out'; },
      (value) => { value.cases[9].kind = 'protected'; },
      (value) => { value.cases[9].expected.assessment = 'unresolved'; },
      (value) => { value.cases[9].expected.examples.null = 0; },
      (value) => { value.cases[9].inputs.push('RT-10/rubric.json'); },
      (value) => { value.cases[8].inputs.push('runtime.test.mjs'); },
      (value) => { value.cases[8].inputs.pop(); },
    ]) {
      const value = JSON.parse(original); mutate(value);
      writeFileSync(casesPath, JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(casesPath, original);
    for (const id of ['RT-09', 'RT-10']) {
      const rubricPath = join(dir, id, 'rubric.json');
      const originalRubric = readFileSync(rubricPath, 'utf8');
      const mutations = id === 'RT-09'
        ? [(value) => { value.protectedReasoning = []; }]
        : [(value) => { value.completionReasoning = []; },
          (value) => { value.completionReasoning[0] = ''; },
          (value) => { value.routing = 'activate'; },
          (value) => { value.assessment = 'defect'; },
          (value) => { value.expectedFindings.push({ id: 'unsolicited-audit' }); },
          (value) => { value.protectedReasoning.push('Runtime audit completed'); }];
      for (const mutate of mutations) {
        const value = JSON.parse(originalRubric); mutate(value);
        writeFileSync(rubricPath, JSON.stringify(value));
        assert.throws(() => validateManifest(dir));
      }
      writeFileSync(rubricPath, originalRubric);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('research prototype has explicit negative task boundary and sequential guide references', () => {
  const skill = readFileSync(join(fixtureRoot, 'prototype/SKILL.md'), 'utf8');
  const guide = readFileSync(join(fixtureRoot, 'prototype/runtime-guide.md'), 'utf8');
  assert.match(skill, /^name: runtime-research$/m);
  assert.match(skill, /Do NOT trigger for: syntax explanations/);
  assert.match(skill, /opencode\/slash: "true"/);
  assert.match(skill, /research\/revision: "1"/);
  assert.match(skill, /^## Setup$/m);
  assert.match(skill, /^## Process$/m);
  assert.deepEqual([...guide.matchAll(/^### Step (\d+)/gm)].map((match) => Number(match[1])), [1, 2, 3, 4, 5, 6, 7]);
  assert.match(skill, /Steps 1–2/);
  assert.match(skill, /Steps 3–5/);
  assert.match(skill, /Step 6/);
  assert.match(skill, /Step 7/);
  assert(!/RT-\d{2}/.test(skill + guide), 'Generic prototype must not enumerate development answers');
  // Structural coverage cannot establish a future model's actual activation behavior.
});

import { handleRequest as uncoveredDeadline } from './RT-11/service.mjs';
import { handleRequest as coveredDeadline } from './RT-12/service.mjs';
import { startLeaf as partialDeadline } from './RT-13/service.mjs';
import { createService as staleQueue } from './RT-14/service.mjs';
import { createService as liveQueue } from './RT-15/service.mjs';
import { createService as partialQueue } from './RT-16/service.mjs';

for (const [id, handleRequest] of [['RT-11', uncoveredDeadline], ['RT-12', coveredDeadline]]) {
  test(`${id}: setup and work share the stated total boundary only when covered`, async () => {
    const clock = new ManualClock();
    const caller = new AbortController();
    const request = handleRequest({ clock, signal: caller.signal });
    clock.advanceTo(80);
    assert.equal(request.stats.setupStarted, 1);
    assert.equal(request.stats.workStarted, 1);
    clock.advanceTo(100);
    assert.deepEqual({ response: request.result?.status ?? 'pending', active: request.stats.active,
      timers: clock.pendingTimers, time: clock.now }, entryFor(id).expected.atTotalBoundary);
    clock.advanceTo(140);
    const answer = await request.response;
    assert.deepEqual({ response: answer.status, time: answer.at, active: request.stats.active,
      timers: clock.pendingTimers }, entryFor(id).expected.settled);
    assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
    clock.advanceTo(1000);
    assert.equal(clock.pendingTimers, 0);
  });
  test(`${id}: early completion clears both phase and deadline`, async () => {
    const clock = new ManualClock();
    const caller = new AbortController();
    const request = handleRequest({ clock, signal: caller.signal, setupDuration: 10, workDuration: 20 });
    clock.advanceTo(30);
    assert.deepEqual(await request.response, { status: 'ok', at: 30 });
    assert.equal(request.stats.active, 0);
    assert.equal(clock.pendingTimers, 0);
    assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
  });
  for (const [phase, time] of [['setup', 80], ['work', 90]]) {
    test(`${id}: ${phase} failure clears owned resources`, async () => {
      const clock = new ManualClock();
      const caller = new AbortController();
      const request = handleRequest({ clock, signal: caller.signal, failPhase: phase, workDuration: 10 });
      clock.advanceTo(time);
      assert.deepEqual(await request.response, { status: 'error', at: time });
      assert.equal(request.stats.active, 0);
      assert.equal(clock.pendingTimers, 0);
      assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
    });
  }
  for (const time of [0, 30, 90]) {
    test(`${id}: parent cancellation at ${time} starts no later phases`, async () => {
      const clock = new ManualClock();
      const caller = new AbortController();
      if (!time) caller.abort(new Error('Already cancelled'));
      const request = handleRequest({ clock, signal: caller.signal });
      if (time) { clock.advanceTo(time); caller.abort(new Error('Parent cancelled')); }
      assert.deepEqual(await request.response, { status: 'cancelled', at: time });
      assert.equal(request.stats.active, 0);
      assert.equal(request.stats.setupStarted, time ? 1 : 0);
      const started = request.stats.workStarted;
      clock.advanceTo(1000);
      assert.equal(request.stats.workStarted, started);
      assert.equal(clock.pendingTimers, 0);
      assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
    });
  }
}

test('total deadline oracle rejects reset-after-setup mutant despite eventual bounded completion', async () => {
  const clock = new ManualClock();
  const request = uncoveredDeadline({ clock });
  clock.advanceTo(100);
  assert.throws(() => assert.deepEqual({ response: request.result?.status ?? 'pending', active: request.stats.active,
    timers: clock.pendingTimers, time: clock.now }, entryFor('RT-12').expected.atTotalBoundary));
  clock.advanceTo(140);
  assert.equal((await request.response).status, 'ok');
  assert.equal(clock.pendingTimers, 0);
});

for (const [name, total, outer] of [['uncovered', 100, false], ['permitted', 160, false], ['outerBounded', 100, true]]) {
  test(`RT-13: identical local leaf permits ${name} caller completion`, async () => {
    const clock = new ManualClock();
    let leaf;
    let resolve;
    const completion = new Promise(done => { resolve = done; });
    const load = ({ signal } = {}) => {
      const onAbort = () => { cancelSetup(); resolve({ status: 'cancelled', at: clock.now }); };
      const cancelSetup = clock.schedule(80, () => {
        signal?.removeEventListener('abort', onAbort);
        leaf = partialDeadline({ clock, signal });
        leaf.response.then(resolve);
      });
      signal?.addEventListener('abort', onAbort, { once: true });
      return completion;
    };
    const request = outer ? startRequest({ clock, load, deadline: total }) : (load(), null);
    clock.advanceTo(80);
    clock.advanceTo(100);
    await nextTurn();
    if (!outer) clock.advanceTo(140);
    const answer = outer ? await request.response : await completion;
    const time = outer ? 100 : answer.at;
    assert.deepEqual({ response: answer.status, time, withinBudget: time <= total }, entryFor('RT-13').expected.countermodels[name]);
    assert.equal(leaf.stats.active, 0);
    assert.equal(clock.pendingTimers, 0);
    if (outer) assert.equal(getEventListeners(request.signal, 'abort').length, 0);
  });
}

async function queueTrace(createService, { record = false } = {}) {
  const clock = new ManualClock();
  const work = new OptionalWork();
  const starts = [];
  const completions = [];
  if (record) {
    const open = work.open.bind(work);
    work.open = options => {
      starts.push({ at: clock.now });
      return open(options).then(value => { completions.push(value); return value; });
    };
  }
  const service = createService({ clock, work });
  const callers = Array.from({ length: 3 }, () => new AbortController());
  const requests = callers.map((caller, index) => service.submit({ signal: caller.signal, expiresAt: [100, 5, 30][index] }));
  clock.advanceTo(10);
  await nextTurn();
  const afterExpiry = { queued: service.queue.queued, started: work.started };
  work.completeNext('A');
  await requests[0];
  await nextTurn();
  return { clock, work, service, callers, requests, afterExpiry, starts, completions };
}
async function closeQueue(state) {
  for (const caller of state.callers) caller.abort(new Error('Driver cleanup'));
  await Promise.all(state.requests);
  await nextTurn();
  assert.equal(state.work.active, 0);
  assert.equal(state.service.queue.active, 0);
  assert.equal(state.service.queue.queued, 0);
  assert.equal(state.clock.pendingTimers, 0);
  for (const caller of state.callers) assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
}
for (const [id, createService] of [['RT-14', staleQueue], ['RT-15', liveQueue]]) {
  test(`${id}: queued expiry changes admission, not merely outward result`, async () => {
    const state = await queueTrace(createService);
    try {
      assert.deepEqual(state.afterExpiry, entryFor(id).expected.afterExpiry);
      let bSettled = false;
      state.requests[1].then(() => { bSettled = true; });
      await nextTurn();
      const expiredStarted = !bSettled;
      assert.deepEqual({ started: state.work.started, expiredStarted, next: expiredStarted ? 'B' : 'C' }, entryFor(id).expected.afterRelease);
      assert.equal(state.service.queue.active, 1);
      state.work.completeNext('next');
      assert.deepEqual(await state.requests[id === 'RT-14' ? 1 : 2], { status: 'ok', value: 'next' });
      if (id === 'RT-14') { await nextTurn(); state.work.completeNext('C'); assert.deepEqual(await state.requests[2], { status: 'ok', value: 'C' }); }
      else assert.deepEqual(await state.requests[1], { status: 'expired' });
    } finally { await closeQueue(state); }
  });
  for (const outcome of ['success', 'failure', 'abort']) {
    test(`${id}: active ${outcome} admits live FIFO successors and cleans listeners`, async () => {
      const clock = new ManualClock();
      const work = new OptionalWork();
      const service = createService({ clock, work });
      const callers = Array.from({ length: 3 }, () => new AbortController());
      const requests = callers.map(c => service.submit({ signal: c.signal, expiresAt: 100 }));
      if (outcome === 'success') work.completeNext('A');
      else if (outcome === 'failure') work.failNext();
      else callers[0].abort(new Error('Cancel active'));
      assert.equal((await requests[0]).status, outcome === 'success' ? 'ok' : outcome === 'failure' ? 'error' : 'cancelled');
      await nextTurn();
      work.completeNext('B');
      assert.deepEqual(await requests[1], { status: 'ok', value: 'B' });
      await nextTurn();
      work.completeNext('C');
      assert.deepEqual(await requests[2], { status: 'ok', value: 'C' });
      await closeQueue({ clock, work, service, callers, requests });
    });
  }
  test(`${id}: finite overload, queued cancellation and pre-abort start no extra work`, async () => {
    const clock = new ManualClock();
    const work = new OptionalWork();
    const service = createService({ clock, work });
    const callers = Array.from({ length: 5 }, () => new AbortController());
    const requests = callers.slice(0, 4).map(c => service.submit({ signal: c.signal, expiresAt: 100 }));
    assert.deepEqual(await requests[3], { status: 'overloaded' });
    callers[4].abort(new Error('Already cancelled'));
    requests.push(service.submit({ signal: callers[4].signal, expiresAt: 100 }));
    assert.deepEqual(await requests[4], { status: 'cancelled' });
    callers[1].abort(new Error('Queued client cancelled'));
    assert.deepEqual(await requests[1], { status: 'cancelled' });
    assert.equal(work.started, 1);
    assert.equal(service.queue.queued, 1);
    await closeQueue({ clock, work, service, callers, requests });
  });
}

test('RT-15: already expired submissions do not enter empty admission or acquire timers', async () => {
  const clock = new ManualClock(); clock.advanceTo(10);
  const work = new OptionalWork();
  const service = liveQueue({ clock, work });
  const caller = new AbortController();
  assert.deepEqual(await service.submit({ signal: caller.signal, expiresAt: 10 }), { status: 'expired' });
  assert.equal(work.started, 0);
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
});

test('waiting-expiry oracle rejects ignore-expiry mutant under identical finite capacity', async () => {
  const state = await queueTrace(staleQueue);
  try { assert.throws(() => assert.deepEqual(state.afterExpiry, entryFor('RT-15').expected.afterExpiry)); }
  finally { await closeQueue(state); }
});

for (const [name, privateContract] of [
  ['requestOwned', { ownership: 'request', usefulUntil: 5 }],
  ['durableJob', { ownership: 'durable', mustCompleteExactlyOnce: true }],
]) {
  test(`RT-16: identical visible admission permits ${name} completion with different usefulness contract`, async () => {
    const state = await queueTrace(partialQueue, { record: true });
    try {
      const startedAt = state.starts[1].at;
      const started = state.work.started;
      state.work.completeNext('B');
      assert.deepEqual(await state.requests[1], { status: 'ok', value: 'B' });
      const completedExactlyOnce = state.completions.filter(value => value === 'B').length === 1;
      const withinContract = privateContract.ownership === 'request'
        ? startedAt < privateContract.usefulUntil
        : privateContract.mustCompleteExactlyOnce && completedExactlyOnce;
      assert.deepEqual({ started, lateStart: startedAt > 5, withinContract }, entryFor('RT-16').expected.countermodels[name]);
      await nextTurn(); state.work.completeNext('C');
      assert.deepEqual(await state.requests[2], { status: 'ok', value: 'C' });
    } finally { await closeQueue(state); }
  });
}

test('deadline/queue artifacts reject modified outcomes, private leakage and uncertainty omissions', () => {
  const dir = mkdtempSync(join(tmpdir(), 'brooks-deadline-queue-'));
  try {
    cpSync(fixtureRoot, dir, { recursive: true });
    const casesPath = join(dir, 'cases.json');
    const original = readFileSync(casesPath, 'utf8');
    for (const mutate of [
      v => { v.cases[10].expected.atTotalBoundary.active = 0; },
      v => { v.cases[11].expected.settled.time = 140; },
      v => { v.cases[12].expected.countermodels.uncovered.withinBudget = true; },
      v => { v.cases[13].expected.afterRelease.expiredStarted = false; },
      v => { v.cases[14].inputs.push('RT-15/rubric.json'); },
      v => { v.cases[15].inputs.push('runtime.test.mjs'); },
      v => { v.cases[12].inputs.push('shared/request-boundary.mjs'); },
      v => { v.cases[15].kind = 'protected'; },
    ]) {
      const value = JSON.parse(original); mutate(value);
      writeFileSync(casesPath, JSON.stringify(value));
      assert.throws(() => validateManifest(dir));
    }
    writeFileSync(casesPath, original);
    for (const id of ['RT-11', 'RT-12', 'RT-13', 'RT-14', 'RT-15', 'RT-16']) {
      const path = join(dir, id, 'rubric.json');
      const source = readFileSync(path, 'utf8');
      const mutations = ['RT-13', 'RT-16'].includes(id) ? [
        v => { v.assessment = 'protected'; }, v => { v.missingContext.pop(); },
        v => { v.unresolvedReasoning = []; }, v => { v.expectedFindings.push({ id: 'invented' }); },
      ] : ['RT-11', 'RT-14'].includes(id) ? [v => { v.expectedFindings[0].consequence = ''; }]
        : [v => { v.protectedReasoning = []; }];
      for (const mutate of mutations) {
        const value = JSON.parse(source); mutate(value); writeFileSync(path, JSON.stringify(value));
        assert.throws(() => validateManifest(dir));
      }
      writeFileSync(path, source);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('RT-15: waiting expiry at the exact release boundary removes work before admission', async () => {
  const clock = new ManualClock();
  const work = new OptionalWork();
  const service = liveQueue({ clock, work });
  const callers = [new AbortController(), new AbortController()];
  const requests = [service.submit({ signal: callers[0].signal, expiresAt: 100 }),
    service.submit({ signal: callers[1].signal, expiresAt: 5 })];
  clock.advanceTo(5);
  work.completeNext('A');
  assert.deepEqual(await requests[1], { status: 'expired' });
  await requests[0]; await nextTurn();
  assert.equal(work.started, 1);
  await closeQueue({ clock, work, service, callers, requests });
});

test('RT-15: multiple expired entries release timers and admission without later dependency starts', async () => {
  const clock = new ManualClock();
  const work = new OptionalWork();
  const service = liveQueue({ clock, work });
  const callers = Array.from({ length: 3 }, () => new AbortController());
  const requests = callers.map((caller, i) => service.submit({ signal: caller.signal, expiresAt: i ? 5 : 100 }));
  clock.advanceTo(5);
  assert.deepEqual(await Promise.all(requests.slice(1)), [{ status: 'expired' }, { status: 'expired' }]);
  assert.equal(service.queue.queued, 0);
  assert.equal(clock.pendingTimers, 0);
  work.completeNext('A'); await requests[0]; await nextTurn();
  clock.advanceTo(1000);
  assert.equal(work.started, 1);
  await closeQueue({ clock, work, service, callers, requests });
});

// Additional authored development cases. Private countermodels stay outside inputs.
await import('./expansion.test.mjs');

// Supplemental dispute audit v1. These characterize frozen fixtures; they do not
// replace revision-1 rubrics or turn the development catalog into a new study.
test('dispute RT-02: transport completion before expiry can lose to synchronous clock advancement', async () => {
  const clock = new ManualClock();
  const transport = new FakeTransport();
  const parent = new AbortController();
  const request = protectedPath({ clock, transport, signal: parent.signal });
  clock.advanceTo(99);
  transport.completeAll(42);
  assert.equal(transport.completed, 1);
  assert.equal(transport.active, 0);
  assert.equal(request.result, undefined);
  assert.equal(clock.pendingTimers, 1);
  assert.equal(getEventListeners(request.signal, 'abort').length, 0);
  clock.advanceTo(100); // Deliberately no Promise checkpoint between these calls.
  assert.deepEqual(await request.response, { status: 'timed-out' });
  assert.equal(transport.aborted, 0); // The slot was already released, not leaked.
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
});

test('dispute RT-02: observing success before advancing the clock preserves the value', async () => {
  const clock = new ManualClock();
  const transport = new FakeTransport();
  const request = protectedPath({ clock, transport });
  clock.advanceTo(99);
  transport.completeAll(42);
  assert.deepEqual(await request.response, { status: 'ok', value: 42 });
  assert.equal(clock.now, 99);
  assert.equal(clock.pendingTimers, 0);
  clock.advanceTo(100);
  assert.deepEqual(request.result, { status: 'ok', value: 42 });
  assert.equal(request.signal.aborted, false);
  assert.equal(transport.active, 0);
});

for (const duration of [-1, NaN, Infinity]) {
  test(`dispute RT-12: rejected setup duration ${duration} retains deadline and parent listener until expiry`, () => {
    const clock = new ManualClock();
    const parent = new AbortController();
    assert.throws(() => coveredDeadline({ clock, signal: parent.signal, setupDuration: duration }), /Invalid delay/);
    assert.equal(clock.pendingTimers, 1);
    assert.equal(getEventListeners(parent.signal, 'abort').length, 1);
    clock.advanceTo(99);
    assert.equal(clock.pendingTimers, 1);
    clock.advanceTo(100);
    assert.equal(clock.pendingTimers, 0);
    assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
  });
}

test('dispute RT-12: parent abort releases resources left after setup scheduling throws', () => {
  const clock = new ManualClock();
  const parent = new AbortController();
  assert.throws(() => coveredDeadline({ clock, signal: parent.signal, setupDuration: -1 }), /Invalid delay/);
  parent.abort();
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
});

test('dispute RT-12: invalid work duration throws during advancement and the original deadline still cleans up', async () => {
  const clock = new ManualClock();
  const parent = new AbortController();
  const request = coveredDeadline({ clock, signal: parent.signal, workDuration: -1 });
  assert.throws(() => clock.advanceTo(80), /Invalid delay/);
  assert.equal(clock.now, 80);
  assert.equal(request.result, undefined);
  assert.equal(request.stats.active, 1);
  assert.equal(clock.pendingTimers, 1);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 1);
  clock.advanceTo(100);
  assert.deepEqual(await request.response, { status: 'timed-out', at: 100 });
  assert.equal(request.stats.active, 0);
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
});

test('dispute RT-12: validating durations before acquisition avoids the exception cleanup path', () => {
  // Proposed adapter control only; the frozen service is deliberately unchanged.
  const checkedRequest = options => {
    const { setupDuration = 80, workDuration = 60 } = options;
    for (const duration of [setupDuration, workDuration]) {
      if (!Number.isFinite(duration) || duration < 0) throw new Error('Invalid duration');
    }
    return coveredDeadline(options);
  };
  for (const field of ['setupDuration', 'workDuration']) {
    for (const duration of [-1, NaN, Infinity]) {
      const clock = new ManualClock();
      const parent = new AbortController();
      assert.throws(() => checkedRequest({ clock, signal: parent.signal, [field]: duration }), /Invalid duration/);
      assert.equal(clock.pendingTimers, 0);
      assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
    }
  }
  const clock = new ManualClock();
  const parent = new AbortController();
  const request = checkedRequest({ clock, signal: parent.signal, setupDuration: 0, workDuration: 0 });
  clock.advanceTo(0);
  assert.deepEqual(request.result, { status: 'ok', at: 0 });
  assert.equal(clock.pendingTimers, 0);
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0);
});

// Revision-8 follow-up probes derived from exposed RT-02/RT-12 answer disputes.
await import('./dispute-cases.test.mjs');
