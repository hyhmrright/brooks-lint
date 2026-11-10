# Event ingestion handoff

The packet contains the producer state update, relay batching, and consumer accumulator modules. The owning application reads producerTotal and balance through its reporting layer; that layer's data dictionary and integration specification are maintained separately and are not part of this packet.

Relay restart can repeat an event. Ledger and seen set survive restart; each deliver call is atomic. The producer commit also updates producerTotal, and a simulated crashBeforeOutbox can occur in that call.

Each committed event ID is unique across the producer lifetime. Batches can deliver in any index order. An acknowledgement may arrive late. Restart discards batch handles but retains store state; it selects unsent rows again. Delivery acceptance and marking a row sent are distinct operations. Calling deliverOne again models at-least-once transport delivery. Ordering of distinct additive effects is not constrained.
