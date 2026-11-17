import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {cases, baseline} from './cases.mjs';
import {calculateDashboard, finalizeDashboard, verifyDashboard, SCORE_PLACEHOLDER} from '../../skills/brooks-health/scripts/score-dashboard.mjs';
const skills = ['review','audit','test','debt','health','sweep'];
const variants = ['positive','protected','unknown'];
function validate(rows) {
  assert.equal(rows.length, 18);
  assert.equal(new Set(rows.map(c=>c.id)).size, 18);
  for (const skill of skills) for (const variant of variants) {
    const matches = rows.filter(c=>c.skill===skill && c.variant===variant);
    assert.equal(matches.length,1, `${skill}/${variant}`);
    const c = matches[0];
    assert.equal(c.id, `${skill}-${variant}`);
    assert.equal(typeof c.task,'string'); assert(c.task.length > 20);
    assert.equal(typeof c.evidence.contract,'string'); assert(c.evidence.contract.length > 20);
    assert(Object.keys(c.evidence).length > 1);
    const e = c.evidence;
    if (skill==='review') { assert.equal(typeof e.current,'string'); assert(Array.isArray(e.witness)); assert(variant==='unknown' ? e.base===null : typeof e.base==='string'); }
    if (skill==='audit') { assert(e.files && Object.keys(e.files).length); assert(Object.values(e.files).every(x=>typeof x==='string' && x.length)); }
    if (skill==='test') { assert.equal(typeof e.original,'string'); assert.equal(typeof e.mutant,'string'); assert(variant==='unknown' ? e.assertion===null : typeof e.assertion==='string'); }
    if (skill==='debt') { if(variant==='protected') { assert.equal(typeof e.retail,'string'); assert.equal(typeof e.wholesale,'string'); } else { assert(Array.isArray(e.items) && e.items.length); for(const item of e.items) for(const field of ['pain','spread']) assert(item[field]===null || (Number.isInteger(item[field]) && item[field]>=1 && item[field]<=3)); } }
    if (skill==='health') { calculateDashboard(e.ledger); assert(Array.isArray(e.findingEvidence)); }
    if (skill==='sweep') for(const field of ['current','candidate','userFile']) assert.equal(typeof e[field],'string');
    for (const field of ['expected','forbidden']) {
      assert(Array.isArray(c.rubric[field]) && c.rubric[field].length);
      assert(c.rubric[field].every(x=>typeof x==='string' && x.length>15));
    }
  }
}
const by = id => cases.find(c=>c.id===id);
const load = source => import(`data:text/javascript,${encodeURIComponent(source)}`);
function temporary(t) {
  const path = mkdtempSync(join(tmpdir(),'brooks-value-'));
  t.after(()=>rmSync(path,{recursive:true,force:true})); return path;
}
function runAssertion(t, source, assertion) {
  const dir = temporary(t);
  writeFileSync(join(dir,'subject.mjs'),source);
  writeFileSync(join(dir,'check.mjs'),`import assert from 'node:assert/strict'; import {total} from './subject.mjs'; ${assertion}`);
  const result = spawnSync(process.execPath,['check.mjs'],{cwd:dir,encoding:'utf8',timeout:3000});
  assert.ifError(result.error); assert.equal(result.signal,null); return result;
}

test('inventory contains all six task mechanisms and paired protected/unknown controls',()=> {
  validate(cases); assert(baseline.includes('supplied evidence'));
  assert.throws(()=>validate(cases.slice(1)));
  const malformed = structuredClone(cases); malformed[0].evidence.contract = '';
  assert.throws(()=>validate(malformed));
  const missingVariant = structuredClone(cases); missingVariant[2].variant='positive';
  assert.throws(()=>validate(missingVariant));
  const emptyRubric = structuredClone(cases); emptyRubric[3].rubric.forbidden=[];
  assert.throws(()=>validate(emptyRubric));
  const badLedger = structuredClone(cases); delete badLedger.find(c=>c.id==='health-positive').evidence.ledger;
  assert.throws(()=>validate(badLedger));
});

for (const variant of variants) test(`review/${variant}: execute the same input on available revisions`,async()=> {
  const {evidence:e} = by(`review-${variant}`);
  assert.equal((await load(e.current)).total(...e.witness),1000);
  if (variant==='positive') assert.equal((await load(e.base)).total(...e.witness),900);
  if (variant==='protected') assert.equal((await load(e.base)).total(...e.witness),1000);
  if (variant==='unknown') assert.equal(e.base,null); // No manufactured base outcome.
});

// This extractor is deliberately only for these literal fixture imports, not a JS resolver.
const imports = files => Object.entries(files).flatMap(([from,source])=>
  [...source.matchAll(/from '\.\/(.*?)'/g)].map(m=>[from,m[1]]));
test('audit/positive: evidenced closed import path does not imply a runtime recursion',async t=> {
  const {files} = by('audit-positive').evidence;
  assert.deepEqual(imports(files),[['application.mjs','port.mjs'],['port.mjs','application.mjs']]);
  const dir=temporary(t); for(const [file,source] of Object.entries(files))writeFileSync(join(dir,file),source);
  assert.equal((await import(`file://${join(dir,'application.mjs')}`)).application(),'ok');
});
test('audit/protected: injected callback executes without a reverse import edge',async t=> {
  const {files} = by('audit-protected').evidence;
  assert.deepEqual(imports(files),[['main.mjs','app.mjs'],['main.mjs','adapter.mjs']]);
  const dir=temporary(t); for(const [file,source] of Object.entries(files))writeFileSync(join(dir,file),source);
  assert.equal((await import(`file://${join(dir,'main.mjs')}`)).run(),'done');
});
test('audit/unknown: fixture supplies a dynamic target, not a resolved adapter',()=> {
  const {files}=by('audit-unknown').evidence;
  assert.deepEqual(imports(files),[]);
  assert(files['app.mjs'].includes('import(pluginName)'));
});

test('test/positive: existing weak test survives relevant mutant; stronger assertion rejects it',t=> {
  const e=by('test-positive').evidence;
  assert.equal(runAssertion(t,e.original,e.assertion).status,0);
  assert.equal(runAssertion(t,e.mutant,e.assertion).status,0);
  assert.equal(runAssertion(t,e.original,'assert.equal(total(1000),900);').status,0);
  const failure=runAssertion(t,e.mutant,'assert.equal(total(1000),900);');
  assert.equal(failure.status,1); assert.match(failure.stderr,/AssertionError/);
});
test('test/protected: equivalent implementations satisfy the same meaningful assertion',t=> {
  const e=by('test-protected').evidence;
  assert.equal(runAssertion(t,e.original,e.assertion).status,0);
  assert.equal(runAssertion(t,e.mutant,e.assertion).status,0);
});
test('test/unknown: source outcomes differ, but no test body is supplied',async()=> {
  const e=by('test-unknown').evidence;
  assert.equal((await load(e.original)).total(1000),900);
  assert.equal((await load(e.mutant)).total(1000),1000); assert.equal(e.assertion,null);
});
test('runner witnesses: equivalent assertion injections fail; swallowed assertion falsely succeeds',t=> {
  const source=by('test-positive').evidence.original;
  for(const assertion of ['assert.equal(total(1000),901);','assert.fail("injected failure");']) {
    assert.equal(runAssertion(t,source,assertion).status,1);
    assert.equal(runAssertion(t,source,`try { ${assertion} } catch {}`).status,0);
  }
});

test('debt/positive: supplied factors yield 9 versus 1 independent of intent labels',()=> {
  const [high,low]=by('debt-positive').evidence.items;
  assert.equal(high.pain*high.spread,9); assert.equal(low.pain*low.spread,1);
  assert.equal(high.intent,'intentional'); assert.equal(low.intent,'accidental');
});
test('debt/protected: one-sided independent policy change preserves wholesale behavior',async()=> {
  const e=by('debt-protected').evidence;
  assert.equal((await load(e.retail)).rate(),0.1); assert.equal((await load(e.wholesale)).rate(),0.1);
  assert.equal((await load(e.retail.replace('0.1','0.2'))).rate(),0.2);
  assert.equal((await load(e.wholesale)).rate(),0.1);
});
test('debt/unknown: missing factors are explicit, not a synthetic zero/one or known intent',()=> {
  const [item]=by('debt-unknown').evidence.items;
  assert.equal(item.pain,null); assert.equal(item.intent,null); assert.equal(item.spread,2);
});

for(const [variant, expected] of [['positive',90],['protected',98],['unknown',null]])
  test(`health/${variant}: shipped helper finalizes the supplied ledger and exact delivery`,()=> {
    const e=by(`health-${variant}`).evidence;
    const draft=`# Bounded assessment\n${SCORE_PLACEHOLDER}\n${e.findingEvidence.join('\n')}\n`;
    const report=finalizeDashboard(e.ledger,draft);
    assert.equal(calculateDashboard(e.ledger).composite,expected);
    assert.equal(verifyDashboard(e.ledger,report).valid,true);
    for(const line of e.findingEvidence)assert(report.includes(line));
    if(variant==='positive') {
      assert.equal(e.findingEvidence.length,6);
      // Expose the tool boundary: a valid receipt does not verify evidence coverage.
      const incomplete=finalizeDashboard(e.ledger,`${SCORE_PLACEHOLDER}\nOnly five highlighted causes are shown.`);
      assert.equal(verifyDashboard(e.ledger,incomplete).valid,true);
    }
    if(variant==='protected') {
      const duplicate=structuredClone(e.ledger);
      duplicate.dimensions.debt.findings=[structuredClone(duplicate.dimensions.architecture.findings[0])];
      assert.throws(()=>calculateDashboard(duplicate),/duplicate|unique/i);
    }
  });

for(const variant of variants)test(`sweep/${variant}: exercise output and input effect in an isolated workspace`,async t=> {
  const e=by(`sweep-${variant}`).evidence; const dir=temporary(t);
  writeFileSync(join(dir,'notes.txt'),e.userFile); writeFileSync(join(dir,'ordered.mjs'),e.current);
  const original=await load(readFileSync(join(dir,'ordered.mjs'),'utf8'));
  const input=[3,1,2]; assert.deepEqual(original.ordered(input),[1,2,3]);
  assert.deepEqual(input,variant==='protected'?[3,1,2]:[1,2,3]);
  // Only the positive fixture authorizes this behavior correction.
  if(variant==='positive') {
    writeFileSync(join(dir,'ordered.mjs'),e.candidate);
    const fixed=await load(readFileSync(join(dir,'ordered.mjs'),'utf8')); const next=[3,1,2];
    assert.deepEqual(fixed.ordered(next),[1,2,3]); assert.deepEqual(next,[3,1,2]);
  } else assert.equal(readFileSync(join(dir,'ordered.mjs'),'utf8'),e.current);
  assert.equal(readFileSync(join(dir,'notes.txt'),'utf8'),e.userFile);
});
