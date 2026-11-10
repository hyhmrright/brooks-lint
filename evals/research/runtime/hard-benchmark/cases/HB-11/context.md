# Operating context

Prepare at time0 with TTL10. A second acquisition at5 is denied. At10 acquire a replacement (either the same or different worker name), commit its new value, then deliver the first completion. Token generations are monotonic; all shown commits are synchronous.

The deployment contract supplied for review does not specify: The stale-write policy for lease generations: must each write hold the current generation, or are completed values from older generations accepted? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
