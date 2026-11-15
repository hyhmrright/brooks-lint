# Latest-receipt protocol retest — complete

All six authorized submissions completed and passed the frozen lifecycle and exact-delivery checks. Both the generic-checklist arm B and full health-instruction arm C passed 3/3. The final report in every answer matches the latest successful finalization, and the complete final answer matches its latest host assembly exactly. No replacement model calls or automatic retries were made; no exposed transport retry was reported by the collector.

This demonstrates the new executor's instructed receipt lifecycle working through the real Codex login route on these six exercises. It does **not** establish a health-skill advantage, autonomous correction, diagnostic generalization, or sweep repair capability.

## Execution and budget

- Frozen model and CLI-selected identity: `gpt-6.1-terra / low`; Codex CLI `0.169.0`; ChatGPT login channel.
- Frozen plan SHA-256: `5ef87e3da5313e9f14db44972e3d7c557c4f76b32cf8863bd799c6f7d28810dd`.
- Started `2026-11-15T08:06:04.034Z`; completed `2026-11-15T08:09:12.358Z`.
- Six attempts, six completed, zero failed, zero unexecuted; no stop condition triggered.
- **419,318 observed tokens / 1,000,000 budget** (B 123,983; C 295,335).
- **188,325 ms / 1,800,000 ms budget** (about 3 min 8 sec); all six turn timings below the 120-second limit.
- All six process-group cleanup and private-home removal confirmations passed.

The selected identity is verified from the CLI record; provider-reported backend identity remains unavailable. Observed usage is not a complete billing measurement. The collector cannot establish absence of hidden provider retries. Per-row model, effort, binary hashes, usage components, timestamps, receipt bindings and answer hashes are in [model-information.json](model-information.json).

## Per-answer results

| Ordinal | Scenario | Arm | Successful sequence | Final generation | Observed tokens | Turn ms | Protocol / bounded semantics |
|---|---|---|---|---:|---:|---:|---|
| 1 | ordinary | B | finalize → assemble | 1 | 33,403 | 30,969 | pass / pass |
| 2 | ordinary | C | finalize → assemble | 1 | 79,364 | 30,271 | pass / pass |
| 3 | latest | C | finalize → finalize → assemble | 2 | 79,728 | 29,006 | pass / pass |
| 4 | latest | B | finalize → finalize → assemble | 2 | 32,781 | 27,403 | pass / pass |
| 5 | rebuild | B | finalize → assemble → finalize → assemble | 2 | 57,799 | 27,244 | pass / pass |
| 6 | rebuild | C | finalize → assemble → finalize → assemble | 2 | 136,243 | 37,385 | pass / pass |

The four multi-finalization answers use distinct revision drafts and deliver revision B. In rebuild, revision A's assembly is intermediate; successful re-finalization invalidates it, then the new assembly supplies the final bytes. This is invalidation and rebuilding, not a lock against subsequent finalization. All 18 tool calls succeeded, within the eight-request per-turn limit.

## Semantic inspection and interpretation

Protocol acceptance alone does not validate ledger truth. The separate [semantic-review.json](semantic-review.json) records inspection of all six final answers and all ten finalized ledgers against the supplied evidence. Every ledger uses `hasDiff=false`, skips PR because no diff was supplied, and marks architecture, debt and tests assessed with no findings. This matches the deliberately complete, bounded inventories and direct assertion for the sole `identity(1)` contract. No ledger invents an assessed PR or a defect. The host computes the single composite score as `7500 / 75 = 100`; the final answer retains that canonical block unchanged.

Every answer scopes its conclusion to supplied evidence and distinguishes predicted source behavior from executed artifact operations. Row 5's checks list includes only predictions and omits host operations; it makes no false execution claim, and the frozen contract does not require listing every artifact operation. No supplied source/test was executed and no candidate repair was applied. C adds dashboard structure and recommendations, but these six instruction-following exercises cannot show that this improves diagnosis.

These are development-authored, deliberately instructed scenarios, one observation per arm per lifecycle, with expected clean classifications supplied explicitly. They are neither independent holdouts nor an adequately repeated efficacy benchmark. The result supports retaining the executor fix and separately designing a substantive, independently reviewed capability evaluation if authorized; it does not justify retroactively changing historical grades or declaring all skill issues solved.

## Evidence and offline reproduction

[raw.tar.gz](raw.tar.gz) contains every one of the 32 original run files unchanged: plan, execution, six admission intents, six records, six answers, six event streams and six receipts. [archive.json](archive.json) gives the archive hash and screening scope; [archive-files.json](archive-files.json) gives SHA-256 for each extracted file. Existing collector redactions are preserved. Pattern screening found no recognizable bearer credential, OpenAI key, JWT, private key or nonredacted token credential field; this screening is not a universal proof of absence of sensitive data.

From the repository root, extract into a fresh temporary directory and run the frozen offline verifier and reviewer:

```sh
tar -xzf docs/research/latest-receipt-retest/results/2026-11-15-complete/raw.tar.gz -C /path/to/fresh-temporary-directory
node evals/research/latest-receipt-retest/runner.mjs verify retest /path/to/fresh-temporary-directory/latest-receipt-live
node evals/research/latest-receipt-retest/review.mjs /path/to/fresh-temporary-directory/latest-receipt-live
```

The verifier also checks the sealed source and historical hashes against this checkout; reproduction therefore requires the frozen checkout and retained capability-smoke prerequisite used by its source binding. These commands do not run a model. Their saved outputs are [verification.json](verification.json) and [review.json](review.json). Independent QA and repository validation records accompany this report. Historical results, failures, snapshots and frozen evaluators remain unchanged.
