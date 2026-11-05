# Codex behavioral comparison

Model: gpt-6-astra; reasoning: high; CLI: codex-cli 0.166.0.
Repetitions: 3; valid paired samples: 21/21.

| Metric | With skills | Without skills |
|---|---:|---:|
| Task completion | 100.0% | 100.0% |
| Required-issue recall | 100.0% | 100.0% |
| False positives / findings (lower is better) | 0.0% | 0.0% |
| Severity calibration among labeled findings | 100.0% | 54.5% |
| Observed expected-skill reads | 100.0% | 0.0% |
| Negative-case skill reads | 0.0% | 0.0% |

False positives: 0/0; uncertain findings: 0/0; unlabeled findings: 0/4 (with/without).

These are model-graded observations, not human-validated accuracy or statistical significance. Skill reading is an observable proxy, not proof that instructions were followed. A null rate has no denominator; excluded/incomplete pairs never count as wins. Read individual answers and judge rationales before drawing conclusions.

## Per-repetition stability

Cells: completed tasks / required issues found / false positives / correctly calibrated labeled findings / unlabeled findings. Fractions retain their denominators; 0/0 is not a perfect score.

| Repetition | Valid pairs | With skills | Without skills |
|---|---:|---|---|
| 1 | 7/7 | 7/7 / 3/3 / 0 / 5/5 / 0 | 7/7 / 3/3 / 0 / 2/3 / 2 |
| 2 | 7/7 | 7/7 / 3/3 / 0 / 5/5 / 0 | 7/7 / 3/3 / 0 / 2/4 / 1 |
| 3 | 7/7 | 7/7 / 3/3 / 0 / 5/5 / 0 | 7/7 / 3/3 / 0 / 2/4 / 1 |

## Per-case observations across three repetitions

| Case | Valid pairs | With skills | Without skills |
|---|---:|---|---|
| review-rule-drift | 3/3 | 3/3 / 3/3 / 0 / 6/6 / 0 | 3/3 / 3/3 / 0 / 0/2 / 4 |
| review-new-behavior-coverage | 3/3 | 3/3 / 3/3 / 0 / 3/3 / 0 | 3/3 / 3/3 / 0 / 3/3 / 0 |
| audit-composition-root | 3/3 | 3/3 / 0/0 / 0 / 0/0 / 0 | 3/3 / 0/0 / 0 / 0/0 / 0 |
| test-mocked-subject | 3/3 | 3/3 / 3/3 / 0 / 6/6 / 0 | 3/3 / 3/3 / 0 / 3/6 / 0 |
| review-local-severity | 3/3 | 3/3 / 0/0 / 0 / 0/0 / 0 | 3/3 / 0/0 / 0 / 0/0 / 0 |
| nontrigger-nullish-syntax | 3/3 | 3/3 / 0/0 / 0 / 0/0 / 0 | 3/3 / 0/0 / 0 / 0/0 / 0 |
| nontrigger-new-implementation | 3/3 | 3/3 / 0/0 / 0 / 0/0 / 0 | 3/3 / 0/0 / 0 / 0/0 / 0 |

## Severity details

| Judge classification | With skills | Without skills |
|---|---:|---:|
| Correctly calibrated labels | 15 | 6 |
| Unlabeled findings | 0 | 4 |
| Overgraded matched expected issues | 0 | 5 |
| Undergraded matched expected issues | 0 | 0 |
| Other miscalibrated labels | 0 | 0 |

Over/under counts compare only matched expected issues with the authored allowed severities. Other findings retain the original judge's severity_ok result; no new grading targets were invented. These are a breakdown of existing judgments, not a replacement evaluator.

## Execution accounting

Primary run: 42 attempted arms, 9 failed arms, 14/21 valid pairs. Whole-pair recovery attempts: 10 across 7 failed primary pairs; accepted: 7. Main metrics use 21/21 valid pairs after any disclosed recovery. Of the primary failures, 7 occurred during answer-session acceptance and 2 during separate judging. The unchanged runner rejects reconnect/error traces even with exit 0 or an answer file; such rejection is not proof the model could not answer. A judging failure excludes the pair even if the answer was produced. Primary records, failure stages/errors, available answer/judge trace and stderr hashes, analyzed judge trace metadata, and recovery records are preserved in JSON; raw prompts and credentials are not exported.

Across primary and recovery attempts: 62 attempted arms, 12 failed arms, and 8 successful partner arms excluded by the whole-pair recovery policy. These excluded partners were not selected based on their grades.

The initial recovery plan allowed one whole-pair retry. After some first recovery attempts also failed, one additional attempt was allowed for each still-failed pair to obtain three valid comparisons per case. This was an operational deviation from the initial plan; it did not change grading, deadlines, or other controls. Successful primary or recovery pairs were never retried based on grades, and every failed attempt remains visible.

## Evidence and limitations

Three repetitions of the unchanged seven authored cases, judge schema, judge prompt, model, reasoning, CLI, deadline, and runner isolation; fresh skill and baseline sessions. Only the skill output convention and repetition count changed from the earlier severity-calibration run. All primary records and whole-pair recovery attempts remain archived. The initial plan allowed one recovery per failed pair; any additional operational recovery after that failure is explicitly disclosed in recovery_policy and the ordered attempts, with no selection based on grades. Comparative metrics include only valid pairs; failures are never wins. Every raw catalog, answer, judgment, trace hash, read trace and aggregate was checked before export. Fixture paths are redacted to <fixture>; original hashes refer to local raw artifacts. No human-certified grades, statistical significance or expected-Critical recall is claimed.

Three repetitions on seven fixed small JavaScript cases describe within-suite consistency, not broad reliability or cross-model generalization. Correlated task/model/judge errors remain. There is no expected-Critical positive case, and debt, health, sweep, large repositories, multilingual triggering and other languages remain outside measured coverage.

See [answers, unchanged judgments, fixture snapshot, primary attempts and read evidence](stability-2026-11-05.json) and [methodology](../../docs/codex-behavior-evals.md).

## Interpretation

Every recovered repetition produced five labeled treatment findings, all graded
calibrated (5/5, 5/5, 5/5), with no unspecified labels. All 15 finding titles
contain a literal severity word. The local policy inconsistency and mocked
subject are Warning in all three treatment repetitions; the additional bounded
test-protection observations are Suggestion. The numerical deductions agree
with these tiers. This resolves the earlier emoji-only ambiguity within this
fixed suite, without changing the expected severities or relabeling old answers.

The baseline identifies the same nine required issues and has no false positives,
but overgrades the mocked subject three times and policy drift twice. Its four
unlabeled findings remain separate, not counted as severity mistakes. Labeled
calibration varies from 2/3 to 2/4 to 2/4, compared with treatment's 5/5 each time.
The valid primary pairs also show 10/10 treatment labels calibrated versus 4/7
baseline labels, before recovery; those primary pairs cover fewer case/repetition
combinations and cannot stand in for the full suite.

These observations support repeatable label clarity and appropriate restraint
on these small cases. They do not show a recall or false-positive advantage:
both arms found 9/9 required issues, completed 21/21 tasks in valid pairs, and had
zero judged false positives. Reused fixtures and same-model judging remain
correlated, and execution instability required recovery. No broad reliability,
statistical significance, or preserved Critical recall is established.

## Separate strict-report diagnostic

Label clarity does not establish complete machine-report validity. With the
parser's new literal-title suffix support, only 7/15 final treatment review
reports pass the strict report contract. Remaining failures involve bulleted
Iron Law fields, explanations appended to score lines, and one absent Mode
field. The source digest and per-answer errors are archived under
`auxiliary_format_audit`. This diagnostic is outside the fixed behavioral rubric;
it changes none of the judgments or comparative metrics above. Full format
adherence remains a separate optimization target.
