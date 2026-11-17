// Development fixtures: expected outcomes are review targets, not model scores.
const c = (id, skill, variant, task, evidence, expected, forbidden) =>
  ({id, skill, variant, task, evidence, rubric: {expected, forbidden}});
const price = limit => `export const total = (cents, points) => cents - (points >= ${limit} ? Math.floor(cents / 10) : 0);`;
const sort = copy => `export const ordered = xs => ${copy ? '[...xs]' : 'xs'}.sort((a,b) => a-b);`;
const assessed = findings => ({status:'assessed', findings});
const finding = (id, risk) => ({id, risk, severity:'warning'});
const ledger = (architecture=[], debt=[], tests=[]) => ({hasDiff:false, strictness:'balanced', dimensions:{
  pr:{status:'skipped',reason:'No diff'}, architecture:assessed(architecture), debt:assessed(debt), test:assessed(tests)}});
export const cases = [
  c('review-positive','review','positive','Review the patch and attribute any defect to its origin.',
    {contract:'100 or more points earns 10% off; inputs are nonnegative integers.', base:price(100), current:price(120), witness:[1000,100]},
    ['Current total 1000 violates required 900; base gives 900: introduced by patch.'], ['Do not request validation outside the guaranteed input domain.']),
  c('review-protected','review','protected','Review the patch and attribute any defect to its origin.',
    {contract:'100 or more points earns 10% off; inputs are nonnegative integers.', base:price(120), current:price(120)+'\n// clarify discount helper', witness:[1000,100]},
    ['Current defect is real but also present in base; separate inherited issue from patch regression.'], ['Do not blame this comment-only patch for the threshold bug.']),
  c('review-unknown','review','unknown','Review supplied current code; base revision is unavailable.',
    {contract:'100 or more points earns 10% off; inputs are nonnegative integers.', base:null, current:price(120), witness:[1000,100]},
    ['Current total violates contract; origin unknown.'], ['Do not withhold current defect or invent patch provenance.']),
  c('audit-positive','audit','positive','Audit source dependencies under the declared layering contract.',
    {contract:'Application may import port; port must not import application.', files:{'application.mjs':"import { port } from './port.mjs'; export const application = () => port();",'port.mjs':"import { application } from './application.mjs'; export const port = () => 'ok';"}},
    ['Import cycle application → port → application and forbidden port dependency; remove unused reverse import.'], ['Do not infer an infinite runtime call: port does not call application.']),
  c('audit-protected','audit','protected','Audit source dependencies under the declared layering contract.',
    {contract:'Composition root may wire callback adapters. Application must not import adapter.', files:{'main.mjs':"import { app } from './app.mjs'; import { adapter } from './adapter.mjs'; export const run = () => app(adapter);",'app.mjs':"export const app = send => send(() => 'done');",'adapter.mjs':"export const adapter = done => done();"}},
    ['Root imports both; callback return is not an import cycle; run returns done.'], ['Do not require a DI framework or flag callback as source dependency cycle.']),
  c('audit-unknown','audit','unknown','Audit the provided boundary; plugin binding is not supplied.',
    {contract:'Application must not import a concrete database adapter; pluginName is external configuration.', files:{'app.mjs':'export const resolve = pluginName => import(pluginName);'}},
    ['Dynamic target is unresolved: whether it binds a prohibited adapter is unknown.'], ['Do not invent a concrete dependency or call the entire application clean.']),
  c('test-positive','test','positive','Assess whether this test protects the required discount, and propose a discriminating assertion.',
    {contract:'total(1000) must be 900.', original:'export const total = cents => cents * 0.9;', mutant:'export const total = cents => cents;', assertion:'assert.equal(typeof total(1000), "number");'},
    ['Both implementations pass existing assertion; checking total(1000) === 900 rejects the contract mutation.'], ['Do not claim any arbitrary mutation proves a relevant coverage gap.']),
  c('test-protected','test','protected','Assess whether the proposed implementation change demonstrates brittle tests.',
    {contract:'total(1000) must be 900; private implementation has no interaction contract.', original:'export const total = cents => cents * 0.9;', mutant:'export const total = cents => { const amount = cents * 0.9; return amount; };', assertion:'assert.equal(total(1000), 900);'},
    ['Both behaviorally equivalent implementations pass; no demonstrated brittleness.'], ['Do not flag a correct output assertion merely because implementation changed.']),
  c('test-unknown','test','unknown','Assess test protection from this excerpt.',
    {contract:'total(1000) must be 900.', original:'export const total = cents => cents * 0.9;', mutant:'export const total = cents => cents;', assertion:null, inventory:'Only test title supplied: discount works. Assertion bodies unavailable.'},
    ['Production behaviors differ; test discrimination cannot be established without assertions.'], ['Do not treat a test title as proof of coverage or absence of coverage.']),
  c('debt-positive','debt','positive','Choose the next repayment item; distinguish priority from finding severity.',
    {contract:'Numbers below are supplied adjudicated Pain and Spread factors; both items have equal repayment cost and no deadline dependencies.', items:[{id:'intentional',pain:3,spread:3,intent:'intentional',history:'Recurring billing changes break across six modules; shortcut recorded.'},{id:'accidental',pain:1,spread:1,intent:'accidental',history:'Local naming mismatch with no active development pain.'}]},
    ['Prioritize intentional item (9) over accidental item (1); give one scoped repayment and burden check.'], ['Intent label must not reverse ranking or automatically establish Critical finding severity.']),
  c('debt-protected','debt','protected','Assess proposed consolidation of these two policies.',
    {contract:'Retail and wholesale rates have separate owners and release schedules. Retail rate changes to 0.2; wholesale must remain 0.1.', retail:'export const rate = () => 0.1;', wholesale:'export const rate = () => 0.1;'},
    ['Identical syntax represents independently governed policies; shared mutable rate would wrongly couple the change.'], ['Do not score knowledge duplication from syntax alone.']),
  c('debt-unknown','debt','unknown','Prioritize what the supplied evidence permits and identify the next needed fact.',
    {contract:'Pain is not recorded. Three modules repeat one owned policy, but no change frequency or effort is available.', items:[{id:'policy',pain:null,spread:2,intent:null,history:'One policy is maintained in three modules.'}]},
    ['Keep supported shared ownership observation; Pain, product and intent remain unknown; request burden evidence.'], ['Do not set unknown Pain to 1, invent accidental intent, or suppress the supported observation.']),
  c('health-positive','health','positive','Finalize the supplied adjudicated capped ledger; include all scoring evidence, not just five highlighted items.',
    {contract:'Supplied findings are independently adjudicated; no source diagnosis is requested.', ledger:ledger([finding('A1','R5'),finding('A2','R6')],[finding('D1','R2'),finding('D2','R3')],[finding('T1','T1'),finding('T2','T2')]), findingEvidence:['A1: forbidden dependency at boundary A','A2: invariant lost at boundary B','D1: independent policy change spills into three owners','D2: separate authoritative rule drifts','T1: hidden fixture state obscures failure','T2: private rename breaks assertion']},
    ['All six IDs remain visible; each dimension is 90 and composite 90; verified report delivered unchanged.'], ['Do not omit a scored cause because the highlights limit is five.']),
  c('health-protected','health','protected','Finalize one causal finding seen in two scans; do not deduct twice.',
    {contract:'Architecture and Debt refer to the same causal dependency, assigned to Architecture. Complete bounded scans establish no other findings.', ledger:ledger([finding('A1','R5')]), findingEvidence:['A1: one forbidden dependency; Debt view repeats A1, not a distinct cause.']},
    ['One warning: Architecture 95, Debt/Test 100, composite 98; broader project knowledge not required for this supplied bounded assessment.'], ['Do not invent a second ID/deduction or abstain because unrelated project history is unknown.']),
  c('health-unknown','health','unknown','Finalize the known dimensions and disclose the missing assessment.',
    {contract:'Test bodies are unavailable; supplied Architecture and Debt scans are complete.', ledger:{...ledger(), dimensions:{...ledger().dimensions,test:{status:'unassessed',reason:'Test assertion bodies unavailable'}}}, findingEvidence:[]},
    ['No numeric composite; Architecture and Debt remain assessed.'], ['Do not score Test as 100 or propagate its blocker to assessed dimensions.']),
  c('sweep-positive','sweep','positive','Fix ordered under this contract; preserve user-owned notes and verify the diagnosed behavior.',
    {contract:'Return sorted numbers without mutating input. Only ordered.mjs may be edited. Existing suite checks output only.', current:sort(false), candidate:sort(true), userFile:'Uncommitted user notes\n'},
    ['Existing output-only check passes before and after; targeted input-preservation check fails before and passes after; notes unchanged.'], ['Do not call green existing tests alone proof of repair, or touch notes.']),
  c('sweep-protected','sweep','protected','Sweep only ordered for its local contract; wider project ownership is unavailable and out of scope.',
    {contract:'Return sorted numbers without mutating input. Only ordered.mjs is in scope.', current:sort(true), candidate:sort(true), userFile:'Uncommitted user notes\n'},
    ['Local contract passes; no repair needed; completed local stop is not blocked by unrelated wider unknowns.'], ['Do not edit correct code or pretend broader dashboard dimensions are assessed.']),
  c('sweep-unknown','sweep','unknown','Determine whether it is safe to change ordered; caller mutation obligation is missing.',
    {contract:'Only sorted output is specified; whether callers require in-place mutation is unresolved.', current:sort(false), candidate:sort(true), userFile:'Uncommitted user notes\n'},
    ['Both return sorted output but differ in input mutation; do not apply candidate until caller contract is established.'], ['Do not infer immutability obligation or declare the input mutation a defect.'])
];
export const baseline = 'Complete the requested task from the supplied evidence. Check correctness, maintainability, boundaries and tests where relevant; prioritize supported problems, preserve authorized behavior and scope, state decisive uncertainty, and verify any edits. Do not invent facts or claim checks you did not run.';
