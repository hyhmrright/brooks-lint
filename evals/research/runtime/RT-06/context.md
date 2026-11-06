# Supplied resource contract

This authored synthetic service has two worker slots and two waiting slots in total.
Optional work is a slow, read-only enrichment call; essential work returns a local
quote without using that dependency. One essential request must succeed while
optional work is saturated, provided no other essential request is active or queued.
Rejection of excess optional requests is explicitly permitted. Essential overload
under its own concurrent traffic is outside this availability requirement.

The driver submits five optional requests without settling their dependency work,
then submits one essential request. Both variants have the same aggregate worker
capacity (two) and queue capacity (two), offered sequence, and work implementation.
Pools use bounded FIFO queues with immediate `overloaded` results on full admission.
A running operation holds one worker until its promise settles. Separate pools may
reserve capacity; unused reservations need not be lent to optional requests.

`OptionalWork.open` stays pending until `completeNext`, `failNext`, or caller abort.
Caller signals must remove queued requests and cancel active optional operations.
Pool release and admission of the next queued request occur on promise settlement;
tests drain promise reactions after manual transitions. Pre-aborted work must not
start. All controllers are driver-owned; this fixture introduces no timers, retries,
network, threads, or elapsed-time scheduling. No hidden scheduler or pool exists.

Only inspect the task, this context, service, worker-pool and optional-work files
listed as inputs. Slots represent synthetic capacity, not measured CPU, sockets,
memory, production load, SLOs, or a whole-process outage. Same-process operation is
intentional; this contract concerns admission capacity, not process failure isolation.
