# Six-skill mechanism calibration (offline)

These 18 development-authored cases test the factual basis of proposed skill
mechanisms, not whether a model benefits from the instructions. They are small,
explicit and often leading on purpose. **They are calibration probes, not a ready
superiority benchmark or an independent holdout.** Running both model arms on
these obvious tasks may simply repeat the previous ceiling result. No live runner,
model budget or execution authorization is supplied here.

Run `node --test evals/skill-value/offline.test.mjs` (also included in `npm test`).
It executes actual fixture modules, child-process assertions, and the shipped
health finalizer. All filesystem changes occur in temporary directories. No model
or network access is required. Historical 64 structural scenarios and all model
results remain unchanged.

## Inventory and observations

`cases.mjs` contains task text, evidence, expected and forbidden observations.
Each skill has positive, protected and unknown variants. Protected means protected
against the targeted overclaim, not necessarily a defect-free program: the review
protected variant contains an inherited defect but no introduced regression.

| Family | Offline witness | Still requires semantic evaluation |
| --- | --- | --- |
| review | Same input evaluated on base/current; base absent is explicit | Correct attribution and proportionate remedy |
| audit | Literal import paths plus real execution of cycle/callback examples | Edge ownership, consequence, useful remedy; no general JS resolver is provided |
| test | Relevant mutation survives weak assertion; stronger assertion rejects it; equivalent refactor passes | Choosing relevant witnesses and avoiding false claims |
| debt | Supplied priority products, independent one-sided rate change, explicit missing factors | Validating factor evidence, repayment ordering/cost and unknown handling; arithmetic does not prove ranking usefulness |
| health | Six adjudicated findings, one duplicated cause, missing Test status; actual finalizer outputs | Source admission, causal truth, cap selection and prose evidence coverage; supplied ledgers do not test those abilities |
| sweep | Output-only test is green on mutating implementation; targeted input check distinguishes correction; notes preserved | Model repair choice, authorization, actual workspace behavior and stop reason |

The 20 checks include inventory/schema negatives and an additional runner-failure
calibration. A valid health receipt **also passes for a draft omitting finding
evidence**. That deliberate regression check exposes the helper's semantic limit;
it is not a repaired semantic grader or evidence that incomplete reports are good.
The helper correctly rejects duplicate IDs but cannot find duplicate causes under
different IDs. Those require review.

## Fair future comparison

Use the exported generic `baseline` as a starting control, not a frozen prompt.
Both arms must receive identical task evidence, tools (including the scorer),
authority and resource limits. A final execution freeze must bind the exact shared
prompt, both instruction bundles, cases, schedule, model and budget. Do not leak
`rubric` or oracle code into model input. File/module data are fixture inputs; the
expected outcomes and mutation checks are evaluator-only unless the task itself
requests that comparison. Neither Brooks labels, report format, citations nor
choosing the illustrated patch earns points by itself.

For each response, judge separately: supported diagnosis, useful completed action,
preserved behavior, uncertainty handling, and honest delivery/execution. A strict
pass requires every applicable axis, no expected miss, and no confirmed unsupported
claim. Accept equivalent witnesses/repairs; assess novel findings against the same
contracts without silently adding them to the expected-issue denominator. Do not
count a hypothesis, a predicted run or these deterministic tests as model success.

Before attempting an efficacy claim, the maintainer must choose whether the
specific workflow outcome is worth testing on less leading, realistic repository
inputs. Keep the current bounded mechanisms; do not manufacture a new vast corpus
or increase difficulty merely to produce a winner. Any new cases remain development
cases unless genuinely unseen independently prepared evidence is obtained.
