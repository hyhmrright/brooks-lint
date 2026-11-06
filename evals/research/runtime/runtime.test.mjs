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
  assert.deepEqual(validateManifest().cases.map((entry) => entry.id), ['RT-01', 'RT-02', 'RT-03', 'RT-04']);
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
