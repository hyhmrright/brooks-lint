# RT-11: supplied context

This synthetic interactive request has a total lifetime limit of **100 logical clock units**, measured from entry to `handleRequest`. The total includes setup and work. The standard trace has setupDuration 80 and workDuration 60. A timed-out request must release its owned phase and timers by the total boundary; no separate caller deadline exists in this supplied path. Parent cancellation must also release them. These counters model one owned operation, not actual sockets or production load. Review only the supplied path and contract.
