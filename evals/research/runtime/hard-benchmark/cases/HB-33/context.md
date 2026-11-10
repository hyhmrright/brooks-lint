# Operating context

A one-connection pool serves multiple tenants in successive leases. The adapter resets physical session state through a posted callback; callers can request another lease while callbacks are queued. Binding during reset is deferred until acknowledgement. A reset can fail and destroy the connection. Queries execute synchronously; a released lease rejects queries.

The deployment contract supplied for review does not specify: The session binding contract: are queries scoped by the physical session tenant, or does the database enforce an independent per-query tenant envelope? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
