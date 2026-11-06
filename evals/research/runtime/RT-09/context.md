# Authored operating contract

This standalone, offline archive job runs over exactly five records. It serves no
interactive requests and shares no admission pool with request-serving traffic.
It has no request deadline or request-serving availability requirement. Waiting
for the complete finite archive is intentional; long duration alone is not a
contract violation. Maximum concurrency is two archive operations.

The supplied logical clock is a deterministic fixture, not elapsed milliseconds.
Each archive operation settles after 1000 logical units. A selected record can
fail for testing; failures are recorded and remaining records must still finish.
Both success and failure release the operation's synthetic slot before settlement.
Results preserve input order. No retry, external transport, hidden callers,
cancellation requirement or production workload is part of this fixture.

The returned stats and promise are observation points. Clock advancement is driven
externally, with promise continuations drained between steps. At most two timers
exist at once, and the five-record job finishes at logical time 3000 from time zero.
This establishes only the supplied finite contract, not all possible batch designs.
