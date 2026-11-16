import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readScore, parseReport, countFindings } from './report-parse.mjs';
import { classify } from './eval-utils.mjs';
import { reportToSarif } from './sarif.mjs';
import { assembleSystemPrompt } from './assemble-prompt.mjs';
import { modesForRunner, assertRunnerMode } from './modes.mjs';
import { fileURLToPath } from 'node:url';
import {finalizeDashboard} from '../skills/brooks-health/scripts/score-dashboard.mjs';

const finding = (code = 'R1') => `**${code} — Mixed concerns**\nSymptom: src/a.js:3 mixes unrelated responsibilities.\nSource: Code Complete — High-Quality Routines.\nConsequence: Changes require understanding unrelated paths.\nRemedy: Separate the calculation from persistence.`;
const report = (code = 'R1') => `**Mode:** PR Review\n**Scope:** src/a.js\n**Health Score:** 95/100\n### 🟡 Warning\n${finding(code)}`;
const clean = '**Mode:** PR Review\n**Scope:** src/a.js\n**Health Score:** 100/100\nNo findings.';

test('score labels work for all report modes including bold and final sweep score', () => {
  for (const mode of ['review', 'audit', 'debt', 'test']) {
    for (const label of ['Health Score: 95/100', '**Health Score:** 95/100', '**Health Score**: 95/100']) {
      assert.equal(readScore(label, mode).score, 95, `${mode}: ${label}`);
    }
  }
  assert.equal(readScore('**Composite Score:** 92/100', 'health').score, 92);
  assert.equal(readScore('## Health Score Delta\nBefore: 70/100 → After: 95/100', 'sweep').score, 95);
});

test('full sweep finalizer output is consumed as the single final composite score', () => {
  const ledger = {hasDiff: false, dimensions: {
    pr: {status: 'skipped', reason: 'No diff supplied'},
    architecture: {status: 'assessed', findings: []},
    debt: {status: 'assessed', findings: []},
    test: {status: 'assessed', findings: []},
  }};
  const final = finalizeDashboard(ledger,
    '# Brooks-Lint — Full Sweep Report\nMode: Full Sweep\nScope: src/\n<!-- BROOKS_HEALTH_SCORE -->\nNo findings within assessed scope.');
  assert.equal(readScore(final, 'sweep').score, 100);
  assert.equal(parseReport(final).valid, true);
  assert.equal(parseReport(`${final}\nComposite Score: 95/100`).valid, false);
});

test('invalid, ambiguous and missing scores are not valid machine reports', () => {
  for (const text of ['', 'Health Score: -1/100', 'Health Score: 101/100', 'Health Score: 999', 'Health Score: 95.5/100', 'Health Score: 95/10', `${clean}\nHealth Score: 90/100`, 'Health Score: 80/100\nNo findings.']) {
    assert.equal(parseReport(`Mode: PR Review\nScope: src/a.js\n${text}`).valid, false, text);
  }
  for (const missingEnvelope of ['Health Score: 100/100', 'Health Score: 100/100\n```\nMode: PR Review\nScope: src/a.js\n```']) {
    assert.equal(parseReport(missingEnvelope).valid, false, missingEnvelope);
  }
});

test('fenced examples are not interpreted as report scores or findings', () => {
  const sample = `${clean}\n\nExample:\n\`\`\`markdown\n${report()}\n\`\`\``;
  assert.equal(readScore(sample).score, 100);
  assert.equal(parseReport(sample).valid, true);
  assert.deepEqual(countFindings(sample), { critical: 0, warning: 0, suggestion: 0 });
});

test('custom findings preserve severity and code through parser and SARIF', () => {
  for (const section of [`### Project-Specific Risks\n#### 🔴 Critical\n${finding('C1')}`, `### Project-Specific Risks\n🔴 ${finding('C1')}`]) {
    const text = `Mode: PR Review\nScope: src/a.js\nHealth Score: 85/100\n${section}`;
    const parsed = parseReport(text);
    assert.equal(parsed.valid, true, JSON.stringify(parsed.errors));
    assert.equal(parsed.findings[0].riskCode, 'C1');
    assert.deepEqual(countFindings(text), { critical: 1, warning: 0, suggestion: 0 });
    const sarif = reportToSarif(text).runs[0];
    assert.equal(sarif.results[0].ruleId, 'C1');
    assert.equal(sarif.results[0].level, 'error');
    assert.equal(sarif.tool.driver.rules[0].id, 'C1');
    assert.match(sarif.tool.driver.rules[0].helpUri, /custom-risks-guide/);
  }
});

test('missing severity and incomplete findings cannot silently become clean reports', () => {
  const envelope = 'Mode: PR Review\nScope: src/a.js\n';
  const missingSeverity = parseReport(`${envelope}Health Score: 85/100\n### Project-Specific Risks\n${finding('C1')}`);
  assert.equal(missingSeverity.valid, false);
  assert(missingSeverity.errors.some(error => error.includes('severity')));
  const inheritedSeverity = parseReport(`${envelope}Health Score: 80/100\n### Warning\n${finding()}\n### Project-Specific Risks\n${finding('C1')}`);
  assert.equal(inheritedSeverity.valid, false);
  assert(inheritedSeverity.errors.some(error => error.includes('severity')));
  const outsideGroup = parseReport(`${envelope}Health Score: 100/100\n## Findings\n${finding()}`);
  assert.equal(outsideGroup.valid, false);
  assert(outsideGroup.errors.some(error => /severity|Unparsed/.test(error)));
  const incomplete = parseReport(report().replace(/\nRemedy:.*$/, ''));
  assert.equal(incomplete.valid, false);
  assert(incomplete.errors.some(error => error.includes('remedy')));
});

test('no-risk scenarios reject unrelated findings while targeted exclusions permit them', () => {
  const global = { mode: 'review', expected_output: 'Must not flag R5', no_risk_codes: true };
  assert.equal(classify(global, report('R1')), 'fail');
  assert.equal(classify(global, clean), 'false-positive-pass');
  const targeted = { mode: 'review', expected_output: 'Must not flag R5', forbidden_risk_codes: ['R5'] };
  assert.equal(classify(targeted, report('R1')), 'false-positive-pass');
  assert.equal(classify(targeted, report('R5')), 'fail');
});

test('prose mentions are not findings and keyword soup cannot earn a pass', () => {
  assert.equal(classify({ expected_output: 'R1', mode: 'review' }, `${clean}\nR1 was considered but no symptom was found.`), 'fail');
  assert.equal(classify({ expected_output: 'R1', mode: 'review' }, 'R1 R2 R3 R4 R5 R6 T1 T2 T3 T4 T5 T6 Symptom Source Consequence Remedy Health Score: 999'), 'fail');
  assert.equal(classify({ expected_output: 'R1', mode: 'review' }, report()), 'pass');
  assert.equal(classify({ expected_output: 'R1 R2', mode: 'review' }, report()), 'partial');
});

test('every finding needs all Iron Law fields and onboarding cannot contain bold scores', () => {
  const partial = `${report()}\n**R2 — Hidden dependency**\nSymptom: src/b.js:2 depends on a global.`;
  assert.equal(classify({ expected_output: 'R1 R2', mode: 'review' }, partial), 'fail');
  const tour = { expected_output: 'A codebase tour', no_health_score: true, mode: 'audit' };
  assert.equal(classify(tour, '**Health Score:** 100/100'), 'fail');
  assert.equal(classify(tour, '## Module Map\nThe entry point dispatches to services.'), 'false-positive-pass');
  assert.equal(classify(tour, ''), 'fail');
});

test('mode registry shares review test knowledge and restricts tool-less runners', () => {
  const prompt = assembleSystemPrompt('review', fileURLToPath(new URL('../skills/', import.meta.url)));
  for (const code of ['T1', 'T4', 'T5']) assert.match(prompt, new RegExp(`## Risk ${code}:`));
  assert.deepEqual(modesForRunner('ci'), ['review']);
  assert.deepEqual(modesForRunner('eval'), ['review', 'audit', 'debt', 'test', 'health']);
  assert.throws(() => assertRunnerMode('sweep', 'ci'), /not supported/);
  assert.throws(() => assertRunnerMode('sweep', 'eval'), /not supported/);
  assert.throws(() => assertRunnerMode('toString', 'ci'), /Unknown mode/);
});

test('suppressed-only reports keep score 100 and emit no active findings or SARIF results', () => {
  for (const summary of ['Suppressed', 'Suppressed (1)']) {
    const text = `${clean}\n<details>\n<summary>${summary}</summary>\n### 🔴 Critical\n${finding('R5')}\n</details>`;
    assert.equal(parseReport(text).valid, true, text);
    assert.equal(readScore(text).score, 100);
    assert.deepEqual(countFindings(text), { critical: 0, warning: 0, suggestion: 0 });
    assert.deepEqual(reportToSarif(text).runs[0].results, []);
    assert.equal(classify({ mode: 'review', no_risk_codes: true, expected_output: 'No active findings' }, text), 'false-positive-pass');
  }
});

test('suppression boundaries exclude inner findings and require fresh active severity afterward', () => {
  const suppressed = `<details><summary>Suppressed</summary>\n### 🔴 Critical\n${finding('T5')}\n</details>`;
  const mixed = `${report()}\n${suppressed}\n### 🔴 Critical\n${finding('R2')}`;
  const parsed = parseReport(mixed);
  assert.equal(parsed.valid, true, JSON.stringify(parsed.errors));
  assert.deepEqual(parsed.findings.map(f => f.riskCode), ['R1', 'R2']);
  assert.deepEqual(countFindings(mixed), { critical: 1, warning: 1, suggestion: 0 });
  assert.deepEqual(reportToSarif(mixed).runs[0].results.map(r => r.ruleId), ['R1', 'R2']);
  const ambiguous = parseReport(`${report()}\n${suppressed}\n${finding('R2')}`);
  assert.equal(ambiguous.valid, false);
  assert(ambiguous.errors.some(error => /severity|Unparsed/.test(error)), JSON.stringify(ambiguous.errors));
});

test('malformed suppression blocks cannot silently hide subsequent active findings', () => {
  const malformedBlocks = [
    `<details><summary>Suppressed</summary>\n${finding('T5')}`,
    `<details><summary>Suppressed</summary>\n<details><summary>Extra</summary>\n${finding('T5')}\n</details>\n</details>`,
  ];
  for (const block of malformedBlocks) {
    const text = `${report()}\n${block}\n### 🔴 Critical\n${finding('R2')}`;
    const parsed = parseReport(text);
    assert.equal(parsed.valid, false, text);
    assert(parsed.errors.some(error => /Suppressed section/.test(error)), JSON.stringify(parsed.errors));
    assert(parsed.findings.some(f => f.riskCode === 'R2'), 'following active finding must remain observable');
    assert.equal(classify({ mode: 'review', no_risk_codes: true, expected_output: 'No findings' }, text), 'fail');
  }
  const unclosedFence = parseReport(`${clean}\n\`\`\`markdown\n### 🔴 Critical\n${finding('R2')}`);
  assert.equal(unclosedFence.valid, false);
  assert(unclosedFence.errors.some(error => /Unclosed code fence/.test(error)));
});

test('strict parsing rejects contradictory header and inline severity signals', () => {
  for (const text of [report().replace('🟡 Warning', '🔴 Warning'), report().replace('**R1 —', '🟢 **R1 —')]) {
    const parsed = parseReport(text);
    assert.equal(parsed.valid, false, text);
    assert(parsed.errors.some(error => /Conflicting severity/.test(error)), JSON.stringify(parsed.errors));
  }
  assert.equal(parseReport(report().replace('**R1 —', '🟡 **R1 —')).valid, true);
  assert.equal(parseReport(report().replace('### 🟡 Warning\n', '').replace('**R1 —', '🟡 **R1 —')).valid, true);
});

test('literal title severity labels preserve tiers through parser and SARIF without headings', () => {
  const tiers = [['Critical', 'error'], ['Warning', 'warning'], ['Suggestion', 'note']];
  const entries = tiers.map(([tier], index) => finding(`R${index + 1}`).replace('Mixed concerns**', `Mixed concerns (${tier})**`));
  const text = `Mode: PR Review\nScope: src/a.js\nHealth Score: 79/100\n## Findings\n${entries.join('\n')}`;
  const parsed = parseReport(text);
  assert.equal(parsed.valid, true, JSON.stringify(parsed.errors));
  assert.deepEqual(parsed.findings.map(f => f.severity), ['critical', 'warning', 'suggestion']);
  assert.deepEqual(parsed.findings.map(f => f.title), ['Mixed concerns', 'Mixed concerns', 'Mixed concerns']);
  assert.deepEqual(countFindings(text), { critical: 1, warning: 1, suggestion: 1 });
  assert.deepEqual(reportToSarif(text).runs[0].results.map(r => r.level), tiers.map(([, level]) => level));
  assert.equal(parseReport(text.replace('## Findings', '### Project-Specific Risks').replace('R1 —', 'C1 —')).valid, true);
});

test('literal severity labels must agree with markers and never leak into following findings', () => {
  for (const marker of ['### Warning\n', '🟡 ']) {
    for (const tier of ['Critical', 'Suggestion']) {
      const text = `Mode: PR Review\nScope: src/a.js\nHealth Score: 95/100\n${marker}${finding().replace('Mixed concerns**', `Mixed concerns (${tier})**`)}`;
      assert(parseReport(text).errors.some(error => /Conflicting severity/.test(error)), text);
    }
    assert.equal(parseReport(`Mode: PR Review\nScope: src/a.js\nHealth Score: 95/100\n${marker}${finding().replace('Mixed concerns**', 'Mixed concerns (Warning)**')}`).valid, true);
  }
  const explicit = finding().replace('Mixed concerns**', 'Mixed concerns (Warning)**');
  assert.equal(parseReport(`Mode: PR Review\nScope: src/a.js\nHealth Score: 90/100\n${explicit}\n${finding('R2')}`).valid, false);
  assert.equal(parseReport(`Mode: PR Review\nScope: src/a.js\nHealth Score: 95/100\n${finding().replace('Mixed concerns', 'Critical path has Warning text')}`).valid, false);
  assert.deepEqual(countFindings(`${clean}\n\`\`\`markdown\n${explicit}\n\`\`\`\n<details><summary>Suppressed</summary>\n${explicit}\n</details>`), { critical: 0, warning: 0, suggestion: 0 });
});
