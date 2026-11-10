# Operating context

Prepare at time0 with TTL10. A second acquisition at5 is denied. At10 acquire a replacement (either the same or different worker name), commit its new value, then deliver the first completion. Token generations are monotonic; all shown commits are synchronous.

Contract: A writer may commit only under the exact current monotonically increasing lease generation for the key. Worker names are reusable after restart. Read and write values are atomic in this in-memory store; the lease check and mutation occur synchronously in commit.
