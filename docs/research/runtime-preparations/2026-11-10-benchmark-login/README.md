# HB/BV Codex login calibration readiness

Date: 2026-11-10. Status: model-independent protocol frozen; offline process drill
passed. **No real model was called.** The maintainer must select and explicitly
bind a model, reasoning effort and installed CLI version before live execution.
Switching the chat's model selector does not automatically configure this runner.
This work does not authorize the 324-response reserved round or the older 81-turn
study. Historical plans, results and both HB/BV corpus freezes remain unchanged.

## Frozen design

`frozen-protocol.json` contains the complete input/guidance/rubric/scoring snapshots,
54-turn seeded schedule, source hashes and admission limits. Its model is null and
`liveAuthorized` is false. Protocol SHA-256:

`bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78`

The calibration contains 18 cases from six nominal families: 12 HB and six BV,
with six defect, six protected and six unresolved cases. Each receives A (case
only), B (case plus core), and C (case plus core and runtime prototype revision 2)
once. These are public, same-workflow synthetic cases, not independent holdouts.
The original 50 external PR candidates remain quarantined and are not admitted.

| Arm | Primary calls | Minimum prompt bytes | Maximum prompt bytes | Total prompt bytes |
| --- | ---: | ---: | ---: | ---: |
| A | 18 | 2,135 | 3,537 | 53,462 |
| B | 18 | 119,044 | 120,446 | 2,157,824 |
| C | 18 | 129,082 | 130,484 | 2,338,508 |

Total visible prompt size is 4,549,794 UTF-8 bytes. These are exact byte counts,
not tokenizer counts, billing estimates or a guarantee that a chosen model's
context window is sufficient. B/C have much longer guidance; interpretation must
retain that context-length confound. Guidance is supplied in text, not discovered
as native skills. The largest prompt is below the frozen 262,144-byte cap.

## Limits and failure behavior

- At most 54 primary submitted turns; zero harness retries.
- Each turn receives at most 180 seconds. The study has a three-hour monotonic
  admission/deadline budget; setup, archival and cleanup add overhead. This is not
  a hard process-wide three-hour wall-clock cap.
- Stop admitting new turns when reported cumulative usage reaches 3,000,000
  tokens. The last call may overshoot; absent usage stops the run. Built-in
  provider retries and ChatGPT token consumption/cost are **not hard bounded**.
  ChatGPT login usage is not API dollar accounting; no dollar estimate is claimed.
- The underlying transport retains its 2 MiB stdout/stderr bound and bounded
  process-group termination confirmation. Model, effort or CLI-version mismatch,
  unexpected tools, invalid streams, cleanup failure or setup failure stops
  subsequent admissions and preserves the full 54-turn denominator.
- Each attempt writes an intent before any process/auth side effect. Exact raw
  answers, events, metadata, hashes and checkpoint snapshots are retained.
  Existing output directories are refused. There is no automatic resume/replay:
  an interrupted unknown attempt must not be treated as a free retry. Any recovery
  requires a separately authorized linked execution; retain the original result.

## Offline evidence

`readiness.json` and `execution.json` report 54/54 successful **synthetic fake
app-server subprocess** turns, 0 failed/interrupted/not-run and pending semantic
reviews. `gpt-fixture` is a fake label, not a model. The simulated 5,400 tokens do
not forecast real consumption. `0.167.0` is fixture initialization metadata, not
verification of the currently installed CLI.

`offline-raw.json.gz` is compressed JSON mapping relative paths to exact UTF-8 raw
artifact contents: all 54 records, answers, events, attempt intents, registration,
final responses, review packets and execution summary. Intermediate checkpoints
and the initial empty response table are redundant and omitted from this archive.
`offline-raw-inventory.json` lists every retained artifact's byte count and SHA-256.
The archive contains only synthetic credentials-free process data. Read it using
Node's `gunzipSync` or `gzip -dc`; do not mistake its answers for model responses.

The regression suite also covers wrong model, malformed stream, missing usage,
token admission stop, spawn failure, immutable input/guidance/budget/runner hashes,
explicit authorization routes and refusal to replay an existing directory. The
unchanged transport's existing regression tests cover timeout, tool rejection,
wrong effort/thread/turn, authentication redaction and bounded cleanup.

## Execution handoff after the maintainer switches model

Use the existing authenticated Codex CLI on Darwin. Do not copy credentials into
this repository. The transport makes an ephemeral auth-only home, does not copy
the refresh token, disables and rejects tools, and checks CLI-selected model and
effort. These are application restrictions, not OS containment or independent
backend identity attestation. Expired access requires refreshing the normal login
before a separately authorized recovery. Proxy inheritance remains off unless
explicitly chosen and recorded at registration.

1. Verify the freeze with `npm run evals:runtime:benchmark:login -- validate
   docs/research/runtime-preparations/2026-11-10-benchmark-login/frozen-protocol.json
   bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78`.
2. Obtain the maintainer's explicit model and effort, verify the installed CLI
   version locally, and record authorization provenance. Register using the
   exported `register({frozen, anchor, model, effort, cliVersion, authorization,
   inheritProxy:false})`. The `frozen` value is the parsed frozen-protocol file;
   `anchor` is the independently recorded hash above. Save the returned sealed
   registration in a new file. The CLI `register CONFIG NEW_FILE` accepts the
   same argument object in CONFIG. Null or inferred model selections are rejected.
3. Explicitly start with `npm run evals:runtime:benchmark:login -- run
   REGISTRATION_FILE REGISTRATION_SHA256 NEW_OUTPUT_DIRECTORY --live`.
   The runner rechecks all frozen corpus, guidance, scoring and adapter bytes
   before any model call. It does not run reserved cases.
4. Preserve all execution artifacts. Review each successfully executed answer
   against its frozen rubric using `login-review.md` and the frozen scoring
   protocol. `review-packets.json` omits arms but cannot guarantee blinding.
   Semantic judging and comparative statistics are post-run manual work, not an
   automatic correctness claim from the executor. Pending reviews remain null.

Protocol changes require a new versioned freeze and a new registration; never
rewrite a completed study to make it validate. The CLI version and model for the
real round remain deliberately unbound until the maintainer's next instruction.

The existing transport follows the documented app-server `thread/start` model
and `turn/start` effort configuration. See the official
[Codex app-server documentation](https://learn.chatgpt.com/docs/app-server).
