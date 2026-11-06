# Runtime contract

A request owns three optional child operations. All must release their owned slots when the parent is cancelled. No child is detached durable work.

## Supplied caller configuration

The caller supplies three separate cancellation-aware `OptionalWork` instances
as `transports`, and passes one request-owned parent signal as `options.signal`.
Each receiver's `open` method is the supplied shared/optional-work.mjs
implementation: pending work retains a slot until explicit completion, failure or
abort; abort removes its listener and releases the slot. The script starts all
three children before cancelling the parent. There is no external controller or
independent timeout that cancels the third receiver.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
