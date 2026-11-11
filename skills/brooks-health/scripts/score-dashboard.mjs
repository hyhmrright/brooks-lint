import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIMENSIONS = [
  ['pr', 'Code Quality', 25],
  ['architecture', 'Architecture', 30],
  ['debt', 'Tech Debt', 25],
  ['test', 'Test Quality', 20],
];
const DEDUCTIONS = {
  strict: { critical: 20, warning: 8, suggestion: 2 },
  balanced: { critical: 15, warning: 5, suggestion: 1 },
  'legacy-friendly': { critical: 8, warning: 3, suggestion: 1 },
};
const own = (object, key) => Object.hasOwn(object, key);

function object(value, allowed, required, at) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${at} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`${at}: unknown field ${key}`);
  }
  for (const key of required) {
    if (!own(value, key)) throw new Error(`${at}: missing ${key}`);
  }
}

/** Calculate from an already adjudicated, configured and capped finding ledger. */
export function calculateDashboard(ledger) {
  object(ledger, ['strictness', 'hasDiff', 'dimensions', 'suppliedCappedLedger'], ['hasDiff', 'dimensions'], 'ledger');
  const strictness = own(ledger, 'strictness') ? ledger.strictness : 'balanced';
  if (typeof strictness !== 'string' || !own(DEDUCTIONS, strictness)) {
    throw new Error('strictness must be a resolved supported preset');
  }
  if (typeof ledger.hasDiff !== 'boolean') throw new Error('hasDiff must be a boolean');
  if (own(ledger, 'suppliedCappedLedger') && typeof ledger.suppliedCappedLedger !== 'boolean') {
    throw new Error('suppliedCappedLedger must be a boolean assertion');
  }
  const keys = DIMENSIONS.map(([key]) => key);
  object(ledger.dimensions, keys, keys, 'dimensions');
  const dimensions = DIMENSIONS.map(([key, label, weight]) => {
    const input = ledger.dimensions[key];
    object(input, ['status', 'findings', 'reason'], ['status'], key);
    if (!['assessed', 'unassessed', 'skipped'].includes(input.status)) {
      throw new Error(`${key}: invalid status`);
    }
    if ((key === 'pr' && !ledger.hasDiff) !== (input.status === 'skipped')) {
      throw new Error(`${key}: only PR with no diff must be skipped`);
    }
    if (input.status !== 'assessed') {
      if (own(input, 'findings')) throw new Error(`${key}: unassessed/skipped cannot carry findings`);
      if (typeof input.reason !== 'string' || !input.reason.trim()) {
        throw new Error(`${key}: unassessed/skipped requires a reason`);
      }
      return { key, label, weight: input.status === 'skipped' ? 0 : weight,
        status: input.status, reason: input.reason, findings: [], deduction: null, score: null };
    }
    if (own(input, 'reason')) throw new Error(`${key}: assessed ledger does not use reason`);
    if (!Array.isArray(input.findings) || input.findings.length > 3) {
      throw new Error(`${key}: findings must be an array capped at three`);
    }
    const ids = new Set();
    const byRisk = new Map();
    const findings = input.findings.map((finding, index) => {
      const at = `${key}.findings[${index}]`;
      object(finding, ['id', 'risk', 'severity'], ['id', 'severity'], at);
      if (typeof finding.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(finding.id)) {
        throw new Error(`${at}: id must contain only letters, digits, dots, underscores or hyphens`);
      }
      if (ids.has(finding.id)) throw new Error(`${key}: duplicate finding id ${finding.id}`);
      ids.add(finding.id);
      if (!own(finding, 'risk')) {
        if (ledger.suppliedCappedLedger !== true) {
          throw new Error(`${at}: missing risk requires suppliedCappedLedger assertion`);
        }
      } else {
        if (typeof finding.risk !== 'string' || !/^(?:[RT][1-6]|C\d+)$/.test(finding.risk)) {
          throw new Error(`${at}: invalid risk code`);
        }
        const count = (byRisk.get(finding.risk) ?? 0) + 1;
        if (key === 'debt' && count > 2) throw new Error('debt: at most two findings per risk code');
        byRisk.set(finding.risk, count);
      }
      if (typeof finding.severity !== 'string' || !own(DEDUCTIONS[strictness], finding.severity)) {
        throw new Error(`${at}: invalid severity`);
      }
      return { ...finding };
    });
    const deduction = findings.reduce((sum, finding) => sum + DEDUCTIONS[strictness][finding.severity], 0);
    return { key, label, weight, status: 'assessed', findings, deduction, score: Math.max(0, 100 - deduction) };
  });
  const incomplete = dimensions.filter(dimension => dimension.status === 'unassessed');
  const denominator = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  const numerator = incomplete.length ? null : dimensions.reduce((sum, dimension) =>
    sum + (dimension.status === 'skipped' ? 0 : dimension.weight * dimension.score), 0);
  const composite = numerator === null ? null : Math.floor((2 * numerator + denominator) / (2 * denominator));
  const debtDimension = dimensions.find(dimension => dimension.key === 'debt');
  const debtRiskCapVerified = debtDimension.status === 'assessed'
    ? debtDimension.findings.every(finding => own(finding, 'risk')) : null;
  return { strictness, hasDiff: ledger.hasDiff, suppliedCappedLedger: ledger.suppliedCappedLedger === true,
    debtRiskCapVerified, dimensions, numerator, denominator, composite };
}

/** Render the sole score-bearing block; never accepts model-proposed totals. */
export function renderScoreBlock(ledger) {
  const result = calculateDashboard(ledger);
  const lines = [result.composite === null
    ? '**Composite unavailable:** required dimensions are unassessed.'
    : `**Composite Score:** ${result.composite}/100`, '',
  '| Dimension | Score | Deduction | Retained findings |',
  '|-----------|-------|-----------|-------------------|'];
  for (const dimension of result.dimensions) {
    const score = dimension.status === 'assessed' ? `${dimension.score}/100`
      : dimension.status === 'skipped' ? 'Skipped (no diff)' : 'Unassessed';
    const findings = dimension.findings.map(finding =>
      `${finding.id} (${finding.risk ?? 'risk unspecified'}, ${finding.severity})`).join('; ') ||
      (dimension.status === 'assessed' ? 'None' : '—');
    lines.push(`| ${dimension.label} | ${score} | ${dimension.deduction ?? '—'} | ${findings} |`);
  }
  lines.push('', `Preset: \`${result.strictness}\`.`);
  if (result.suppliedCappedLedger) {
    lines.push('Ledger provenance: supplied, adjudicated and capped (asserted by input).');
  }
  if (result.debtRiskCapVerified === false) {
    lines.push('Debt per-risk cap: not verified because the supplied ledger omitted risk codes.');
  }
  if (result.composite !== null) {
    const terms = result.dimensions.filter(dimension => dimension.status === 'assessed')
      .map(dimension => `${dimension.weight} × ${dimension.score}`).join(' + ');
    lines.push(`Weighted sum: \`${terms} = ${result.numerator}\`; retained weight: \`${result.denominator}\`.`,
      `Half-up rounding is applied once to \`${result.numerator}/${result.denominator}\`.`);
  } else {
    const names = result.dimensions.filter(dimension => dimension.status === 'unassessed').map(dimension => dimension.label);
    lines.push(`Missing assessments: ${names.join(', ')}. No weights were redistributed for these dimensions.`);
  }
  return `${lines.join('\n')}\n`;
}

/** Check canonical-block integrity, not arbitrary prose or the truth of findings. */
export function verifyScoreBlock(ledger, report) {
  if (typeof report !== 'string') throw new Error('report must be text');
  const normalized = report.replaceAll('\r\n', '\n');
  const block = renderScoreBlock(ledger).trimEnd();
  const first = normalized.indexOf(block);
  if (first < 0 || normalized.indexOf(block, first + block.length) >= 0) {
    throw new Error('report must contain the unchanged canonical score block exactly once');
  }
  const compositeLabels = normalized.match(/Composite\s+Score\s*(?:\*\*)?\s*:/gi) ?? [];
  const expected = calculateDashboard(ledger).composite === null ? 0 : 1;
  if (compositeLabels.length !== expected) throw new Error('report repeats or invents a Composite Score label');
  return { valid: true, scope: 'canonical score block only' };
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    // Skills may be discovered through a symlink such as .agents/skills/.
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMainModule()) {
  try {
    const [command, ledgerPath, reportPath, ...extra] = process.argv.slice(2);
    if (!['render', 'check'].includes(command) || !ledgerPath || extra.length ||
        (command === 'render' && reportPath) || (command === 'check' && !reportPath)) {
      throw new Error('Usage: node score-dashboard.mjs render LEDGER.json | check LEDGER.json REPORT.md');
    }
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
    if (command === 'render') process.stdout.write(renderScoreBlock(ledger));
    else process.stdout.write(`${JSON.stringify(verifyScoreBlock(ledger, readFileSync(reportPath, 'utf8')))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
