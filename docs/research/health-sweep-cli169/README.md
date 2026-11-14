# CLI 0.169.0 scope retest binding

This derivative retains the original scope retest's eight cases, both prompts, private rubrics, guidance snapshots, schedule, model, effort, assessment policy, and 4,500,000 observed-token / 3-hour / 120-second-per-turn budget. `provenance.test.mjs` compares these structures with the frozen original, SHA-256 `1daab46dd93ef747b71a56146dea3f6513045ca5f31a96d0fed3885ef00778a1`. The previous preflight failed before output creation and before any model request because CLI 0.167.1 was absent. This is a new CLI binding, not a claim that CLI versions have equivalent behavior.

The new freeze requests gpt-6.1-terra / low and binds the real CLI 0.169.0 and code-mode-host hashes and explicit proxy digest. Body SHA-256: `3aa833824f497cb99b3de69bc657147c0d489d2aef4e10d8b88554734e186d46`. First execution/identity/retry/cleanup/verification failure stops immediately, no automatic retry, and a fresh output path is mandatory. Observed-token admission may overshoot by one admitted call; it is not a billing cap. Tool access and public contract are identical across arms. There is no independent provider identity attestation.

Offline tests: `targeted-tests.log` has 18 passing tests including 48 injected turns and seven stopping controls. `raw-simulation.tar.gz` SHA-256 `b0cd826cde8ee0bbc795ef7f58036b782c5c9b77bd844fdbfbb32b7248d189fa` contains synthetic data only. A real 0.169.0 CLI communicated with one local fake upstream request without credentials, produced synthetic text, and confirmed process-group/private-home cleanup; `real-cli-fake-upstream.log` and archive SHA-256 `08c82aa548f869fb12841c539277286d441ed6a188ce0f0454403d7230d86d4f` preserve the record. That run tested ordinary response transport, not real CLI dynamic-tool invocation. Dynamic tool exchange was tested using the fake app-server; first provider-side live dynamic tool use remains unverified. No live model call occurred in preparation.

After QA, execute with a fresh directory and explicit authorization:

```
node evals/research/health-sweep-cli169/runner.mjs execute _workspace/health-sweep-cli169-live --live
node evals/research/health-sweep-cli169/runner.mjs verify _workspace/health-sweep-cli169-live
node evals/research/health-sweep-cli169/review.mjs packets _workspace/health-sweep-cli169-live _workspace/health-sweep-cli169-packets.json
node evals/research/health-sweep-cli169/review.mjs assess _workspace/health-sweep-cli169-live _workspace/health-sweep-cli169-annotations.json _workspace/health-sweep-cli169-assessment.json
```

Judge each completed answer against the sealed rubric and CRITERIA, preserve failed raw records and partial denominators, distinguish tool compliance, semantic quality and strict versus normalized delivery. No model-generated patch is executed. The calibration cases are not independent holdouts; no causal before/after claim is justified.
