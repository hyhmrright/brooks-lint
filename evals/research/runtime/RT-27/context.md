# Runtime contract

Eight clients fail once together at logical time zero. Exactly one retry each is permitted. In the injected deterministic schedule no logical slot may contain more than two retry starts; initial attempts are outside that retry-slot allowance.

## Supplied caller configuration

The eight callers use unique indices 0 through 7 and share one `ManualClock`
instance. This reproduction begins after one scripted failed initial attempt per
client, at common logical time zero. Every retry is scheduled before the clock
advances. The supplied `start` callback synchronously records the clock value at
each start; it neither creates pending asynchronous work nor performs external
admission. No other controller reschedules or rate-limits these starts. These
index and callback facts are supplied configuration, not properties guaranteed by
the local retry helper for arbitrary callers.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
