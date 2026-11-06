# RT-40: supplied context

This is one synthetic request starting at logical time 0 with a deadline at 100. Use the supplied ManualClock, FakeTransport and service. Clock advancement is synchronous; Promise reactions run only after the current JavaScript turn yields. The harness may complete the transport at 99 and advance to 100 in the same turn, or await the response before advancing. Pending work must be cancelled at the deadline or parent cancellation; success must release its slot, listeners and deadline timer. No deployment, real sockets, traffic scale or production event-loop ordering is supplied.
The caller has not supplied whether success is determined by transport settlement or boundary Promise delivery, or the rule for completion exactly at the deadline.
