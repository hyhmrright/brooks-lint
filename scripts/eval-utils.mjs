/**
 * Shared eval classification utilities.
 * Used by run-evals-live.mjs (runtime) and validate-repo.test.mjs (tests).
 */

const RISK_CODE_RE = /\b([RT]\d+)\b/g;

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
  if (scenario.no_risk_codes) {
    const unexpected = [...foundCodes].filter((c) => expectedCodes.has(c));
    return unexpected.length === 0 ? "false-positive-pass" : "fail";
  }

  const hasIronLaw =
    /\bSymptom\b/.test(aiText) &&
    /\bSource\b/.test(aiText) &&
    /\bConsequence\b/.test(aiText) &&
    /\bRemedy\b/.test(aiText);

  const truePositives  = [...expectedCodes].filter((c) => foundCodes.has(c));
  const falseNegatives = [...expectedCodes].filter((c) => !foundCodes.has(c));

  if (falseNegatives.length === 0 && hasIronLaw && hasHealthScore) return "pass";
  if (truePositives.length > 0   && hasIronLaw)                    return "partial";
  return "fail";
}
