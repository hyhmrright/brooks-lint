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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const evalsData = JSON.parse(
  readFileSync(path.join(root, "evals/evals.json"), "utf8"),
);
const evals = evalsData.evals;

const REQUIRED_FIELDS = ["id", "name", "prompt", "expected_output"];

// Must match the risk categories defined in skills/_shared/decay-risks.md (production)
// and skills/_shared/test-decay-risks.md (test). Update both constants when adding a new
// risk category so RISK_CODES stays in sync automatically.
const PRODUCTION_RISK_COUNT = 6;
const TEST_RISK_COUNT = 6;
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

  // expected_output should reference at least one risk code so reviewers know
  // which risk the scenario is testing
  if (typeof ev.expected_output === "string") {
    const referencedCodes = RISK_CODES.filter((code) => ev.expected_output.includes(code));
    if (referencedCodes.length === 0) {
      warnings.push(`${label}: expected_output does not reference any risk code (${RISK_CODES.join(", ")})`);
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────

const idCheckPass = !errors.some((e) => e.includes("expected id"));
const fieldCheckPass = !errors.some((e) => e.includes("missing required field") || e.includes("is empty"));
const riskCodePass = warnings.length === 0;

console.log("\nEval Suite Structural Validation");
console.log("=================================");
console.log(`Total scenarios : ${evals.length}`);
console.log(`Sequential IDs  : ${idCheckPass ? "PASS" : "FAIL"}`);
console.log(`Required fields : ${fieldCheckPass ? "PASS" : "FAIL"}`);
console.log(`Risk code refs  : ${riskCodePass ? "PASS" : `${warnings.length} warning(s)`}`);

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
