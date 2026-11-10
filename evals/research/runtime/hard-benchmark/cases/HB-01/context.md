# Operating context

Ingress occurs at time 0 with budget 50. Dequeue may occur at 0,35,or50. A failed attempt takes10 and backoff takes10. A later attempt takes1. A successful first attempt may instead take70. Clock values are monotonic integer milliseconds in one clock domain.

Contract: The ingress timestamp defines one absolute 50 ms admission deadline, covering queue residence and retry backoff. No attempt may start at or after that deadline. Already-running operations may settle after it.
