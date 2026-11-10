# Operating context

A scheduler posts reservation-delivery callbacks independently of callers. A request can be queued, reserved for future delivery, or delivered to its owner. Cancellation can occur at any pre-delivery stage. Weights can differ and total capacity is3. The workload includes an initial full-capacity holder, waiting requests and later admissions; no callback interleaves within one synchronous method.

The deployment contract supplied for review does not specify: The pre-delivery reservation owner: does cancel terminate and release the reservation, or does an outer scope retain responsibility until its explicit cleanup call? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
