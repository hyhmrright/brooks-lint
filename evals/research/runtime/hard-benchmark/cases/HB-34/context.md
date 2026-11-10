# Operating context

Request failures can schedule delayed retries. Shutdown can occur while attempts are active, while timers are owned but pending, or after a timer callback has been dequeued before it executes. Timer cancellation only removes queued callbacks; it cannot retract an already-dequeued function. Repeated shutdown is allowed. The scheduler executes one callback at a time.

The deployment contract supplied for review does not specify: The shutdown ownership boundary: does drain cover delayed retry work or only the currently active transport attempts? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
