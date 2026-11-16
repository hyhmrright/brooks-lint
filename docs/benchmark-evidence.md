# Benchmark evidence: what is covered and what remains unknown

This index documents evidence retained in the 2.0.0 preparation at `12b6a5c`
and research snapshot `17bd333`. It does not claim that all historical skill
versions match the current source tree. It does not authorize further model calls or a
release. Different tasks, arms, rubrics, instruction revisions and execution
channels must not be merged into one accuracy number.

## Six skills: where to start and what changed

Choose a skill for the work you need to deliver. The intended outputs below
explain the workflow contract; they are not additional measured wins. All six
skills have comparison evidence, but not all show an incremental benefit.

| Skill | Useful deliverable | Experiment and baseline | Baseline → skill | What the change supports |
| --- | --- | --- | ---: | --- |
| [review](#review) | Contract-grounded findings with a discriminating witness | E1, generic checklist | 6/6 → 6/6 | No additional primary passes |
| [audit](#audit) | Dependency and ownership diagnosis across boundaries | E1, generic checklist | 6/6 → 6/6 | No additional primary passes |
| [test](#test-the-difference-and-the-correction) | A faulty implementation and the assertion that exposes it | E1, generic checklist | 5/6 → 6/6 | One additional primary pass, BV5-23 |
| [debt](#debt--older-case-only-baseline) | Prioritized maintenance work and a scoped repayment step | E2, older case-only baseline | 11/15 → 12/15 | One additional complete-supported answer; no recall or ranking gain established |
| [health](#health--adverse-result-remains-visible) | A dashboard tied to one ledger and explicit evidence scope | E3, generic checklist | 15/18 → 10/18 | Five fewer behavioral passes; excessive abstention; post-fix efficacy still untested |
| [sweep](#sweep--advantage-limited-to-one-family) | Authorized repairs, executed checks and a bounded stop report | E3, generic checklist | 15/18 → 18/18 | Three additional behavioral passes, all repeats in one priority-routing family |

**Read each comparison within its experiment.** E1 is the 36-answer focused
study: six cases per skill, one response per arm and case. E2 is the older
all-skills campaign: five debt cases with three repetitions per arm, scored for
complete-supported answers against a case-only baseline. E3 is the 72-answer
health/sweep capability study: 18 answers per skill and arm, clustered in four
development-authored families across the two skills. E1 and E3 count behavioral
passes under their respective frozen rubrics; E2 uses a different measure.
There is no combined six-skill accuracy or cross-experiment ranking.

All three studies selected `gpt-6.1-terra / low` through the CLI. CLI versions,
instruction revisions, grading details and frozen evidence are recorded in each
section below. Small, reused development cases and non-independent grading
limit claims about unseen projects. Current health arithmetic/delivery checks
verify product behavior, not a reversal of its adverse efficacy result.

For the diagnosis behind the next changes, see the
[six-skill value analysis](skill-value-diagnosis.md): it separates observed skill
failures from benchmark blind spots, identifies concrete instruction repairs, and
defines outcomes that could falsify each proposed advantage. Its offline fixtures
are not new model results and do not supersede the comparisons below.

For a first trial, use a small real diff, dependency boundary or test suite you
already understand. Ask for a concrete witness, inspect its governing contract,
and run the proposed check when appropriate. For health, inspect the ledger and
unknowns rather than treating a score as diagnostic truth. For sweep, give an
authorized scope and a repair budget, then inspect the actual diff and executed
checks. These are adoption suggestions, not another benchmark dataset.

## Product checks on main

| Check | Scope | Does not establish |
| --- | --- | --- |
| `npm test`, installation/health/delivery regressions | Product behavior, deterministic arithmetic, resource packaging and known report failures | Truth of model diagnoses or general autonomous repair |
| `npm run evals` | Structure and risk references of 64 scenarios | A live 64-case model pass rate |
| `npm run benchmark` | Parser/SARIF fidelity on 30 frozen reports | Correctness of the reports' substantive findings |
| `npm run evals:codex:validate` | Offline validation of seven Codex fixtures | A fresh model run or seven-skill coverage |
| Opt-in [Codex behavioral collector](codex-behavior-evals.md) | Skill-read evidence and judged answers for review/audit/test plus non-trigger controls | Debt/health/sweep efficacy, independent human truth, arbitrary hosts |

The three preserved native Codex studies are the
[initial pilot](../evals/codex/pilot-2026-11-04.md),
[severity calibration](../evals/codex/calibration-2026-11-04.md) and
[three-repetition comparison](../evals/codex/stability-2026-11-05.md).
Their judge shares the evaluated model; compare denominators, exclusions and
read traces, not just headline percentages.

## Focused comparison: review, audit and test

This is one experiment, not a composite leaderboard: 18 cases, two arms and
36 completed answers. B receives the generic checklist; C receives focused skill
guidance. The CLI selected `gpt-6.1-terra / low` with Codex CLI 0.169.0; each case
has one response per arm. Six development-authored families group the cases.

A primary behavioral pass requires diagnosis, contract scope, discriminating
witness, remedy and verification honesty all to pass, no missed expected issue
and no established false claim. Taxonomy/severity and frozen label agreement are
separate metrics. These fractions are not estimates of general accuracy.

| Skill | Generic B | Skill C | Supported conclusion |
| --- | ---: | ---: | --- |
| review | 6/6 | 6/6 | No incremental primary-pass gain in these cases |
| audit | 6/6 | 6/6 | No incremental primary-pass gain in these cases |
| test | 5/6 | 6/6 | One paired advantage after offline adjudication |

### Review

Both arms passed all six responses. This establishes that both met this rubric
on these cases, not that guidance improved diagnostic ability. Case reuse and the
ceiling leave limited room to distinguish the arms. A useful reporting workflow
can still be retained without claiming an observed accuracy gain.

### Audit

Both arms passed all six responses. Older architecture gains used a different
baseline and protocol; they do not override this tie. These small static snapshots
do not establish effectiveness across arbitrary module graphs or repositories.

### Test: the difference and the correction

**BV5-23:** the contract requires an integer for a numeric string, without a
length bound. C identified a 309-digit unsigned decimal that the supplied parser
accepts and converts to `Infinity`; the two existing tests miss that behavior.
B failed the requested mutant-comparison axis because its witness only predicts
the baseline test run. The new overflow observation was not retroactively added
to the expected-issue denominator or treated as a newly frozen miss in B.

**BV5-24:** the original reviewer failed B for changing an assertion rather than
the parser. The frozen rule accepts behaviorally equivalent witnesses; offline
reproduction showed both produce the relevant caught-success/uncaught-failure
difference. B was corrected to pass. Keeping that initial rejection would
inflate the skill advantage. The historical annotations remain unchanged beside
the corrected annotations. This post-run adjudication is not independent human
validation; it includes a targeted spot check, not a new independent review of
all 36 answers.

All frozen expected issues were found in both arms (7/7), with no confirmed
false-claim answers. Zero observed false claims is not a population false-positive
rate. The overall prespecified practical-lift criterion remains **not met**:
review and audit did not improve. Runnable examples in model answers were
predictions; later reviewer reproduction is separate evidence.

**Inspect the evidence:** [frozen plan](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/plan.json),
[original answers/records](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live),
[case inputs, rubrics and answers](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/review-packets.json),
[original judgments](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/annotations.json),
[corrected quoted judgments](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/annotations.json),
[recomputed assessment](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/assessment.json),
[adjudication and reproduction instructions](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md).
The [recovery plan](https://github.com/hyhmrright/brooks-lint/blob/17bd333/evals/research/focused-skill-recovery/freeze.json)
binds the retained failed attempt; completed collection does not erase it.

## Other skills: distinct experimental cohorts

Do not compare these rows directly with the focused study or pool their
numerators. A repeated answer is not an independent project, and a historical
instruction bundle is not certification of the current 2.0.0 source tree.

### Debt — older case-only baseline

The all-skills campaign used CLI-selected `gpt-6.1-terra / low`, CLI 0.167.0,
five debt cases repeated three times in each arm. A received the case and common
task/authority rules; B also received the selected skill guidance. This baseline
is **not** the generic checklist used in the focused and capability studies.

Complete-supported answers were A **11/15**, B **12/15**; frozen expected issue
recall was **3/3 in both**. One recurring-drift remedy explanation supplied the
small completeness gain; neither better issue recall nor better ranking was
established. The older guidance, exposed cases and same-workflow review prevent
a current-release superiority claim.

Evidence: [frozen full schedule](https://github.com/hyhmrright/brooks-lint/blob/17bd333/evals/research/all-skills/frozen-full.json),
[report](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/report.md),
[quoted annotations](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/annotations-all-skills.json),
[summary](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/all-skills-summary.json),
[original interruption and raw archive](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-10-terra-low-interrupted/README.md),
[recovery archive and provenance](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/README.md).

### Health — adverse result remains visible

The capability comparison collected 72 answers across health and sweep using
CLI-selected `gpt-6.1-terra / low`, CLI 0.169.0. B was the generic checklist and
C the static full skill bundle. Health behavioral passes were B **15/18**,
C **10/18**. C's eight failures concerned excessive abstention despite sufficient
bounded evidence. B's three failures concerned repeated deductions for one
ownership cause. Both recovered the expected issues (**9/9**), so the observed
difference was not issue recall.

Later scope and duplicate-ID corrections have offline regression coverage.
There is **no completed post-fix behavioral efficacy result** for those changes.
A successful scoring or delivery probe demonstrates that narrower behavior;
it cannot substitute for a fresh health diagnosis comparison. This is a limit
on efficacy claims, not a reason to hide the adverse result or silently run
another experiment.

### Sweep — advantage limited to one family

In the same capability cohort, B passed **15/18**, C **18/18**, with expected
issue recall **6/6 in both**. The difference came from three repeated responses
in one authored priority-routing family. Finite repair probes and supplied
contracts do not establish general autonomous repository repair. The combined
health/sweep practical-lift criterion was not met: health's losses must not be
removed from the account of this experiment.

**Health/sweep evidence:** [frozen recovery plan](https://github.com/hyhmrright/brooks-lint/blob/17bd333/evals/research/capability-efficacy-v2-recovery2/freeze.json),
[completed report](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/REPORT.md),
[merged assessment](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/assessment.json),
[new quoted judgments](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/annotations-new.json),
[new raw archive](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/raw.tar.gz),
[raw manifest](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/raw-manifest.json).
The report links the earlier 38 answers, their judgments and the failed attempt;
the new raw archive alone is not the entire campaign. Cases are clustered within
four development-authored families, with repeated responses, not 72 independent
tasks. No native skill discovery is measured by these static instruction arms.

## Supporting and adverse history remains visible

- [All-skills collector correction](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/collector-correction/README.md): sweep's reported artifact deficit came from an abandoned stream fragment; corrected completion is 15/15 in both arms. Read the correction before using the old table.
- [324-answer V5 assessment](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/skills-benchmark-v5-recovery2/results/2026-11-14-completed/REPORT.md): retained failures, sensitivity readings and task-level differences; 324 answers are not 324 independent projects.
- [48-answer health/sweep assessment](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/health-sweep-cli169-recovery2/results/2026-11-14-complete/REPORT.md): health tied 6/6; sweep 15/18 versus 18/18, solely one repeated stopping-rule scenario. Different protocol from the later 72-answer comparison.
- [Six-answer latest-receipt retest](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/latest-receipt-retest/results/2026-11-15-complete/REPORT.md): B/C each 3/3 instructed lifecycle/delivery checks. Supports executor behavior on those exercises, not health efficacy.
- [Bounded health follow-up freeze](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/bounded-health-retest/README.md): a prospective 2-call smoke and 56-call comparison, not a completed result or current authorization. No further calls are required by this release-readiness review.

Research responses use CLI-selected identity; backend identity is not independently
attested. Observed tokens are not billing totals. Failures remain in the archives;
recovery does not prove the transport root cause disappeared. Human independence,
unseen holdouts, cross-model generalization and broad host verification remain
unestablished. Retaining a workflow can be useful without claiming superiority;
release readiness and an efficacy claim have different evidence requirements.
