# Exploratory runtime study: 37 development cases

On 2026-11-06, a real Codex CLI run attempted all 37 public, agent-authored
runtime development cases once in each of three arms. **102 of 111 calls
executed; nine failed**, leaving 30 cases with all three execution records
complete. Execution is not semantic correctness: no study-wide semantic judgments
or human review have been completed. No accuracy, recall, false-positive rate,
incremental benefit or production-readiness conclusion follows from these counts.

## Reproduction and scope

- Frozen source commit: `3b1257c68380d1a22722462e3ea8c09353514397` (clean
  worktree when planned); runtime manifest revision 7, SHA-256
  `a022ba18ea4c0534beba1d08c047a89cc4205d203792697ba13b1d4fcade4f5b`.
- Plan SHA-256: `25daed13b4933274fc64ef2957f937776f85d5f69f42b0c75ea2ad802a8ecab0`.
  Planned 2026-11-06 07:19:03 UTC; executed 07:19:29–08:43:21 UTC.
- Requested model `gpt-6.1-terra`, reasoning `medium`, one repetition,
  240-second per-process timeout; actual CLI `codex-cli 0.166.0`.
- A had no skill catalog, B had the six core skills and shared framework, and C
  additionally had the revision-1 runtime research skill. The identical natural
  task and visible-input whitelist were used for each case. Arm order rotated
  by case, and calls ran serially. See the [runner contract](../../runtime-runner.md)
  for isolation and its limits.
- All cases were exposed development material, not independent holdouts. Model
  familiarity with them cannot be excluded. A single repetition cannot establish
  stability; the authored rubrics and source mappings await human review.

The [sanitized execution records](results.json) preserve per-call answers,
status, timing, discovered skills, conservative observed-read traces and available
usage. Temporary local paths were replaced with `<study-repo>` / `<study-temp>`.
Recorded answer and trace hashes refer to the original, unredacted artifacts, so
cannot be recomputed from altered answer text. Raw prompts, event streams and full
frozen plan remain locally ignored; source inputs and tooling are identifiable at
the frozen commit. These records include failure evidence where available. The
separate [RT-01 pilot](../2026-11-06-terra-pilot/README.md) is not included here.

## Execution and usage

All 111 calls were attempted. The nine failed calls are RT-09 A, RT-10 B,
RT-18 C, RT-24 B and C, RT-25 A and B, RT-29 C, and RT-37 A. The runner
recorded connection/disconnection or routing errors for seven; RT-24 B and
RT-29 C timed out. An incomplete answer or observed skill read on a failed call
is not a completed result. The seven affected cases cannot enter a complete
three-arm comparison. There was no silent retry or replacement of these records.

The CLI reported usage for 108 of 111 calls, including some failed calls. Summed
reported values are 4,432,398 input tokens, 3,503,104 cached input tokens,
62,792 output tokens and 3,217 reasoning output tokens. Cached and reasoning
figures are reported breakdowns, not additional amounts to add to input or output.
Missing usage for three calls is unknown; these totals are therefore only the
available recorded usage and are not a complete cost calculation.

## Illustrative observations pending review

These observations describe answers, not adjudicated outcomes. All three RT-01
answers identify a cancellation signal dropped before the dependency call. All
three RT-07 answers describe missing caller/transport information and decline to
establish a cancellation defect. On RT-02, A and C say the supplied cancellation
controls establish no supported defect, while B reports an additional ordering
case in which the clock advances before the Promise handler runs. The fixture
says successful completion before expiry should return its value and says Promise
delivery is observed through `await`; whether B's reproduction is admissible under
that contract requires human review. These three examples do not represent a
study-wide semantic assessment.

The runner's conservative read detection is a proxy for observed file reads, not
proof that a model used guidance correctly. A full analysis must inspect every
finding and abstention against the frozen rubric, including unsupported claims,
severity and context restraint, with the same review procedure across arms. Human
case review, independent holdouts, and an evidence-based promotion decision remain
outstanding.
