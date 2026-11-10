# Operating context

A coalescing queue accepts entries with heterogeneous absolute deadlines. It supports replacing or cancelling a queued item before a flush. Flush atomically detaches the current valid generation of each item. The scheduler may delay flush; callers do not control other members deadlines. No callback interleaves within synchronous flush.

The deployment contract supplied for review does not specify: The batch admission policy: do entry deadlines remain independent, or does joining a coalesced batch transfer admission to the latest batch deadline? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
