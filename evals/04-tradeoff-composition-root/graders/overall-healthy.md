---
type: llm
focus: last_message
---
PASS only if all of the following hold:
1. No issue is labelled Critical, 🔴, High severity, or Blocker, and no issue is declared blocking ("must fix before merge", "blocks merge", "do not merge until"). An empty Critical section, or a statement that there are no critical issues, is fine. Saying some issues are worth addressing before shipping or before production, without calling them critical or blocking, is also fine.
2. If the answer gives a numeric Health Score out of 100, it is 70 or higher. (Under brooks-lint's default weights — Critical −15, Warning −5, Suggestion −1 — 70 still leaves room for about six Warnings.)
3. The overall verdict does not say the code needs significant rework or redesign before it can ship.

FAIL if any of 1–3 is violated.
