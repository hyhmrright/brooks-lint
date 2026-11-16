# Benchmark evidence: what is covered and what remains unknown

This index describes evidence available through main `d248ad5` and preserved
research snapshot `17bd333`. It does not authorize further model calls or a
release. Different tasks, arms, rubrics, instruction revisions and execution
channels must not be merged into one accuracy number.

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

## All six skills: research evidence map

All research links below use the fixed research snapshot, not mutable main.
Static supplied-instruction studies do not measure native skill discovery.

| Skill | Evidence and supported interpretation |
| --- | --- |
| review | [Focused adjudication](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md): generic B 6/6, skill C 6/6 primary behavioral passes; no observed incremental pass gain |
| audit | Same focused adjudication: B 6/6, C 6/6. Earlier architecture gains in a different campaign do not override this tie or establish general superiority |
| test | Same focused adjudication: B 5/6, C 6/6, one paired advantage. BV5-23's overflow finding is supported; equivalent failure injection in BV5-24 is accepted in B. Post-run adjudication is explicit, not independent ground truth |
| debt | [All-skills campaign](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/all-skills-results/2026-11-11-terra-low-campaign/report.md): complete-supported A 11/15, B 12/15; expected issue recall 3/3 both. Five development cases repeated three times, older guidance, case-only rather than generic-checklist baseline; no current-release debt superiority established |
| health | [72-answer capability comparison](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/capability-efficacy-v2-recovery2/results/2026-11-15-complete/REPORT.md): generic B 15/18, C 10/18; excessive abstention caused C failures. The subsequent scope and duplicate-ID corrections have offline coverage, not completed behavioral efficacy evidence |
| sweep | Same 72-answer comparison: B 15/18, C 18/18; benefit limited to one authored priority-routing family. Finite repair probes and supplied contracts do not prove general autonomous repository repair |

The focused study used CLI-selected `gpt-6.1-terra / low`, one response per case
and arm, six related development families, and five primary behavioral axes.
All expected issues were found in both arms (7/7); the extra supported overflow
finding is not retroactively added to that denominator. Zero confirmed false
claims in this finite study is not a population false-positive rate.

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
