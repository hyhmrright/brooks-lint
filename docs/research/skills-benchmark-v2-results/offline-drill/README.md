# Authored offline collector exercise — 2026-11-12

**SUPERSEDED by `../offline-drill-r2/`.** The earlier protected shared-repository
tests did not kill delimiter-key collisions. This original archive is retained
unchanged for audit, not current benchmark evidence. It did not retain a complete
source snapshot; current strict-source verification may reject it after changes.
Do not claim the current checkout reconstructs its old report byte-for-byte.
The commands below describe the original matching-source workflow only.

**SIMULATION ONLY. No real model, login credentials or provider was contacted.**
The archive retains all 108 authored fake-CLI answers, intents, raw protocol
records, receipts, registration, review packets, synthetic annotations and report.
Every synthetic judgment is `no-answer` and provides no semantic credit; it tests
the reporting pipeline rather than skill effectiveness. The recorded 10,800 tokens
are fixture-supplied counters, not actual model usage or billing.

- Schedule: 36 cases × three arms × one repeat.
- Completed: 108; failed: 0; unrun: 0.
- CLI identity: the authored protocol fixture reports 0.167.1; the executable is
  local Node, with explicitly simulation-only binary identities. This is not a
  claim that 108 real Codex model turns ran.
- Case freeze: `085aa9151b703b9ad01e020b63a194858ef7a9b017e2676d7705316a4acf32b9`.
- All arms receive the same public schema and scorer capability. Fake answers do
  not diagnose the case inputs and are not used to compare skill quality.
- Returned model patches are never executed by this collector.

The separate unit controls cover first-failure stopping, unknown usage stopping,
budget admission, raw-record tampering, missing/simulated probe rejection and
mandatory scorer receipts. They are not hidden retries in this archived run.

At the commit containing this archive, extract it to a fresh directory and verify:

```sh
shasum -a 256 -c SHA256SUMS
node evals/research/skills-benchmark-v2/campaign.mjs verify /tmp/extracted/skills-v2-collector-drill
node evals/research/skills-benchmark-v2/campaign.mjs review /tmp/extracted/skills-v2-collector-drill /tmp/extracted/skills-v2-collector-drill/annotations.json /tmp/new-simulation-report.json
```

Compare the new report byte-for-byte with the archived `report.json`. Source
hashes intentionally require the matching checkout; future source changes must
not silently reinterpret this registration.
