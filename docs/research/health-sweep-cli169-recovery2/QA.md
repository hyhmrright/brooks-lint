# Independent offline QA

Verdict: **PASS**. No real model calls were made. This verifies recovery preparation, not remote service availability or resolution of the connection refusal.

Final anchor: `03fce76b87c0064d1b697412dda698132b3f6168b71d7ba6e5d31f77ba33d633`.

## Automated gate

Commands ran in order against the final unchanged source snapshot with local subprocess/loopback permissions; all exited zero.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-validate.log` |
| `npm test` | 222 legacy checks + 1,382 Node tests = 1,604 checks, zero failures | `qa-test.log` |
| `npm run evals` | 64 structural scenarios | `qa-evals.log` |
| `npm run benchmark` | Frozen parser-fidelity benchmark passes | `qa-benchmark.log` |
| `node --test evals/research/health-sweep-cli169-recovery2/recovery.test.mjs` | 15/15 | `qa-targeted.log` |

The new targeted suite is separately invoked; it is not claimed to be included in `npm test`.

## Independent boundary comparisons

- Extracted `offline-drill.tar.gz` into a fresh temporary directory and verified all eight success rows and seven stop-control runs against the frozen runner. Archive SHA-256 is `d4f1abb68192a11d5b335ca9be3a7d739321a2dda92dffc3ef140f7a6004aee2`.
- Independently modified seven execution fields: token total, terminal reason, ordinal, finish time, timeout, prompt hash and admission time. Each was rejected; each original was restored before the next check.
- Read both historical annotation files and proved that the merger retains their exact 37+3 entries. All 40 completed responses remain bound to their original identities and answer hashes; prior failed turns are retained separately and cannot enter the reviewed denominator. The merger rejects simulated input and annotations outside the newly eligible set.
- Recomputed all 251 historical file hashes directly sealed by this continuation. The older historical lifecycle checks in `npm test` separately confirm their 321-file snapshot. These are different inventories, not interchangeable counts.
- Compared remaining ordinals 41–48 to the original schedule; eight new attempts plus 42 historical attempts give a lifetime ceiling of 50 for 48 answer slots. Prior usage of 3,187,885 tokens and 1,405,011 ms is deducted, leaving 1,312,115 observed tokens and 9,394,989 ms. Per-turn ceiling remains 120,000 ms. Model `gpt-6.1-terra`, effort `low`, CLI `0.169.0`, prompts, criteria, transport toolchain and proxy identity remain bound to the original plan.
- Reviewed explicit-live admission, fresh-directory enforcement, stop-on-first-failure behavior, deadline/intent receipts, cumulative accounting, identity/tool/cleanup checks and immutable source lists. QA output files are not execution inputs and do not invalidate the anchor.
- Cross-compared package version 1.9.1 with all four manifests, six README version surfaces, landing-page JSON-LD and top CHANGELOG entry. Derived twelve books from source frontmatter and matched README/AGENTS/GEMINI wording; counted 64 eval scenarios and matched AGENTS; all six skill descriptions have negative-trigger boundaries.

Independent results and archive summaries are in `qa-independent.json`; raw replay logs are `qa-independent.log` and `qa-independent-final.log`.

## Diagnosis and limits

Both original raw failures exhibit a connection refusal and an exposed `Reconnecting... 2/5` retry notification, with no HTTP status. The second failure finishes at 22,810 ms monotonic, with cleanup starting at the 22,779 ms retry notification, after one successful tool request. Its 10,245 observed tokens are included in the cumulative total. This is not the 120-second deadline. Both runs confirm process-group and private-home cleanup.

Identical visible errors do not identify the same underlying cause. The refusing endpoint, backend model identity, hidden retry count and complete billing remain unknown. Offline injected events do not reproduce a real remote CLI reconnect. No network repair or stronger isolation than the retained evidence supports is claimed. An admitted turn can exceed an observed-token admission ceiling; it is not a billing cap.

No blocking inconsistency remains. Preparation-command failures retained under `development-v1` are explicitly separated from live model failures; historical results were not edited.
