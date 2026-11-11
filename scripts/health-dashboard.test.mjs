import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateDashboard, renderScoreBlock, verifyScoreBlock } from '../skills/brooks-health/scripts/score-dashboard.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const helper = path.join(root, 'skills/brooks-health/scripts/score-dashboard.mjs');
const dimensions = ['pr', 'architecture', 'debt', 'test'];
const risk = { pr: 'R1', architecture: 'R5', debt: 'R2', test: 'T1' };
const clean = (strictness = 'strict') => ({ strictness, hasDiff: true,
  dimensions: Object.fromEntries(dimensions.map(key => [key, { status: 'assessed', findings: [] }])) });
function withFindings(values, strictness = 'strict') {
  const ledger = clean(strictness);
  for (const [key, severities] of Object.entries(values)) {
    ledger.dimensions[key].findings = severities.map((severity, i) => ({ id: `${key}-${i + 1}`, risk: risk[key], severity }));
  }
  return ledger;
}
const strictExample = () => withFindings({ pr: ['warning'], architecture: ['critical', 'critical', 'critical'], debt: ['suggestion'] });
const noDiff = ledger => ({ ...ledger, hasDiff: false, dimensions: { ...ledger.dimensions, pr: { status: 'skipped', reason: 'No diff' } } });
const view = result => ({ scores: result.dimensions.map(d => d.score), numerator: result.numerator, denominator: result.denominator, composite: result.composite });
function temporary(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'brooks-health-score-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('literal strict, balanced and legacy witnesses agree with the documented deduction table', () => {
  // These are independent literal expectations, not a second implementation of the formula.
  const expected = {
    strict: { scores: [92, 40, 98, 100], numerator: 7950, denominator: 100, composite: 80 },
    balanced: { scores: [95, 55, 99, 100], numerator: 8500, denominator: 100, composite: 85 },
    'legacy-friendly': { scores: [97, 76, 99, 100], numerator: 9180, denominator: 100, composite: 92 },
  };
  const deductions = { strict: [20, 8, 2], balanced: [15, 5, 1], 'legacy-friendly': [8, 3, 1] };
  const common = readFileSync(path.join(root, 'skills/_shared/common.md'), 'utf8');
  for (const [preset, truth] of Object.entries(expected)) {
    const ledger = strictExample(); ledger.strictness = preset;
    assert.deepEqual(view(calculateDashboard(ledger)), truth, preset);
    const row = common.split('\n').find(line => line.startsWith(`| \`${preset}\``));
    assert(row, `Missing canonical preset ${preset}`);
    assert.deepEqual([...row.matchAll(/−(\d+)/g)].map(match => Number(match[1])), deductions[preset]);
    for (const [i, severity] of ['critical', 'warning', 'suggestion'].entries()) {
      assert.equal(calculateDashboard(withFindings({ pr: [severity] }, preset)).dimensions[0].deduction, deductions[preset][i]);
    }
  }
  const defaultLedger = strictExample(); delete defaultLedger.strictness;
  assert.deepEqual(view(calculateDashboard(defaultLedger)), expected.balanced);
});

test('SR-03 half-up and no-diff witnesses keep exact weights; clean is distinct from skipped', () => {
  const ledger = withFindings({ architecture: ['suggestion'], debt: ['suggestion'], test: ['critical', 'suggestion'] });
  assert.deepEqual(view(calculateDashboard(ledger)), { scores: [100, 98, 98, 78], numerator: 9450, denominator: 100, composite: 95 });
  const absent = noDiff(ledger);
  assert.deepEqual(view(calculateDashboard(absent)), { scores: [null, 98, 98, 78], numerator: 6950, denominator: 75, composite: 93 });
  assert.deepEqual(calculateDashboard(ledger).dimensions.map(d => d.weight), [25, 30, 25, 20]);
  assert.deepEqual(calculateDashboard(absent).dimensions.map(d => d.weight), [0, 30, 25, 20]);
  assert.deepEqual(view(calculateDashboard(clean())), { scores: [100, 100, 100, 100], numerator: 10000, denominator: 100, composite: 100 });
  assert.deepEqual(view(calculateDashboard(noDiff(clean()))), { scores: [null, 100, 100, 100], numerator: 7500, denominator: 75, composite: 100 });
  const guide = readFileSync(path.join(root, 'skills/brooks-health/health-guide.md'), 'utf8');
  for (const [label, weight] of [['PR (code quality)', '0.25'], ['Architecture', '0.30'], ['Debt', '0.25'], ['Test', '0.20']]) {
    assert(guide.split('\n').some(line => line.startsWith(`| ${label} | ${weight} |`)), `Guide weight drift: ${label}`);
  }
});

test('SR-04 and every required unknown dimension suppress the composite without redistributing its weight', () => {
  const ledger = noDiff(withFindings({ architecture: ['warning', 'warning'] }));
  ledger.dimensions.test = { status: 'unassessed', reason: 'Test sources unavailable' };
  assert.deepEqual(view(calculateDashboard(ledger)), { scores: [null, 84, 100, null], numerator: null, denominator: 75, composite: null });
  const block = renderScoreBlock(ledger);
  assert(!block.includes('Composite Score'));
  assert(!block.includes('Weighted sum'));
  assert(block.includes('| Test Quality | Unassessed |'));
  assert.deepEqual(verifyScoreBlock(ledger, block), { valid: true, scope: 'canonical score block only' });
  assert.throws(() => verifyScoreBlock(ledger, `${block}\n**Composite Score:** 100/100`));
  for (const key of dimensions) {
    const unknown = clean(); unknown.dimensions[key] = { status: 'unassessed', reason: 'Not inspected' };
    const result = calculateDashboard(unknown);
    assert.equal(result.composite, null); assert.equal(result.denominator, 100);
    assert.equal(result.dimensions.find(d => d.key === key).weight, { pr: 25, architecture: 30, debt: 25, test: 20 }[key]);
  }
});

test('canonical report rejects the observed stale headline, altered table/arithmetic and duplicate totals', () => {
  const ledger = strictExample(), block = renderScoreBlock(ledger);
  assert.equal((block.match(/Composite Score/g) ?? []).length, 1);
  assert(block.startsWith('**Composite Score:** 80/100\n'));
  assert(block.includes('25 × 92 + 30 × 40 + 25 × 98 + 20 × 100 = 7950'));
  assert(block.includes('`7950/100`'));
  const report = `# Dashboard\n\n${block}\n## Recommendation\nInspect the underlying architecture findings.\n`;
  assert(verifyScoreBlock(ledger, report).valid);
  assert(verifyScoreBlock(ledger, report.replaceAll('\n', '\r\n')).valid);
  for (const mutate of [
    text => text.replace('**Composite Score:** 80/100', '**Composite Score:** 77/100'),
    text => text.replace('| Architecture | 40/100 |', '| Architecture | 55/100 |'),
    text => text.replace('= 7950', '= 7900'),
    text => text.replace('`7950/100`', '`7950/75`'),
    text => text + block,
  ]) assert.throws(() => verifyScoreBlock(ledger, mutate(report)));
  for (const label of ['**Composite Score:** 77/100', '**Composite Score: 80/100**', '**Composite Score**: 80/100', 'composite score: 80/100']) {
    assert.throws(() => verifyScoreBlock(ledger, `${report}\n${label}\n`), /repeats|invents/);
  }
  assert.throws(() => verifyScoreBlock(ledger, null));
  // Scope is deliberately narrow: prose outside the block still requires semantic review.
  assert.equal(verifyScoreBlock(ledger, `${report}\nAn unrelated prose assertion is not adjudicated by this checker.`).scope, 'canonical score block only');
});

test('preserved AS-21 completed response exposes both disagreeing score labels and fails the new block contract', () => {
  const directory = path.join(root, 'docs/research/skill-revision-results/2026-11-11-terra-low');
  const archive = path.join(directory, 'raw-run.tar.gz');
  const manifest = JSON.parse(readFileSync(path.join(directory, 'archive-manifest.json')));
  assert.equal(createHash('sha256').update(readFileSync(archive)).digest('hex'), manifest['raw-run.tar.gz']);
  const record = JSON.parse(execFileSync('tar', ['-xOzf', archive, 'run/011/record.json'], { maxBuffer: 4 * 1024 * 1024 }));
  const { annotations } = JSON.parse(readFileSync(path.join(directory, 'annotations.json')));
  const annotated = annotations.find(item => item.responseId === 'b9d405c4866db92c56b6');
  assert(annotated);
  assert.equal(createHash('sha256').update(record.answer).digest('hex'), annotated.review.answerSha256);
  assert(record.answer.includes('**Composite Score:** 77/100'));
  assert(record.answer.includes('**Composite Score: 80/100**'));
  assert.throws(() => verifyScoreBlock(strictExample(), record.answer));
});

test('the actual AS-21 severity-only supplied ledger is supported without inventing risk codes', () => {
  const frozen = JSON.parse(readFileSync(path.join(root, 'evals/research/skill-revision/frozen-full.json')));
  const fixture = frozen.protocol.cases.find(value => value.id === 'AS-21');
  const supplied = JSON.parse(fixture.inputs.find(value => value.path === 'ledger.json').content);
  assert(fixture.inputs.find(value => value.path === 'contract.md').content.includes('already adjudicated and capped'));
  const ledger = { strictness: supplied.strictness, hasDiff: supplied.diff, suppliedCappedLedger: true,
    dimensions: Object.fromEntries([['pr', 'PR'], ['architecture', 'Architecture'], ['debt', 'Debt'], ['test', 'Test']]
      .map(([key, source]) => [key, { status: 'assessed', findings: supplied[source].map((severity, i) =>
        ({ id: `${key}-${i + 1}`, severity: severity.toLowerCase() })) }])) };
  const result = calculateDashboard(ledger);
  assert.deepEqual(view(result), { scores: [92, 40, 98, 100], numerator: 7950, denominator: 100, composite: 80 });
  assert.equal(result.debtRiskCapVerified, false);
  assert(result.dimensions.every(value => value.findings.every(finding => !Object.hasOwn(finding, 'risk'))));
  const block = renderScoreBlock(ledger);
  assert(block.includes('risk unspecified'));
  assert(block.includes('Debt per-risk cap: not verified'));
  assert(verifyScoreBlock(ledger, block).valid);
  const unasserted = structuredClone(ledger); delete unasserted.suppliedCappedLedger;
  assert.throws(() => calculateDashboard(unasserted), /missing risk/);
  const falselyTyped = structuredClone(ledger); falselyTyped.suppliedCappedLedger = 'true';
  assert.throws(() => calculateDashboard(falselyTyped), /boolean/);
  const excessive = structuredClone(ledger); excessive.dimensions.debt.findings = [1, 2, 3].map(i => ({ id: `D${i}`, risk: 'R2', severity: 'warning' }));
  assert.throws(() => calculateDashboard(excessive), /at most two/);
  const tooMany = structuredClone(ledger); tooMany.dimensions.architecture.findings.push({ id: 'A4', severity: 'critical' });
  assert.throws(() => calculateDashboard(tooMany), /capped at three/);
});

test('capped ledgers reject excess deductions, duplicate IDs and invalid or missing schema fields', () => {
  const invalid = [
    value => { value.extra = true; },
    value => { value.strictness = 'constructor'; },
    value => { value.strictness = null; },
    value => { value.hasDiff = 'false'; },
    value => { delete value.dimensions.test; },
    value => { value.dimensions.other = { status: 'assessed', findings: [] }; },
    value => { value.dimensions.test = null; },
    value => { value.dimensions.test = { status: 'unknown' }; },
    value => { value.dimensions.test = { status: 'unassessed', reason: ' ' }; },
    value => { value.dimensions.test = { status: 'unassessed', reason: 'Missing', findings: [] }; },
    value => { value.dimensions.test = { status: 'skipped', reason: 'Missing' }; },
    value => { value.dimensions.pr = { status: 'skipped', reason: 'No diff' }; },
    value => { value.hasDiff = false; },
    value => { value.dimensions.pr.reason = 'Unexpected'; },
    value => { delete value.dimensions.pr.findings; },
    value => { value.dimensions.pr.findings = [null]; },
    value => { delete value.dimensions.pr.findings[0].id; },
    value => { delete value.dimensions.pr.findings[0].severity; },
    value => { delete value.dimensions.pr.findings[0].risk; },
    value => { value.dimensions.pr.findings[0].severity = 'Warning'; },
    value => { value.dimensions.pr.findings[0].risk = 'R7'; },
    value => { value.dimensions.pr.findings[0].id = 'bad|table'; },
    value => { value.dimensions.pr.findings[0].deduction = 0; },
    value => { value.dimensions.pr.findings.push({ ...value.dimensions.pr.findings[0] }); },
    value => { value.dimensions.architecture.findings.push({ id: 'A4', risk: 'R5', severity: 'critical' }); },
    value => { value.dimensions.debt.findings = [1, 2, 3].map(i => ({ id: `D${i}`, risk: 'R2', severity: 'critical' })); },
  ];
  for (const mutate of invalid) {
    const ledger = strictExample(); mutate(ledger);
    assert.throws(() => calculateDashboard(ledger), mutate.toString());
  }
  for (const value of [null, [], {}, 7]) assert.throws(() => calculateDashboard(value));
  const debt = withFindings({ debt: ['critical', 'critical', 'critical'] });
  debt.dimensions.debt.findings[2].risk = 'C1';
  assert.equal(calculateDashboard(debt).dimensions[2].score, 40);
  // Three findings with maximum strict deduction 20 cannot reach the zero floor.
  // Rejecting a fourth verifies the cap; this suite does not claim a floor-trigger witness.
  const original = strictExample(), snapshot = structuredClone(original);
  const result = calculateDashboard(original);
  result.dimensions[0].findings[0].severity = 'critical';
  assert.deepEqual(original, snapshot);
});

test('CLI render/check and symlink entry points produce output; invalid commands/reports fail nonzero', t => {
  const dir = temporary(t), ledgerPath = path.join(dir, 'ledger.json'), reportPath = path.join(dir, 'report.md');
  writeFileSync(ledgerPath, JSON.stringify(strictExample()));
  const alias = path.join(dir, 'linked-score.mjs'); symlinkSync(helper, alias);
  for (const executable of [helper, alias]) {
    const run = (...args) => spawnSync(process.execPath, [executable, ...args], { cwd: dir, encoding: 'utf8' });
    const rendered = run('render', ledgerPath);
    assert.equal(rendered.status, 0, rendered.stderr);
    assert(rendered.stdout.startsWith('**Composite Score:** 80/100\n'));
    writeFileSync(reportPath, rendered.stdout);
    const checked = run('check', ledgerPath, reportPath);
    assert.equal(checked.status, 0, checked.stderr);
    assert.deepEqual(JSON.parse(checked.stdout), { valid: true, scope: 'canonical score block only' });
    writeFileSync(reportPath, rendered.stdout.replace('80/100', '77/100'));
    assert.notEqual(run('check', ledgerPath, reportPath).status, 0);
    for (const args of [[], ['invalid'], ['render'], ['render', ledgerPath, reportPath], ['check', ledgerPath], ['check', ledgerPath, reportPath, 'extra']]) {
      const invalid = run(...args); assert.notEqual(invalid.status, 0, JSON.stringify(args)); assert(invalid.stderr.includes('Usage:'));
    }
  }
  writeFileSync(ledgerPath, '{bad-json');
  assert.notEqual(spawnSync(process.execPath, [helper, 'render', ledgerPath], { encoding: 'utf8' }).status, 0);
});

test('finalization inserts one verified total and rejects competing score surfaces', async () => {
  const { finalizeDashboard, verifyDashboard, SCORE_PLACEHOLDER } = await import('../skills/brooks-health/scripts/score-dashboard.mjs');
  const ledger = strictExample();
  const draft = `# Brooks-Lint Health Dashboard\n\n${SCORE_PLACEHOLDER}\n\n## Recommendation\nInvestigate architecture findings.\n`;
  const report = finalizeDashboard(ledger, draft);
  assert.equal((report.match(/Composite Score/g) ?? []).length, 1);
  assert(report.includes('**Composite Score:** 80/100'));
  assert(verifyDashboard(ledger, report + '\nR5 findings leave the score unchanged. There are a total of 3 dependencies. The score is unavailable for an unassessed dimension.').valid);
  const receipt = verifyDashboard(ledger, report);
  assert.equal(receipt.reportSha256, createHash('sha256').update(report).digest('hex'));
  assert.equal(receipt.ledgerSha256, createHash('sha256').update(JSON.stringify(ledger)).digest('hex'));
  for (const extra of ['Overall: 78', 'The score is 80.', 'Health: 80/100', '80 out of 100', '总分：78', '**Composite unavailable:** incomplete']) {
    assert.throws(() => finalizeDashboard(ledger, draft + extra), /score-free/);
    assert.throws(() => verifyDashboard(ledger, report + extra), /score-free/);
  }
  for (const invalid of [draft.replace(SCORE_PLACEHOLDER, ''), draft + SCORE_PLACEHOLDER]) {
    assert.throws(() => finalizeDashboard(ledger, invalid), /exactly once/);
  }
  const changed = strictExample(); changed.strictness = 'balanced';
  assert.throws(() => verifyDashboard(changed, report), /canonical/);
  const unknown = strictExample(); unknown.dimensions.test = { status: 'unassessed', reason: 'Unavailable evidence' };
  const incomplete = finalizeDashboard(unknown, draft);
  assert(incomplete.includes('Composite unavailable'));
  assert(!incomplete.includes('Composite Score'));
  assert(verifyDashboard(unknown, incomplete).valid);
});

test('finalize/check-report CLI preserves inputs, refuses overwrites and binds final bytes', t => {
  const dir = temporary(t), ledgerPath = path.join(dir, 'ledger.json'), draftPath = path.join(dir, 'draft.md'), reportPath = path.join(dir, 'report.md');
  const ledgerBytes = JSON.stringify(strictExample());
  const draft = '# Dashboard\n\n<!-- BROOKS_HEALTH_SCORE -->\n';
  writeFileSync(ledgerPath, ledgerBytes); writeFileSync(draftPath, draft);
  const run = (...args) => spawnSync(process.execPath, [helper, ...args], { encoding: 'utf8' });
  const result = run('finalize', ledgerPath, draftPath, reportPath);
  assert.equal(result.status, 0, result.stderr);
  const checked = run('check-report', ledgerPath, reportPath);
  assert.equal(checked.status, 0, checked.stderr);
  assert.deepEqual(JSON.parse(result.stdout), JSON.parse(checked.stdout));
  assert.equal(readFileSync(ledgerPath, 'utf8'), ledgerBytes);
  assert.equal(readFileSync(draftPath, 'utf8'), draft);
  assert.notEqual(run('finalize', ledgerPath, draftPath, reportPath).status, 0);
  writeFileSync(reportPath, readFileSync(reportPath, 'utf8') + '\nOverall: 78\n');
  assert.notEqual(run('check-report', ledgerPath, reportPath).status, 0);
  assert.notEqual(run('finalize', ledgerPath, draftPath, ledgerPath).status, 0);
  writeFileSync(reportPath, readFileSync(reportPath, 'utf8').replace('\nOverall: 78\n', ''));
  const changed = strictExample(); changed.strictness = 'balanced';
  writeFileSync(ledgerPath, JSON.stringify(changed));
  assert.notEqual(run('check-report', ledgerPath, reportPath).status, 0);
  assert(readFileSync(reportPath, 'utf8').includes('**Composite Score:** 80/100'));
});
