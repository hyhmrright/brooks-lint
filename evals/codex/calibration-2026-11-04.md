# Codex behavioral comparison

Model: gpt-6-astra; reasoning: high; CLI: codex-cli 0.166.0.
Repetitions: 1; valid paired samples: 7/7.

| Metric | With skills | Without skills |
|---|---:|---:|
| Task completion | 100.0% | 100.0% |
| Required-issue recall | 100.0% | 100.0% |
| False positives / findings (lower is better) | 0.0% | 0.0% |
| Severity calibration among labeled findings | 100.0% | 75.0% |
| Observed expected-skill reads | 100.0% | 0.0% |
| Negative-case skill reads | 0.0% | 0.0% |

False positives: 0/0; uncertain findings: 0/0; unlabeled findings: 2/1 (with/without).

These are model-graded observations, not human-validated accuracy or statistical significance. Skill reading is an observable proxy, not proof that instructions were followed. A null rate has no denominator; excluded/incomplete pairs never count as wins. Read individual answers and judge rationales before drawing conclusions.

## Per-case observations

Cells: completed / required issues found / false positives / correctly calibrated labeled findings. A 0/0 denominator is not a perfect score.

| Case | With skills | Without skills |
|---|---|---|
| review-rule-drift | yes / 1/1 / 0 / 2/2 | yes / 1/1 / 0 / 1/1 |
| review-new-behavior-coverage | yes / 1/1 / 0 / 1/1 | yes / 1/1 / 0 / 1/1 |
| audit-composition-root | yes / 0/0 / 0 / 0/0 | yes / 0/0 / 0 / 0/0 |
| test-mocked-subject | yes / 1/1 / 0 / 0/0 | yes / 1/1 / 0 / 1/2 |
| review-local-severity | yes / 0/0 / 0 / 0/0 | yes / 0/0 / 0 / 0/0 |
| nontrigger-nullish-syntax | yes / 0/0 / 0 / 0/0 | yes / 0/0 / 0 / 0/0 |
| nontrigger-new-implementation | yes / 0/0 / 0 / 0/0 | yes / 0/0 / 0 / 0/0 |

## Evidence and scope

Post-calibration exploratory rerun: same model, reasoning, seven cases, judge schema and judging prompt as the original pilot; one repetition and fresh baseline. No human-certified grades or statistical significance. Every raw catalog, answer, trace hash, judgment and metric was validated before export. Fixture paths are redacted to <fixture>; original hashes refer to local raw artifacts. Original pilot and evaluation criteria are unchanged. An earlier incomplete attempt was stopped after QA found a conflicting review-guide severity rule; final results use a fresh full run after harmonization, with no cases selected for their scores. Initial final-run deadline failures and the one whole-pair recovery are preserved under initial_attempt and recovery; the main table reports recovered complete pairs, not uninterrupted execution success.

See [answers, judgments, fixture snapshot, and read evidence](calibration-2026-11-04.json) and [methodology](../../docs/codex-behavior-evals.md). Seven small JavaScript cases cover review, audit, test, and negative trigger controls. This pilot does not measure debt, health, sweep, large repositories, or other models.

## Interpretation and execution accounting

The original skill result was 2/5 calibrated labeled findings; this recovered
rerun has 3/3, with **two additional findings marked unspecified by the judge**.
The fresh baseline has 3/4 calibrated labels and one unspecified finding. These
changing denominators prevent reading the percentages as overall accuracy.
Both arms completed 7/7 tasks, found 3/3 required issues, and had zero judged
false positives. Skill reads were 5/5 with zero negative-control triggers.

The primary run had 6/7 valid pairs and two deadline failures (the treatment also
logged routing errors). One whole-pair retry recovered the coverage case using
the same settings; initial metrics/failures and recovery metadata remain in JSON.
The main table describes recovered pairs, not a failure-free first pass.

See [diagnosis, concrete changes, and limitations](../../docs/severity-calibration.md).
No positive expected-Critical case exists in this fixed suite, so preserved Critical
recall has not been behaviorally demonstrated. No human-certified or statistically
significant improvement is claimed.
