# Operating context

A registry coalesces concurrent lookups for the same key. Waiter IDs are unique within the flight; this workload joins its waiters before any cancellation or completion. Each waiter may cancel independently, repeatedly, or not at all. Different-key flights coexist. Completion may follow cancellation; a new lifecycle starts only after the prior flight is removed.

The deployment contract supplied for review does not specify: Cancellation ownership for coalesced work: are waiters independent, or does any member have authority to cancel the group? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
