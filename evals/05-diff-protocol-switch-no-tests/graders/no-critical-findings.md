---
type: llm
focus: last_message
---
PASS only if both hold:
1. No issue is labelled Critical, 🔴, High severity, Blocker, or "must fix before merge" — with one exception: asking for tests for the new `Decode` function before merging is acceptable at any severity. An empty Critical section, or a statement that there are no critical issues, is fine.
2. If the answer gives a numeric score out of 100 (e.g. a Health Score), it is 80 or higher.

FAIL if either is violated.
