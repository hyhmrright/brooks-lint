# v4 offline preparation and validation

All records here are offline. The fake CLI has `simulation:true`, synthetic model `gpt-fixture`, no real credentials and no live model calls. Fake answers do not measure semantic performance.

- `campaign-restricted.log`: retained failed attempt under restricted process inspection. Four process/cleanup assertions failed; this is not a model result.
- `offline-v4.log`, `offline-v4-final.log`, `offline-v4-frozen.log`: successful intermediate targeted suites during development; they are not the final freeze's sole evidence.
- `offline-v4-sealed.log`: preliminary targeted suite before the sandbox inspection/cleanup fixes, against its then-sealed prospective freeze, including the stale-freeze guard, semantic metric accounting, 108-turn fake collection, failure-stop controls and mocked sandbox checks.
- `sealed-drill.log` and `sealed-drill.tar.gz`: preserved preliminary synthetic capture before the sandbox inspection/cleanup fixes; not bound to the final source/freeze; includes 108 successful answers and four separate first-turn stop controls (retry, wrong model, unknown usage, observed-token admission budget). Every stop preserves the remaining 107 slots. All review annotations in this archive are explicitly non-semantic synthetic controls.
- `drill.log`: intermediate development drill log only; do not use it as final frozen evidence.
- `offline-v4-resealed.log`, `resealed-drill.log` and `resealed-drill.tar.gz`: final post-fix targeted validation and full synthetic capture, bound to the final source/freeze. The earlier captures stay historical and may require their matching old source snapshots for replay.
- `registration-resealed-check.log` and `drill-resealed-replay.log`: final offline registration and synthetic record integrity verification.
- `structural-evals.log`: repository structural scenarios; these do not establish semantic skill effectiveness.

The full repository QA gate is recorded separately by the consistency QA stage before commit. The standalone real Docker controls are in [the sandbox evidence directory](../skills-benchmark-v4-artifact-sandbox/README.md); they are authored local probes, not model outputs.

To inspect/replay the final synthetic capture, extract `resealed-drill.tar.gz` to a fresh directory. For each of `success`, `retry`, `wrong-model`, `unknown-usage` and `budget`, run:

```sh
node evals/research/skills-benchmark-v4/campaign.mjs verify EXTRACTED/campaign-v4-resealed-drill/MODE
node evals/research/skills-benchmark-v4/campaign.mjs review EXTRACTED/campaign-v4-resealed-drill/MODE EXTRACTED/campaign-v4-resealed-drill/MODE/annotations.json FRESH_ASSESSMENT
```

A repeated archive review validates integrity and arithmetic, not independent semantic judgment. Historical v2/v3 files and the original 108 answers remain byte-identical, checked against `historical-hashes.json`.

## QA loopback

The initial full QA correctly rejected the stale prospective freeze after sandbox boundary repairs. The final freeze and registration were regenerated after those source changes; a new 108-answer synthetic rehearsal and four stop controls were captured without overwriting the preliminary records. Full repository QA is rerun afterward. No real model requests were made.

## Final QA

[QA.md](QA.md) records the complete PASS gate after the artifact-boundary repair and reseal. `qa-gate-logs.tar.gz` retains both the initial stale-source failure and the successful full rerun. Initial concrete findings and the inspection-size reproduction remain alongside the final report. The final source-bound fake capture is `resealed-drill.tar.gz`; use the updated replay instructions above. No real model calls were made.
