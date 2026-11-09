# Codex login text comparison: execution report

The maintainer authorized the 81-turn run after switching models. The current
session identified `gpt-6.1-terra`; CLI version 0.167.0 was registered with
`medium` effort (the local CLI default) and explicit proxy inheritance. CLI
selection is not independent provider or weight attestation. Authentication was
ChatGPT login. See `config.json` and `registration.json` for the frozen settings.

All 81 of 81 primary turns completed (9 public candidate cases, 3 arms, 3
repetitions), with no primary retries or stopped turns. Each selected the
registered model and effort, yielded the exact archived answer, and confirmed
process-group absence and private-home removal. Byte and SHA-256 checks matched
the corresponding response records. Each turn's events, answer and record are
retained under `run/`; responses, review packets and execution summary are also
preserved. Intermediate response snapshots retain their original bytes inside
`run/response-snapshots.tar.gz`.

Summing the CLI-reported per-turn totals gives 2,353,455 tokens: 2,313,306 input
and 40,149 output (including 3,310 reasoning output tokens). This is reported
usage, not independently verified billing; provider retries and cost are not hard
bounded. No calculation of monetary cost is asserted.

**Semantic review remains pending for all 81 answers.** The generated summary
therefore excludes all 27 triplets and does not establish accuracy, false
negatives, false positives, or treatment benefit. The review packets contain
case inputs and exact answers for the required subsequent review; no labels were
inferred from keywords or invented. Human calibration and independent review
remain absent. Repetitions are not independent cases.

This is the `login-full-context-text-v1` text treatment: guidance is supplied
as text rather than observed skill reading; tools are disabled and rejected.
All cases are exposed public candidates, not independent holdouts. The historical
native-tool design is unchanged and its isolation is not established by this run.

Offline validation after execution: `npm run validate` passed; `npm test` passed
914/914; `npm run evals` passed 64 structural scenarios; `npm run
evals:runtime:prepared` passed 541/541. An archive check matched all 81 answer
bytes and hashes, selected model/effort, completion and cleanup records. A scan
for common API key and bearer token patterns returned no matches; it is not a
guarantee that every possible secret pattern was detectable.

## Subsequent semantic review

The pending-review description above is the preserved execution-time state.
The [separate review revision](review-v1/REPORT.md) now grades all 81 answers,
with frozen-rubric counters, per-answer rationales and sensitivity analysis.
Original execution data and the original pending summary remain unchanged.
