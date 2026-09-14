---
type: llm
focus: last_message
---
PASS only if all of the following hold:
1. No issue is labelled Critical, 🔴, High severity, Blocker, or "must fix before merge". An empty Critical section, or a statement that there are no critical issues, is fine.
2. If the answer gives a numeric score out of 100 (e.g. a Health Score), it is 80 or higher.
3. The overall verdict does not say the code needs significant rework or redesign before it can ship.

FAIL if any of 1–3 is violated.
