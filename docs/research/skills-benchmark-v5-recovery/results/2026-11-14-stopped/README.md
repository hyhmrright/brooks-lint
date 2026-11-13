# Stopped v5 recovery collection

On 2026-11-14 the authorized `gpt-6.1-terra / low` recovery stopped at ordinal 200 (BV5-31, arm C, repetition 2), its 122nd attempt. The CLI reported a disconnected response stream, connection refused (os error 61), and `willRetry: true`. The collector stopped without another submission. Process group absence and private-home cleanup were confirmed. Failed-request usage is unknown.

The recovery completed 121 answers, failed once, and left 124 unrun. Together with the preserved original segment, 199 answers are complete. Cumulative observed usage is 4,284,856 tokens, excluding unknown usage for both failed requests; cumulative recorded execution time is 4,587,374 ms. Client-selected model identity is not independent backend attestation.

`raw-recovery.tar.gz` retains the recovery plan, intents, raw events, answers, failed record, receipts and state. Its SHA-256 is `e9328cfdf0eb01e11d4d864852abe4d8949a0bfe5ba756d58ff93aed30ba9484`. The original 78 answers, prior failure and adjudications remain in the separately preserved original archive and report. The recovery verifier confirms the counts and retained provenance.

The 121 new answers have not yet been semantically adjudicated. No combined skill accuracy, recall, false-positive or effectiveness result is claimed. The frozen plan forbids automatic resumption; any further recovery needs a separate reviewed plan.
