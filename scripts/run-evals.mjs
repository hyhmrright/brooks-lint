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
import { MODES } from "./modes.mjs";
import { RISK_CODES, extractRiskCodes } from "./eval-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const evalsData = JSON.parse(
  readFileSync(path.join(root, "evals/evals.json"), "utf8"),
);
const evals = evalsData.evals;

const REQUIRED_FIELDS = ["id", "name", "prompt", "expected_output", "mode"];

// Errors carry the summary bucket they belong to, so the report below never has
// to re-derive it by substring-matching its own message text.
const errors = [];
const warnings = [];

function fail(bucket, message) {
  errors.push({ bucket, message });
}

// ── Sequential ID check ────────────────────────────────────────────────────

for (let i = 0; i < evals.length; i++) {
  const ev = evals[i];
  const expectedId = i + 1;
  if (ev.id !== expectedId) {
    fail("id", `Eval at index ${i}: expected id ${expectedId}, got ${JSON.stringify(ev.id)}`);
  }
}

// Explicit duplicate-id guard (the sequential check only catches dups that also
// break the running count; a deliberate re-use of the same id would not).
const idCounts = new Map();
for (const ev of evals) idCounts.set(ev.id, (idCounts.get(ev.id) ?? 0) + 1);
for (const [id, count] of idCounts) {
  if (count > 1) fail("id", `Duplicate eval id ${JSON.stringify(id)} appears ${count} times`);
}

// ── Per-eval field and content checks ─────────────────────────────────────

for (const ev of evals) {
  const label = `Eval ${ev.id} "${ev.name ?? "<unnamed>"}"`;

  for (const field of REQUIRED_FIELDS) {
    if (!ev[field] && ev[field] !== 0) {
      fail("fields", `${label}: missing required field '${field}'`);
    }
  }

  for (const field of ["name", "prompt", "expected_output"]) {
    if (typeof ev[field] !== "string" || !ev[field].trim()) fail("fields", `${label}: '${field}' must be a non-empty string`);
  }

  if (!VALID_MODES.includes(ev.mode)) {
    fail("fields", `${label}: 'mode' must be one of ${VALID_MODES.join(", ")} (got '${ev.mode}')`);
  }

  if ("files" in ev && !Array.isArray(ev.files)) {
    fail("fields", `${label}: 'files' must be an array when present (got ${typeof ev.files})`);
  }
  if (Array.isArray(ev.files) && ev.files.some((file) => !file || typeof file.path !== "string" || !file.path.trim() || typeof file.content !== "string")) {
    fail("fields", `${label}: each fixture requires a non-empty 'path' and string 'content'`);
  }

  // expected_output should reference at least one risk code so reviewers know
  // which risk the scenario is testing. False-positive (no_risk_codes) and
  // health-score-suppression (no_health_score) scenarios are code-free by
  // design — warning on them is noise, so the check skips boundary scenarios.
  if (typeof ev.expected_output === "string") {
    // Same word-bounded extraction the live runner classifies with — a substring
    // scan here would let the two disagree about what a scenario expects.
    const referencedCodes = [...extractRiskCodes(ev.expected_output)];
    const isBoundaryScenario = ev.no_risk_codes || ev.no_health_score || ev.forbidden_risk_codes;
    if (referencedCodes.length === 0 && !isBoundaryScenario) {
      warnings.push(`${label}: expected_output does not reference any risk code (${RISK_CODES.join(", ")})`);
    }

    // mode ↔ risk-code compatibility: assemble-prompt.mjs only loads the risk
    // definitions from the common mode registry. Review includes Quick Test
    // Check's T-codes. A code outside the loaded set is a dead reference —
    // the model is never given its definition, so the scenario cannot pass live.
    // RISK_CODES is R/T-prefixed by construction, so c[0] fully partitions it.
    const refsR = referencedCodes.filter((c) => c[0] === "R");
    const refsT = referencedCodes.filter((c) => c[0] === "T");
    const unsupported = [...refsR, ...refsT].filter((code) => Object.hasOwn(MODES, ev.mode) && !MODES[ev.mode].risks.includes(code[0]));
    if (unsupported.length) {
      fail("coherence", `${label}: mode '${ev.mode}' does not load definitions for ${unsupported.join(", ")}`);
    }
  }

  // no_risk_codes and no_health_score are optional flags that put the live
  // runner into a false-positive classification mode. They are mutually
  // exclusive because allowing both would make the verdict indeterminate
  // (the no_health_score branch exits before risk-code analysis runs).
  if ("no_risk_codes" in ev && ev.no_risk_codes !== true) {
    fail("fields", `${label}: 'no_risk_codes' must be true when present (got ${JSON.stringify(ev.no_risk_codes)})`);
  }
  if ("no_health_score" in ev && ev.no_health_score !== true) {
    fail("fields", `${label}: 'no_health_score' must be true when present (got ${JSON.stringify(ev.no_health_score)})`);
  }
  if ("forbidden_risk_codes" in ev) {
    if (!Array.isArray(ev.forbidden_risk_codes) || !ev.forbidden_risk_codes.length ||
        ev.forbidden_risk_codes.some((code) => !RISK_CODES.includes(code) || !Object.hasOwn(MODES, ev.mode) || !MODES[ev.mode].risks.includes(code[0]))) {
      fail("fields", `${label}: 'forbidden_risk_codes' must be a non-empty array of risk codes supported by the mode`);
    }
  }
  if ([ev.no_risk_codes, ev.no_health_score, ev.forbidden_risk_codes].filter(Boolean).length > 1) {
    fail("coherence", `${label}: boundary flags are mutually exclusive`);
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
  if (ev.no_risk_codes || ev.no_health_score || ev.forbidden_risk_codes) continue;
  if (typeof ev.expected_output !== "string") continue;
  for (const code of extractRiskCodes(ev.expected_output)) coveredCodes.add(code);
}
const uncoveredCodes = RISK_CODES.filter((code) => !coveredCodes.has(code));
if (uncoveredCodes.length > 0) {
  fail("coherence", `Risk codes with no positive eval scenario: ${uncoveredCodes.join(", ")}`);
}

// ── Report ─────────────────────────────────────────────────────────────────

const passed = (bucket) => !errors.some((e) => e.bucket === bucket);

console.log("\nEval Suite Structural Validation");
console.log("=================================");
console.log(`Total scenarios   : ${evals.length}`);
console.log(`Sequential IDs    : ${passed("id") ? "PASS" : "FAIL"}`);
console.log(`Required fields   : ${passed("fields") ? "PASS" : "FAIL"}`);
console.log(`Mode/risk & cover : ${passed("coherence") ? "PASS" : "FAIL"}`);
console.log(`Risk code refs    : ${warnings.length === 0 ? "PASS" : `${warnings.length} warning(s)`}`);

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const e of errors) console.error(`  ✗ ${e.message}`);
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
