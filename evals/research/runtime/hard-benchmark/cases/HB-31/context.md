# Operating context

A one-connection pool serves multiple tenants in successive leases. The adapter resets physical session state through a posted callback; callers can request another lease while callbacks are queued. Binding during reset is deferred until acknowledgement. A reset can fail and destroy the connection. Queries execute synchronously; a released lease rejects queries.

Contract: A connection cannot be assigned to a different tenant until its asynchronous session reset has acknowledged. Query execution uses the physical connection session tenant, not the caller label. A completed lease has no further right to query. The pool holds one physical connection.
