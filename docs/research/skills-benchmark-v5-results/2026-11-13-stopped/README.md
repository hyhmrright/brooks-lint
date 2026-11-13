# V5 live collection stopped

The authorized `gpt-6.1-terra / low` run stopped on 2026-11-13 at ordinal 79 (BV5-27, arm C, repeat 1), when the CLI reported a stream disconnect, `Connection refused (os error 61)`, and `willRetry: true`. The collector stopped without a replacement submission. Process cleanup confirmed the group absent and the private home removed. The failed request has unknown token usage.

Seventy-eight answers completed, one request failed, and 245 were not run. The observed total of 1,315,995 tokens excludes unknown failed-request usage. The selected model and effort are recorded client metadata, not independent backend attestation. `raw-run.tar.gz` preserves registration, intents, raw events, answers, failure and execution state; its SHA-256 is `d899daa452628e214f3426abd91954df926de7842837e01779763eaaa511431e`.

Offline `node evals/research/skills-benchmark-v5/campaign.mjs verify <run-directory>` verified all 324 planned records and 78 completed answers. Semantic adjudication remains pending: no skill accuracy, recall, false-positive or comparative effectiveness claim is made here. No automatic resumption is authorized by the frozen stop rule.
