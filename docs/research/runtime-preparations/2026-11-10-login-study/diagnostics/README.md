# Unresolved intermittent offline failure

The full suite failed on the 81 synthetic-turn test in two runs (first at turn
51; diagnostic reproduction at turn 21). The latter retained a setup-failure
artifact: runLoginTurn threw outside its ordinary recorded transport failure
path. No record.json was produced for that turn. The generic sanitized exception
did not retain errno, so the specific syscall/root cause is **not established**.
This is not evidence of a model/provider timeout; no model was called.

The test now retains failing output and includes its path in the assertion.
Batch setup errors now retain a sanitized uppercase errno when present, without
publishing arbitrary exception messages that might include credentials.
The instrumented full-suite diagnostic passed 910 tests. This intermittent pass
does not resolve the prior failures or constitute a final readiness QA pass.
No timeout was relaxed and no speculative retry was added. Further diagnosis
must capture the next failing syscall/code before claiming reliable readiness.
