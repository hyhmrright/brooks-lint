# Runtime contract

Two total underlying transport slots are available. Optional calls must leave one slot available for an essential call. Separate wrapper objects do not change this underlying cap. There is no other essential traffic in the declared schedule.

## Supplied caller configuration

The caller supplies one cancellation-aware `OptionalWork` instance as `work`.
The supplied shared/optional-work.mjs implementation keeps each started operation
pending until explicit completion, failure or abort, and removes its abort
listener when it settles. Its object does not provide a separate admission cap;
the pools in the supplied route implementation are the actual admission resource.
The script submits two optional calls, leaves their admitted work pending, then
submits one essential call. There is no external reservation or admission owner.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
