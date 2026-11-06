# Supplied request contract

This is an authored synthetic, read-only quote lookup. One logical request permits
at most **three total dependency attempts**, including the initial call (two retries).
The limit applies across the entire call path, not separately to each layer.
The request deadline is 100 logical clock units, owned by `startRequest`; these
are not elapsed milliseconds. Client cancellation or deadline expiry must release
active dependency work and prevent subsequent attempts. The signal is forwarded
through the supplied path and transport abort releases work synchronously.

Only failures marked `retryable: true` may repeat. Success and nonretryable failure
must terminate attempts. The dependency has no internal retries; each `fetchQuote`
call increments `started` once, owns one synthetic slot, and stays pending until
`failNext`, `completeNext`, or cancellation. The test driver can fail successive
calls before advancing the logical clock. Each layer's `maxAttempts` includes its
initial call; retry does not schedule a backoff timer. Immediate retries are an
explicit policy for this bounded synthetic study; pacing, jitter, circuit breakers,
and production traffic behavior are outside the supplied contract.

Only inspect the task, this context, the case service, and shared clock,
request-boundary, retry, and retry-transport files listed as inputs. They form the
complete call path. No hidden retry layer, budget guard, or transport timeout exists.
The fixture establishes attempts and cleanup for one request, not production load,
SLOs, billing, sockets, memory, non-idempotent side effects, or an outage.
