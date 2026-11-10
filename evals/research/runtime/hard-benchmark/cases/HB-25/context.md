# Operating context

A producer sends variable-length frames to required and optional sinks. Required sinks may drain at different rates; optional sinks may remain slow without controlling the required-delivery window. A sink acknowledgement names a frame and may be duplicated. Enqueue is synchronous but drainage is independently scheduled. Sink names are unique within one fanout.

The deployment contract supplied for review does not specify: The accounting scope: does the 8-byte window bound retained frames across required sinks or only frames waiting to be enqueued? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
