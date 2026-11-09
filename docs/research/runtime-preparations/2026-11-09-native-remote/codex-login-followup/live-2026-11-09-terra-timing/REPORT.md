# Codex CLI ChatGPT login smoke — 2026-11-09

**Result: passed.** One real, text-only turn returned the exact requested answer,
`BROOKS_LOGIN_OK`, and the app-server emitted `turn/completed` with completed
status. Codex CLI 0.167.0 reported ChatGPT authentication and selected
`gpt-6.1-terra` with `low` reasoning, matching the request. Environment proxy
inheritance was enabled. The provider did not independently report model identity;
CLI selection is not independent backend attestation.

The total recorded execution took approximately 7.95 seconds, including startup
and cleanup, within the 45-second limit. The first assistant delta arrived about
7.88 seconds after the monotonic timing origin. The CLI reported 8,200 total tokens:
8,191 input and 9 output, including zero reasoning output tokens. These are the
reported usage fields, not a cost calculation. The ChatGPT login channel does
not supply a verified dollar charge or provider-side request/cost cap, and internal
provider retries are not independently counted. One submitted turn does not prove
one backend request.

`record.json` and `events.jsonl` contain the sanitized requests, events, timing,
usage and cleanup evidence; `answer.txt` contains the raw assistant answer.
Cleanup confirmed the process closed, its process group absent, and the private
authentication home removed. The code-mode host warning was also emitted, but the
fixed text-only request completed without using code mode.

This single successful smoke proves one observed text turn, not a cause for either
prior timeout, reproducible availability, remote-shell isolation, or performance
of the runtime skill. No formal 81-response study was run.

Offline verification after saving the result: `npm run validate` passed,
`npm test` passed all 899 tests, and `npm run evals` passed all 64 structural
scenarios. No additional real inference was performed during verification.
