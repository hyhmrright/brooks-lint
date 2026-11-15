# Retrospective calibration and prospective delivery repair

This package does not change any historical run, frozen source, judgment or result. It adds an exploratory retrospective calibration of all 96 saved responses and a prospective transport fork. No real model calls were made. Case-authored and same-workflow judgments are not independent human ground truth.

## Calibrated measurement

`ANALYSIS.md` states the reviewed rules and each of the 14 originally unresolved responses. `calibrated-annotations.json` applies the same seven component definitions to every response, arm and repeat, retaining exact original dispositions, answer/input hashes, exact answer quotes and typed references. Reference types are supplied file, contract or indexed evidence; nonexistent paths/indexes and forged quotes fail validation. This proves provenance, not semantic truth. Additional HC-03 test-protection observations now cite the actual non-file evidence. They are not silently counted as new mandatory recall targets.

The reviewer retained supported causal diagnosis, authority and honesty judgments; uniformly reconsidered taxonomy, dimension status, severity and causal ownership using each delivered answer and its ledger. The explicit ordinal decisions are human/model review artifacts, not a keyword classifier. C83's discarded finalization is not treated as the delivered semantic answer. Original delivery failure remains unchanged. C37 retains one status ambiguity: its debt-inventory request could mean broader inventory or ignore the stated local maintenance duty. C6 explicitly limits its unknown debt to broader scope; C70 separately fails duplicate policy ownership. B5/38/69 deny debt obligations despite the supplied local coordinated-update duty. All calibrated outcomes are post-hoc and should be independently reviewed before use.

| Component | B pass /48 | C pass /48 |
| --- | ---: | ---: |
| Causal diagnosis | 47 | 48 |
| Risk taxonomy | 31 | 48 |
| Proportionate severity | 48 | 48 |
| Dimension status | 43 | 46 (one fail, one unresolved) |
| Causal deduction ownership | 40 | 47 |
| Edit authority | 48 | 48 |
| Reporting honesty | 48 | 48 |
| All seven components pass | 29 | 45 |
| Historical exact delivery | 48 | 47 |

The conjunction is not simple accuracy or a general win rate. The original frozen completion rates remain B26/48 and C39/48. The calibration resolves most earlier ambiguities, retains a status uncertainty and identifies taxonomy/ownership failures instead of forcing every unresolved row to pass. Expected causal recall and finite repair outcomes are unchanged (30/30 and 9/9 each). The parser false claim at ordinal84 remains a diagnosis failure; the C83 delivery failure remains recorded. Exact labels and stop-enum agreement remain separate, unchanged metrics. Repeats are not independent tasks; this is not a fresh comparison or efficacy improvement.

## Prospective delivery state machine

The new `login-turn.mjs` is an additive derivative of the historical CLI169 transport. It actually routes each dynamic-tool call through `createTurnTool`, checks final response acceptance against the latest assembly, and records per-turn state. B and C must use exactly this same adapter in any future comparison. The original stateless helper and historical collectors remain intact.

Each successful finalization advances a random per-turn binding plus generation, invalidating previous assembly. Assembly must use exactly the latest ledger/report/receipt. Cross-turn, stale and fabricated receipts are rejected. Failed finalization does not advance state. Final output must exactly match a successful assembly for the current generation; re-finalizing after assembly invalidates it. Eight-request admission, scope checks, duplicate call rejection, no automatic model retry and bounded cleanup remain inherited. The new binding is host protocol state, not a model identity attestation.

The offline fake app-server drives the real successor process/RPC dispatch for valid latest assembly, stale assembly, failed-finalize recovery, post-assembly finalize, output mutation, request cap, duplicate call and wrong scope. Captured ordinal83's sequence is also replayed directly against the new adapter. The retained `offline-protocol.tar.gz` contains synthetic records and cleanup evidence. It is not evidence that a live model can respond successfully to the newly rejected request.

## Reproduce offline

```sh
node --test evals/research/capability-calibration/calibration.test.mjs
node evals/research/capability-calibration/drill.mjs FRESH_SYNTHETIC_DIRECTORY
node evals/research/capability-calibration/review.mjs docs/research/capability-calibration/calibrated-annotations.json FRESH_CALIBRATED_REPORT.json
node evals/research/capability-calibration/seal.mjs
```

Tests require local process inspection/termination permissions. `offline-tests-v1.log` records sandbox process-group inspection failures; rerunning with those local permissions passed. No remote model, account probe or real upstream is used. The transport fixture is a fake app-server executable, not a real Codex CLI server. No arbitrary candidate code executes in this package. History and input seals exclude QA outputs. A future live collector must explicitly bind the new transport/tool sources and receipt protocol, freeze model/budget/call count, rehearse its orchestration and obtain authorization. The historical live collector cannot be silently repointed while retaining its old freeze. No new live plan or budget is claimed here.
