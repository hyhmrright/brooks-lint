# Corrected protected controls — offline collector revision 2

**SUPERSEDED RUNNER by `../offline-drill-r3/`.** The archive content and its
108 records were verified, but this old CLI entrypoint can silently do nothing
when invoked through a symlink or `/tmp`/`/var` alias. Use a canonical source path
for r2 reproduction; do not treat exit code zero without output/report creation
as a successful verification. All original archive bytes remain unchanged.

**SIMULATION ONLY.** No real model or login was used. All 108 protocol responses
are authored fake-CLI output, and all semantic annotations deliberately award no
credit. The 10,800 usage counter is synthetic, not billing or model consumption.

The shared protected repository now exercises delimiter collisions, both route
orders, returned domain identities, read reuse and unauthorized-request isolation.
Its six protected variants kill ambiguous-delimiter and disabled-cache mutants.
The previous archive remains unchanged under `../offline-drill/`, marked
superseded; there are no real model answers to regrade.

- Current case freeze: `cedb1f3204799848638dd6d714899c4117597480bdfc541be73de5d566266f34`.
- Schedule: 36 cases × three arms × one repeat; all 108 collected and reviewed as synthetic controls.
- Cases: 18 regressions + 18 related challenges; no independent holdouts.
- Suite tests: 12/12; collector tests: 9/9.
- Synthetic CLI identification: 0.167.1, emitted by the checked-in fake CLI run with Node.
- No model-generated code is executed.

The archive contains every intent, raw protocol record, receipt, sealed
registration, frozen case/rubric/prompt, review packet, synthetic annotation and
report. `source-snapshots/` preserves all registration source hashes plus required
transitive modules, authored fixtures and test controls with repository-relative
paths. `source-snapshots.json` hashes those source copies. Snapshot-based verification
and report regeneration passed; the regenerated report is byte-identical.

Extract to a fresh directory. From this result directory verify the archive:

```sh
shasum -a 256 -c SHA256SUMS
```

Then use the archived source tree rather than assuming a future checkout matches:

```sh
BROOKS_R2_ROOT="$(cd /tmp/extracted/skills-v2-collector-drill-r2 && pwd -P)"
node "$BROOKS_R2_ROOT/source-snapshots/evals/research/skills-benchmark-v2/campaign.mjs" verify "$BROOKS_R2_ROOT"
# Require the displayed JSON to contain completed: 108; use a fresh report path.
node "$BROOKS_R2_ROOT/source-snapshots/evals/research/skills-benchmark-v2/campaign.mjs" review "$BROOKS_R2_ROOT" "$BROOKS_R2_ROOT/annotations.json" /tmp/new-r2-report.json
test -s /tmp/new-r2-report.json
cmp /tmp/new-r2-report.json "$BROOKS_R2_ROOT/report.json"
```

These commands do not call a model. Passing simulation checks proves collection,
receipt and aggregation behavior only; it does not establish skill effectiveness.
