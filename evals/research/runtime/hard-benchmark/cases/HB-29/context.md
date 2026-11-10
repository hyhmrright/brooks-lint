# Operating context

The policy module defines physical attempt and backoff limits. A transport can lose its acknowledgement after the synchronous receive operation commits. Retrying preserves the logical idempotency key. Receive, cache update and ledger mutation are one synchronous operation in this model; crash atomicity is not under review. A shared monotonic clock drives retries and cache expiry.

The deployment contract supplied for review does not specify: The idempotency guarantee: is local cache retention required to cover the complete configured retry horizon, or is this cache only best-effort duplicate suppression with repeated effects allowed after eviction? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
