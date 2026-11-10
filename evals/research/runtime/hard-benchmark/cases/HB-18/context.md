# Operating context

A registry coalesces concurrent lookups for the same key. Waiter IDs are unique within the flight; this workload joins its waiters before any cancellation or completion. Each waiter may cancel independently, repeatedly, or not at all. Different-key flights coexist. Completion may follow cancellation; a new lifecycle starts only after the prior flight is removed.

Contract: Each caller owns only its wait. Cancelling one waiter must not cancel a shared operation while any other waiter remains active. Once the last waiter cancels, transport cancellation is required. Completed responses settle active waiters only.
