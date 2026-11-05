# Severity calibration

## Diagnosis of the initial pilot

The original seven-pair pilot used fixed, independently authored severity rubrics.
Three of five labeled treatment findings were graded too high. These observations
identify instruction conflicts; they do not establish causation from a single run.

1. **Symptom:** localized duplicated pricing policy was reported as Critical.
   **Source:** the R3 guide classified duplicated core business logic as Critical
   without requiring evidence about impact or propagation. The answer follows that
   categorical rule even though its consequence is confined to two entry points.
   **Consequence:** a correct diagnosis receives an overstated priority and an
   excessive score deduction. **Remedy:** distinguish bounded policy drift from
   evidence of widespread, high-impact inconsistency; require impact evidence for
   Critical rather than inferring it from the business nature of the code.
2. **Symptom:** absence of tests in the same small module was reported as Warning,
   while the fixed rubric allowed a local Suggestion.
   **Source:** T5 emphasized missing tests and error paths, but supplied no clear
   distinction between a local protection recommendation and an evidenced gap in
   changed behavior. **Consequence:** an additional useful observation is elevated
   without establishing a separate substantial risk. **Remedy:** calibrate missing
   tests using change scope, contract, and demonstrated unprotected behavior;
   absence alone does not establish urgency or production impact.
3. **Symptom:** replacing the subject with a mock was Critical in both arms.
   **Source:** T4 used mock-code ratios and test-only methods as automatic Critical
   triggers; the shared framework lacked a general impact check. The baseline also
   chose P1, so this error cannot be attributed solely to the skill.
   **Consequence:** a local test blind spot is treated as a release-threatening
   condition without evidence of that impact. **Remedy:** make Warning the default
   for a demonstrated local verification blind spot, and require separate evidence
   of high-impact exposure for Critical. Harmonize the test guide with that rule.

## Rule changes and verification

Use consequence, affected scope, and evidence to calibrate every risk. Preserve
real Critical findings when serious impact and relevant exposure are established.
Risk-specific examples and numeric smell thresholds are diagnostic signals, not
automatic priority assignments. Explicit project severity overrides still win;
strictness continues to change score deductions rather than severity.

The original cases, allowed severities, judge prompt/schema, and initial pilot
remain unchanged. A fresh paired run with the same model and reasoning settings
will measure the revised instructions against a fresh no-skill baseline. Results
must retain failures, unlabeled findings, and uncertain judgments as separate
observations; do not select favorable reruns or retune the rubric.

Mode-local rules also required reconciliation: the review guide treated numeric
thresholds as primary and any current production risk as Critical; sweep converted
debt priority scores directly into severity; architecture audit elevated ordinary
coordination overhead. These instructions could override the shared policy at the
point of reporting. The revised guides use the same evidence gate, and debt-work
scheduling remains explicitly distinct from finding severity. QA caught these
conflicts before the final frozen-skill rerun.

## Observed rerun

The [recovered seven-pair rerun](../evals/codex/calibration-2026-11-04.md)
kept all original evaluation controls. Both arms completed 7/7 tasks, found 3/3
required issues, and had no judged false positives. Expected skill reads remained
5/5; neither negative control triggered a skill.

| Severity observation | Original skills | Revised skills | Fresh baseline |
|---|---:|---:|---:|
| Calibrated explicitly labeled findings | 2/5 | 3/3 | 3/4 |
| Judge-unspecified findings | 0 | 2 | 1 |
| All findings | 5 | 5 | 5 |

The policy-drift finding changed from Critical to Warning and its additional
regression-protection recommendation from Warning to Suggestion, both accepted
by the unchanged judge. The changed-behavior coverage finding stayed Warning.
For the mocked subject, the revised answer used yellow/green markers without
severity words; this judge marked both unspecified, unlike its earlier treatment
of emoji markers. Preserve those grades: 3/3 labeled findings is not evidence
that all five findings are calibrated. This remaining reporting/judge ambiguity
limits the improvement claim; the fresh baseline still overgraded the mock issue.

The final primary run completed six pairs; both coverage-case arms exceeded the
240-second deadline, with explicit routing errors in the treatment log. One
whole-pair retry used the same deadline/model/judge and recovered the seventh
pair. The archive retains primary metrics, both failed records, and recovery
metadata. The case-filtered retry starts with the skill arm; no answer was selected
based on its score. A separate early partial attempt was stopped after QA found
remaining guide conflicts, before the final frozen run.

This is one repetition over small JavaScript cases, graded by the same model.
There is no expected-Critical positive case, so the rerun cannot establish
preservation of genuine Critical recall. A future held-out expansion should test
that separately, and explicit severity words should be evaluated without changing
these frozen standards or retroactively relabeling the present answers.

## Explicit labels and repeated comparison

The next revision addresses the reporting ambiguity separately from severity
thresholds. Every finding title must contain the literal English word `Critical`,
`Warning`, or `Suggestion`, including localized reports and condensed findings.
Color, emoji, ordering, and priority codes do not replace that word. The
Consequence must establish the impact and scope supporting the selected tier;
headings, prose, markers, and score deductions must agree with it. The shared
template and the health/sweep report placeholders carry the same requirement.
The report parser also accepts a trailing `(Critical)`, `(Warning)`, or
`(Suggestion)` in a bold finding title without a severity heading or emoji, and
rejects contradictory title/heading/emoji signals. Parser/SARIF regression tests
cover all three tiers, missing-label inheritance, suppressed examples, and
conflicts. This compatibility change is separate from the behavioral judge;
its prompt, schema, metric implementation, and fixture targets are unchanged.

The repeated comparison freezes this revision before execution and uses the same
seven fixtures, authored rubrics, judge prompt/schema, runner, model, reasoning,
and 240-second deadline. Only the skill content and the repetition count change:
three repetitions produce 21 planned pairs. Baselines are generated afresh.
Primary execution failures remain visible. The initial plan allowed one whole-pair
recovery with unchanged settings, without selecting on judgment scores.

Report each repetition as well as pooled counts. In particular, distinguish
calibration among labeled findings from the fraction left unlabeled, and retain
recall, false positives, uncertainty, task completion, and execution failures.
Three repetitions of seven fixed fixtures describe repeatability within this
suite; they do not provide 21 independent problem domains or establish broad
generalization. Expected-Critical recall remains outside this suite's coverage.

The three-repetition primary run produced 14/21 valid pairs: 19/21 treatment arms
and 14/21 baseline arms passed both execution and judging. Nine arm attempts
failed the unchanged runner contract, including two failures in the judge after
an answer had been produced. Logs include routing discovery errors, connection
refusal, and deadlines; some traces ended with exit zero but retained error
events, which the existing runner rejects. These are execution observations,
not evidence that the skill causes better connectivity or task completion.
All seven affected pairs were scheduled for one whole-pair recovery, preserving
successful counterparts from the primary attempt in the evidence archive.
Each case-filtered recovery starts with the skill arm, as the existing runner
specifies for a one-case, one-repetition invocation. Recovery therefore does not
preserve the original pair's arm order or wall-clock conditions; read primary
and recovered metrics separately when assessing repeatability.

An architecture pair's first recovery also failed with routing errors. To obtain
three valid comparisons per case, the execution plan was then extended to allow
one additional whole-pair attempt only for pairs whose first recovery failed.
This is a disclosed deviation from the initial once-only recovery plan. Every
attempt remains archived; successful comparisons are never retried for a better
grade, and the authored grading standards remain unchanged.

## Three-repetition observations

The [complete repeated comparison](../evals/codex/stability-2026-11-05.md)
contains 21/21 valid pairs after the disclosed recoveries, including three valid
comparisons for every fixed case.

| Observation | With skills | Fresh baseline |
|---|---:|---:|
| Calibrated labels, repetition 1 | 5/5 | 2/3 |
| Calibrated labels, repetition 2 | 5/5 | 2/4 |
| Calibrated labels, repetition 3 | 5/5 | 2/4 |
| Calibrated labels, pooled | 15/15 | 6/11 |
| Unlabeled findings | 0/15 | 4/15 |
| Matched expected issues graded too high | 0 | 5 |
| Required issues found | 9/9 | 9/9 |
| Judged false positives | 0/15 | 0/15 |

All 15 treatment finding titles contain an explicit severity word; their score
deductions agree with the selected tiers. Local policy drift and the mocked
subject consistently receive Warning, while bounded additional test protection
receives Suggestion. Baseline overgrading recurs on the mocked subject in all
three repetitions and policy drift in two. Unspecified baseline labels are kept
separate from mistakes. The valid primary pairs also favor treatment label
calibration (10/10 versus 4/7), but cover fewer case/repetition combinations.

The evidence supports within-suite repeatability of clear, appropriately bounded
labels. It shows no recall or false-positive improvement because both arms
already reach the same results on those dimensions. Three repetitions of seven
fixed cases and same-model grading do not establish broad reliability or
Critical recall. Primary execution instability remains material: ten whole-pair
recovery attempts were needed to recover seven pairs, with all 62 arm attempts,
12 acceptance failures, and eight excluded successful partners retained.

An auxiliary strict-parser check, separate from the unchanged behavioral rubric,
accepts 7/15 final treatment review reports after literal-title support. Bulleted
fields, score-line explanations, and an absent Mode field cause the remaining
failures. The archived answers and per-report errors preserve this limitation;
explicit labels alone do not establish complete report-format adherence.
