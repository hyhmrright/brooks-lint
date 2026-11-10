# Benchmark source and corpus audit

This directory is evaluator-only research material, not a model input bundle.
`node evals/research/runtime/benchmark-audit/audit.mjs` recomputes the complete
36-case HB inventory and external candidate registry without network or models.
`node --test evals/research/runtime/benchmark-audit/audit.test.mjs` checks the saved
inventory against source bytes. Line counts describe scale, not reasoning difficulty.

`upstream/` preserves five unmodified golden-comment files and their MIT license
from withmartian/code-review-benchmark commit
`e616e849755441da38f18bf3adba2c9583b03803`, retrieved 2026-11-10.
Their labels are upstream assertions, **not locally verified ground truth**.
Each registry entry is quarantined. No entry is included in runnable case counts,
scoring denominators, or live input exports. An upstream license for this dataset
does not settle the license of every target repository's code.

Admission requires verifying the exact reviewed base/head (not the final merged
fix), acquiring the correctly licensed input snapshot, separating later comments
and answers, checking each label against the available contract, and obtaining a
reproduction or documented semantic adjudication. Preserve notes about unavailable
reviewed revisions; do not silently substitute an unrelated original PR. Original
and recreated PRs belong to the same provenance group for splits. Empty labels do
not prove a protected case. This registry is a concrete source acquisition step,
not an assertion that a third-party benchmark has been integrated or run.

Do not execute the upstream fork/judge scripts as part of offline validation:
they can create repositories/PRs and call models. Only data files were imported.

## Combined offline preparation

The adapter below exports either frozen synthetic suite through the same
`files: [{path, content}]` interface. Evaluator IDs, kinds and expected findings
are not in the exported payload. Both freezes are checked. A prepared schedule
is evaluator material and must never be used as a model prompt.

```sh
npm run evals:runtime:benchmark-audit
node evals/research/runtime/benchmark-audit/plan.mjs catalog
node evals/research/runtime/benchmark-audit/plan.mjs export BV-01
node evals/research/runtime/benchmark-audit/plan.mjs prepare calibration 1
```

`prepare` emits deterministic seeded A/B/C turn ordering and input hashes for the
selected split. The full 54-case, three-repetition option has 486 planned turns,
not 486 completed results or a recommended default spend. It intentionally leaves
model, budget, guidance hashes and live runner unset and marks `liveAuthorized`
false. This is an **offline adapter and schedule draft**, not a live executor or
frozen executable study plan. Model/budget confirmation and runner isolation review
are still required. The 18 nominal families are not all statistically independent:
new checkpoints/caches share ownership concepts with old lease/epoch families.
