# Operating context

The policy module defines physical attempt and backoff limits. A transport can lose its acknowledgement after the synchronous receive operation commits. Retrying preserves the logical idempotency key. Receive, cache update and ledger mutation are one synchronous operation in this model; crash atomicity is not under review. A shared monotonic clock drives retries and cache expiry.

Contract: A logical operation may be retried for 100 ms after its first send with the same idempotency key. Dedupe entries must cover that whole retry horizon, even when the first acknowledgement is lost. The ledger records business mutations; transport timeouts do not roll them back. No secondary durable dedupe exists.
