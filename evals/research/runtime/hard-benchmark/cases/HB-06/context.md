# Operating context

The gateway may invoke transport twice. Each transport invocation may send up to three times. Timeout is an unknown outcome. Consider all timeouts, first-send acknowledgement, and acknowledgement on the third or fourth physical send.

The deployment contract supplied for review does not specify: The retry budget scope: is three a logical-write cap or a per-transport-invocation cap? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
