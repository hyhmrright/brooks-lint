# Runtime contract

One non-cancellation failure opens the breaker. Calls are rejected for ten logical units. After cooldown permit at most one concurrent recovery probe. Its failure reopens for another cooldown; its success closes. Cancellation releases a probe and permits a replacement without classifying cancellation as backend failure.

## Supplied caller configuration

Recovery operations use the supplied cancellation-aware `OptionalWork` adapter.
The caller creates one `ManualClock`, constructs the displayed breaker and first
runs a scripted immediate non-cancellation failure to open it at time zero. After
advancing to the cooldown boundary, it submits three calls before settling any
probe. Each probe operation invokes `OptionalWork.open` with the signal passed by
the breaker; pending probes settle only on explicit completion, failure or abort,
and remove their listeners on settlement. There is no external admission or retry
controller. Additional scripts exercise the declared success/failure/cancellation transition
rules with immediate scripted outcomes or cancellation-aware pending work.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
