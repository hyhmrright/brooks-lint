# Campaign collection and semantic review complete

> **Collector correction (2026-11-11):** the reported sweep B artifact/completeness result of 14/15 was caused by joining an abandoned stream fragment to the completed answer. The completed-event result is **15/15**, tied with A; evidence is **45/45**. One runtime response also contained an abandoned prefix, without any score change. All 318 records were audited; other skill results are unchanged. The original results below are retained for audit. See [the correction](collector-correction/README.md).

The maintainer authorized the frozen campaign and explicit recovery. The selected
Codex CLI model and reasoning effort were `gpt-6.1-terra / low`; CLI-selected
identity is not independently attested provider identity. All-skills collected
210 of 210 planned answers, with two failed attempts preserved separately and
explicit recovery of their ordinals. The runtime pack collected 108 of 108 with
no failed attempts. Total known observed tokens: 3,313,206 all-skills plus
1,977,505 runtime = 5,290,711; both failed all-skills attempts have unknown
usage, so actual usage is higher or equal and this is not a billing total.

The original all-skills parent archive is in the [interruption record](../2026-11-10-terra-low-interrupted/README.md).
`raw-recovery-and-runtime.tar.gz` contains the two recovery segments and the
runtime run, including raw records and review packets. SHA-256:
`41d9808f3050e789de3b71e0b91726f7be0c8a1d19658bb8c15fe7985e206d1c`.
Both research schedules completed, but interruptions and recovery can introduce
temporal effects; the first recovery's old source content was not archived
separately, although its source hash is recorded. Verification is consistency
checking, not an independent provider attestation or tamper-proof signature.
Common credential patterns and email addresses were scanned before archiving;
this does not guarantee that every sensitive datum was detected.

**All 318 answers now have individual semantic annotations.** The original single
published review remains unchanged in `annotations-in-progress.json`; the completed
inventories are `annotations-all-skills.json` (210) and `annotations-runtime.json`
(108). Every credited item has an exact answer excerpt, with missing evidence and
unresolved extra claims retained explicitly. See the [results report](report.md),
[per-answer ledger](response-ledger.md), and [review protocol](review-protocol.md).

The evaluated model was CLI-selected `gpt-6.1-terra / low` with Codex CLI
`0.167.0`. The continuation semantic reviewer was `gpt-6-astra`; its reasoning
effort was not independently recorded. Model review is not independent human
validation. Frozen label agreement, issue recall, task criteria, causal evidence,
artifact validity, arithmetic contradictions and pending claims are distinct
outcomes. Complete collection and raw-integrity verification are not proof of
answer quality. The development fixtures are public and same-workflow authored,
not independent holdouts. The studies measure supplied guidance and bounded
artifacts, not native skill discovery or the full autonomous workflow.

## Reproduce the arithmetic without model calls

The historical executor deliberately verifies the exact current checkout sources.
After later guide revisions, reproduce this completed study from its pinned
assessment commit, rather than weakening that execution gate or replacing the
frozen files:

```bash
git worktree add --detach ../brooks-campaign-37fd5a2 37fd5a282df17736541c7c36d109f4ab070bbc8a
cd ../brooks-campaign-37fd5a2
```

From that pinned checkout, extract the original archive and recovery/runtime
archive into a new private directory. Both archives contain top-level run folders.
Use an absolute path to that directory as `RAW_ROOT`, then run:

```bash
node docs/research/all-skills-results/2026-11-11-terra-low-campaign/reproduce.mjs RAW_ROOT NEW_OUTPUT_DIRECTORY
```

The output directory must not already exist. The script verifies the recovered
raw chain and runtime artifacts, checks that the original published annotation
is unchanged, validates all exact citations, and recomputes the two study
summaries, per-response scores, per-skill comparisons, post-hoc witness-equivalence
sensitivity and readable ledger. Compare the generated files to their committed
counterparts. No model or network access is used. This verifies provenance and
arithmetic; semantic truth still requires inspection of the judgments.

The [validation record](validation-record.md) records the independent archive
reconstruction and repository checks. Failed-attempt records remain in the
original archives and are not removed from the execution history.

On a revised checkout, the explicit historical integrity check is:

```bash
node evals/research/campaign-plan.mjs validate-historical evals/research/frozen-campaign.json
```

It compares the retained campaign and sub-study bytes, snapshots, cases and
source hashes to the pinned Git objects. The pinned commit must already exist
locally; the check does not fetch, run a model, grant execution permission or
fall back to the revised sources. Normal current-source registration remains
strict and rejects this historical freeze after a guide change.
