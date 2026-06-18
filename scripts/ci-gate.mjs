/**
 * CI quality gates for the GitHub Action.
 *
 * Pure decision helpers (severityBreached / isRegression) plus a CLI that reads
 * the JSON report emitted by ci-review.mjs and exits non-zero when a gate is
 * breached. Kept out of action.yml so the logic is unit-testable instead of
 * living as an untested inline `node -e` block.
 *
 * Usage:
 *   node scripts/ci-gate.mjs --report brooks-lint-report.json \
 *     --fail-on critical --fail-on-regression true
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./cli-utils.mjs";

/**
 * True when findings at/above the `failOn` severity exist.
 * @param {{critical?: number, warning?: number, suggestion?: number}} findings
 * @param {"none"|"warning"|"critical"} failOn
 */
export function severityBreached(findings, failOn) {
  const critical = findings?.critical ?? 0;
  const warning = findings?.warning ?? 0;
  if (failOn === "critical") return critical > 0;
  if (failOn === "warning") return critical + warning > 0;
  return false;
}

/** True when the Health Score regressed (delta is a negative number). */
export function isRegression(delta) {
  return typeof delta === "number" && delta < 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const report = JSON.parse(readFileSync(args.report, "utf8"));
  const failOn = args["fail-on"] ?? "none";
  // parseArgs yields boolean true for a bare flag and a string otherwise.
  const failOnRegression = String(args["fail-on-regression"]).toLowerCase() === "true";

  let failed = false;
  if (failOn !== "none" && severityBreached(report.findings, failOn)) {
    console.error(`Severity gate failed (fail-on=${failOn}): ${JSON.stringify(report.findings)}`);
    failed = true;
  }
  if (failOnRegression && report.delta == null) {
    console.log("Regression gate inactive: no prior history (commit .brooks-lint-history.json to enable it).");
  } else if (failOnRegression && isRegression(report.delta)) {
    console.error(`Regression gate failed: ${report.previousScore} → ${report.score} (${report.delta})`);
    failed = true;
  }

  if (failed) process.exit(1);
  console.log("brooks-lint quality gates passed.");
}
