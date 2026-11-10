Each committed event must change the consumer balance exactly once. The relay can crash after consumer acceptance but before marking its outbox row sent. The consumer ledger, processed-ID set and outbox rows survive relay restart. All consumer operations below are atomic, single-threaded transactions; no database or thread behavior is implied.

The producer commit also updates producerTotal. A simulated crashBeforeOutbox can occur in that call. A producer update and its outbox row must commit together or neither may survive; failed commit is atomic rollback.

Each committed event ID is unique across the producer lifetime. Batches can deliver in any index order. An acknowledgement may arrive late. Restart discards batch handles but retains store state; it selects unsent rows again. Delivery acceptance and marking a row sent are distinct operations. Calling deliverOne again models at-least-once transport delivery. Ordering of distinct additive effects is not constrained.
