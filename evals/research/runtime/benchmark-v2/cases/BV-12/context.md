# Partition worker handoff

The packet contains the worker dispatch, completion buffer, and application-owned checkpoint sink. The scheduler that assigns epochs and invokes these operations is maintained by another component; its lifecycle configuration and callback management are outside this packet. This sink is not a model of Kafka broker internals.

Sink updates to total and checkpoint are atomic. Each batch supplies ascending offsets, but completion callbacks may arrive out of order; the buffer drains its contiguous ready prefix. There is at most one batch per epoch. Batch handles are ordinary objects whose lifetime is managed by the caller. Duplicate completion callbacks for a batch index must not apply its effect twice.

A new epoch begins its batch after the last offset reserved to the old epoch; offsets therefore remain globally increasing at dispatch.
