/**
 * Shared eval classification utilities.
 * Used by run-evals.mjs and run-evals-live.mjs (runtime) and validate-repo.test.mjs.
 */

import { PRODUCTION_RISK_COUNT, TEST_RISK_COUNT } from "./frontmatter.mjs";
import { parseReport, readScore } from "./report-parse.mjs";

/**
 * Canonical risk codes, derived from the counts rather than spelled out, so a
 * seventh risk becomes valid everywhere at once instead of in whichever regexes
 * someone remembered to widen.
 */
export const RISK_CODES = [
  ...Array.from({ length: PRODUCTION_RISK_COUNT }, (_, i) => `R${i + 1}`),
  ...Array.from({ length: TEST_RISK_COUNT }, (_, i) => `T${i + 1}`),
];

// Word-bounded and enumerated: a bare `\d+` would also match typos like `R10` or
// stray text like "R20", polluting true/false-positive classification.
const RISK_CODE_RE = new RegExp(`\\b(${RISK_CODES.join("|")})\\b`, "g");

export function extractRiskCodes(text) {
  return new Set(text.match(RISK_CODE_RE) ?? []);
}

export function classify(scenario, aiText) {
  if (typeof aiText !== "string" || !aiText.trim()) return "fail";
  const parsed = parseReport(aiText, { mode: scenario.mode, requireScore: !scenario.no_health_score });
  if (scenario.no_health_score) {
    return readScore(aiText, scenario.mode).present || parsed.findings.length || parsed.errors.length
      ? "fail" : "false-positive-pass";
  }
  if (!parsed.valid) return "fail";
  const expectedCodes = extractRiskCodes(scenario.expected_output);
  const foundCodes = new Set(parsed.findings.map((finding) => finding.riskCode).filter(Boolean));
  if (scenario.no_risk_codes) {
    return parsed.findings.length === 0 ? "false-positive-pass" : "fail";
  }
  if (scenario.forbidden_risk_codes) {
    return scenario.forbidden_risk_codes.some((code) => foundCodes.has(code)) ? "fail" : "false-positive-pass";
  }
  // This is a structural contract check, not a semantic judgment of the evidence.
  if (!expectedCodes.size) return "fail";
  const truePositives  = [...expectedCodes].filter((c) => foundCodes.has(c));
  const falseNegatives = [...expectedCodes].filter((c) => !foundCodes.has(c));
  if (falseNegatives.length === 0) return "pass";
  if (truePositives.length > 0) return "partial";
  return "fail";
}
