# Authorization service handoff

The service handles requests for multiple tenants and receives a tenant and user ID from an upstream gateway. That gateway owns identity lifecycle and request admission. Its configuration and admission implementation are not included in this packet.

For the request sequences under review, the authorization policy table is immutable. Authoritative policy lookup uses both tenant and user. The cache instance is shared across successive requests for multiple tenants. The supplied service, cache and policy modules comprise the authorization component being handed off; upstream request handling is maintained separately.
