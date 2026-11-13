# Stopped v4 live collection

On 2026-11-13 the authorized gpt-6.1-terra / low campaign stopped at ordinal 39 (BV4-13, arm C) after `Smoke deadline exceeded`. Thirty-eight answers completed, one failed, and 69 were not run. The failed turn has unknown usage; the 578,158 observed token total excludes that unknown usage. Cleanup reported process group absent and private home removed. No automatic retry occurred.

`raw-run.tar.gz` preserves the original complete run directory, including registration, raw answers, events, failed record, state and review packets. `node evals/research/skills-benchmark-v4/campaign.mjs verify <extracted>/campaign-v4-live` verified 108 planned records and 38 completed. Model/effort are client-selected metadata, not independent backend attestation.

Semantic adjudication of the 38 completed answers is pending. No accuracy, missed-issue or false-positive statistics are claimed. The stop does not authorize resumption or replacement calls under the frozen plan.
