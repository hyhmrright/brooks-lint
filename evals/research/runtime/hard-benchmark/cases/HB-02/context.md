# Operating context

Ingress occurs at time 0 with budget 50. Dequeue may occur at 0,35,or50. A failed attempt takes10 and backoff takes10. A later attempt takes1. A successful first attempt may instead take70. Clock values are monotonic integer milliseconds in one clock domain.

The deployment contract supplied for review does not specify: The ingress-to-worker SLA definition: does the supplied timestamp begin the admission budget or is the queue explicitly excluded? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
