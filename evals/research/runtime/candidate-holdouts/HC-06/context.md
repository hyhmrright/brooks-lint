# HC-06: visible contract

The execute function acquires a lease, exposes a response and an explicit release hook, and releases after child success. Child failure is an asynchronous rejection. The caller contract does not identify whether this function or an outer scope owns release after rejection, nor when failure cleanup is required. The outer scope is unavailable. A local retained lease can be observed; absent ownership does not prove permanent leakage.
