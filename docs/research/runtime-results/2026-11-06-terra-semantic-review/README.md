# Model semantic review of the runtime development study

On 2026-11-06 a separate Codex model reviewer assessed every successfully
executed answer against its frozen case rubric. This is **model judgment, not
human review**. For the 30 original cases with complete A/B/C triplets, the
reviewer found all 11 expected defect issues in each arm; no definite false
positive was identified, and two protected-case findings were left uncertain.
The strict composite case-correct counts were A **29–30/30**, B **28–29/30**,
and C **30/30**, where each range treats an uncertain case as incorrect or
correct respectively. These are observations on a small exposed development set,
not validated accuracy or evidence that the runtime skill caused an improvement.

## What was assessed

The tested model was the requested `gpt-6.1-terra` with `medium` reasoning in
Codex CLI 0.166.0, one run per arm per case. A had no skills, B had core skills,
and C additionally had the runtime research skill. The original
[37-case run](../2026-11-06-terra-37/README.md) had 102 successful calls out of
111; [recovery runs](../2026-11-06-terra-recovery/README.md) generated 21 later
successful calls for seven affected cases. All **123 successful answers** were
judged once, including all 102 original successful calls and all 21 recovery
calls. Failed executions are not answers. The original complete-triplet analysis
contains 30 cases in each arm. Seven later complete recovery triplets are reported
separately; they do not replace failed original calls.

The reviewer was a separately invoked Codex model agent in the current session;
its exact model identity and version were not independently verified. It received
runner-generated packets containing case ID, task, visible inputs, frozen rubric
and response, with arm labels and execution metadata withheld. The same reviewer
and procedure were used for all packets. Answer wording can disclose the arm, so
this is only partial blinding. The packet preparer had seen some arm mappings but
was a different agent and did not grade. The reviewer had access to the exposed,
agent-authored rubrics and the same workspace: this was not an independent or
human ground truth. The separate model reviewer used this Codex session; no new CLI study runs or external model-judge calls were made for the review.

The complete frozen [judgments](judgments.json) contain exact excerpts, rubric
matches, uncertainty, completion, severity and rationale for each answer. Their
SHA-256 is `2a60a72832312c9a746ce47828e62e3ad460e94ad9a9aba9877f24a78a47b858`.
Packet IDs are unblinded after judging using the run plan hashes. The runner's
offline importer accepted all eight run-specific judgment sets, checking answer
hashes, exact quotes and structural consistency; **it does not check whether a
semantic judgment is correct**. No judgment was amended after unblinding.

## Original paired comparison

The 30 comparable cases comprise 11 defect, 10 protected and 9 unresolved
cases in each arm. The syntax-only non-trigger case is absent because its
original B call failed. All rates below use judged responses as denominators.

| Measure | A | B | C |
| --- | ---: | ---: | ---: |
| Strict composite correct, lower–upper bound | 29–30/30 (96.7–100%) | 28–29/30 (93.3–96.7%) | 30/30 (100%) |
| Expected defect issues found | 11/11 | 11/11 | 11/11 |
| Defect cases with a definite missed expected issue | 0/11 | 0/11 | 0/11 |
| Protected cases with a definite false positive | 0/10; 1 uncertain | 0/10; 1 uncertain | 0/10 |
| Unresolved controls classified unresolved without unsupported certainty | 9/9 | 9/9 | 9/9 |
| Responses with a definite unsupported claim across all kinds | 0/30; 1 uncertain | 0/30; 1 uncertain | 0/30 |

False-positive rates on protected controls are therefore 0–10% for A and B
and 0% for C under this reviewer's assessments; the upper bound treats each
uncertain finding as false. A result can contain an additional unsupported
finding even on a defect case, so the all-kind measure is also shown. Missing
expected issues measure false negatives; unresolved cases are not counted as
ordinary negatives. C found **zero additional expected issues compared with B**
in the same complete triplets: both matched all 11. In B/C comparisons the
composite classifications differ on RT-05 (B incorrect, C correct) and RT-02
(B indeterminate, C correct); the other 28 are equal. RT-05 B located the issue,
but the reviewer judged one required causal evidence element incomplete. This
is an evidence-quality difference, not a missed diagnosis. RT-02 B raised a
promise-delivery ordering scenario whose relationship to the written success
contract remains unresolved; it is not recorded as a definite false positive.
A's other uncertain finding is RT-12's conditional invalid-duration concern.
These two interpretation questions need human adjudication.

## Recovery and unpaired observations

The seven recovery triplets contain one defect, three protected, two unresolved
and one syntax-only case in each arm. Every arm was rated case-correct **7/7**,
matched **1/1** expected issue, had **0/1** defect cases with a definite miss,
**0/3** protected false positives, and correctly restrained **2/2** unresolved
controls; all three completed the syntax task without unsolicited auditing.
There were no B/C composite differences in these seven cases. Recovery ran later
and used A/B/C order for every case rather than the original rotated order, so
it is a secondary dataset, not a silent repair of the original comparison.

The individual original arms each have 34 executed answers, but different
missing cases. A has 33 correct and one uncertain; B has 32 correct, one
incorrect and one uncertain; C has 34 correct. Their defect denominators are
12, 12 and 11 respectively; protected denominators are 12, 12 and 11; unresolved
controls are 9, 10 and 11. These unpaired numbers are descriptive and should
not be used as a direct A/B/C comparison. Full computed counts are in
[metrics.json](metrics.json).

## Definitions and reproducibility

Strict composite correctness requires task completion, an assessment matching
case kind, all expected issues matched, no unsupported finding or unsupported
certainty, complete evidence for supported findings, acceptable explicitly
labeled canonical severity (`Critical`, `Warning`, or `Suggestion`), and no
unsolicited audit. Missing severity and noncanonical terms such as `High` or
`moderate` are recorded as `unspecified`; their calibration is not evaluated
and does not reduce the composite score. In the original study this affected
13 A and 8 B findings; in recovery it affected one A and one B finding. These
counts include absent and noncanonical labels, which the schema does not
separately record. No C findings were marked unspecified. A reviewer-marked uncertain finding makes a case indeterminate unless
another definite failure independently establishes incorrectness; a disputed
assessment based on that finding is not itself treated as a definite failure.
The bounds count indeterminate cases as incorrect and correct, respectively.
This is stricter than detecting the primary defect alone. A false positive is an
unsupported affirmative finding or explicit unsupported certainty; a false
negative is a missing expected issue in a defect case. An uncertain finding
without a definite false positive remains indeterminate; a missing expected
issue accompanied by such a finding would also be indeterminate. There were no
missing expected issues in these reviewed runs.

Run `python3 docs/research/runtime-results/2026-11-06-terra-semantic-review/analyze.py`
from the repository root to regenerate the tracked metrics from the judgments,
case manifest and sanitized execution records. The case-level rules are explicit
in [analyze.py](analyze.py). The importer was also run using the original local
frozen plans and raw execution records, which are ignored and not published.

The sample consists entirely of exposed synthetic development fixtures, with one
repetition per arm, a single model reviewer, unreviewed rubric/source mappings,
and no independent holdout. The reviewer and the tested model may share biases;
packet wording can reveal arm identity. A 30-case descriptive comparison cannot
establish a population error rate, real-world benefit, reproducibility or
production readiness. Human review of answers, especially the disputed cases,
and independently authored holdouts remain necessary before making those claims.
