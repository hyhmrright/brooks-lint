# Offline evidence classification

All new execution records here are synthetic, injected in-process without credentials, CLI processes, network calls or model output. Historical source files are read only to validate continuity. Do not add synthetic rows or tokens to the real benchmark statistics.

`development-source-drift.log` and `development-deadline-source-drift.log` retain interrupted development drills. They intentionally failed closed when the implementation changed during execution; they are not final readiness evidence. Earlier disposable unit runs also observed source drift during development. The final `targeted-tests.log`, `drill.log`, `summary.json` and `raw-simulation.tar.gz` bind the settled plan and replace those runs as offline evidence.

The final full success scenario covers 125 remaining ordinals. The eight negative scenarios separately exercise execution failure, retry, identity, cleanup, unknown usage, token ceiling, deadline, and proxy drift. Synthetic budgets carry the real prior counters solely to test cumulative accounting; injected new tokens are fictional.

Full repository QA and the historical hash guard are documented in the parent preparation report. These checks establish offline execution/recordkeeping behavior, not a new successful login or live provider availability.

In the identity, cleanup and unavailable-usage controls, `completed` counts the injected transport record's raw status; it does not certify an accepted answer. `stopped` records the rejection, and verification-failure records are excluded from adjudication. The archive SHA-256 is `78ebe8433722a912404bb41b4f7582c787701c9db738cbbbbc2cde0faa7dd3bc`.
