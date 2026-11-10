import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ROOT,
  manifest,
  validate,
  freezeData,
  exportInputs,
  exerciseCase,
  reproduce,
  checkedPath,
  sha256,
  staticImports,
} from "./suite.mjs";
import { holds } from "./oracles.mjs";

const m = manifest();
function controls(family, o) {
  switch (family) {
    case "deadline-rebase":
      assert.deepEqual(o.fast.starts, [0, 20]);
      assert.deepEqual(o.lateCompletion.starts, [0]);
      assert.equal(o.lateCompletion.status, "complete");
      assert.equal(o.lateCompletion.now, 70);
      break;
    case "retry-token-ownership":
      assert.equal(o.early.sends, 1);
      assert.equal(o.third.sends, 3);
      assert.equal(o.third.receipts.at(-1).ok, true);
      break;
    case "hedge-cancel-drain":
      assert.equal(o.probe.finalUsed, 0);
      assert.equal(o.early.finalUsed, 0);
      assert.equal(o.early.physical, 2);
      assert.equal(o.probe.loserCancelled, true);
      break;
    case "lease-fencing":
      assert.equal(o.probe.busy, true);
      assert.equal(o.probe.fresh, true);
      assert.equal(o.different.stale, false);
      assert.equal(o.different.value, "new");
      break;
    case "batch-item-expiry":
      assert.deepEqual(o.both.ids, ["a", "b"]);
      assert.deepEqual(o.expired.ids, []);
      assert.deepEqual(o.generation, ["a"]);
      assert.deepEqual(o.cancelReinsert.ids, ["a"]);
      assert.deepEqual(o.cancelReinsert.sent, [{ id: "a", deadline: 80 }]);
      assert.equal(o.cancelReinsert.newerGeneration, true);
      assert.deepEqual(o.staleAfterFlush.first, ["a"]);
      assert.deepEqual(o.staleAfterFlush.second, ["a"]);
      assert.equal(o.staleAfterFlush.newerGeneration, true);
      assert.equal(o.probe.remaining, 0);
      break;
    case "singleflight-waiters":
      assert.equal(o.probe.a.status, "cancelled");
      assert.equal(o.probe.other.value, 7);
      assert.equal(o.probe.remaining, 0);
      assert.equal(o.last.cancelled, true);
      assert.equal(o.last.waiters, 0);
      break;
    case "weighted-reservation":
      assert.equal(o.outer.next, "delivered");
      assert.equal(o.outer.used, 2);
      assert.equal(o.finalUsed, 0);
      assert.equal(o.queuedCancel, 0);
      assert.equal(o.normalReleased, 0);
      break;
    case "breaker-probe-epoch":
      assert.equal(o.probe.denied, true);
      assert.equal(o.probe.final, "closed");
      assert.equal(o.currentFailure.cooldown, true);
      assert.equal(o.currentFailure.duplicateBlocked, true);
      assert.equal(o.currentFailure.final, "closed");
      break;
    case "fanout-backpressure":
      assert.equal(o.afterDrain.fourth, true);
      assert.equal(o.finalUsed, 0);
      assert.equal(o.finalSlow, 0);
      assert.ok(o.optionalRetained > 0); // Optional retention is explicitly outside the required-sink bound.
      break;
    case "dedupe-retention":
      assert.equal(o.probe.first.timeout, true);
      assert.equal(o.immediate.mutations, 1);
      assert.equal(o.different.mutations, 2);
      assert.equal(o.outside.mutations, 2);
      break;
    case "tenant-session-reuse":
      assert.equal(o.probe.occupied, true);
      assert.equal(o.after.session, "B");
      assert.equal(o.after.requested, "B");
      assert.equal(o.failedReset, true);
      break;
    case "shutdown-retry-drain":
      assert.equal(o.normal, 2);
      assert.equal(o.active.waits, true);
      assert.equal(o.active.activeDone, true);
      break;
    default:
      assert.fail("unknown family");
  }
}
for (const item of m.cases) {
  test(`${item.id}: actual modules preserve controls and distinguish the contract`, async () => {
    const observed = await exerciseCase(item);
    assert.deepEqual(
      observed,
      await exerciseCase(item),
      "deterministic fresh state on every exercise",
    );
    controls(item.family, observed);
    assert.equal(holds(item.family, observed), item.kind === "protected");
    if (item.kind === "protected") {
      if (item.family === "deadline-rebase")
        assert.deepEqual(observed.boundary.starts, []);
      if (item.family === "batch-item-expiry")
        assert.deepEqual(observed.boundary.ids, ["b"]);
      if (item.family === "fanout-backpressure")
        assert.equal(observed.afterDrain.slowBytes, 8);
      if (item.family === "dedupe-retention")
        assert.equal(observed.horizon.mutations, 1);
      if (item.family === "breaker-probe-epoch")
        assert.equal(observed.oldFailure.mode, "half-open");
    }
    if (item.kind === "unresolved") {
      assert.equal(
        holds(item.family, observed, "alternative"),
        true,
        "same observation admits opposing judgments under the two documented contracts",
      );
      const defect = m.cases.find(
        (c) => c.family === item.family && c.kind === "defect",
      );
      assert.deepEqual(
        observed,
        await exerciseCase(defect),
        "contract omission, not a covert implementation change",
      );
    }
  });
}
for (const family of m.families) {
  test(`${family.id}: protected mechanism mutation is rejected`, async () => {
    const safe = m.cases.find(
      (c) => c.family === family.id && c.kind === "protected",
    );
    const defect = m.cases.find(
      (c) => c.family === family.id && c.kind === "defect",
    );
    const temporary = mkdtempSync(path.join(tmpdir(), "brooks-hard-mutation-"));
    try {
      mkdirSync(path.join(temporary, "cases"), { recursive: true });
      mkdirSync(path.join(temporary, "drivers"));
      cpSync(
        path.join(ROOT, "cases", safe.id),
        path.join(temporary, "cases", safe.id),
        { recursive: true },
      );
      cpSync(path.join(ROOT, safe.driver), path.join(temporary, safe.driver));
      let changed = 0;
      for (const input of safe.inputs.filter((p) => p.endsWith(".mjs"))) {
        const file = path.basename(input),
          replacement = readFileSync(path.join(ROOT, "cases", defect.id, file));
        if (
          sha256(replacement) !== sha256(readFileSync(path.join(ROOT, input)))
        ) {
          writeFileSync(path.join(temporary, input), replacement);
          changed++;
        }
      }
      assert.ok(changed > 0, "real production source changed");
      const observed = await exerciseCase(safe, temporary);
      assert.equal(holds(family.id, observed), false);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
}

test("family-level split, frozen inventory, full offline observations", async () => {
  const checked = validate();
  assert.equal(checked.cases.length, 36);
  assert.equal(
    checked.cases.filter((c) => c.split === "calibration").length,
    12,
  );
  assert.equal(
    checked.cases.filter((c) => c.split === "development-reserved").length,
    24,
  );
  assert.deepEqual(
    await reproduce(),
    JSON.parse(readFileSync(path.join(ROOT, "offline-evidence.json"), "utf8")),
  );
});
test("all 36 exported input bundles exclude evaluator metadata and close imports", () => {
  for (const item of m.cases) {
    const bundle = exportInputs(item.id);
    assert.deepEqual(Object.keys(bundle), ["files"]);
    assert.equal(bundle.files.length, item.inputs.length);
    for (const file of bundle.files) {
      assert.deepEqual(Object.keys(file), ["path", "content"]);
      assert.equal(path.basename(file.path), file.path);
      assert.ok(item.inputs.includes(`cases/${item.id}/${file.path}`));
      assert.ok(
        !/rubric\.json|freeze\.json|expectedFindings|development-reserved|HB-\d\d/.test(
          file.content,
        ),
      );
    }
  }
});
function changedCopy(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "brooks-hard-validation-"));
  try {
    cpSync(ROOT, dir, { recursive: true });
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("source byte drift is rejected before export", () =>
  changedCopy((dir) => {
    const input = m.cases[0].inputs[0];
    writeFileSync(
      path.join(dir, input),
      readFileSync(path.join(dir, input), "utf8") + "\n",
    );
    assert.throws(() => exportInputs(m.cases[0].id, dir), /drift/);
  }));
test("additional files are rejected by frozen inventory", () =>
  changedCopy((dir) => {
    writeFileSync(path.join(dir, "untracked.txt"), "extra");
    assert.throws(() => validate(dir), /drift/);
  }));
test("rubric masquerading as an input is rejected even before freeze", () =>
  changedCopy((dir) => {
    const changed = structuredClone(m);
    changed.cases[0].inputs[0] = changed.cases[0].rubric;
    writeFileSync(path.join(dir, "cases.json"), JSON.stringify(changed));
    assert.throws(() => freezeData(dir), /whitelist/);
  }));
test("absolute and traversal input paths are rejected", () => {
  for (const value of [
    "/tmp/secret",
    "../outside",
    "cases/../secret",
    "cases\\secret",
  ])
    assert.throws(() => checkedPath(ROOT, value), /unsafe/);
});
test("symlink source and unexpected symlink inventory are rejected", () =>
  changedCopy((dir) => {
    const input = m.cases[0].inputs[0],
      target = path.join(dir, input);
    rmSync(target);
    symlinkSync(path.join(ROOT, input), target);
    assert.throws(() => validate(dir), /symlink/);
  }));
test("split drift and inflated independence are rejected", () =>
  changedCopy((dir) => {
    const changed = structuredClone(m);
    changed.cases[0].split = "development-reserved";
    writeFileSync(path.join(dir, "cases.json"), JSON.stringify(changed));
    assert.throws(() => freezeData(dir), /classification/);
    changed.cases[0].split = m.cases[0].split;
    changed.independent = true;
    writeFileSync(path.join(dir, "cases.json"), JSON.stringify(changed));
    assert.throws(() => freezeData(dir), /status/);
  }));
test("hidden imports and evaluator references cannot be exported", () =>
  changedCopy((dir) => {
    const item = m.cases[0],
      source = item.inputs.find((p) => p.endsWith("service.mjs"));
    writeFileSync(
      path.join(dir, source),
      'import oracle from "../../oracles.mjs";\n',
    );
    assert.throws(() => freezeData(dir), /leakage|closure/);
  }));
test("unknown case and policy are rejected", () => {
  assert.throws(() => exportInputs("HB-99"), /unknown case/);
  assert.throws(
    () => holds("deadline-rebase", {}, "unknown"),
    /unknown policy/,
  );
});

test("an extra symlink outside visible inputs is rejected by inventory", () =>
  changedCopy((dir) => {
    symlinkSync(
      path.join(ROOT, "cases.json"),
      path.join(dir, "unexpected-link.json"),
    );
    assert.throws(() => validate(dir), /symlink/);
  }));

test("fanout required/optional accounting contract is consistent in all three cases", () => {
  for (const item of m.cases.filter(
    (c) => c.family === "fanout-backpressure",
  )) {
    const context = readFileSync(
      path.join(ROOT, "cases", item.id, "context.md"),
      "utf8",
    );
    const rubricText = readFileSync(path.join(ROOT, item.rubric), "utf8");
    const rubric = JSON.parse(rubricText);
    assert.ok(
      context.includes(
        "optional sinks may remain slow without controlling the required-delivery window",
      ),
    );
    assert.ok(!context.includes("every sink has drained"));
    assert.ok(!rubricText.includes("every sink has drained"));
    assert.ok(rubric.contract.includes("every required sink has drained"));
    assert.ok(rubric.contract.includes("Optional sinks do not participate"));
    if (item.kind !== "unresolved")
      assert.ok(context.includes("every required sink has drained"));
  }
});
test("static import scanner handles supported bindings, comments and side effects", () => {
  const source = `
    // import "./not-a-dependency.mjs";
    const text = "import './also-not-a-dependency.mjs'";
    import "./clock.mjs";
    import Clock from './clock.mjs';
    import { Clock as Time, remaining, } from './clock.mjs';
    import * as clock from './clock.mjs';
    import Clock, { remaining } from './clock.mjs';
    import Clock, * as clock from './clock.mjs';
    import /* declaration comment */ {Clock} from /* specifier comment */ './clock.mjs';
  `;
  assert.deepEqual(staticImports(source), Array(7).fill("./clock.mjs"));
});
test("allowlisted side-effect import survives explicit freeze and input export", () =>
  changedCopy((dir) => {
    const source = m.cases[0].inputs.find((p) => p.endsWith("service.mjs"));
    writeFileSync(
      path.join(dir, source),
      readFileSync(path.join(dir, source), "utf8") +
        '\nimport "./clock.mjs";\n',
    );
    writeFileSync(
      path.join(dir, "freeze.json"),
      JSON.stringify(freezeData(dir), null, 2) + "\n",
    );
    const exported = exportInputs(m.cases[0].id, dir);
    assert.ok(
      exported.files
        .find((f) => f.path === "service.mjs")
        .content.includes('import "./clock.mjs";'),
    );
  }));
for (const specifier of [
  "./missing.mjs",
  "../outside.mjs",
  "node:fs",
  "/tmp/outside.mjs",
]) {
  test(`unclosed side-effect import ${specifier} is rejected before freeze and export`, () =>
    changedCopy((dir) => {
      const source = m.cases[0].inputs.find((p) => p.endsWith("service.mjs"));
      writeFileSync(
        path.join(dir, source),
        readFileSync(path.join(dir, source), "utf8") +
          `\nimport ${JSON.stringify(specifier)};\n`,
      );
      assert.throws(() => freezeData(dir), /input import closure/);
      assert.throws(
        () => exportInputs(m.cases[0].id, dir),
        /input import closure/,
      );
    }));
}
for (const source of [
  'import("./clock.mjs");',
  "import.meta.url;",
  'import "./clock.mjs" with {type:"json"};',
  'import { Clock } from "./clock.mjs" assert {type:"json"};',
  'export * from "./clock.mjs";',
  'export { Clock } from "./clock.mjs";',
  'import Clock, from "./clock.mjs";',
  'import Clock from "./clock.mjs"',
  'import "./\\u0063lock.mjs";',
]) {
  test(`unsupported import syntax rejected: ${source}`, () =>
    assert.throws(() => staticImports(source), /unsupported import syntax/));
}
