# Executor completion — QA round1 FAIL

Route to **eval-curator / executor_completion_author**. Do not commit/push yet.

## Finding

**[P2] evals/research/runtime/prospective/executor-completion.mjs:100 — final-file import can block beyond the subprocess deadline.**

**Symptom:** An owned FIFO at `last-message.txt` blocks the current `finalCapture`
helper. The bounded QA subprocess printed `BEFORE_FINAL_CAPTURE`, then timed out
at1512ms and was killed; the temporary FIFO was removed.

**Source:** `openSync(O_RDONLY | O_NOFOLLOW)` precedes file-type verification and
omits `O_NONBLOCK`. The subsequent initial-size check also does not bound the
read-until-EOF loop if an already-open regular file grows.

**Consequence:** Collection can hang after process timeout/cleanup, leaving the
current receipt and service cleanup incomplete. Existing fixed native cases do
not exercise special output files.

**Remedy:** Use no-follow/nonblocking descriptor opening, verify a regular file,
and enforce a cumulative hard read/work budget. Return recorded ineligibility
for invalid/special/oversized artifacts while preserving process/HTTP evidence.
Add bounded FIFO, symlink/directory and growth/oversize regression cases.

## Checks completed

All16 offline commands PASS: validate, npmtest, structuralevals, prepared, research,
drill/reviews/executor/process/channel/CLI/stream/boundaries/completion archive
validators, parserbenchmark and Codexoffline. Counts222helper+6provider+547main,
189prepared,64structural,30parserreports,7Codexfixtures. Eleven additional pure
mutations are rejected at both standalone import and archive-record boundaries.

Independently compared4manifests,6READMEbadges,JSON-LD,CHANGELOG,AGENTS/GEMINI,
derived12books,64evals and6negative skill boundaries.1082 oldresearch files remain
identical; prospective README is append-only. All132 rawrecords and838binaryattrs
checked; all132 recordedgroups absent in a read-only bounded ps snapshot. Full81
protocol completions remain81canonicalmodelrowsnot-run,0studyeligible. Two fully
paginated Discussion reads confirm5maintainercomments and0replies, no posts sent.

The native concurrent pair uses the same final text. Its evidence supports scoped
request-routing/budget separation; arbitrary response-callback identity is not
verified. This limitation does not add a finding against the narrowed scope.

Raw gate logs, independent checks, process snapshot, mutation results and bounded
FIFO reproduction (including the initial setup error) are retained in the new
archive `qa-logs/`; `qa-verification.json` records this FAIL. No actual Codex or live
model was launched by QA. No source/old evidence was edited; no commit/push.

Harness loop-back once: author fixes, then rerun complete QA.
