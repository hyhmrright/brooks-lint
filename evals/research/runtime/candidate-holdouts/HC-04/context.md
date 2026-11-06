# HC-04: visible contract

The execute function owns its acquired SlotPool lease. On either child resolution or child rejection, including cancellation represented by an AbortError rejection, the lease must be released before the returned response settles. A rejection must preserve the original error identity. The caller must not need to invoke release to recover capacity; the returned release hook is only idempotent teardown. There is one slot and no timer or external cleanup owner.
