# Authored fixture contract, revision 1

This synthetic request-driven quote service has one dependency operation per
request. The request boundary owns a deadline of 100 logical clock units from
request start. At expiry it must return a timed-out response AND cancel the
underlying operation, releasing its slot before the boundary callback returns.
The slot represents occupied dependency work, not a real socket or measured memory.

The fake dependency does not complete unless the harness calls `completeAll`.
It honors a supplied AbortSignal, including a signal already aborted at call time.
There are no other timeouts, deadlines, retry layers, or cleanup mechanisms in
this fixture. A successful completion before expiry should return its value and
release the slot and all associated listeners and deadline timers.

The supplied clock advances synchronously and deterministically. Its units are not
wall-clock milliseconds. Promise delivery is observed through await; abort handlers
run synchronously. Teardown via `dispose` is a harness operation after measurement,
not an application protection or evidence of timely cancellation.

Only a single synthetic request and one occupied slot are established here. No
production deployment, traffic, cross-request starvation, outage, data loss, or
security exposure is supplied. Findings should not imply those effects.
