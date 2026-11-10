# Cache component handoff

These modules are used by a read service. The packet includes the cache operations and their calling conventions; the client-facing service specification and freshness policy are maintained by the read-service owner outside this packet.

beginRead captures the current source value and generation. write synchronously advances the generation and clears the cache. finishRead may run after intervening writes. Calls are serialized, with no hidden background cache refresh. readNow returns a cache hit when present and otherwise reads through the supplied operations.
