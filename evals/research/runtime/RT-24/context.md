# Runtime contract

Each logical write has one stable caller identity. A write may commit before its response is lost. Duplicate effects for that logical write are forbidden. The supplied backend atomically stores and returns one result per identity for its lifetime. Reusing an identity with a different payload is rejected without another effect. Cancellation before admission prevents a write; cancellation after commit does not roll back that effect.

## Supplied caller configuration

The caller instantiates the supplied `WriteBackend` implementation and passes it
as `backend`, with one logical identity `write-A`, payload 17 and a live signal.
The standard script uses the displayed `loseFirst: true` default: the first
backend call commits then loses its response. The backend map is retained across
the retry; no external retry owner changes identity or adds deduplication. Separate
scripts vary cancellation, payload and response loss to check the same contract.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
