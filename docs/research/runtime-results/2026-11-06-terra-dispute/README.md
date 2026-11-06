# RT-38–RT-43 model comparison and semantic review

2026-11-06 follow-up: the [RT-40 reassessment](../2026-11-06-terra-rt40-recheck/README.md) found an inconsistent explicit-evidence threshold affecting A/2, B/1 and C/3. All nine RT-40 answers correctly diagnosed uncertainty. Supplemental sensitivities and prototype revision 2 are recorded separately; the historical results below remain unchanged.

On 2026-11-06 the six revision-8 dispute cases were tested with `gpt-6.1-terra`,
medium reasoning, Codex CLI 0.167.0, three repetitions in each of three arms.
Of 54 planned turns, 53 executed and one failed. A separate model reviewer
(`gpt-6.1-terra`, Codex eval-curator in this session) judged each successful
answer against its frozen rubric. **This is model review, not human adjudication.**
The cases were constructed after exposure to prior model answers and are neither
independent holdouts nor representative production samples.

A made no skills available; B made the core skills available; C made the same
core and the experimental runtime skill available. Availability is not proof of
use; observed reads are in the records. Each case had a separate plan with order
rotated across repetitions; case plans ran in ID order. The reviewer read the
runner-generated packets without arm mappings before making judgments, but
wording often reveals the arm. This is partial blinding, not a blinded trial.
The reviewer had access to the same workspace and was not independent of the
fixture-authoring organization. Judgments may share biases with the tested model.

## Paired descriptive results

Seventeen of 18 case/repetition triplets have all three answers. RT-41 repetition
3 is excluded from paired comparisons because B's execution failed. Counts below
use the 17 complete pairs, with each repetition counted as a response, not an
independent case. There are only six underlying cases.

| Measure | A | B | C |
| --- | ---: | ---: | ---: |
| Primary composite correct | 16/17 (94.1%) | 13/17 (76.5%) | 16/17 (94.1%) |
| Defect issues found | 5/5 | 5/5 | 5/5 |
| Defect responses with a missed expected issue | 0/5 | 0/5 | 0/5 |
| Protected responses with a false defect assertion | 0/6 | 0/6 | 0/6 |
| Unresolved responses meeting explicit reasoning criteria | 5/6 | 5/6 | 6/6 |
| Uncertain supplementary output concerns | 0 | 2 | 0 |

Primary correctness requires the proper assessment, completion, all expected
issues, the frozen rubric's required evidence, and no definite unsupported
finding or certainty. For RT-38, three B answers and one C answer identified the
defect but omitted the explicitly required awaited-success countertrace; they
are evidence-incomplete, not missed defects. For RT-40, one A and one B answer
identified the missing rule but did not explicitly compare the two hypothetical
contract interpretations and resulting judgments. Those two evidence judgments
are reviewer's strict interpretation and merit independent human review.

The reviewer separately marked two B outputs uncertain: RT-41/1 applies R6 to
an input-validation defect without showing domain-model distortion; RT-39/2
prints an overall `100/100` Health Score on a bounded runtime scenario. The
rubrics do not expressly forbid simply emitting a core code or core score, so
neither is counted as a definite unsupported finding or false defect assertion.
As a conservative sensitivity analysis, counting both uncertain outputs against
composite correctness yields A **16/17**, B **11/17**, C **16/17**. These are
supplemental judgments; they do not change issue recall.

C exceeds B on three complete triplets under the primary composite: RT-38/1 and
RT-38/3 (countertrace evidence) and RT-40/1 (explicit alternatives). Neither
arm found an expected defect issue missed by the other. C also equals A on the
composite (16/17), so these observations do not establish that the runtime skill
caused improvement; small exposed fixtures, same model family, repetitions, and
one reviewer rule out a general accuracy or causal-benefit claim. Severity was
not penalized when absent or noncanonical.

Unpaired individual totals are A **17/18**, B **13/17**, C **17/18**. These have
different available triplets and must not be used as the paired comparison.
False-positive and false-negative rates above refer respectively to affirmative
unsupported defect assertions on protected responses and missing expected defect
issues; a conditional question is not a false positive. Two uncertain additional
output concerns are shown separately rather than silently counted either way.

## Records, provenance and reproduction

Each [case directory](RT-38/) (RT-38 through RT-43) contains the complete runner
`results.json`, including frozen plan, execution metadata, exact successful
answers and the failed partial answer; `review-packets.json` with exact answers
and rubric; model `judgments.json`; and the offline importer `summary.json`.
The case-level plans pin clean source commit
`bb52ca88260ec534e23a0bec2f765e79a4e5721f`, manifest revision 8, prompts,
inputs, rubric and skill digests. Raw JSONL event streams, CLI stderr and
prompt snapshots are kept in the local ignored run directories, not published;
they may contain host-specific paths or environment details. The published
runner records retain answer and trace SHA-256 values, timing, available usage,
CLI and model information. Exact answer strings are unmodified; their temporary
fixture paths identify local ephemeral synthetic workspaces, not credentials.
A pattern scan for common token/credential forms and `/Users/` matched none
in the published results; this is a limited scan, not a guarantee of anonymity.

RT-41/3/B has `status: failed` despite a partial answer and exit code 0: its
stream reported a connection refusal and lacked the required completion event.
The partial answer is retained in its exact runner record but is not graded or
counted as successful. No recovery run was substituted.

Recompute [metrics.json](metrics.json) without model calls:

```bash
python3 docs/research/runtime-results/2026-11-06-terra-dispute/analyze.py > /tmp/terra-dispute-metrics.json
diff -u docs/research/runtime-results/2026-11-06-terra-dispute/metrics.json /tmp/terra-dispute-metrics.json
```

The importer validated packet hashes, answer excerpts, issue IDs, severity schema
and complete-triplet boundaries for each case; it does not validate the semantic
truth of the review. The importer summaries treat evidence and uncertainty as
separate fields; the custom primary/sensitivity composites in `analyze.py` must
not be confused with the runner's aggregate fields. Human review and independently
authored holdouts remain necessary before any claim of real-world benefit.
