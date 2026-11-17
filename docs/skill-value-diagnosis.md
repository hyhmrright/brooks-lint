# Six-skill value diagnosis and offline improvements

Status: development analysis, not a new model result or a live execution freeze.
Based on main `a18ac8f` and preserved research snapshot `17bd333`. Historical
prompts, answers, rubrics and judgments are unchanged. No release is authorized.

## What the evidence actually decides

The evidence does **not** support general superiority over a generic checklist.
It also does not establish that every workflow is worthless. These are different
claims, and a ceiling result is not evidence of hidden superiority. Retaining a
skill requires a useful contract and a falsifiable incremental-value hypothesis;
formatting, book references and longer instructions alone are insufficient.

The [evidence index](benchmark-evidence.md) gives fixed links to plans, raw answers,
quoted judgments and corrections. The current assessment is:

| Skill | Measured evidence | Diagnosis and disposition |
| --- | --- | --- |
| review | E1 generic 6/6, skill 6/6; no recall gain | The supplied cases are solved by both. Retain as a bounded review workflow; no demonstrated diagnostic advantage. Test change attribution before claiming more. |
| audit | E1 6/6 vs 6/6 | Import/boundary diagnosis already works with the checklist. A useful graph must distinguish edge types and explain change impact; graph production itself is not a win. |
| test | E1 5/6 vs 6/6 after correction | One paired gain on BV5-23, not broad superiority. A discriminating executable witness is plausible value; preserve equivalent witnesses and avoid rewarding a preferred mutation spelling. |
| debt | E2 11/15 vs 12/15, case-only baseline | Generic-checklist superiority has never been established here. Ranking was not demonstrated. The current guide also creates unsupported priority estimates and an intent-based priority override; repair that before testing. |
| health | E3 15/18 vs 10/18 | This is adverse behavioral evidence, not just a benchmark blind spot: excessive abstention lost valid bounded assessments. Later offline scope fixes remain unproven. Arithmetic and delivery tools have deterministic value, distinct from diagnosis accuracy. |
| sweep | E3 15/18 vs 18/18; same expected-issue recall | One priority-routing family repeated three times accounts for the gain. Preserve bounded orchestration; do not market it as another independent detector or general autonomous repair. |

E1 used six cases per skill and one answer per arm/case. E2 used five debt cases
with three repetitions; E3 used related authored families and repeated answers.
The denominators and baselines differ. No pooled six-skill uplift is meaningful.

### Why the benchmark can miss value — and why that is not an excuse

- E1 has a ceiling for review and audit. Static supplied snapshots and instructions
  do not test finding the relevant caller, assembling a boundary, or selecting a
  discriminating check from a repository. Whether skills improve that work is
  unknown; simply adding larger files or obscure puzzles would not establish it.
- Debt's older baseline is case-only, not the generic checklist. Its completeness
  score does not establish repayment ordering, avoided work, or cost reduction.
- Health mixed admission, deduction and delivery behavior. Those are useful
  separate outcomes; a correct score on an incorrect or over-abstained ledger is
  not a diagnostic pass. The observed health loss remains a real failure on its
  frozen task, even if deterministic scoring is useful elsewhere.
- Sweep's supplied repair probes and authored stop scenarios cover a small slice
  of workspace repair. Existing user changes, failed checks, causal resolution
  and stable residuals are distinct outcomes; completing five named passes is not
  an effectiveness measure.
- Development-authored cases and same-workflow adjudication limit independence.
  BV5-24's accepted equivalent witness shows a grading defect that originally
  overstated the skill advantage. Keep novel supported findings eligible in both
  arms, without changing expected-issue denominators after seeing answers.

## Static diagnosis and implemented changes

These are instruction defects or gaps found by inspection, **not newly observed
model failures**. Each change is intentionally bounded; none adds risk codes or
changes the shared severity scale.

### Review: attribute the defect to the change

**Symptom:** the guide asks for expected/actual behavior but does not explicitly
compare the same witness on base and changed versions. **Source:** review guide
Step 1. **Consequence:** a real inherited bug can be presented as a regression
introduced by the PR. **Remedy:** require base/changed attribution when available;
retain a supported current defect with unknown origin when the base is absent.
A failure found in current code is not itself evidence that a PR caused it.

### Audit: diagnose a graph of the right relation

**Symptom:** imports and runtime injection are distinguished, but the guide does
not explicitly require a claimed cycle to close within its stated edge kind.
**Source:** architecture guide Step 1. **Consequence:** a callback or injected
adapter can be confused with a forbidden import cycle. **Remedy:** require a
referenced closed path of the claimed relation, separating import, call and
ownership edges. Preserve legitimate findings about runtime cycles separately.

### Test: make the witness prove the actual allegation

**Symptom:** the comparison format alone can blur production mutation, equivalent
refactoring and injected assertion failure. **Source:** test guide witness setup;
BV5-24 adjudication demonstrates why equivalence matters. **Consequence:** useful
runner evidence may be rejected for its spelling, or overclaimed as coverage of
business behavior. **Remedy:** explicitly match witness type to protection,
brittleness or failure propagation. Equivalent failure injections are accepted
for propagation only; require a contract-breaking production change for a
production coverage claim.

### Debt: prioritize evidenced work, not assumed history

**Symptom:** every finding is forced into numeric Pain × Spread; missing repayment
documentation invokes accidental-for-prioritization handling; highest category
average determines the recommendation.
**Source:** debt guide Steps 2–4 and Output. **Consequence:** missing factor evidence can
be invented, the intent-based priority rule can displace a high-burden intentional
item with a minor accidental one, and category averages can hide the most useful
next action. The former rule concerned prioritization, not proof of historical intent. **Remedy:** cite
factor evidence, retain unknowns or justified ranges, leave overlapping ranks tied,
preserve unknown intent, and recommend an individual repayment step with a burden
reduction check. Intent does not override evidenced impact. Unknown history alone
does not force abstention on supported present burden. Sweep adopts these rules.

### Health: expose what the score did and did not count

**Symptom:** up to three findings per dimension may be scored, while the template
requests at most five findings overall; candidate selection can follow discovery
order; the abbreviated R5 checklist names a fan-out threshold. **Source:** health
guide Steps 1–3 and report template. **Consequence:** some deducted findings can
lack report evidence, worse findings can be capped out, and a structural cue can
be mistaken for a violation. **Remedy:** select supported independent causes by
severity/impact before applying caps, include every retained scoring ID once,
keep excess observations explicitly unscored, and treat fan-out as a cue. A 100
means no retained deductions in the declared abbreviated scan, not absence of all
risks. This does not reverse the historical over-abstention result.

### Sweep: prove a repair, not only a green command

**Symptom:** Step 2 says every symptom hit becomes a finding, and pass-level green
commands can be mistaken for resolution of a particular defect. **Source:** sweep
guide Steps 2a and 2e, in tension with the focused review evidence gate.
**Consequence:** speculative candidates can become edits, and a patch can be
reported fixed even when the command never exercises its alleged cause.
**Remedy:** admit findings only after causal diagnosis; check each remedy against
its witness and required preserved behavior; distinguish applied, statically
predicted and execution-verified. Existing bounded-round and scoped-stop rules
remain in force.

## Incremental-value hypotheses to try to falsify

These describe where a skill could outperform a checklist, **not where it already
does**. Each requires a relevant failure and a nearby protected/unknown case, so
more warnings or more abstention cannot manufacture improvement.

| Skill | Candidate incremental value | Discriminating task and counterexample | Outcome that would refute the claim |
| --- | --- | --- | --- |
| review | Correct change attribution with a minimal regression witness | Compare a patch-introduced contract break with the same bug already present in base; omit base in a third variant | Generic checklist attributes equally well, or skill invents provenance when base is missing |
| audit | Correct ownership/change boundary from heterogeneous edges | A real import cycle versus an injected callback with similar-looking call arrows; unresolved binding variant | No improvement in correct edge/path evidence, or skill falsely condemns legal composition |
| test | Better tests that reject meaningful regressions without rejecting equivalent behavior | Escaping contract mutation versus harmless refactor; assertion-failure injection tests only the runner | More proposed tests without discriminating executions, or false brittleness/coverage claims |
| debt | Better first repayment action under real maintenance constraints | High measured intentional burden versus low accidental burden; unknown pain; independent lookalike policies | Unsupported precise ranking, intent overrides impact, or consolidation increases coupling |
| health | Correct bounded assessment and one fully evidenced score ledger | Sufficient local evidence versus a genuinely decisive missing fact; more than five capped scored entries and duplicate causes | Excessive abstention or false completeness persists, or any scored finding lacks evidence; arithmetic alone cannot pass |
| sweep | Verified minimal repair and justified bounded stopping | A green but irrelevant suite versus a targeted witness; preserved unrelated edits; local completion with broader unknowns | Claims resolution without the witness, damages unrelated work, loops, or blocks finished local work solely on broader unknowns |

## Retain, simplify or withdraw decisions

- **Review:** retain bounded change review; if attribution/witness outcomes tie,
  simplify instructions that add cost without changing decisions. Do not claim
  better bug finding from report consistency.
- **Audit:** retain a graph with inspectable edge evidence; if ownership and change
  analysis tie, avoid a mandatory elaborate graph where a small edge list serves
  the task. A diagram alone does not justify incremental efficacy.
- **Test:** retain discrimination checks; remove rigid example-shaped requirements
  that reject equivalent witnesses. Retain a stronger detection claim only if it
  survives new paired cases without false positives.
- **Debt:** retain only evidence-supported prioritization and repayment decisions;
  if these do not outperform the checklist, simplify to a decision record rather
  than presenting numeric priority as expert certainty.
- **Health:** retain the deterministic ledger/delivery tool contract; if bounded
  assessment still regresses, simplify or withdraw the offending admission
  guidance before recommending automated diagnosis. Correct arithmetic cannot
  rescue a bad ledger.
- **Sweep:** retain orchestration only while authorized repairs, preservation and
  stopping are dependable. If it adds no benefit over the same checklist/tools,
  reduce it to a thin workflow wrapper; disable automatic fixes that cannot obtain
  relevant verification rather than promise autonomous repair.

## Evaluation rules before any new model call

1. Keep the generic checklist. Give both arms identical tasks, tools, workspace
   state, authority, time/token limits and delivery requirements. A bundled scorer
   is available to both for a diagnostic comparison; otherwise the result measures
   a tool-access bundle, not instruction value. Native discovery is a separate
   question from static guidance efficacy.
2. Judge observable task outcomes and counterexamples, not use of Brooks labels,
   book citations, report length or matching an example patch. Preserve executable
   repair checks and accept equivalent witnesses in both arms. Record cost, scope
   and unsupported claims separately; do not reward more findings by default.
3. Record deterministic fixture results as fixture results. They prove the oracle,
   arithmetic or repair behavior, not that a model will produce the desired answer.
   New cases built during this repair are development cases, not independent
   holdouts. Do not pool them with historical experiments.
4. Use separate axes for correct diagnosis, useful completed action, preserved
   behavior, uncertainty handling and delivery. Keep a strict task-level pass and
   per-axis failures so one cosmetic miss cannot conceal a genuine regression.
5. Start with this bounded set of mechanisms, not an ever-expanding benchmark.
   Freeze the actual cases, rubric, paired schedule, model and budgets only after
   offline oracle review. Notify the maintainer before real model execution. This
   document grants no calls and contains no runnable live freeze.
6. If a skill ties again, keep only demonstrably useful workflow/tool contracts and
   reduce unhelpful guidance. If it regresses, repair or withdraw the offending
   behavior. Do not keep adding special cases until the development set reports
   victory; independent adoption evidence remains a separate future requirement.

The immediate deliverable is repaired instructions plus inspectable offline case
oracles. A new claim of model improvement requires another authorized paired run;
publication remains on hold regardless of local validation results.

## Offline calibration delivered

The [18 mechanism probes](../evals/skill-value/README.md) give each skill a
positive, protected and unknown variant, backed by 20 offline checks. They execute
revision comparisons, literal import/callback fixtures, test mutations, independent
policy changes, the shipped health finalizer, and isolated repair/input-preservation
checks. `npm test` includes them; `evals/evals.json` and all historical answers stay
unchanged. They validate fixture facts and tool boundaries, not model performance.

These deliberately explicit probes are **not a new efficacy benchmark ready to
run**: the generic checklist may solve every one. In particular, health receives
adjudicated ledgers here, so its source-assessment over-abstention is not retested.
The finalizer can accept a report omitting finding evidence; a regression check
makes this semantic boundary visible. The guide now requires evidence coverage,
but proving that models comply still needs separately authorized behavioral work.
No live freeze, call count or model-improvement claim follows from these passes.
