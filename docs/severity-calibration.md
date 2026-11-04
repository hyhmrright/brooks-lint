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
