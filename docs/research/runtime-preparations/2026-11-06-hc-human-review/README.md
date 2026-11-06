# Human fixture review invitation and frozen next-study design

Status: prepared offline on 2026-11-06; **no human review, model execution or
external invitation has occurred in this preparation**. Source is commit
`6318fd6` on `research/domain-packs`; `source.json` records the full commit.

Give the contributor only [participant instructions](participant/README.md),
its linked inputs and blank form for the first pass. This is a semantic review of
two fixture contracts and implementations, not a review of invented model answers.
The pair exercises cancellation during awaited setup with the same finite pool.
The author-selected pair contains one defect and one bounded protected variant;
the participant instructions do not disclose which. Public headings and source
history can identify them: this is not blind or independent holdout validation.

After a timestamped first-pass submission, share the separate
[facilitator instructions](facilitator.md) and authored key. Preserve the first
submission and append feedback separately. No completed human labels are supplied.
[invitation-draft.md](invitation-draft.md) is ready to copy but has **not been sent**.
The collaborator can comment in Discussion #45 or submit a PR with their own
review; participation and publication of their review remain voluntary.

The next study's [design](study-design.md), [frozen plan](plan.json),
[order](execution-order.json), [prompt](prompt.txt) and blank 81-turn response
schedule are frozen together in `artifacts.sha256.json` with an external digest
in `freeze-anchor.json`. These are public drift checks, not signatures or secret
custody. `execution-registration-template.json` is deliberately unbound and
**not runnable**. A future immutable registration and separately reviewed executor
must bind model, reasoning and CLI before any separately authorized execution.
No runnable live executor is added here.

All nine candidates remain exposed, non-independent public development material.
Human review is pending; book mapping is unverified. Receiving a human review does
not retroactively establish independent authorship, private custody or complete
book verification. Passing offline validation verifies artifacts and arithmetic,
not semantic truth or skill efficacy.

Run from the repository root:

```bash
node --test evals/research/runtime/prospective/human-preparation.test.mjs
npm run evals:runtime:prepared
```

`validation.json` records actual offline checks and is outside the immutable
inventory, as are later QA logs. Every frozen artifact is listed in the inventory;
the inventory and anchor do not recursively hash themselves. Preserve these
files; changes require a newly named/versioned preparation, not rewriting this one.
