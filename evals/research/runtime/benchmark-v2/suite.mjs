import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import {
  checkedPath,
  inventory,
  sha256,
  staticImports,
} from "../hard-benchmark/suite.mjs";
export const ROOT = fileURLToPath(new URL(".", import.meta.url));
export const read = (p) => JSON.parse(readFileSync(p, "utf8"));
export const manifest = (root = ROOT) => read(checkedPath(root, "cases.json"));
const utility = fileURLToPath(
  new URL("../hard-benchmark/suite.mjs", import.meta.url),
);
export function validate(root = ROOT) {
  const m = manifest(root);
  if (
    m.revision !== 1 ||
    m.independent !== false ||
    m.difficultyMeasured !== false ||
    m.liveRunnerIntegration !== false ||
    m.humanReview !== "pending"
  )
    throw Error("research claims");
  if (
    m.families.length !== 6 ||
    m.cases.length !== 18 ||
    new Set(m.families.map((f) => f.id)).size !== 6
  )
    throw Error("inventory");
  if (new Set(m.cases.map((c) => c.id)).size !== 18)
    throw Error("duplicate case");
  for (const f of m.families) {
    const kinds = m.cases
      .filter((c) => c.family === f.id)
      .map((c) => c.kind)
      .sort();
    if (
      JSON.stringify(kinds) !==
      JSON.stringify(["defect", "protected", "unresolved"])
    )
      throw Error("triad");
  }
  for (const c of m.cases) {
    if (!/^BV-\d{2}$/.test(c.id) || !m.families.some((f) => f.id === c.family))
      throw Error("case");
    const prefix = "cases/" + c.id + "/";
    if (
      c.rubric !== prefix + "rubric.json" ||
      c.driver !== "drivers/" + c.family + ".mjs"
    )
      throw Error("evaluator paths");
    checkedPath(root, c.driver);
    if (
      new Set(c.inputs).size !== 5 ||
      !c.inputs.includes(prefix + "context.md") ||
      !c.inputs.includes(prefix + "task.md")
    )
      throw Error("inputs");
    for (const input of c.inputs) {
      if (
        !input.startsWith(prefix) ||
        !/^(?:[a-z]+\.mjs|context\.md|task\.md)$/.test(
          input.slice(prefix.length),
        )
      )
        throw Error("whitelist");
      const s = readFileSync(checkedPath(root, input), "utf8");
      if (
        /rubric\.json|freeze\.json|BV-\d\d|expectedFindings|development-reserved/.test(
          s,
        )
      )
        throw Error("leakage");
      if (input.endsWith(".mjs")) {
        for (const imp of staticImports(s))
          if (
            !/^\.\/[a-z]+\.mjs$/.test(imp) ||
            !c.inputs.includes(prefix + imp.slice(2))
          )
            throw Error("import closure");
      }
    }
    const r = read(checkedPath(root, c.rubric));
    if (
      r.caseId !== c.id ||
      r.assessment !== c.kind ||
      !Array.isArray(r.expectedFindings) ||
      !r.openSetPolicy ||
      !r.matchingPolicy
    )
      throw Error("rubric");
    if (
      c.kind === "defect"
        ? r.expectedFindings.length < 1
        : r.expectedFindings.length !== 0
    )
      throw Error("finding count");
    if (
      new Set(r.expectedFindings.map((f) => f.id)).size !==
      r.expectedFindings.length
    )
      throw Error("duplicate finding");
    if (
      c.kind === "unresolved" &&
      (!r.alternativeJudgments ||
        !r.evidenceRequirements.includes("two-compatible-judgments"))
    )
      throw Error("uncertainty");
  }
  checkPromptAudit(root, m);
  return m;
}
export function checkPromptAudit(root = ROOT, m = manifest(root)) {
  const audit = read(checkedPath(root, "prompt-cue-audit.json"));
  const unresolved = m.cases.filter((c) => c.kind === "unresolved");
  if (
    audit.revision !== 1 ||
    !Array.isArray(audit.cases) ||
    JSON.stringify(audit.cases.map((c) => c.caseId).sort()) !==
      JSON.stringify(unresolved.map((c) => c.id).sort())
  )
    throw Error("prompt audit inventory");
  const commonTask = readFileSync(
    checkedPath(
      root,
      m.cases[0].inputs.find((p) => p.endsWith("/task.md")),
    ),
    "utf8",
  );
  for (const c of m.cases) {
    const task = readFileSync(
      checkedPath(
        root,
        c.inputs.find((p) => p.endsWith("/task.md")),
      ),
      "utf8",
    );
    if (task !== commonTask) throw Error("unequal task instructions");
  }
  for (const a of audit.cases) {
    if (
      a.context !== "cases/" + a.caseId + "/context.md" ||
      !/^[a-f0-9]{64}$/.test(a.beforeSha256) ||
      !a.changeRationale ||
      !a.residualCueing ||
      a.reviewStatus !== "same-workflow-author-audit-not-independent" ||
      !Array.isArray(a.retainedOperationalFacts) ||
      a.retainedOperationalFacts.length < 3
    )
      throw Error("prompt audit content");
    const context = readFileSync(checkedPath(root, a.context), "utf8");
    if (sha256(context) !== a.afterSha256) throw Error("prompt audit digest");
    const c = m.cases.find((c) => c.id === a.caseId);
    const rubric = read(checkedPath(root, c.rubric));
    if (context.includes(rubric.alternativeJudgments))
      throw Error("copied rubric alternatives");
  }
  return true;
}
export function exportCase(id, root = ROOT) {
  checkFreeze(root);
  const m = validate(root),
    c = m.cases.find((c) => c.id === id);
  if (!c) throw Error("unknown case");
  return Object.fromEntries(
    c.inputs.map((p) => [
      path.basename(p),
      readFileSync(checkedPath(root, p), "utf8"),
    ]),
  );
}
export async function exerciseCase(id, root = ROOT, overrides = {}) {
  const c = manifest(root).cases.find((c) => c.id === id);
  if (!c) throw Error("unknown case");
  const driver = await import(pathToFileURL(checkedPath(root, c.driver)));
  const load = async (name) =>
    overrides[name] ||
    import(pathToFileURL(checkedPath(root, "cases/" + id + "/" + name)));
  return driver.exercise(load);
}
export async function contractCompletions(id, root = ROOT) {
  const c = manifest(root).cases.find((c) => c.id === id);
  if (!c || c.kind !== "unresolved") throw Error("unresolved case required");
  const driver = await import(pathToFileURL(checkedPath(root, c.driver)));
  const load = (name) =>
    import(pathToFileURL(checkedPath(root, "cases/" + id + "/" + name)));
  const outcomes = await driver.completions(load);
  if (
    outcomes.length !== 2 ||
    outcomes[0].satisfied !== false ||
    outcomes[1].satisfied !== true
  )
    throw Error("compatible completions");
  return outcomes;
}
export async function reproduce(root = ROOT) {
  const m = validate(root),
    result = [];
  for (const c of m.cases) {
    const observation = await exerciseCase(c.id, root);
    if (
      !observation.benign ||
      observation.violation !== (c.kind !== "protected")
    )
      throw Error("oracle mismatch " + c.id);
    result.push({
      id: c.id,
      assessment: c.kind,
      observation,
      compatibleCompletions:
        c.kind === "unresolved" ? await contractCompletions(c.id, root) : null,
      interpretation:
        c.kind === "unresolved"
          ? "Observed under restrictive completion; permissive completion is specified in rubric, not inferred fact."
          : "Bounded fixture observation only.",
    });
  }
  return result;
}
export function freeze(root = ROOT) {
  const files = Object.fromEntries(
    inventory(root).map((p) => [p, sha256(readFileSync(checkedPath(root, p)))]),
  );
  const value = {
    revision: 1,
    files,
    dependencies: {
      "../hard-benchmark/suite.mjs": sha256(readFileSync(utility)),
    },
  };
  writeFileSync(
    path.join(root, "freeze.json"),
    JSON.stringify(value, null, 2) + "\n",
  );
  return value;
}
export function checkFreeze(root = ROOT) {
  const f = read(checkedPath(root, "freeze.json"));
  const actual = inventory(root);
  if (JSON.stringify(actual) !== JSON.stringify(Object.keys(f.files)))
    throw Error("freeze inventory");
  for (const p of actual)
    if (sha256(readFileSync(checkedPath(root, p))) !== f.files[p])
      throw Error("freeze digest " + p);
  if (
    f.dependencies["../hard-benchmark/suite.mjs"] !==
    sha256(readFileSync(utility))
  )
    throw Error("utility digest");
  return true;
}
// An annotation aggregator, not an autonomous semantic judge. Evidence adjudication is required first.
export function scoreIssues(expectedIds, annotations) {
  if (!Array.isArray(expectedIds) || !Array.isArray(annotations))
    throw Error("arrays required");
  const validId = (id) => typeof id === "string" && id.trim().length > 0;
  if (
    expectedIds.some((id) => !validId(id)) ||
    new Set(expectedIds).size !== expectedIds.length
  )
    throw Error("expected IDs");
  const seen = new Set(),
    matched = new Set(),
    novel = new Set(),
    causalStatuses = new Map();
  let rejected = 0,
    pending = 0,
    duplicateMatches = 0;
  for (const a of annotations) {
    if (!a || !validId(a.id) || seen.has(a.id)) throw Error("annotation ID");
    seen.add(a.id);
    if (
      !["matched", "rejected", "pending", "novel-confirmed"].includes(a.status)
    )
      throw Error("annotation status");
    const causalId =
      a.status === "matched" ? a.expectedId : (a.causalId ?? a.id);
    if (!validId(causalId)) throw Error("causal ID");
    const previous = causalStatuses.get(causalId);
    if (previous && previous !== a.status)
      throw Error("conflicting causal adjudication");
    causalStatuses.set(causalId, a.status);
    if (a.status === "matched") {
      if (!expectedIds.includes(a.expectedId))
        throw Error("unknown expected issue");
      if (matched.has(a.expectedId)) duplicateMatches++;
      matched.add(a.expectedId);
    }
    if (a.status === "rejected" && !previous) rejected++;
    if (a.status === "pending" && !previous) pending++;
    if (a.status === "novel-confirmed") {
      if (!validId(a.causalId) || expectedIds.includes(a.causalId))
        throw Error("novel causal ID");
      novel.add(a.causalId);
    }
  }
  const confirmed = matched.size + novel.size,
    resolved = confirmed + rejected,
    total = resolved + pending;
  return {
    expected: expectedIds.length,
    found: matched.size,
    missed: expectedIds.length - matched.size,
    recall: expectedIds.length ? matched.size / expectedIds.length : null,
    falsePositives: rejected,
    pending,
    novelConfirmed: novel.size,
    duplicateMatches,
    confirmed,
    resolvedPrecisionDenominator: resolved,
    precision: resolved ? confirmed / resolved : null,
    precisionBounds: total
      ? { lower: confirmed / total, upper: (confirmed + pending) / total }
      : null,
    allExpectedFound: matched.size === expectedIds.length,
    reviewComplete: pending === 0,
    perfect:
      matched.size === expectedIds.length && pending === 0 && rejected === 0,
  };
}
