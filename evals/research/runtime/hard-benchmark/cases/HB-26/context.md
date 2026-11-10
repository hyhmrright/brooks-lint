# Operating context

A producer sends variable-length frames to required and optional sinks. Required sinks may drain at different rates; optional sinks may remain slow without controlling the required-delivery window. A sink acknowledgement names a frame and may be duplicated. Enqueue is synchronous but drainage is independently scheduled. Sink names are unique within one fanout.

Contract: The 8-byte credit window bounds bytes still retained by any required sink. A frame is released only after every required sink has drained that frame. Enqueue acknowledgement is not drainage. Fast-sink completion cannot replenish the shared credit while the slow required sink still retains bytes. Optional sinks do not participate in this credit window.
