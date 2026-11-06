# RT-16: supplied context

Only a bounded FIFO queue and its dependency adapter are supplied. Whether submissions represent expiring request work or accepted durable background jobs is **not supplied**. Caller cancellation policy, useful-until times, durability/acknowledgment requirements and any upstream expiry filtering are unavailable. The dependency can cancel an operation when its signal aborts, but that does not define when a queued job should expire. Identify what context is needed; no actual hidden workload or production consequence has been established.
