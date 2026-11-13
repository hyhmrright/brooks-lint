# V5 offline preparation evidence

No real model was invoked. `synthetic-raw.tar.gz` contains `v5-offline-format-final/` with
all 324 fake-CLI answers, registration, raw events, intents, receipts, synthetic
annotations and metrics, plus four stop-control runs. `synthetic-summary.json`
records 324/324 completions in the success simulation; retry, wrong model,
unknown usage and budget each stop after one submission with 323 not-run slots.
Synthetic answers are not diagnostic judgments and must not be interpreted as
skill accuracy. The fake scorer path and its outputs are protocol controls only.

`targeted-tests.log` records 30 initial targeted passes. After source-drift
admission hardening and protected sweep test-inventory corrections,
`source-drift-guard.log` and `final-freeze-tests.log` record the corresponding final
checks; the entire synthetic drill was rerun on the final freeze.
`v4-migration.log` records 16 historical suite tests passing. Superseded successful
synthetic runs remain in ignored local workspace; no historical model artifact
was replaced. Full repository QA and actual authored Docker checks are subsequent
explicit gates, not claimed by these preparatory logs.

Final freeze SHA-256:
`1dabadb774478e3d80b38ecab492c002f02038f20abbc962a9b48aaa11d5b1fe`.
Registration SHA-256:
`e1fd7864864137111f74a0f045dca627e64f70688048ac832a26220ba3624fd2`.
The registration verifies offline for `gpt-6.1-terra / low`, CLI `0.167.1`,
324 submissions, 12,000,000 observed tokens, 12 hours total, 120 seconds per turn.
This proves local source/toolchain binding, not current backend availability.

Extract the archive into a fresh directory and run:

```sh
node evals/research/skills-benchmark-v5/campaign.mjs verify EXTRACTED/v5-offline-format-final/success
node evals/research/skills-benchmark-v5/campaign.mjs review EXTRACTED/v5-offline-format-final/success EXTRACTED/v5-offline-format-final/success/annotations.json FRESH_ASSESSMENT.json
node docs/research/skills-benchmark-v5-validation/verify-history.mjs
```

The final assessment must match the archived success/assessment.json. The history
checker pins 545 existing artifacts independently of new benchmark files.

QA repair: negative controls now require an admitted, completed nonzero assertion
receipt with confirmed cleanup and no infrastructure failure. Admission refusal
is no longer reported as executed candidate code. A no-answer annotation cannot
pass the primary endpoint through contradictory issue/criterion credits.
`qa-repair-targeted.log` records these regressions and final suite checks; all 324
synthetic answers and four stop controls were recollected after resealing.
Earlier QA and Docker records remain separate evidence of the pre-repair check.

Final formatting correction: BV5-28/29 contract endings changed from semicolon
plus trailing space to a period. No obligation, executable source or grading rule
changed. The eight suite tests passed (`final-contract-format-tests.log`), the
source-bound freeze/registration were regenerated, and all 324 synthetic records
plus four stop controls were recollected. `final-contract-format-replay.json`
records author replay of all five freshly extracted assessments. Earlier independent
QA logs and Docker records are retained as their original snapshots.
