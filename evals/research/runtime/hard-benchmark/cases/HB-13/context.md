# Operating context

A coalescing queue accepts entries with heterogeneous absolute deadlines. It supports replacing or cancelling a queued item before a flush. Flush atomically detaches the current valid generation of each item. The scheduler may delay flush; callers do not control other members deadlines. No callback interleaves within synchronous flush.

Contract: Each entry has its own absolute admission deadline. Sending a batch does not merge ownership or extend an entry deadline. At dispatch time entries with deadline <= now must not be sent; valid entries must remain eligible. Backend processing after admission is outside this contract.
