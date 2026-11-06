# Nine-candidate offline end-to-end drill

**SIMULATED DATA — NOT A MODEL EVALUATION.** This archive rehearses the complete
prospective preparation/import/review/aggregation workflow on all HC-01–HC-09.
No model executable, API, inference request or live evaluation was run. The
response text and semantic labels are intentionally authored exercise material;
`executed`, `failed` and `interrupted` in these JSON records are **simulated
statuses**, not claims that corresponding real model executions occurred.

The candidate/scorer/adapter/guidance base is commit
`a52bc8ddd466c11f7d5fb9ddac07ab460132b6da`. The drill recipe is new work after
that base, frozen separately with its exact bytes and SHA-256 in
[recipe-source.json](recipe-source.json). Guidance and scoring were not tuned
from this drill. Its purpose is to check data flow and arithmetic, not to measure
accuracy, compare models or estimate a runtime-skill improvement.

## Complete exercise

[plan.json](plan.json) freezes the nine visible-input whitelists, separate rubrics,
scoring protocol v1, schema, scorer/adapter bytes, core guidance and runtime
prototype revision 2. One repetition across A/B/C gives **27 simulated turns and
nine complete triplets**. [plan-anchor.json](plan-anchor.json) saves the plan digest
separately. This same-public-archive anchor detects accidental drift when trusted;
it is not a signature, independently held custody or protection against replacing
both plan and anchor.

[responses-template.json](responses-template.json) preserves the initial 27
not-run rows. [synthetic-events.json](synthetic-events.json) retains the exact
script-authored response text and hashes, with a conspicuous simulation marker;
it deliberately does not imitate Codex JSON events. [responses.json](responses.json)
binds every simulated response to that artifact and its authored review.
[reviews.json](reviews.json) retains reviewer method, exposure and labels.

Each candidate uses the **same authored answer and labels across all three arms**.
The complete-stage [summary.json](summary.json) therefore has equal arm counters:
nine assessment matches, three expected issue matches, no injected misses or
unsupported defect assertions, and all 18 evidence requirements met per arm.
These are expected arithmetic checks from injected labels, **not observed model
accuracy or evidence that the runtime skill helps**. There are nine synthetic
cases, not 27 independent observations. No composite performance claim is made.

[review-packets.json](review-packets.json) contains all 27 exact successful
synthetic answers with whitelisted supplied inputs, omitting arm mapping,
guidance, authored annotations and rubric labels. It supports first-pass notes
before consulting the separate frozen rubrics. Public answer content, input paths
and source mappings remain accessible: this is partial masking only, not blind
or independent review. No reviewer completed an exercise by generating this file.

## Separate injected boundary exercise

[boundary-responses.json](boundary-responses.json) and its separately named
[synthetic provenance](boundary-synthetic-events.json) derive from the complete
exercise solely to test error handling. They are never substituted into its
27-turn summary. The [boundary summary](boundary-summary.json) retains the full
nine-triplet schedule, 24 supplied records, three absent turns, **five complete
triplets and four excluded triplets**:

| Injected change | Expected consequence |
| --- | --- |
| HC-01/A exactly empty answer, annotated incomplete | Remains executed and paired; completion and assessment fail; one missed issue. |
| HC-02/B affirmative invented leak | One protected-case false defect and incomplete evidence. |
| HC-03/C pending review | Entire triplet excluded; pending is not a wrong-answer label. |
| HC-04/B invented failed stream with partial text | Partial preserved ungraded; triplet excluded. |
| HC-05/C invented interruption with partial text | Partial preserved ungraded; triplet excluded. |
| HC-06 all arms absent | All three absences and the excluded triplet remain visible. |
| HC-07/A authored issue miss | Second issue-level miss for A, assessment mismatch. |
| HC-08/B correct bounded assessment with omitted contrast | Evidence omission without erasing assessment correctness. |
| HC-09/C unsupported unconditional safety | Unresolved certainty error, separate from protected false-defect denominator. |

A has two issue misses in its individual summary; B has one protected false
defect; C has one unresolved certainty error. These faults were deliberately
injected into named arm slots to exercise distinct counters, not to represent
arm behavior. Their differences must not be interpreted as a skill effect.

## Reproduction and validation

[offline-evidence.json](offline-evidence.json) is actual deterministic execution
of all nine synthetic programs, matched byte-for-byte against the pre-existing
candidate evidence. The drivers observe state before explicit teardown and then
clean up. These code observations are separate from the scripted response text.

[validation.json](validation.json) records executed offline CLI round trips:
`plan`, `validate`, `template`, `packets`, `summary`, and whitelisted `turn` export
for A/B/C. Every command exits zero and matches the API artifact. The CLI here is
this repository's Node offline adapter, **not the Codex/model CLI**. The validator
also rebuilds all archived JSON, verifies hashes and expected denominators, and
reruns candidate observation reproduction. Full repository QA is recorded
separately when performed; the generation record does not claim it in advance.

```bash
npm run evals:runtime:drill
node --test evals/research/runtime/prospective/drill.test.mjs
npm run evals:runtime:prepared

# Generate a new archive directory; existing outputs are refused.
node evals/research/runtime/prospective/drill.mjs generate /tmp/new-hc-offline-drill
```

[artifacts.sha256.json](artifacts.sha256.json) inventories generated JSON only;
this README and a later QA log are not members. Validation requires the pinned recipe/scorer/adapter. The fresh CLI `plan`
command is compared with a separately created fresh plan from the current checkout;
it does not replace or need to equal the archived plan. The remaining CLI commands
use the frozen archived plan and its original anchor, so later candidate, protocol
or guidance changes do not silently substitute new bytes. Existing archived plans
retain their frozen materials. Use the archival recipe version for exact
regeneration; never overwrite a completed archive after source changes to make
validation pass. Scorer/adapter implementation drift still requires a versioned
implementation; arbitrary code from the archive is never executed.

## Independence and outstanding work

All nine candidates, synthetic answers and injected annotations originate in the
same exposed agent research workflow. The author had access to public fixtures,
prior model answers, rubrics and guidance. There is no separate human review,
independent author or private custodian; book/source mapping remains unverified.
The preparation does not satisfy the independent holdout gate. The scripted model
identity `NOT-A-MODEL-scripted-simulation` is a sentinel, not the current selected
model. No actual skill reads, model costs or model latency were measured.

Independent human calibration, independently authored reserved cases and any
future explicitly authorized real-model execution remain separate work. Passing
this drill proves reproducible artifact handling and arithmetic only.
