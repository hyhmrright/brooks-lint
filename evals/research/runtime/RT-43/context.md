# RT-43: supplied context

This is one synthetic request starting at logical time 0. Its total lifetime, including setup and work, is 100 logical units. The supplied ManualClock is the scheduler; its schedule rejects negative or nonfinite delays and no other scheduling failure is assumed. On total deadline or parent abort, owned phases, timers and listeners must be released. Normal defaults are setupDuration=80 and workDuration=60. Zero-duration phases are allowed. At exactly 100 the deadline wins over phase success because it is armed first. Counters model owned work, not real sockets, traffic or production load.
The accepted input domain and invalid-input rejection/cleanup policy are not supplied. No upstream validator is shown; its existence or absence must not be assumed.
