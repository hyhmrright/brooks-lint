# Runtime contract

There are two total worker slots. Optional details may consume at most one while an essential request must remain serviceable under two optional arrivals followed by one essential arrival. A correct degraded response contains essential=17, detail=null and degraded=true; rejecting all requests is not acceptable. Detail omission is explicitly permitted.

## Supplied caller configuration

The caller supplies one cancellation-aware `OptionalWork` instance as `detail`.
The supplied shared/optional-work.mjs implementation holds each started detail
operation pending until explicit completion, failure or abort and removes its
abort listener on settlement. The script submits two optional calls and leaves
admitted detail operations pending, then submits one essential call with a live
signal. The displayed service owns admission and generates the essential payload;
there is no external reservation, shedding controller or payload repair step.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
