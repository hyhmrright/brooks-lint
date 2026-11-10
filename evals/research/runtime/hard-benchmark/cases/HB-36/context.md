# Operating context

Request failures can schedule delayed retries. Shutdown can occur while attempts are active, while timers are owned but pending, or after a timer callback has been dequeued before it executes. Timer cancellation only removes queued callbacks; it cannot retract an already-dequeued function. Repeated shutdown is allowed. The scheduler executes one callback at a time.

Contract: Shutdown closes admission and resolves only when no active attempt and no scheduled retry can later start. Retry timers are request work, not unrelated maintenance timers. Cancelling a timer removes it from the owned pending set. Shutdown does not require successful completion of cancelled requests.
