import { createHash } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  rmSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ROOT,
  manifest,
  validate,
  checkFreeze,
  exportCase,
  exerciseCase,
  reproduce,
  scoreIssues,
  read,
} from "./suite.mjs";
const m = manifest();
test("structure and immutable dependency freeze", () => {
  validate();
  checkFreeze();
});
test("committed evidence equals actual execution", async () =>
  assert.deepEqual(await reproduce(), read(ROOT + "offline-evidence.json")));
for (const c of m.cases) {
  test(c.id + " executes actual fixture and benign boundary", async () => {
    const o = await exerciseCase(c.id);
    assert.equal(o.violation, c.kind !== "protected");
    assert.equal(o.benign, true);
  });
  test(c.id + " exports only model-visible closed bundle", () => {
    const b = exportCase(c.id);
    assert.equal(Object.keys(b).length, 5);
    assert.ok(!JSON.stringify(b).includes("expectedFindings"));
    assert.ok(!JSON.stringify(b).includes(c.id));
  });
}
for (const f of m.families) {
  test(f.id + " unresolved implementation matches defective sibling", () => {
    const cs = m.cases.filter((c) => c.family === f.id);
    const a = exportCase(cs.find((c) => c.kind === "defect").id),
      b = exportCase(cs.find((c) => c.kind === "unresolved").id);
    for (const key of Object.keys(a).filter((k) => k.endsWith(".mjs")))
      assert.equal(a[key], b[key]);
  });
}
test("outbox partial fixes isolate independent issues", async () => {
  const goodStore = await import("./cases/BV-02/store.mjs");
  const goodService = await import("./cases/BV-02/service.mjs");
  const onlyProducer = await exerciseCase("BV-01", ROOT, {
    "store.mjs": goodStore,
  });
  const onlyConsumer = await exerciseCase("BV-01", ROOT, {
    "service.mjs": goodService,
  });
  assert.deepEqual(onlyProducer.issueFailures, {
    consumerDuplicate: true,
    producerAtomicity: false,
  });
  assert.deepEqual(onlyConsumer.issueFailures, {
    consumerDuplicate: false,
    producerAtomicity: true,
  });
});
test("test oracle partial fixes independently kill mutants", async () => {
  const discountOnly = { releaseTest: (q) => q(100) === 90 };
  const negativeOnly = {
    releaseTest: (q) => {
      try {
        q(-1);
        return false;
      } catch {
        return true;
      }
    },
  };
  const a = await exerciseCase("BV-16", ROOT, { "service.mjs": discountOnly });
  const b = await exerciseCase("BV-16", ROOT, { "service.mjs": negativeOnly });
  assert.deepEqual(
    a.mutants.map((x) => x.survives),
    [false, true],
  );
  assert.deepEqual(
    b.mutants.map((x) => x.survives),
    [true, false],
  );
});
test("rollout unresolved has executable compatible deployment completions", async () => {
  const { createConfig, publish } = await import("./cases/BV-15/config.mjs");
  const { begin, finish } = await import("./cases/BV-15/service.mjs");
  for (const overlap of [false, true]) {
    const c = createConfig(overlap),
      r = begin(c);
    publish(c);
    assert.equal(finish(c, r), overlap);
  }
});
test("multi-issue recall and open-set pending are distinct", () => {
  const s = scoreIssues(
    ["a", "b"],
    [
      { id: "x", status: "matched", expectedId: "a" },
      { id: "y", status: "pending" },
    ],
  );
  assert.equal(s.recall, 0.5);
  assert.equal(s.missed, 1);
  assert.equal(s.falsePositives, 0);
  assert.equal(s.pending, 1);
  assert.equal(s.perfect, false);
  assert.equal(
    scoreIssues(
      ["a"],
      [
        { id: "x", status: "matched", expectedId: "a" },
        { id: "y", status: "matched", expectedId: "a" },
      ],
    ).found,
    1,
  );
  assert.equal(scoreIssues([], []).recall, null);
  assert.throws(() =>
    scoreIssues(["a"], [{ id: "x", status: "matched", expectedId: "b" }]),
  );
  assert.throws(() => scoreIssues([], [{ id: "x", status: "wrong" }]));
  assert.throws(() =>
    scoreIssues(
      [],
      [
        { id: "x", status: "pending" },
        { id: "x", status: "pending" },
      ],
    ),
  );
});
function cloned(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "brooks-v2-"));
  try {
    cpSync(ROOT, dir, { recursive: true });
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("rubric cannot be exported through whitelist", () =>
  cloned((dir) => {
    const p = path.join(dir, "cases.json"),
      m = read(p);
    m.cases[0].inputs[0] = m.cases[0].rubric;
    writeFileSync(p, JSON.stringify(m));
    assert.throws(() => exportCase("BV-01", dir));
  }));
for (const spec of ["./missing.mjs", "../../rubric.json", "node:fs"])
  test("reject import " + spec, () =>
    cloned((dir) => {
      const p = path.join(dir, "cases/BV-01/service.mjs");
      writeFileSync(p, 'import "' + spec + '";\n' + readFileSync(p, "utf8"));
      assert.throws(() => validate(dir));
    }),
  );
test("reject input symlink", () =>
  cloned((dir) => {
    const p = path.join(dir, "cases/BV-01/service.mjs");
    rmSync(p);
    symlinkSync(path.join(ROOT, "cases/BV-01/service.mjs"), p);
    assert.throws(() => validate(dir));
  }));
test("freeze catches content and added files", () =>
  cloned((dir) => {
    writeFileSync(path.join(dir, "extra.txt"), "unexpected");
    assert.throws(() => checkFreeze(dir));
  }));

test("every unresolved case executes two compatible contract completions", async () => {
  const { contractCompletions } = await import("./suite.mjs");
  for (const c of m.cases.filter((c) => c.kind === "unresolved"))
    assert.deepEqual(
      (await contractCompletions(c.id)).map((o) => o.satisfied),
      [false, true],
    );
});
test("export fails on stale source freeze", () =>
  cloned((dir) => {
    const p = path.join(dir, "cases/BV-01/service.mjs");
    writeFileSync(p, readFileSync(p, "utf8") + "\n// drift\n");
    assert.throws(() => exportCase("BV-01", dir), /freeze/);
  }));
test("precision bounds preserve pending and novel findings", () => {
  const s = scoreIssues(
    ["a", "b"],
    [
      { id: "1", status: "matched", expectedId: "a" },
      { id: "2", status: "rejected" },
      { id: "3", status: "pending" },
    ],
  );
  assert.equal(s.precision, 0.5);
  assert.deepEqual(s.precisionBounds, { lower: 1 / 3, upper: 2 / 3 });
  assert.equal(s.reviewComplete, false);
  const n = scoreIssues(
    ["a"],
    [
      { id: "1", status: "novel-confirmed", causalId: "new" },
      { id: "2", status: "novel-confirmed", causalId: "new" },
    ],
  );
  assert.equal(n.novelConfirmed, 1);
  assert.equal(n.recall, 0);
  assert.equal(n.precision, 1);
  assert.throws(() => scoreIssues([""], []));
  assert.throws(() => scoreIssues([], [null]));
  assert.throws(() => scoreIssues([], {}));
});
for (const [bad, good, module] of [
  ["BV-04", "BV-05", "cache.mjs"],
  ["BV-07", "BV-08", "service.mjs"],
  ["BV-10", "BV-11", "service.mjs"],
  ["BV-13", "BV-14", "service.mjs"],
]) {
  test(bad + " guard transplant kills bounded defect", async () => {
    const replacement = await import("./cases/" + good + "/" + module);
    const observation = await exerciseCase(bad, ROOT, {
      [module]: replacement,
    });
    assert.equal(observation.violation, false);
    assert.equal(observation.benign, true);
  });
}

test("rejected and pending duplicate causal findings count once", () => {
  const s = scoreIssues(
    [],
    [
      { id: "1", status: "rejected", causalId: "same" },
      { id: "2", status: "rejected", causalId: "same" },
      { id: "3", status: "pending", causalId: "other" },
      { id: "4", status: "pending", causalId: "other" },
    ],
  );
  assert.equal(s.falsePositives, 1);
  assert.equal(s.pending, 1);
  assert.throws(() =>
    scoreIssues(
      [],
      [
        { id: "1", status: "rejected", causalId: "same" },
        { id: "2", status: "pending", causalId: "same" },
      ],
    ),
  );
});

test("global identity uniqueness does not imply tenant authorization binding", async () => {
  for (const [id, expectedViolation] of [
    ["BV-07", true],
    ["BV-08", false],
    ["BV-09", true],
  ]) {
    const result = await exerciseCase(id);
    assert.equal(result.globalUserHistories.length, 2);
    for (const history of result.globalUserHistories) {
      assert.equal(history.user, 42);
      assert.equal(
        history.answers.some((answer, i) => answer !== history.expected[i]),
        expectedViolation,
      );
    }
  }
});
test("permissive tenant completion enforces immutable binding before cache access in both orders", async () => {
  const { contractCompletions } = await import("./suite.mjs");
  const outcomes = await contractCompletions("BV-09");
  const observation = outcomes[1].observation;
  assert.deepEqual(observation.bindings, { 42: "red", 43: "blue" });
  assert.equal(Object.isFrozen(observation.bindings), true);
  assert.deepEqual(
    observation.histories.map((h) => h.order),
    [
      ["red", "blue"],
      ["blue", "red"],
    ],
  );
  for (const history of observation.histories) {
    assert.equal(
      history.events.filter((event) => event.bindingRejected).length,
      2,
    );
    assert.equal(history.events.filter((event) => event.cacheAccess).length, 3);
    for (const event of history.events) {
      if (event.tenant !== observation.bindings[event.user]) {
        assert.equal(event.cacheAccess, false);
        assert.equal(event.bindingRejected, true);
        assert.equal(event.decision, false);
      }
    }
    assert.deepEqual(history.events.map((event) => event.decision).slice(-3), [
      false,
      false,
      true,
    ]);
  }
});

test("cue audit pins six revised contexts and common task instructions", async () => {
  const { checkPromptAudit } = await import("./suite.mjs");
  assert.equal(checkPromptAudit(), true);
  const audit = read(ROOT + "prompt-cue-audit.json");
  assert.equal(audit.cases.length, 6);
  for (const entry of audit.cases) {
    assert.notEqual(entry.beforeSha256, entry.afterSha256);
    assert.ok(entry.changeRationale.length > 20);
    assert.ok(entry.retainedOperationalFacts.length >= 3);
  }
});
test("context changes require renewed cue audit", () =>
  cloned((dir) => {
    const file = path.join(dir, "cases/BV-09/context.md");
    writeFileSync(file, readFileSync(file, "utf8") + "\nChanged handoff.\n");
    assert.throws(() => validate(dir), /prompt audit digest/);
  }));
test("copying entire evaluator alternatives is rejected even if audit digest updated", () =>
  cloned((dir) => {
    const file = path.join(dir, "cases/BV-09/context.md");
    const rubric = read(path.join(dir, "cases/BV-09/rubric.json"));
    const context =
      readFileSync(file, "utf8") + "\n" + rubric.alternativeJudgments;
    writeFileSync(file, context);
    const audit = read(path.join(dir, "prompt-cue-audit.json"));
    // SHA hash alone records bytes; the separate exact-copy guard catches this accident.
    audit.cases.find((c) => c.caseId === "BV-09").afterSha256 = createHash(
      "sha256",
    )
      .update(context)
      .digest("hex");
    writeFileSync(
      path.join(dir, "prompt-cue-audit.json"),
      JSON.stringify(audit),
    );
    assert.throws(() => validate(dir), /copied rubric alternatives/);
  }));
