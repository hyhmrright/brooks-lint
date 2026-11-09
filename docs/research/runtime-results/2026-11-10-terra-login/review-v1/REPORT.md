# Semantic review of 81 Codex login answers

All 81 answers match the frozen case assessment, all 27 expected defect instances
are detected, and no definite false defect or unsupported safety assertion was
identified. The runtime-guidance arm improves **evidence completeness under the
frozen strict rubric**, not observed diagnosis accuracy. The baseline already
reaches the assessment/recall ceiling on these exposed development cases.

## Design and provenance

The responding model was CLI-selected `gpt-6.1-terra`, effort `medium`, Codex CLI
0.167.0 through ChatGPT login. Provider/model weights were not independently
attested. This review uses only the already archived answers: no new live model
evaluation was launched. The reviewing agent and parent audit used `gpt-6-astra`
(as identified by the review session), distinct from the responding model.

Nine public synthetic cases each have three repetitions in three arms:

- A: case inputs only.
- B: same inputs plus core skill/shared guidance.
- C: same inputs plus core guidance and runtime prototype revision 2.

All arms also received the same explicit task asking for causal traces, contrasts,
missing assumptions and bounded conclusions; A is not an unprompted baseline.
This is `login-full-context-text-v1`: guidance was supplied in the prompt, not
observed as native skill discovery/tool reads. The prior native-tool design is
not validated by this run. Frozen plan SHA-256:
`bade5c6cc86db0ea02dd32d6f22adb970374db427d757a4a3535258eb912996b`.

The eval-curator read every full answer and applied each case's frozen rubric.
The parent also read all 36 answers for HC-03/06/07/09 and checked the distinction
between conclusion correctness, causal issue matching and evidence completeness.
This is exposed agent review with shared provenance, not independent human
calibration or a blinded inter-rater agreement study. Arm mappings and public
rubrics were accessible; masked packets do not establish blindness. All original
answers, raw execution records and pending-review summary remain unchanged.
The new response revision binds every judgment to the exact answer SHA-256.

## Paired results

All 27 triplets are complete and reviewed: 81/81 executions and reviews, no
exclusions. Individual-arm and paired denominators are consequently identical.
Each arm includes nine defect, nine protected and nine unresolved responses;
these are three repeats of three unique cases per kind, not nine independent cases.

| Frozen measurement | A: inputs | B: core | C: core + runtime |
| --- | ---: | ---: | ---: |
| Task completion | 27/27 (100%) | 27/27 (100%) | 27/27 (100%) |
| Assessment correctness | 27/27 (100%) | 27/27 (100%) | 27/27 (100%) |
| Expected issue recall | 9/9 (100%) | 9/9 (100%) | 9/9 (100%) |
| Issue false negatives | 0/9 (0%) | 0/9 (0%) | 0/9 (0%) |
| Defect responses missing an issue | 0/9 (0%) | 0/9 (0%) | 0/9 (0%) |
| Protected false defect responses | 0/9 (0%) | 0/9 (0%) | 0/9 (0%) |
| Unresolved certainty errors | 0/9 (0%) | 0/9 (0%) | 0/9 (0%) |
| Evidence requirements met | 47/54 (87.04%) | 50/54 (92.59%) | 54/54 (100%) |
| Answers meeting all evidence requirements | 20/27 (74.07%) | 23/27 (85.19%) | 27/27 (100%) |
| Allowed explicit canonical severity | 0/0 (N/A) | 8/8 (100%) | 9/9 (100%) |
| Supported issues with no explicit severity | 9 | 1 | 0 |

Every arm has zero unsupported defect assertions, unsupported safety responses,
unsolicited audits, noncanonical severity concerns, and supplementary concerns.
Missing severity is not incorrect severity; the absent B label is HC-01 repetition
2. All supplied explicit supported severities are Warning, the allowed label.
Assessment correctness is the protocol's narrow case-kind metric, not a composite
quality score or a claim that every answer satisfies every requirement.

## Exact evidence omissions

| Case | Affected answers | Missing frozen requirement |
| --- | --- | --- |
| HC-03: preparation cancellation, unknown policy | B repetitions 2, 3 | `alternative-judgments`: names permissive policy but does not judge the same admission under it |
| HC-06: rejection cleanup, unknown owner | A repetition 2; B repetition 2 | `alternative-judgments`: asks for outer ownership/timing without an explicit compatible-contract judgment |
| HC-07: stale completion, authoritative reservation | A repetitions 1, 2, 3 | `contrast-control`: traces stale deletion and compares repeated completion/SlotPool, but omits current-generation completion and its admission contrast |
| HC-09: stale completion, unknown map role | A repetitions 1, 2, 3; B repetition 2 | `alternative-judgments`: names diagnostic/authoritative roles without explicitly judging the deletion under the diagnostic completion |

These 11 omissions are evidence deficiencies, not 11 failed diagnoses. All 81
causal-trace requirements pass. The frozen protocol requires an unresolved answer
to give two compatible contract completions and a judgment of the same behavior
under each; merely naming alternatives is insufficient. Explicit formulations
such as “may satisfy,” “may be consistent,” or “does not establish a violation”
are accepted in context; no exact wording is required. Conditional remedies and
local retention descriptions are not counted as affirmative unsupported defects.

## What the runtime guidance adds, and what remains unknown

Relative to B, C has four more fully evidenced responses out of 27 (+14.81
percentage points) and four more requirements out of 54 (+7.41 points). These
four differences occur in HC-03 repetitions 2/3, HC-06 repetition 2 and HC-09
repetition 2. Relative to A, C has seven more fully evidenced responses (+25.93
points); three of those reflect the HC-07 current-generation contrast missing
from every A repetition. There are no C evidence regressions in this sample.

The supported interpretation is that the runtime guidance made the requested
contrast and alternate-contract reasoning more explicit and consistent on this
set. It did not improve observed assessment correctness, recall or false-alarm
rates, which are tied. Severity labels are more consistently present, but an
absent label was never a failure under the rubric.

A post-review sensitivity accepts implicit alternative judgments for **all eight**
flagged unresolved answers, leaving the three HC-07 contrast omissions unchanged.
It is an intentionally more permissive, non-primary interpretation, not a revised
frozen rule or a claim those answers contain the missing explicit evidence:

| Sensitivity | A | B | C |
| --- | ---: | ---: | ---: |
| Evidence requirements met | 51/54 (94.44%) | 54/54 (100%) | 54/54 (100%) |
| Fully evidenced responses | 24/27 (88.89%) | 27/27 (100%) | 27/27 (100%) |

Under that sensitivity, C's evidence advantage over B disappears. This limits the
claim to explicitness under the frozen standard; it is not proof of stronger
underlying causal understanding. No accuracy improvement survives to be claimed
because none was observed under either reading.

The cases/rubrics are public, synthetic and development-exposed, with three
mechanism families. Human calibration, independent holdouts and book mapping
verification remain absent. Repeated answers are not independent observations;
no significance test or population accuracy estimate is asserted. Larger context,
guidance content and formatting differ together; no length-matched placebo or
ablation isolates the runtime text's mechanism. No production impact, generalized
safety, native isolation or actual skill-reading effectiveness follows.

## Follow-up design implications

Preserve the explicit two-contract/two-judgment requirement and current-versus-stale
completion contrast when refining guidance. Use these evidence axes separately
from classification to avoid concealing ceiling effects. A later study should add
harder, privately authored mechanisms and multiple causal issues, length-matched
controls and independent semantic labels before claiming diagnostic benefit.
These are next-study proposals; this review changes neither the frozen guidance
nor the candidate standards, and starts no further live test.

## Artifacts and verification

- [81-answer review index](REVIEW-INDEX.md), linking each original answer.
- [Reviewed answers and annotations](responses.json), with per-answer rationales.
- [Deterministic paired and individual summary](summary.json).
- [Initial shared-process ratings](first-pass-reviews.json), [per-answer notes](notes.json),
  and [explicit-threshold sensitivity](sensitivity.json).
- [Offline archive verifier](verify.mjs): checks all 81 original execution records,
  answer bytes/hashes, unmodified execution metadata, review schema and exact
  regeneration of the summary. It does not validate semantic truth.
- [Validation record](VALIDATION.md), including the repository QA gate.
- [Original execution report](../REPORT.md) and [raw records](../run/responses.json).

Run `node docs/research/runtime-results/2026-11-10-terra-login/review-v1/verify.mjs`
from any working directory. Aggregate original CLI-reported usage remains
2,353,455 tokens (2,313,306 input; 40,149 output, including 3,310 reasoning output).
This is the original execution usage, not current review-session usage or verified
billing. The verifier also reports per-arm usage; no monetary cost is inferred.

| Original CLI-reported tokens | A | B | C |
| --- | ---: | ---: | ---: |
| Input | 243,063 | 1,008,243 | 1,062,000 |
| Output (including reasoning) | 11,381 | 13,938 | 14,830 |
| Total | 254,444 | 1,022,181 | 1,076,830 |

C used 54,649 more reported tokens than B across 27 answers (about 5.35%).
This describes the text-treatment overhead in this run; it is not a billing or
cost-effectiveness estimate and does not include the subsequent agent review.
