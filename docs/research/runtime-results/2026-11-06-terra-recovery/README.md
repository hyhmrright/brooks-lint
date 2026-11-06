# Exploratory runtime study: recovery runs

On 2026-11-06, seven separately planned recovery runs re-executed the cases
whose calls failed in the [37-case study](../2026-11-06-terra-37/README.md).
All **21 of 21 calls executed**, including all nine case/arm combinations that
previously failed. Each recovery run has three executed arms. Execution is not
semantic correctness. A subsequent [model semantic review](../2026-11-06-terra-semantic-review/README.md)
assessed these answers; human review remains pending. The runs cannot establish
production accuracy, model benefit or readiness. The original study remains 102/111 executed and 30 complete execution
triplets; its failed records have not been overwritten or combined with these
later outputs.

## Recovery coverage

| Case | Originally failed arm(s) | Recovery A/B/C | Frozen recovery plan SHA-256 | Records |
| --- | --- | --- | --- | --- |
| RT-09 | A | executed / executed / executed | `9438ba7fdd67bcc6cc37b804f59dbaa25cc941737a13206a02f65238e56b04df` | [RT-09](RT-09/results.json) |
| RT-10 | B | executed / executed / executed | `4edc844b643b1b8551d2ca79aca4f38128e81d44ce8830efc8d6050fed178be9` | [RT-10](RT-10/results.json) |
| RT-18 | C | executed / executed / executed | `a33dbe85de0055e89dd02b7adf61dfd30c46bb2d46f8857c5f74eeeffe9ad712` | [RT-18](RT-18/results.json) |
| RT-24 | B, C | executed / executed / executed | `0aa04332450d236a3e0a88fc56eddd499d595b983003ab4be172636a8e3f54e5` | [RT-24](RT-24/results.json) |
| RT-25 | A, B | executed / executed / executed | `53731a6f12a29a0690291dd065345c529ccaa819b921b69a1a34100625ee3801` | [RT-25](RT-25/results.json) |
| RT-29 | C | executed / executed / executed | `08704143909ad4e8a88e831430a6e5fbc1912dae0ae80e6f3e994738d9102240` | [RT-29](RT-29/results.json) |
| RT-37 | A | executed / executed / executed | `9bccffa8b5a344f49b2a213101c0dd89eaa07260c497b9994da30d7065aeb08b` | [RT-37](RT-37/results.json) |

## Method and limits

- Frozen source commit `9dc5cc4e77f52ad894043f0c639afd2ad531f2a3`, with a
  clean worktree at planning; all seven plans use manifest revision 7, SHA-256
  `a022ba18ea4c0534beba1d08c047a89cc4205d203792697ba13b1d4fcade4f5b`.
  The corresponding case objects (including prompt, visible inputs and rubric),
  core and prototype inventories, tooling hashes and model settings match the
  frozen plan from the original study. Recovery is a separate run at a later
  time, not a rerun under identical external conditions.
- Requested model `gpt-6.1-terra`, reasoning `medium`, one repetition,
  240-second per-process timeout; CLI `codex-cli 0.166.0`. The seven runs
  executed serially from 09:07:36 to 09:18:19 UTC. Within each single-case
  plan arms ran A, B, C in that order; the original full study rotated arm
  order by case. A had no skill catalog, B had the core skills and shared
  framework, and C additionally had the runtime research skill.
- CLI usage was available for all 21 recovery calls: **701,755 input tokens**
  (including 575,360 cached input tokens) and **9,615 output tokens** (including
  239 reasoning output tokens). The parenthesized numbers are breakdowns, not
  additional amounts; usage is not a complete cost calculation. These totals
  exclude the original study and pilot.
- Each linked JSON contains sanitized execution records, answers, statuses,
  timings, discovered skill catalogs, conservative read traces and available
  usage. Temporary local paths were replaced with `<study-repo>` and
  `<study-temp>`; answer and trace hashes refer to the original unredacted
  artifacts and cannot be recomputed from altered answer text. Full frozen
  plans, raw event streams and prompts remain locally ignored. See the
  [runner contract](../../runtime-runner.md) for isolation and its limits.
- These are exposed, agent-authored development cases, not independent holdouts;
  one repetition does not establish stability. Human case review, human
  adjudication of the model assessments and independent holdouts remain outstanding. No result is a human
  certification of the book-to-diagnosis mapping.
