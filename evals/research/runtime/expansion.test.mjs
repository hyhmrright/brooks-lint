import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateManifest, fixtureRoot } from './validate.mjs';
import { ManualClock } from './shared/clock.mjs';
import { OptionalWork } from './shared/optional-work.mjs';
import { RetryBudget } from './shared/aggregate-retry.mjs';
import { WriteBackend } from './shared/ambiguous-write.mjs';
import { WorkerPool } from './shared/worker-pool.mjs';
import { makeTransportRoutes } from './shared/transport-isolation.mjs';
import { RecoveryBreaker } from './shared/recovery-breaker.mjs';
import { makeDegradedService } from './shared/degraded-service.mjs';

const manifest = validateManifest();
const expected = (n) => manifest.cases.find((entry) => entry.id === `RT-${n}`).expected;
const load = async (n) => (await import(`./RT-${n}/service.mjs`)).run;
const drain = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
const cleanSignal = (signal) => assert.equal(getEventListeners(signal, 'abort').length, 0);
const controller = () => new AbortController();
const transient = () => Object.assign(new Error('Transient'), { retryable: true });

for (const n of [17, 18]) {
  test(`RT-${n}: all owned fan-out children are independently measured`, async () => {
    const run = await load(n); const parent = controller();
    const transports = Array.from({ length: 3 }, () => new OptionalWork());
    const response = run({ transports, signal: parent.signal });
    assert.equal(transports.reduce((sum, t) => sum + t.active, 0), 3);
    parent.abort(new Error('Parent cancelled')); await drain();
    assert.deepEqual({ activeAfterCancel: transports.reduce((sum, t) => sum + t.active, 0) }, expected(n).observation);
    if (n === 17) transports[2].completeNext();
    const results = await response;
    assert.equal(results.filter((r) => r.status === 'rejected').length, n === 17 ? 2 : 3);
    assert(transports.every((t) => t.active === 0)); cleanSignal(parent.signal);
  });
  for (const outcome of ['success', 'failure', 'pre-abort']) test(`RT-${n}: fan-out ${outcome} settles every child`, async () => {
    const run = await load(n); const parent = controller(); const transports = Array.from({ length: 3 }, () => new OptionalWork());
    if (outcome === 'pre-abort') parent.abort(new Error('Already cancelled'));
    const response = run({ transports, signal: parent.signal });
    for (const t of transports) if (t.active) outcome === 'failure' ? t.failNext() : t.completeNext();
    const results = await response;
    assert.equal(results.length, 3); assert(transports.every((t) => t.active === 0)); cleanSignal(parent.signal);
    if (n === 18 && outcome === 'pre-abort') assert(transports.every((t) => t.started === 0));
  });
}

test('RT-19: identical visible extract admits request-owned and durable child countermodels', async () => {
  const run = await load(19);
  const execute = async (requestOwned) => {
    const parent = controller(); const detached = controller(); const transports = Array.from({ length: 3 }, () => new OptionalWork());
    const response = run({ transports, signals: [parent.signal, parent.signal, detached.signal] });
    parent.abort(new Error('Request ended')); await drain();
    const active = transports[2].active;
    transports[2].completeNext(17); const results = await response;
    const fulfilled = results[2].status === 'fulfilled';
    cleanSignal(parent.signal); cleanSignal(detached.signal);
    assert(transports.every((t) => t.active === 0));
    return { withinContract: requestOwned ? active === 0 : fulfilled };
  };
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: await execute(true), permitted: await execute(false) } }, expected(19));
});

async function retryBurst(run, { budget, count = 10, fail = true, retryable = true, signal = controller().signal } = {}) {
  let started = 0;
  const responses = await Promise.all(Array.from({ length: count }, () => run({ signal, budget, operation: async () => {
    started++; if (fail) throw retryable ? transient() : new Error('Permanent'); return 17;
  } })));
  return { observation: { started, extra: Math.max(0, started - count) }, responses };
}
for (const n of [20, 21]) {
  test(`RT-${n}: ten local retry caps versus shared extra-attempt allowance`, async () => {
    const clock = new ManualClock(); const budget = new RetryBudget({ clock }); const run = await load(n);
    assert.deepEqual((await retryBurst(run, { budget })).observation, expected(n).observation);
    assert.equal(clock.pendingTimers, 0);
  });
  test(`RT-${n}: success, permanent errors and cancellation cannot consume an extra attempt`, async () => {
    const run = await load(n); const clock = new ManualClock(); const budget = new RetryBudget({ clock });
    assert.equal((await retryBurst(run, { budget, fail: false })).observation.started, 10);
    assert.equal((await retryBurst(run, { budget, retryable: false })).observation.started, 10);
    const parent = controller(); parent.abort();
    assert.equal((await retryBurst(run, { budget, signal: parent.signal })).observation.started, 0);
    const active = controller(); let calls = 0;
    const result = await run({ signal: active.signal, budget, operation: async () => { calls++; active.abort(); throw transient(); } });
    assert.equal(result.status, 'cancelled'); assert.equal(calls, 1); assert.equal(budget.used, 0);
    cleanSignal(parent.signal); cleanSignal(active.signal); assert.equal(clock.pendingTimers, 0);
  });
}
test('RT-21: fixed window does not refill early and resets exactly at boundary', async () => {
  const run = await load(21); const clock = new ManualClock(); const budget = new RetryBudget({ clock });
  assert.equal((await retryBurst(run, { budget })).observation.extra, 2);
  clock.advanceTo(99); assert.equal((await retryBurst(run, { budget })).observation.extra, 0);
  clock.advanceTo(100); assert.equal((await retryBurst(run, { budget })).observation.extra, 2);
  clock.advanceTo(500); assert.equal((await retryBurst(run, { budget })).observation.extra, 2);
  assert.equal(clock.pendingTimers, 0);
});
test('RT-22: local retry extract cannot decide an omitted aggregate contract', async () => {
  const run = await load(22); const observation = (await retryBurst(run)).observation;
  assert.equal(observation.started, 20);
  const model = (allowance) => ({ withinContract: observation.extra <= allowance });
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: model(2), permitted: model(10) } }, expected(22));
});

for (const n of [23, 24]) {
  test(`RT-${n}: committed response loss measures effects rather than response status alone`, async () => {
    const backend = new WriteBackend(); const run = await load(n); const parent = controller();
    const result = await run({ backend, identity: 'write-A', signal: parent.signal });
    assert.deepEqual({ effects: backend.effects, status: result.status }, expected(n).observation); cleanSignal(parent.signal);
  });
  test(`RT-${n}: normal response, pre-cancel and permanent failure`, async () => {
    const run = await load(n); const backend = new WriteBackend(); const parent = controller();
    assert.equal((await run({ backend, identity: 'normal', signal: parent.signal, loseFirst: false })).status, 'ok');
    assert.equal(backend.effects, 1);
    parent.abort(); assert.equal((await run({ backend, identity: 'never', signal: parent.signal })).status, 'cancelled');
    assert.equal(backend.effects, 1);
    let attempts = 0;
    assert.equal((await run({ identity: 'bad', signal: controller().signal, backend: { write: async () => { attempts++; throw new Error('Permanent'); } } })).status, 'error');
    assert.equal(attempts, 1); cleanSignal(parent.signal);
  });
  test(`RT-${n}: cancellation after commit retains effect and prevents a second attempt`, async () => {
    const run = await load(n); const parent = controller(); const real = new WriteBackend(); let calls = 0;
    const backend = { write: async (options) => { calls++; try { return await real.write(options); } finally { parent.abort(); } } };
    assert.equal((await run({ backend, identity: 'committed', signal: parent.signal })).status, 'cancelled');
    assert.equal(real.effects, 1); assert.equal(calls, 1); cleanSignal(parent.signal);
  });
}
test('RT-24: concurrent same-key writes deduplicate atomically and conflicting intent is rejected', async () => {
  const run = await load(24); const backend = new WriteBackend(); const signal = controller().signal;
  const results = await Promise.all(Array.from({ length: 8 }, () => run({ backend, identity: 'same', signal, payload: 17 })));
  assert.equal(backend.effects, 1); assert(results.every((r) => r.status === 'ok' && r.value === 1));
  assert.equal((await run({ backend, identity: 'same', signal, payload: 18 })).status, 'error');
  assert.equal(backend.effects, 1); assert.equal((await run({ backend, identity: 'different', signal })).status, 'ok');
  assert.equal(backend.effects, 2); cleanSignal(signal);
});
test('RT-25: stable identity alone cannot establish backend deduplication', async () => {
  const run = await load(25);
  const execute = async (deduplicate) => {
    let effects = 0, calls = 0; const keys = new Set();
    const backend = { write: async ({ key }) => {
      if (!deduplicate || !keys.has(key)) { keys.add(key); effects++; }
      if (++calls === 1) throw Object.assign(new Error('Lost'), { ambiguous: true });
      return effects;
    } };
    assert.equal((await run({ backend, identity: 'one', signal: controller().signal })).status, 'ok');
    return { withinContract: effects === 1 };
  };
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: await execute(false), permitted: await execute(true) } }, expected(25));
});

async function scheduleBurst(run, arrivalSpread = false) {
  const clock = new ManualClock(); const slots = new Map(); const parents = Array.from({ length: 8 }, controller);
  const responses = parents.map((parent, index) => {
    if (arrivalSpread) clock.advanceTo(index * 10);
    return run({ clock, signal: parent.signal, index, start: (at) => slots.set(at, (slots.get(at) ?? 0) + 1) });
  });
  clock.advanceTo(100); await Promise.all(responses);
  parents.forEach((p) => cleanSignal(p.signal)); assert.equal(clock.pendingTimers, 0);
  return { peak: Math.max(...slots.values()), started: [...slots.values()].reduce((a, b) => a + b, 0) };
}
for (const n of [26, 27]) {
  test(`RT-${n}: injected eight-client schedule is measured per logical slot`, async () => {
    assert.deepEqual(await scheduleBurst(await load(n)), expected(n).observation);
  });
  for (const outcome of ['cancel-before', 'cancel-waiting', 'throw', 'success']) test(`RT-${n}: retry timer ${outcome} cleans timer and listener`, async () => {
    const run = await load(n); const clock = new ManualClock(); const parent = controller(); let starts = 0;
    if (outcome === 'cancel-before') parent.abort();
    const response = run({ clock, signal: parent.signal, index: 7, start: () => { starts++; if (outcome === 'throw') throw new Error('Start failed'); } });
    if (outcome === 'cancel-waiting') { clock.advanceTo(9); parent.abort(); }
    clock.advanceTo(100); const result = await response;
    assert.equal(starts, outcome.startsWith('cancel') ? 0 : 1);
    assert.equal(result.status, outcome.startsWith('cancel') ? 'cancelled' : outcome === 'throw' ? 'error' : 'ok');
    assert.equal(clock.pendingTimers, 0); cleanSignal(parent.signal);
  });
}
test('RT-28: identical local retry delay permits synchronized and staggered arrival countermodels', async () => {
  const run = await load(28); const burst = await scheduleBurst(run); const spread = await scheduleBurst(run, true);
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: { withinContract: burst.peak <= 2 }, permitted: { withinContract: spread.peak <= 2 } } }, expected(28));
});

async function isolationObservation(run) {
  const work = new OptionalWork(); const parent = controller(); const service = run({ work });
  const a = service.optional.run(parent.signal), b = service.optional.run(parent.signal);
  await drain(); const optionalStarted = work.started;
  const essential = service.essential.run(parent.signal); await drain();
  assert.equal(service.pools.reduce((sum, pool) => sum + pool.capacity, 0), 2);
  assert(service.pools.reduce((sum, pool) => sum + pool.active, 0) <= 2);
  if (work.started > optionalStarted) work.completeNext(17); // Optional completion first; essential remains separately pending.
  await drain();
  while (work.active) work.completeNext(17);
  const result = await essential; await Promise.all([a, b]);
  assert(service.pools.every((p) => p.active === 0 && p.queued === 0)); cleanSignal(parent.signal);
  return { optionalStarted, essential: result.status };
}
for (const n of [29, 30]) {
  test(`RT-${n}: distinct wrappers are checked at the actual two-slot resource`, async () => {
    assert.deepEqual(await isolationObservation(await load(n)), expected(n).observation);
  });
  for (const outcome of ['success', 'failure', 'cancel']) test(`RT-${n}: transport ${outcome} releases all admission`, async () => {
    const run = await load(n); const work = new OptionalWork(); const parent = controller(); const service = run({ work });
    const response = service.optional.run(parent.signal);
    if (outcome === 'cancel') parent.abort(); else if (outcome === 'failure') work.failNext(); else work.completeNext();
    assert.equal((await response).status, outcome === 'success' ? 'ok' : outcome === 'failure' ? 'error' : 'cancelled');
    assert.equal(work.active, 0); assert(service.pools.every((p) => p.active === 0)); cleanSignal(parent.signal);
    const cancelled = controller(); cancelled.abort(); const starts = work.started;
    assert.equal((await service.essential.run(cancelled.signal)).status, 'cancelled'); assert.equal(work.started, starts);
  });
}
test('RT-31: injected wrapper instances admit shared and reserved underlying transports', async () => {
  const visible = await load(31);
  const execute = async (reserved) => {
    const work = new OptionalWork(); const parent = controller(); const configured = makeTransportRoutes({ work, reserved });
    const service = visible({ optionalTransport: configured.optional, essentialTransport: configured.essential });
    const a = service.optional.run(parent.signal), b = service.optional.run(parent.signal), e = service.essential.run(parent.signal);
    await drain(); while (work.active) work.completeNext();
    const result = await e; await Promise.all([a, b]); cleanSignal(parent.signal);
    assert(configured.pools.every((p) => p.active === 0));
    return { withinContract: result.status === 'ok' };
  };
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: await execute(false), permitted: await execute(true) } }, expected(31));
});

async function opened(run) {
  const clock = new ManualClock(); const breaker = run({ clock }); const parent = controller();
  assert.equal((await breaker.run(async () => { throw new Error('Backend failure'); }, parent.signal)).status, 'error');
  assert.equal(breaker.state, 'open'); assert.equal(breaker.active, 0); clock.advanceTo(9);
  let forbiddenStarts = 0;
  assert.equal((await breaker.run(async () => { forbiddenStarts++; }, parent.signal)).status, 'rejected');
  assert.equal(forbiddenStarts, 0); clock.advanceTo(10); return { clock, breaker, parent };
}
for (const n of [32, 33]) {
  test(`RT-${n}: simultaneous cooldown callers measure recovery admission`, async () => {
    const { clock, breaker, parent } = await opened(await load(n)); const work = new OptionalWork();
    const responses = Array.from({ length: 3 }, () => breaker.run((signal) => work.open({ signal }), parent.signal));
    assert.deepEqual({ started: work.started, active: breaker.active }, expected(n).observation);
    parent.abort(); await Promise.all(responses); assert.equal(breaker.active, 0); assert.equal(work.active, 0);
    assert.equal(clock.pendingTimers, 0); cleanSignal(parent.signal);
  });
  test(`RT-${n}: successful probe closes; failed probe reopens and restarts cooldown`, async () => {
    const { clock, breaker, parent } = await opened(await load(n));
    assert.equal((await breaker.run(async () => 17, parent.signal)).status, 'ok'); assert.equal(breaker.state, 'closed');
    assert.equal((await breaker.run(async () => { throw new Error('Failed'); }, parent.signal)).status, 'error');
    assert.equal(breaker.state, 'open'); clock.advanceTo(19);
    assert.equal((await breaker.run(async () => 17, parent.signal)).status, 'rejected'); clock.advanceTo(20);
    assert.equal((await breaker.run(async () => 17, parent.signal)).status, 'ok'); assert.equal(breaker.active, 0);
    assert.equal(clock.pendingTimers, 0); cleanSignal(parent.signal);
  });
}
test('RT-33: cancelled probe permits replacement and pre-cancel never starts work', async () => {
  const { breaker, parent } = await opened(await load(33)); const work = new OptionalWork();
  const first = breaker.run((signal) => work.open({ signal }), parent.signal); parent.abort();
  assert.equal((await first).status, 'cancelled'); assert.equal(breaker.state, 'half-open'); assert.equal(breaker.active, 0);
  const next = controller(); const second = breaker.run((signal) => work.open({ signal }), next.signal);
  work.completeNext(); assert.equal((await second).status, 'ok'); assert.equal(breaker.state, 'closed');
  const starts = work.started; assert.equal((await breaker.run((signal) => work.open({ signal }), parent.signal)).status, 'cancelled');
  assert.equal(work.started, starts); cleanSignal(parent.signal); cleanSignal(next.signal);
});
test('RT-32: stale concurrent success cannot close a generation reopened by another failed probe', async () => {
  const { clock, breaker, parent } = await opened(await load(32)); const work = new OptionalWork();
  const a = breaker.run((signal) => work.open({ signal }), parent.signal), b = breaker.run((signal) => work.open({ signal }), parent.signal);
  work.failNext(); await a; assert.equal(breaker.state, 'open'); work.completeNext(); await b;
  assert.equal(breaker.state, 'open'); assert.equal(breaker.active, 0); assert.equal(clock.pendingTimers, 0); cleanSignal(parent.signal);
});
test('RT-34: omitted controller and external admission permit different recovery concurrency', async () => {
  const visible = await load(34);
  const execute = async (limitProbe) => {
    const clock = new ManualClock(); const ctrl = new RecoveryBreaker({ clock, limitProbe }); const parent = controller();
    await visible({ controller: ctrl, operation: async () => { throw new Error('Fail'); }, signal: parent.signal }); clock.advanceTo(10);
    const work = new OptionalWork(); const responses = Array.from({ length: 3 }, () => visible({ controller: ctrl, operation: (signal) => work.open({ signal }), signal: parent.signal }));
    const peak = ctrl.active; parent.abort(); await Promise.all(responses);
    assert.equal(ctrl.active, 0); assert.equal(work.active, 0); cleanSignal(parent.signal);
    return { withinContract: peak <= 1 };
  };
  assert.deepEqual({ assessment: 'unresolved', countermodels: { violating: await execute(false), permitted: await execute(true) } }, expected(34));
});

async function degradeObservation(run) {
  const detail = new OptionalWork(); const parent = controller(); const service = run({ detail });
  const a = service.optional(parent.signal), b = service.optional(parent.signal); const optionalStarted = detail.started;
  const result = await service.essential(parent.signal);
  const observation = { optionalStarted, essential: result.status, payload: result.value ?? null };
  parent.abort(); await Promise.all([a, b]); assert.equal(detail.active, 0); assert.equal(service.pool.active, 0); cleanSignal(parent.signal);
  return observation;
}
for (const n of [35, 36]) {
  test(`RT-${n}: optional admission must preserve a useful essential degraded response`, async () => {
    assert.deepEqual(await degradeObservation(await load(n)), expected(n).observation);
  });
  for (const outcome of ['success', 'failure', 'cancel']) test(`RT-${n}: detail ${outcome} releases capacity for next work`, async () => {
    const run = await load(n); const detail = new OptionalWork(); const parent = controller(); const service = run({ detail });
    const response = service.optional(parent.signal);
    if (outcome === 'cancel') parent.abort(); else if (outcome === 'failure') detail.failNext(); else detail.completeNext();
    assert.equal((await response).status, outcome === 'success' ? 'ok' : outcome === 'failure' ? 'error' : 'cancelled');
    assert.equal(service.pool.active, 0); assert.equal(detail.active, 0); cleanSignal(parent.signal);
    const next = controller(); const e = await service.essential(next.signal);
    assert.deepEqual(e, { status: 'ok', value: { essential: 17, detail: null, degraded: true } });
    const cancelled = controller(); cancelled.abort(); const starts = detail.started;
    assert.equal((await service.optional(cancelled.signal)).status, 'cancelled'); assert.equal((await service.essential(cancelled.signal)).status, 'cancelled'); assert.equal(detail.started, starts);
  });
}
test('RT-37: the same degraded payload satisfies an omission-permitted contract and violates required detail', async () => {
  const visible = await load(37); const detail = new OptionalWork(); const admission = makeDegradedService({ detail, shedOptional: true });
  const parent = controller(); const result = await visible({ admission, signal: parent.signal });
  assert.equal(result.status, 'ok'); assert.equal(admission.pool.active, 0); cleanSignal(parent.signal);
  const payload = result.value;
  assert.deepEqual({ assessment: 'unresolved', countermodels: {
    violating: { withinContract: payload.essential === 17 && payload.detail === 42 },
    permitted: { withinContract: payload.essential === 17 && payload.detail === null && payload.degraded === true },
  } }, expected(37));
});

// Each D/P pair differs by the causal switch. Running the defective implementation
// against the protected observation demonstrates that removing the mechanism is caught.
for (const [d, p, reproduce] of [
  [20, 21, async (run) => (await retryBurst(run, { budget: new RetryBudget({ clock: new ManualClock() }) })).observation],
  [23, 24, async (run) => { const backend = new WriteBackend(); const result = await run({ backend, identity: 'mutant', signal: controller().signal }); return { effects: backend.effects, status: result.status }; }],
  [26, 27, scheduleBurst], [29, 30, isolationObservation], [35, 36, degradeObservation],
]) test(`RT-${p}: causal mutation to RT-${d} fails the protected criterion`, async () => {
  const protectedObservation = await reproduce(await load(p)); const mutated = await reproduce(await load(d));
  assert.deepEqual(protectedObservation, expected(p).observation); assert.notDeepEqual(mutated, expected(p).observation);
});
test('RT-18/33: dropped child signal and unlimited half-open admission fail protected criteria', async () => {
  const parent = controller(); const transports = Array.from({ length: 3 }, () => new OptionalWork());
  const pending = (await load(17))({ signal: parent.signal, transports }); parent.abort(); await drain();
  assert.notDeepEqual({ activeAfterCancel: transports.reduce((sum, t) => sum + t.active, 0) }, expected(18).observation);
  transports[2].completeNext(); await pending;
  const { breaker, parent: probeParent } = await opened(await load(32)); const work = new OptionalWork();
  const probes = Array.from({ length: 3 }, () => breaker.run((signal) => work.open({ signal }), probeParent.signal));
  assert.notDeepEqual({ started: work.started, active: breaker.active }, expected(33).observation); probeParent.abort(); await Promise.all(probes);
});

for (const mutation of ['kind', 'expected', 'input-test', 'input-rubric', 'missing-context', 'finding-evidence']) test(`Expanded manifest rejects ${mutation} drift`, () => {
  const folder = mkdtempSync(join(tmpdir(), 'runtime-expansion-'));
  try {
    cpSync(fixtureRoot, folder, { recursive: true }); const path = join(folder, 'cases.json'); const copy = JSON.parse(readFileSync(path, 'utf8'));
    const entry = copy.cases.find((c) => c.id === (mutation === 'missing-context' ? 'RT-37' : 'RT-20'));
    if (mutation === 'kind') entry.kind = 'protected';
    if (mutation === 'expected') entry.expected.observation.started = 12;
    if (mutation === 'input-test') entry.inputs.push('expansion.test.mjs');
    if (mutation === 'input-rubric') entry.inputs.push(entry.rubric);
    if (mutation === 'missing-context' || mutation === 'finding-evidence') {
      const rubricPath = join(folder, entry.rubric); const rubric = JSON.parse(readFileSync(rubricPath, 'utf8'));
      if (mutation === 'missing-context') rubric.missingContext = [];
      else rubric.evidence[0].anchor = 'nonexistent-assertion';
      writeFileSync(rubricPath, JSON.stringify(rubric));
    }
    writeFileSync(path, JSON.stringify(copy)); assert.throws(() => validateManifest(folder));
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

for (const n of [20, 21]) test(`RT-${n}: one transient error followed by recovery uses exactly one extra attempt`, async () => {
  const run = await load(n); const clock = new ManualClock(); const budget = new RetryBudget({ clock }); let calls = 0;
  assert.deepEqual(await run({ budget, signal: controller().signal, operation: async () => { if (++calls === 1) throw transient(); return 17; } }), { status: 'ok', value: 17 });
  assert.equal(calls, 2); assert.equal(clock.pendingTimers, 0);
});
for (const n of [23, 24]) test(`RT-${n}: repeated ambiguous failures stop at two calls`, async () => {
  const run = await load(n); let calls = 0;
  const result = await run({ identity: 'one', signal: controller().signal, backend: { write: async () => { calls++; throw Object.assign(new Error('Ambiguous'), { ambiguous: true }); } } });
  assert.equal(result.status, 'error'); assert.equal(calls, 2);
});
test('RT-36: reject-all and incorrect-success mutations fail the useful response criterion', async () => {
  const criterion = (result) => result.status === 'ok' && result.value?.essential === 17 && result.value?.detail === null && result.value?.degraded === true;
  const visible = await load(37); const signal = controller().signal;
  for (const result of [{ status: 'overloaded' }, { status: 'ok', value: { essential: 0, detail: null, degraded: true } }, { status: 'ok', value: { essential: 17, detail: null, degraded: false } }]) {
    const observed = await visible({ signal, admission: { essential: async () => result } }); assert.equal(criterion(observed), false);
  }
  const service = makeDegradedService({ detail: new OptionalWork(), shedOptional: true });
  assert.equal(criterion(await visible({ signal, admission: service })), true); assert.equal(service.pool.active, 0);
});
