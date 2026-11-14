# Offline corrections after the complete v5 campaign

## Evidence and scope

The immutable source is `../skills-benchmark-v5-recovery2/results/2026-11-14-completed/REPORT.md` and its 324 annotations. A is case-only, B generic checklist, C skill guidance. The strict primary totals remain A 63, B 89 plus one pending, C 87 plus one pending, each out of 108. No original label, answer, grade, frozen snapshot or execution source is changed by this work. No live model request is made.

## Diagnoses before remedies

| Skill | Symptom → Source → Consequence → Remedy |
| --- | --- |
| Review | C 17/18 plus one pending versus B 18/18 → ambiguous pagination input/output wording → an optional obligation can become a false defect → distinguish preconditions from output duties and retain alternative readings; no new deduction without contract evidence. |
| Audit | B and C both 18/18, A 12/18 → scoped remedies matter, but the supplied skill adds no observed gain over the checklist → no justified claim of incremental benefit → keep existing audit process, do not add complexity to chase a tied result. |
| Debt | C 18/18 versus B 15/18 and A 11/18 → coordinated-change witnesses/remedies are useful in these families → bounded completion gain → retain the workflow and its evidence requirements; no speculative rewrite. |
| Test | B and C both 15/18 → several answers omit baseline/mutant comparison; supported novel findings expose oracle limits → correct observations alone do not demonstrate test protection → explicitly require the same assertions on baseline and contract-breaking mutant, with predicted/executed status. |
| Health | C 10/18 strict versus B 17/18 plus pending → all eight C delivery mismatches are a missing final LF, not changed findings/scores → exact transport contract fails despite identical visible report content → deterministic artifact assembly and receipt-bound delivery checking; separately disclose transport limitations. |
| Sweep | C 9/18 versus A/B 6/18 → empty patch sets conflate unknown and protected obligations, and finite-integer input assumptions become invented validation duties → wrong stop codes and unnecessary behavior changes → explicit stop precedence and input-domain gate before diagnosis/repair. |

### Health: important qualification of the strict result

The five historical mismatches are original ordinal 75 and first-recovery ordinals 79, 86, 182, 198. The new mismatches are ordinals 296, 303, 305. For every one, `finalReport === answer + '\n'`; there is no other text difference. The final report is preserved in the successful tool call and the answer in its raw record. This refines the earlier phrase “report delivery failure”: it is a terminal-newline discrepancy under a deliberately byte-exact criterion, not eight losses of diagnostic content or arithmetic.

The frozen `completedAnswer` collector (`codex-login-turn.mjs`) retains completed agent-message text and joins messages with newlines; it does not trim answer text. The absence is already present at that protocol boundary. These records do not distinguish model emission from an earlier CLI/provider transformation. There is no basis to promise that a new prose instruction alone repairs the transport. The old strict scores remain unchanged. A future transport-tolerant endpoint would need a separately declared policy, with strict and normalized results reported separately; it must not silently overwrite this study.

### Implemented offline changes

- Shared contract-domain guidance distinguishes caller preconditions, callee promises and explicit rejection duties, and requires baseline/mutant comparisons for test-quality claims. No benchmark IDs or labels enter shipped instructions.
- Sweep checks the input domain before repairs and chooses a blocked stop when a missing obligation prevents assessment. A clean stop requires a completed assessment. Budget exhaustion retains precedence, with blockers still reported.
- Health preserves terminal whitespace and uses a new separate delivery helper. `verifyDelivery` binds the ledger/report to a retained finalizer receipt and compares exact candidate text. `assembleDelivery` generates a JSON report field directly from that artifact instead of asking a model to retype it. CLI assembly refuses overwriting a previous artifact.
- Existing scoring/finalization implementation and frozen study files are untouched. The new helper is available to native shell workflows and future host adapters, but is not retroactively injected into the frozen v5 collector.

## Verification limits and next model gate

Offline tests can establish receipt binding, exact comparison, safe assembly and rejection of tampering. They cannot establish model compliance, transport fidelity after the last checked boundary, independent diagnosis truth or repair success. The evidence is 36 same-workflow cases in related families repeated three times, not 324 independent tasks; recall is already 48/48 in every arm.

After offline QA, a separately frozen small model check should first exercise protected-domain versus explicit-validation-duty cases, unknown versus known-contract stop decisions, and report transport with trailing-newline variants. Retain a generic-checklist control and both strict byte fidelity and substantive content metrics. Do not launch it implicitly. Model, calls and budget must be stated to the maintainer before any new live evaluation.
