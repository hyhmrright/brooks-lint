# Canonical CLI entrypoint — offline collector revision 3

**SIMULATION ONLY.** All 108 responses and their usage counters are authored fake
CLI output. No real model or login is used, and synthetic annotations award no
semantic credit. This exercise tests collection and reporting, not skill efficacy.

This archive supersedes r2's runner, preserving every previous archive byte. QA
verified that r2 content was valid with canonical source paths, but found the old
CLI could silently exit without verifying or writing a report through symlinks or
macOS `/var`/`/private/var` aliases. Suite and collector entrypoints now compare
canonical `realpathSync` paths. Tests require actual verify JSON, an actual newly
written review report and an actual freeze file; exit code zero alone is not proof.

- Case freeze: `933cf78cc7abe9c90457d756eabdc1d3dd790693758080e210f9fa8182bae6b4`.
- Schedule: 36 cases × three arms × one repeat; 108/108 collected and synthetically reviewed.
- Cases: 18 regressions + 18 correlated repository challenges; independent holdouts: zero.
- Suite: 13/13 tests; collector: 9/9, including symlink verify and review execution.
- Synthetic token counter: 10,800; not model usage or billing.
- Synthetic reported CLI version: 0.167.1, emitted by a fixture running under Node.
- No returned model code is executed.

All intents, raw protocol records, receipts, frozen prompts/rubrics, annotations,
packets and report are retained. `source-snapshots.json` hashes **385** source and
fixture files under `source-snapshots/`, including every registration source hash
and required imports. The registration was regenerated after the separate probe
entrypoint fix; it binds that updated source. This does not claim a real probe has
run or passed. The separate real-probe plan remains awaiting user authorization.

Snapshot verification through a symlink printed 108 completed records. Snapshot
review through that same symlink created a new report byte-identical to the
archived report. To reproduce, extract into a fresh directory:

```sh
shasum -a 256 -c SHA256SUMS
node /tmp/extracted/skills-v2-collector-drill-r3-final/source-snapshots/evals/research/skills-benchmark-v2/campaign.mjs verify /tmp/extracted/skills-v2-collector-drill-r3-final
node /tmp/extracted/skills-v2-collector-drill-r3-final/source-snapshots/evals/research/skills-benchmark-v2/campaign.mjs review /tmp/extracted/skills-v2-collector-drill-r3-final /tmp/extracted/skills-v2-collector-drill-r3-final/annotations.json /tmp/new-r3-report.json
test -s /tmp/new-r3-report.json
cmp /tmp/new-r3-report.json /tmp/extracted/skills-v2-collector-drill-r3-final/report.json
```

Require verify output to report `completed: 108` and use a fresh report path.
These commands use sealed source and call no models.
