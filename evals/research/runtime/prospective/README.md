# Prospective candidate study adapter, revision 1

This **offline-only** adapter prepares a separate study of HC-01–HC-09 using
[runtime scoring protocol v1](../../../../docs/research/runtime-scoring-protocol.md).
It never starts Codex, another model, a network request or imported code. It does
not extend the historical RT runner, change `liveRunnerIntegration: false`, grant
permission for a later live run, or modify existing plans/results. There is no
completed model study for these candidates. Selftests use explicitly authored
synthetic text and injected labels, never observed model performance.

All candidates remain public, exposed, non-independent development material.
Same-session authorship, prior examples/answers and guidance exposure, pending
human review and unverified book mapping remain recorded in every plan. This
adapter does not meet the independent holdout gate.

## Freeze a fresh plan

Create a local JSON config (do not copy this synthetic model identifier into a
real plan):

```json
{
  "study_id": "offline-preparation-example",
  "intended_model": "NOT-RUN-specify-before-any-future-study",
  "reasoning": "specify-before-any-future-study",
  "author": "name and method of plan preparation",
  "exposure": "Same exposed development workflow; public fixtures and rubrics",
  "case_ids": ["HC-01", "HC-02", "HC-03"],
  "repetitions": 3
}
```

```bash
npm run evals:runtime:prospective -- plan /tmp/config.json /tmp/hc-plan.json
```

Omitting `case_ids` selects all nine; omitting `repetitions` selects three.
The plan freezes exact whitelisted input bytes, separate rubrics, public candidate
manifest, protocol, schema object, scorer and adapter source, all core Markdown
skills/shared guidance and runtime prototype revision 2. The full selected
case/repetition schedule implies A/B/C for every row:

| Arm | Available material |
| --- | --- |
| A | Case inputs only; no skill guidance |
| B | Same case inputs and core skills/shared guidance |
| C | Same case inputs, core skills/shared guidance and runtime prototype rev 2 |

Availability is not evidence of actual skill reads. No environment isolation,
prompt execution or provider authentication is performed here. A future executor
needs a separately reviewed isolation and execution-evidence contract. `turnInputs`
exports only the exact case whitelist and that arm's guidance; it excludes rubrics,
metadata, expected observations, source tests, scoring materials and provenance.
Do not supply the whole plan as model context.

Retain `study_sha256` from the frozen plan in a trusted separate record. Commands
below use `TRUSTED_DIGEST` as a placeholder for that literal hash:

```bash
npm run evals:runtime:prospective -- validate /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-validated.json
npm run evals:runtime:prospective -- template /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json
```

Every output path must be new; existing files are never overwritten. CLI `turn`
also accepts a JSON `{ "case_id": "HC-01", "repetition": 1, "arm": "A" }` file
and writes the whitelisted material:

```bash
npm run evals:runtime:prospective -- turn /tmp/hc-plan.json TRUSTED_DIGEST /tmp/turn.json /tmp/turn-inputs.json
```

Hashes detect changes against a trusted frozen digest. They are not signatures,
proof of source authenticity, secret custody or resistance to an attacker replacing
both an artifact and its trusted anchor. Self-consistency validation alone cannot
prove independence or correct semantics. Existing plans use their own frozen bytes;
imports do not silently replace those bytes with newer candidate/guidance files.
The local scorer and adapter implementations must still match their frozen hashes;
version the adapter rather than executing arbitrary code from a plan snapshot.

## Record responses and review

The template creates all scheduled arm rows as `not-run`, with empty answer and
its SHA-256, null model report, execution evidence and review. It contains no
synthetic answer pretending to be a model run. It is an editable *working copy*;
archive each imported revision separately. Every import names the exact frozen
`plan_sha256`; unknown or duplicate turns and undeclared fields are rejected.
Missing rows, including wholly missing triplets, remain explicit exclusions.

For a later authorized recorded execution preserve exact answer bytes (do not
trim or normalize), their SHA-256, and status `executed`, `failed` or `interrupted`.
Failed/interrupted partial text is retained ungraded. An independently evidenced
successful execution may have an exactly empty or whitespace-only answer; retain
those bytes and their hash. A reviewer may mark it incomplete, and it remains in
eligible paired completion/assessment denominators rather than becoming an
execution failure. Execution success and answer completion are separate claims.
Model evidence is an object
`{model, reasoning, source}` of nonempty strings. It is **reported identity**, not
verified identity; retain observed differences from the intended model rather
than overwriting them. `execution_evidence` has nonempty `source`, an
`artifact_sha256` of the retained external raw artifact, and nonempty
`status_basis` describing why the reported status applies. References/digests do
not prove that the external execution occurred or that its declared status is
true; this adapter does not fetch, parse or authenticate those external artifacts.
Keep the raw source artifact alongside the study archive for review.

Only successful executions may carry a `review`. Null review means pending, not
incorrect or complete. A review requires `reviewer`, `method`, `exposure`,
`rationale`, exact `answer_sha256` and a semantic `annotation` matching
[`validateExample`](../calibration/scoring.mjs). The annotation fields and examples
are documented in the [calibration materials](../calibration/README.md).
Expected issue IDs, evidence requirement IDs and allowed severity come from that
case's frozen rubric. No keyword parser supplies semantic labels. Keep reviewer
disagreement, exposure and alternative interpretations in separately archived
review revisions, never silently replace completed study judgments.

```bash
npm run evals:runtime:prospective -- packets /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json /tmp/hc-packets.json
npm run evals:runtime:prospective -- summary /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json /tmp/hc-summary.json
```

Reviewer packets contain successful exact answers/hashes and supplied case inputs;
they omit arm, guidance, plan schedule mapping, model report, review annotation,
expected case labels and rubric. A reviewer can write first-pass notes before
consulting frozen rubrics for the annotation inventory. Packet hash ordering
removes original schedule order. This is partial masking only: public input paths,
answer content and publicly accessible source mappings can reveal cases or arms.
A deterministic packet ID is recomputable, not a secret. No human calibration or
independent review is claimed by generating packets.

Summaries bind the complete response document digest, use the full frozen schedule
and retain all axes from `compareTriplets`: all planned/absent turns, explicit
triplet exclusions, paired and individual-arm execution/review denominators,
assessment, recall, false negatives, false assertions, evidence and severity.
An executed but incomplete annotated answer remains paired. Failed, missing or
pending-review arms exclude the triplet. No composite score or historical rescore
is introduced. Empty denominators are null. Repetitions remain responses rather
than independent cases; these arithmetic outputs cannot establish model benefit.

## Offline validation

```bash
npm run evals:runtime:prepared
node --test evals/research/runtime/prospective/study.test.mjs
```

Tests cover whitelist/arm isolation, byte drift in inputs/rubric/protocol/guidance/
scorer, external trust anchors, prohibited independence promotion, duplicate and
unplanned turns, partial failed text, pending review, wholly absent triplets,
executed incomplete pairing, annotation provenance, packet omissions and exclusive
CLI output creation. They invoke only this offline CLI, never a model/provider.

## Saved nine-candidate synthetic drill

The [offline end-to-end archive](../../../../docs/research/runtime-results/2026-11-06-hc-offline-drill/README.md)
saves a frozen all-nine, 27-turn simulated exercise, separately injected boundary
scenarios, reviewer packets and actual offline CLI validation. `npm run
evals:runtime:drill` verifies its generated artifacts. All answers and labels are
authored simulations, not responding-model outputs or independent validation.
