/**
 * Shared eval classification utilities.
 * Used by run-evals.mjs and run-evals-live.mjs (runtime) and validate-repo.test.mjs.
 */

import { PRODUCTION_RISK_COUNT, TEST_RISK_COUNT } from "./frontmatter.mjs";

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
  const hasHealthScore = /Health\s+Score[:\s]+\d+/i.test(aiText);

  // no_health_score exits before risk-code extraction (codes are not needed).
  if (scenario.no_health_score) {
    return hasHealthScore ? "fail" : "false-positive-pass";
  }

  const expectedCodes = extractRiskCodes(scenario.expected_output);
  const foundCodes    = extractRiskCodes(aiText);

  // no_risk_codes exits after extraction (needs codes, not Iron Law / Health Score).
  // In this branch expected_output describes what must NOT be flagged, so
  // expectedCodes is a *forbidden* set — hence the inverted-looking filter.
  if (scenario.no_risk_codes) {
    const forbiddenHits = [...foundCodes].filter((c) => expectedCodes.has(c));
    return forbiddenHits.length === 0 ? "false-positive-pass" : "fail";
  }

  const hasIronLaw =
    (/\bSymptom\b/.test(aiText) && /\bSource\b/.test(aiText) &&
     /\bConsequence\b/.test(aiText) && /\bRemedy\b/.test(aiText)) ||
    (/症状/.test(aiText) && /根源/.test(aiText) &&
     /后果/.test(aiText) && /修复/.test(aiText));

  const truePositives  = [...expectedCodes].filter((c) => foundCodes.has(c));
  const falseNegatives = [...expectedCodes].filter((c) => !foundCodes.has(c));

  if (falseNegatives.length === 0 && hasIronLaw && hasHealthScore) return "pass";
  if (truePositives.length > 0   && hasIronLaw)                    return "partial";
  return "fail";
}
