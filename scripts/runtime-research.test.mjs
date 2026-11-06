import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createPlan, validatePlan, schedule, expectedCatalog, researchTrace, reviewPackets, summarize, validateJudgment, contentDigest, ROOT } from './runtime-research.mjs';
import { executePlan } from './run-runtime-research.mjs';
import { digest } from './codex-eval.mjs';

function temporary(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'brooks-runtime-tests-'));
  t.after(() => rmSync(dir, { recursive: true, force: true })); return dir;
}
function fake(t, mode = 'success') {
  const dir = temporary(t), executable = path.join(dir, 'fake-codex.mjs');
  const capture = path.join(dir, 'capture.jsonl'), auth = path.join(dir, 'auth.json');
  writeFileSync(auth, '{"fixture":"not-a-credential"}');
  writeFileSync(executable, `#!${process.execPath}
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
if(args.includes('--version')) { console.log('fake-codex offline'); process.exit(0); }
const names = existsSync('.agents/skills') ? readdirSync('.agents/skills').filter(n=>n!=='_shared').sort() : [];
const files = [];
function walk(dir, prefix='') { for(const n of readdirSync(dir,{withFileTypes:true})) { if(n.name==='.git') continue; const p=path.join(dir,n.name); if(n.isDirectory()) walk(p,prefix+n.name+'/'); else files.push(prefix+n.name); } }
walk(process.cwd());
const capture = ${JSON.stringify(capture)};
appendFileSync(capture, JSON.stringify({args,names,files,home:process.env.HOME,codexHome:process.env.CODEX_HOME,keys:Object.keys(process.env)})+'\\n');
if(args.includes('debug')) {
 const catalog = ${JSON.stringify(mode)}==='mismatch' && names.length===6 ? ['unexpected-skill'] : names;
 console.log(JSON.stringify([{role:'developer',content:[{text:'<skills_instructions>\\n### Available skills\\n'+catalog.map(n=>'- '+n+': fixture (file: /fixture/'+n+'/SKILL.md)').join('\\n')+'\\n</skills_instructions>'}]}]));
} else {
 let input=''; for await(const chunk of process.stdin) input+=chunk;
 appendFileSync(capture,JSON.stringify({input})+'\\n');
 writeFileSync(args[args.indexOf('--output-last-message')+1],'Fixture answer.');
 if(${JSON.stringify(mode)}==='execution-failure' && names.length===6) { console.error('fixture execution failed'); process.exit(2); }
 if(names.includes('runtime-research')) console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',exit_code:0,command:'cat .agents/skills/runtime-research/SKILL.md',aggregated_output:readFileSync('.agents/skills/runtime-research/SKILL.md','utf8')}}));
 console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}));
}
`);
  chmodSync(executable, 0o700); return { dir, executable, capture, auth };
}
function judgment(packet, overrides = {}) {
  return { packet_id: packet.packet_id, answer_sha256: packet.answer_sha256,
    reviewer: 'offline-test', method: 'human', completed: true, assessment: 'unresolved',
    assessment_quote: 'Fixture answer.', findings: [], missing_expected_ids: packet.rubric.expectedFindings.map(f => f.id),
    unsupported_certainty: false, unsolicited_audit: false, rationale: 'Synthetic validator test, not a real review.', ...overrides };
}

test('default validation and plan mode never require Codex or credentials', t => {
  const dir = temporary(t);
  const runner = path.join(ROOT, 'scripts/run-runtime-research.mjs');
  for (const args of [[], ['--plan', '--model', 'offline-fixture', '--runs', '1', '--out', path.join(dir, 'plan')]]) {
    const run = spawnSync(process.execPath, [runner, ...args, '--codex', '/nonexistent/codex', '--auth-file', path.join(dir, 'missing')], { encoding: 'utf8', timeout: 15000 });
    assert.equal(run.status, 0, run.stderr); assert.match(run.stdout, /offline/);
  }
  const plan = JSON.parse(readFileSync(path.join(dir, 'plan/plan.json'), 'utf8'));
  assert.equal(schedule(plan).length, 30);
  assert.equal(plan.study.cases.length, 10);
});

test('plans freeze exact artifacts, reject edits and invalid settings, and rotate three arms', () => {
  const plan = createPlan({ model: 'fixture-model', runs: 3 });
  assert.equal(schedule(plan).length, 90);
  assert.deepEqual(schedule(plan).slice(0, 3).map(r => r.arm), ['A', 'B', 'C']);
  assert.deepEqual(schedule(plan).filter(r => r.case_id === 'RT-01' && r.repetition === 2).map(r => r.arm), ['B', 'C', 'A']);
  assert.equal(expectedCatalog('A').length, 0); assert.equal(expectedCatalog('B').length, 6); assert.equal(expectedCatalog('C').length, 7);
  const tampered = structuredClone(plan); tampered.study.cases[0].inputs[0].content += 'changed';
  assert.throws(() => validatePlan(tampered), /digest/);
  tampered.study_sha256 = contentDigest(tampered.study);
  assert.throws(() => validatePlan(tampered), /Source artifacts/);
  for (const options of [{ runs: 0 }, { runs: 101 }, { timeout: 0 }, { reasoning: 'invalid' }, { caseId: 'RT-99' }]) assert.throws(() => createPlan({ model: 'fixture', ...options }));
  assert.throws(() => createPlan());
});

test('fake CLI exercises A/B/C isolation, same tasks, private cleanup and blind packets', async t => {
  const f = fake(t), plan = createPlan({ model: 'fixture-model', runs: 1, caseId: 'RT-07', timeout: 15 });
  const result = await executePlan({ plan, out: path.join(f.dir, 'run'), codex: f.executable, auth: f.auth });
  assert.deepEqual(result.records.map(r => r.status), ['executed', 'executed', 'executed']);
  const captures = readFileSync(f.capture, 'utf8').trim().split('\n').map(JSON.parse);
  const execs = captures.filter(c => c.args?.includes('exec'));
  assert.deepEqual(execs.map(c => c.names.length), [0, 6, 7]);
  assert.equal(new Set(execs.map(c => c.home)).size, 3);
  for (const c of execs) {
    assert.equal(existsSync(c.home), false); assert.equal(existsSync(c.codexHome), false);
    assert(c.args.includes('--ignore-user-config') && c.args.includes('--ignore-rules') && c.args.includes('--ephemeral') && c.args.includes('read-only'));
    assert(c.args.includes('web_search="disabled"') && c.args.includes('project_doc_max_bytes=0'));
    assert(!c.keys.includes('ANTHROPIC_API_KEY') && !c.keys.includes('OPENAI_API_KEY'));
    const inputs = c.files.filter(p => !p.startsWith('.agents/'));
    assert.deepEqual(inputs.sort(), plan.study.cases[0].inputs.map(f => f.path).sort());
    assert(!c.files.some(p => /rubric|cases.json|runtime.test|auth.json|README/.test(p)));
  }
  assert.deepEqual(captures.filter(c => c.input).map(c => c.input), Array(3).fill(plan.study.cases[0].prompt));
  assert.equal(result.records[2].trace.prototype_reads.length, 1);
  assert(!JSON.stringify(result).includes('not-a-credential'));
  const packets = reviewPackets(plan, result.records);
  assert.equal(packets.length, 3);
  assert(packets.every(p => !('arm' in p) && !('trace' in p)));
  const summary = summarize(plan, result.records, packets.map(p => judgment(p)));
  assert.equal(summary.complete_triplets, 1); assert.equal(summary.arm_metrics.C.correct_unresolved, 1);
  assert.equal(summary.arm_metrics.A.recall, null);
  const resultsPath = path.join(f.dir, 'run/results.json');
  const rawBefore = readFileSync(resultsPath, 'utf8');
  const judgmentsPath = path.join(f.dir, 'judgments.json');
  writeFileSync(judgmentsPath, JSON.stringify(packets.map(p => judgment(p))));
  const imported = spawnSync(process.execPath, [path.join(ROOT, 'scripts/run-runtime-research.mjs'), '--summarize',
    '--results', resultsPath, '--judgments', judgmentsPath, '--out', path.join(f.dir, 'review'),
    '--codex', '/nonexistent/codex'], { encoding: 'utf8', timeout: 15000 });
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(JSON.parse(readFileSync(path.join(f.dir, 'review/summary.json'), 'utf8')).complete_triplets, 1);
  assert.equal(readFileSync(resultsPath, 'utf8'), rawBefore, 'Judgment import preserves raw execution');
  assert(existsSync(path.join(f.dir, 'review/source-digests.json')));
  await assert.rejects(executePlan({ plan, out: path.join(f.dir, 'run'), codex: f.executable, auth: f.auth }), /EEXIST/);
});

for (const mode of ['mismatch', 'execution-failure']) test(`${mode}: preserve failure evidence and exclude incomplete triplet`, async t => {
  const f = fake(t, mode), plan = createPlan({ model: 'fixture', runs: 1, caseId: 'RT-07', timeout: 15 });
  const out = path.join(f.dir, 'run');
  const result = await executePlan({ plan, out, codex: f.executable, auth: f.auth });
  assert.deepEqual(result.records.map(r => r.status), ['executed', 'failed', 'executed']);
  assert(existsSync(path.join(out, 'RT-07-1-B/prompt-input.json')));
  if (mode === 'execution-failure') {
    assert.match(readFileSync(path.join(out, 'RT-07-1-B/stderr.txt'), 'utf8'), /fixture execution failed/);
    assert.equal(result.records[1].answer, 'Fixture answer.');
  }
  const packets = reviewPackets(plan, result.records);
  assert.equal(packets.length, 2);
  const summary = summarize(plan, result.records, packets.map(p => judgment(p)));
  assert.equal(summary.complete_triplets, 0); assert.equal(summary.excluded_triplets.length, 1);
  assert.equal(summary.arm_metrics.C.samples, 0); assert.equal(summary.individual_arm_metrics.C.samples, 1);
  assert.equal(summary.execution_costs.length, 3);
});

test('offline judgments validate quotes, completeness, severity, and only new C-over-B issues count', () => {
  const plan = createPlan({ model: 'fixture', runs: 1, caseId: 'RT-01' });
  const records = schedule(plan).map(k => ({ ...k, status: 'executed', answer: 'Fixture answer.' }));
  const packets = reviewPackets(plan, records), expected = plan.study.cases[0].rubric.expectedFindings[0].id;
  const found = { quote: 'Fixture answer.', expected_id: expected, support: 'supported', severity: 'Warning', severity_ok: true, evidence_complete: true, reason: 'Synthetic test.' };
  const cId = digest(`${plan.study_sha256}/RT-01/1/C`).slice(0, 24);
  const judgments = packets.map(p => judgment(p, p.packet_id === cId ? { assessment: 'defect', findings: [found], missing_expected_ids: [] } : {}));
  assert.equal(summarize(plan, records, judgments).added_expected_issues_C_over_B, 1);
  const allFound = packets.map(p => judgment(p, { assessment: 'defect', findings: [found], missing_expected_ids: [] }));
  assert.equal(summarize(plan, records, allFound).added_expected_issues_C_over_B, 0);
  for (const change of [{ answer_sha256: 'wrong' }, { assessment_quote: 'not in answer' }, { missing_expected_ids: [] }, { findings: [{ ...found, severity_ok: false }] }, { findings: [{ ...found, expected_id: 'invented' }] }]) assert.throws(() => validateJudgment(judgment(packets[0], change), packets[0]));
  assert.throws(() => summarize(plan, records, [judgments[0], judgments[0]]), /Duplicate/);
  assert.throws(() => summarize(plan, [...records, records[0]], []), /Duplicate/);
  const unknown = [{ case_id: 'RT-99', repetition: 1, arm: 'A', status: 'failed' }];
  assert.throws(() => summarize(plan, unknown, []), /Unknown/);
});

test('trace read proxy excludes echo/search claims and failed commands', () => {
  const body = '---\nname: runtime-research\n---\n## Setup\nRead guide.';
  const event = (command, exit_code = 0) => JSON.stringify({ type: 'item.completed', item: { type: 'command_execution', exit_code, command, aggregated_output: body } });
  assert.equal(researchTrace(event('cat .agents/skills/runtime-research/SKILL.md')).prototype_reads.length, 1);
  for (const line of [event('echo runtime-research SKILL.md'), event('rg runtime-research SKILL.md'), event('cat runtime-research/SKILL.md', 1)]) assert.equal(researchTrace(line).prototype_reads.length, 0);
});

test('pre-aborted execution records interruption without starting fake CLI', async t => {
  const f = fake(t), controller = new AbortController(); controller.abort();
  const result = await executePlan({ plan: createPlan({ model: 'fixture', runs: 1, caseId: 'RT-07' }), out: path.join(f.dir, 'run'), codex: f.executable, auth: f.auth, signal: controller.signal });
  assert.equal(result.interrupted, true); assert.equal(result.records.length, 0);
  assert.equal(existsSync(f.capture), false); assert(result.run_error);
});
