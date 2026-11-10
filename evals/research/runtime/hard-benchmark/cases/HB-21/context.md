# Operating context

A scheduler posts reservation-delivery callbacks independently of callers. A request can be queued, reserved for future delivery, or delivered to its owner. Cancellation can occur at any pre-delivery stage. Weights can differ and total capacity is3. The workload includes an initial full-capacity holder, waiting requests and later admissions; no callback interleaves within one synchronous method.

Contract: Capacity is three units. A queued request may reserve units before its delivery callback runs. Cancellation before delivery must return all reserved units; a later delivery callback must not transfer a cancelled reservation. Live delivered owners release their own units once.
