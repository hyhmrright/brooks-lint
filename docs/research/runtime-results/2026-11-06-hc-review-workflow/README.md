# Synthetic reviewer exchange rehearsal

**SIMULATED REVIEWS — NOT HUMAN CALIBRATION OR MODEL EVALUATION.** This archive
uses the previously committed [27 scripted answers](../2026-11-06-hc-offline-drill/README.md)
on HC-01–HC-09. It does not run a responding model or change the frozen source.
Two named “reviewers” and the “adjudicator” are script-authored roles from the same
exposed agent workflow, not independent people or independent model judgments.
All labels, disagreements and decisions were deliberately injected to exercise
artifact handling. Agreement and adjudication do not establish semantic truth.

[source.json](source.json) identifies the committed source and pins both the plan
and the exact source-response document digests. Hashes detect drift against trusted
anchors; the publicly stored anchors are neither signatures nor private custody.
The candidates remain non-independent public development material. Human review,
independent holdouts and book/source verification remain pending. No live model
calls, model costs, latency or actual skill reads are measured.

## Preserved exchange

- `blank-reviewer-A.json` and `blank-reviewer-B.json`: 27 pending rows each, with
  packet IDs and exact answer hashes; blank forms are not completed reviews.
- `reviewer-A.json` and `reviewer-B.json`: authored synthetic labels, notes,
  rationale and exposure. The three disagreements intentionally exercise evidence
  completeness, assessment/issue matching and unsupported certainty. One row
  remains unreviewed by simulated reviewer B.
- `comparison.json`: 23 annotation agreements, three disagreements and one pending
  row, with differing axes. Unordered issue/evidence/severity/concern inventories
  compare by content, so array/object ordering does not fabricate disagreement.
- `decision-template.json`: pending decisions only. `decisions.json`: three explicit
  scripted decisions with rationale and exact answer excerpts; the fourth stays
  pending. Choosing the first role is an authored test choice, not a truth rule.
- `before-adjudication.json`: five complete triplets. All four unresolved rows are
  ungraded in the new revision; the complete originals remain in its audit.
- `after-adjudication.json`: eight complete triplets; the one unreviewed row still
  excludes its triplet. Both submitted forms, old source reviews, comparison and
  decisions are retained alongside the new response revision and metric axes.

The certainty dispute intentionally misreads an existing conditional answer; it
is a deliberately contested exercise label, not a new claim that the answer
contains an actual unsupported assurance. These counters measure workflow states,
not reviewer reliability, inter-rater population agreement or runtime-skill benefit.

Forms use the [existing partial-masked answer packets](../2026-11-06-hc-offline-drill/review-packets.json).
They omit arm names and expected labels; notes can be recorded before consulting
separate frozen rubrics for annotation IDs. Public input paths, identical answer
content and recomputable IDs can reveal cases/arms. This is partial masking only;
no blindness is claimed. Save first-pass notes as their own revision before
consulting rubrics if an actual exercise is conducted later.

## Offline workflow

```bash
npm run evals:runtime:reviews:validate
node --test evals/research/runtime/prospective/reviews.test.mjs
```

The CLI accepts `form`, `compare`, `decisions` and `merge`, each with a JSON request
path and a **new** output path. Existing outputs are refused. Example request:

```json
{
  "plan": "/absolute/path/to/plan.json",
  "source": "/absolute/path/to/responses.json",
  "trusted_plan_sha256": "retain literal frozen plan hash separately",
  "trusted_source_responses_sha256": "retain exact response document hash separately",
  "reviewer": {
    "id": "reviewer identity",
    "method": "method, including human or model and whether synthetic",
    "exposure": "authorship, prior answers, rubrics and guidance exposure"
  }
}
```

```bash
npm run evals:runtime:reviews -- form /tmp/request.json /tmp/new-form.json
```

For `compare` and `merge`, add `forms` with exactly two submission file paths.
For `decisions`, also provide `adjudicator` with `id`, `method`, `exposure`.
For an adjudicated `merge`, add `decisions` with the decision document path;
omitting it leaves all conflicts/pending rows ungraded. A decision may choose an
explicit reviewer ID or `custom` with a fully validated annotation. Completed
choices require rationale and exact excerpts (except an exactly empty answer).
A missing selected reviewer annotation is rejected. Original responses are never
overwritten by the CLI; the merge envelope preserves the source-response digest,
original forms and previous source reviews. Preserve source documents themselves.

Only successfully executed rows can be reviewed, including exact empty answers.
Failed or interrupted partials survive unchanged. Missing form entries mean pending,
not agreement or a false answer. Imports reject stale source/answer/review digests,
duplicate IDs, unplanned packets, missing provenance and invalid rubric inventories.
The deterministic tools validate schema and arithmetic, not the truth of reviews.

`validation.json` records actual offline Node CLI round trips. `implementation.json`
pins new implementation hashes, and `artifacts.sha256.json` inventories generated
JSON only. This README and later QA logs are outside that inventory. Rebuild into a
new directory with `node evals/research/runtime/prospective/reviews-drill.mjs generate NEW_DIRECTORY`.
Exact archival reproduction requires this versioned implementation; do not rewrite
completed archives to fit new implementations. No historical source, scorer,
prototype, 43-case runner or recorded model study was modified.

To fill annotation inventories, use the packet's supplied case input paths to
locate the corresponding `study.cases[].rubric.content` in the separate frozen
plan. Expected finding IDs, evidence requirement IDs and allowed severities come
from those frozen rubrics. The annotation shape and boolean/quote conventions are
specified in [calibration documentation](../../../../evals/research/runtime/calibration/README.md)
and `validateExample` in the frozen scorer. Copying a prior review is appropriate
only for this labelled simulation; real reviewers must supply their own judgment.
