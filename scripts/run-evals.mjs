/**
 * Eval suite structural validator.
 *
 * Checks that every scenario in evals/evals.json is structurally sound:
 *   - Required fields are present
 *   - IDs are sequential
 *   - expected_output references at least one risk code (R1-R6 or T1-T6)
 *
 * This does not execute skills against prompts — it validates that the eval
 * definitions themselves are complete and internally consistent, catching
 * authoring errors (missing fields, duplicate IDs, orphaned scenarios) before
 * they silently accumulate.
 *
 * Usage:  node scripts/run-evals.mjs
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VALID_MODES } from "./assemble-prompt.mjs";
import { PRODUCTION_RISK_COUNT, TEST_RISK_COUNT } from "./frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const evalsData = JSON.parse(
  readFileSync(path.join(root, "evals/evals.json"), "utf8"),
);
const evals = evalsData.evals;

const REQUIRED_FIELDS = ["id", "name", "prompt", "expected_output", "mode"];

const RISK_CODES = [
  ...Array.from({ length: PRODUCTION_RISK_COUNT }, (_, i) => `R${i + 1}`),
  ...Array.from({ length: TEST_RISK_COUNT }, (_, i) => `T${i + 1}`),
];

const errors = [];
const warnings = [];

// ── Sequential ID check ────────────────────────────────────────────────────

for (let i = 0; i < evals.length; i++) {
  const ev = evals[i];
  const expectedId = i + 1;
  if (ev.id !== expectedId) {
    errors.push(`Eval at index ${i}: expected id ${expectedId}, got ${JSON.stringify(ev.id)}`);
  }
}

// Explicit duplicate-id guard (the sequential check only catches dups that also
// break the running count; a deliberate re-use of the same id would not).
const idCounts = new Map();
for (const ev of evals) idCounts.set(ev.id, (idCounts.get(ev.id) ?? 0) + 1);
for (const [id, count] of idCounts) {
  if (count > 1) errors.push(`Duplicate eval id ${JSON.stringify(id)} appears ${count} times`);
}

// ── Per-eval field and content checks ─────────────────────────────────────

for (const ev of evals) {
  const label = `Eval ${ev.id} "${ev.name ?? "<unnamed>"}"`;

  for (const field of REQUIRED_FIELDS) {
    if (!ev[field] && ev[field] !== 0) {
      errors.push(`${label}: missing required field '${field}'`);
    }
  }

  if (typeof ev.prompt === "string" && ev.prompt.trim().length === 0) {
    errors.push(`${label}: 'prompt' is empty`);
  }

  if (typeof ev.expected_output === "string" && ev.expected_output.trim().length === 0) {
    errors.push(`${label}: 'expected_output' is empty`);
  }

  if (typeof ev.mode === "string" && !VALID_MODES.includes(ev.mode)) {
    errors.push(`${label}: 'mode' must be one of ${VALID_MODES.join(", ")} (got '${ev.mode}')`);
  }

  if ("files" in ev && !Array.isArray(ev.files)) {
    errors.push(`${label}: 'files' must be an array when present (got ${typeof ev.files})`);
  }

  // expected_output should reference at least one risk code so reviewers know
  // which risk the scenario is testing. False-positive (no_risk_codes) and
  // health-score-suppression (no_health_score) scenarios are code-free by
  // design — warning on them is noise, so the check skips boundary scenarios.
  if (typeof ev.expected_output === "string") {
    const referencedCodes = RISK_CODES.filter((code) => ev.expected_output.includes(code));
    const isBoundaryScenario = ev.no_risk_codes || ev.no_health_score;
    if (referencedCodes.length === 0 && !isBoundaryScenario) {
      warnings.push(`${label}: expected_output does not reference any risk code (${RISK_CODES.join(", ")})`);
    }

    // mode ↔ risk-code compatibility: assemble-prompt.mjs only loads the risk
    // definitions for that mode (test→T-codes, review/audit/debt→R-codes,
    // health/sweep→both). A code outside the loaded set is a dead reference —
    // the model is never given its definition, so the scenario cannot pass live.
    // RISK_CODES is R/T-prefixed by construction, so c[0] fully partitions it.
    const refsR = referencedCodes.filter((c) => c[0] === "R");
    const refsT = referencedCodes.filter((c) => c[0] === "T");
    if (ev.mode === "test" && refsR.length > 0) {
      errors.push(`${label}: mode 'test' loads only T-codes but expected_output references ${refsR.join(", ")}`);
    }
    if (["review", "audit", "debt"].includes(ev.mode) && refsT.length > 0) {
      errors.push(`${label}: mode '${ev.mode}' loads only R-codes but expected_output references ${refsT.join(", ")}`);
    }
  }

  // no_risk_codes and no_health_score are optional flags that put the live
  // runner into a false-positive classification mode. They are mutually
  // exclusive because allowing both would make the verdict indeterminate
  // (the no_health_score branch exits before risk-code analysis runs).
  if ("no_risk_codes" in ev && ev.no_risk_codes !== true) {
    errors.push(`${label}: 'no_risk_codes' must be true when present (got ${JSON.stringify(ev.no_risk_codes)})`);
  }
  if ("no_health_score" in ev && ev.no_health_score !== true) {
    errors.push(`${label}: 'no_health_score' must be true when present (got ${JSON.stringify(ev.no_health_score)})`);
  }
  if (ev.no_risk_codes && ev.no_health_score) {
    errors.push(`${label}: 'no_risk_codes' and 'no_health_score' are mutually exclusive`);
  }
}

// ── Reverse coverage ───────────────────────────────────────────────────────
// Every risk code must have at least one positive happy-path scenario. Skip the
// false-positive (no_risk_codes) and health-score-suppression (no_health_score)
// boundary scenarios — neither is a clean positive demonstration of a code.
// CLAUDE.md requires "every new risk code gets paired coverage"; this enforces it
// so a new code can never ship without a happy-path eval.

const coveredCodes = new Set();
for (const ev of evals) {
  if (ev.no_risk_codes || ev.no_health_score) continue;
  if (typeof ev.expected_output !== "string") continue;
  for (const code of RISK_CODES) {
    if (ev.expected_output.includes(code)) coveredCodes.add(code);
  }
}
const uncoveredCodes = RISK_CODES.filter((code) => !coveredCodes.has(code));
if (uncoveredCodes.length > 0) {
  errors.push(`Risk codes with no positive eval scenario: ${uncoveredCodes.join(", ")}`);
}

// ── Report ─────────────────────────────────────────────────────────────────

const idCheckPass = !errors.some((e) => e.includes("expected id") || e.includes("Duplicate eval id"));
const fieldCheckPass = !errors.some((e) => e.includes("missing required field") || e.includes("is empty") || e.includes("'files' must"));
const coherencePass = !errors.some((e) => e.includes("loads only") || e.includes("no positive eval scenario"));
const riskCodePass = warnings.length === 0;

console.log("\nEval Suite Structural Validation");
console.log("=================================");
console.log(`Total scenarios   : ${evals.length}`);
console.log(`Sequential IDs    : ${idCheckPass ? "PASS" : "FAIL"}`);
console.log(`Required fields   : ${fieldCheckPass ? "PASS" : "FAIL"}`);
console.log(`Mode/risk & cover : ${coherencePass ? "PASS" : "FAIL"}`);
console.log(`Risk code refs    : ${riskCodePass ? "PASS" : `${warnings.length} warning(s)`}`);

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const e of errors) console.error(`  ✗ ${e}`);
}

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}

if (errors.length === 0) {
  console.log(`\nAll structural checks passed (${evals.length} scenarios).`);
} else {
  process.exit(1);
}
