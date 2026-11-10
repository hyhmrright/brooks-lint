# Pricing test handoff

The packet contains quote, two candidate regression implementations, and the releaseTest function. The CI orchestrator and other test jobs are maintained outside this packet. The orchestrator decides which checks run together before release.

quote must return the original amount below 100, apply a ten percent discount at or above 100, and throw for a negative amount. The two regression implementations are supplied for exercising the visible test function. No implementation changes are requested in this review.
