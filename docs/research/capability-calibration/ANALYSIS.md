# Post-run calibration and delivery diagnosis

This is a new retrospective calibration of the completed 96-response capability study. It does not replace its frozen labels, annotations, statistics or raw records. Rules below were developed after observing answers; any recalculated statistics are exploratory and must be labeled accordingly. A future efficacy claim needs a newly frozen protocol and real answers. No model calls were made for this analysis.

## Evidence and diagnosis

### 1. Evidence provenance was narrower than the task

**Symptom:** HC-03 explicitly says tests assert only web, but the annotation validator accepts novel support only from `input.files`. **Source:** `health-sweep-capability-live/review.mjs` source-path admission versus the actual public `input.evidence` field. **Consequence:** a supported test-protection gap was held unresolved merely because its evidence was not a source file. **Remedy:** use typed references to file content, contract or an indexed evidence item. Bind exact quotes, input hash and answer hash; reject invented references and changed quotes. This verifies provenance, not causal truth.

### 2. Severity and label agreement were conflated with semantic evidence

**Symptom:** a bounded local coverage suggestion was compared to a fixed warning, and local protected behavior was treated as conflicting with an overall unknown assessment. **Source:** fixed HC-05/06 expectations versus `skills/_shared/common.md` severity calibration and the health guide's scoped evidence map. **Consequence:** sound qualified answers became unresolved despite preserving the actual uncertainty. **Remedy:** separate causal diagnosis, risk taxonomy, severity, dimension status, causal ownership, global label agreement and tool delivery. Assess semantic claims at their stated scope. Keep exact-label agreement as an explicit protocol measure, not a substitute for semantic truth.

### 3. Cause ownership requires mechanism-level review

**Symptom:** HC-03's expected one deduction cannot accommodate a separately established test blind spot, while ordinal 70 deducts for both shared-policy drift and its coordinated-edit burden. **Source:** health-guide Step 1 requires one scoring owner per causal finding and admits separately supported mechanisms. **Consequence:** a closed count either rejects legitimate protection analysis or permits the same policy-maintenance cause to be charged twice. **Remedy:** assign causal IDs and explain independence. A missing batch assertion is independently repairable from the duplicated policy; changing the policy value does not fix its test coverage. The missed batch update and the two-file coordination burden are manifestations of the same shared-policy mechanism here, not two deductions simply because PR and Debt both mention it. Keep both observations in prose with one scored owner.

### 4. The host adapter has no notion of superseded finalization

**Symptom:** C ordinal 83 finalized twice, assembled the first receipt and returned that assembly exactly. The second finalization contained a different diagnosis. **Source:** the historical adapter calls the stateless `finalizeTool` for every request; `assembleDelivery` correctly validates its supplied receipt but cannot know a later receipt exists. **Consequence:** the final answer can be locally valid yet fail the frozen latest-finalize chain. **Remedy:** add a prospective per-turn stateful adapter that admits assembly only against the latest successful finalized artifact. Reject stale, cross-turn and fabricated receipts. Final acceptance must equal a successful assembly bound to that same latest artifact. A later successful finalize invalidates an earlier assembly; a failed finalize must not advance state. Keep the original metric and ordinal-83 failure intact.

## Re-review of every historically unresolved answer

The 14 rows below are all unresolved-without-definite-failure cases in the saved assessment. These are calibrated component dispositions, not edits to historical four-axis judgments.

| Ordinal | Case / arm | Calibration |
| --- | --- | --- |
| 5 | HC-03 / B | Policy defect and separate test gap supported; two mechanisms are admissible. R1 and T1 are incorrect taxonomy for the stated mechanisms. Resolve ownership ambiguity; retain definite taxonomy failure. |
| 6 | HC-03 / C | R2 missed synchronized change is supported by the ticket and previous missed update; R3 is not the only permissible classification. Distinct T5 is supported by the evidence item. Two deductions are not automatically duplicate. |
| 10 | HC-05 / C | Suggestion is supported for a local regression-protection gap with limited evidenced impact; the shared rule explicitly permits this. Do not fail merely for differing from frozen warning. |
| 11 | HC-06 / C | Local source behavior is protected while test/architecture/debt remain unassessed. Semantic status passes; preserve global label mismatch separately. |
| 12 | HC-06 / B | Same scoped distinction as 11; no unsupported clean dashboard score. Semantic status passes. |
| 37 | HC-03 / C | R3 policy duplication and independent T5 protection gap supported. Non-file evidence can establish the latter. Resolve two-cause ambiguity without inventing an extra false claim. |
| 38 | HC-03 / B | Same two supported mechanisms, but R1/T1 are wrong taxonomy. Retain that explicit failure independently of ownership. |
| 41 | HC-05 / C | Same locally bounded Suggestion rationale as 10. |
| 43 | HC-06 / B | Report explicitly limits its correct behavior claim to the supplied contract and leaves unavailable dimensions unassessed. Semantic status passes. |
| 44 | HC-06 / C | Explicitly distinguishes local expression protection from unknown test protection. Semantic status passes. |
| 69 | HC-03 / B | Same diagnosis/ownership resolution as 5/38; wrong R1/T1 taxonomy remains a failure. |
| 70 | HC-03 / C | Policy drift and coordinated-maintenance deductions share the policy cause; retain one scored owner plus distinct T5. The third deduction fails ownership, despite supported prose observations and valid risk families. |
| 74 | HC-05 / C | Same locally bounded Suggestion rationale as 10/41. |
| 76 | HC-06 / B | Correctly qualifies input interpretation and unknown inventories. Semantic status passes; global label disagreement remains measurable. |

These resolutions do not excuse other defects. For example, a dimension explicitly supplied as complete cannot be called absent, and a production defect caught by a supplied test is not itself a test-quality defect. In HC-03, the complete consumer inventory and coordinated-update obligation can support a narrowly scoped maintenance finding; assertions that no such obligation exists need separate status review. This is distinct from requiring a broad project debt score. Do not automatically turn all HC-03 rows into whole-answer passes from the table alone.

For HC-05, both Warning and Suggestion can be supported by a proportionate stated consequence in this small fixture; Critical requires additional exposure absent here. This tolerance is case-grounded, not a global rule accepting any adjacent severity. For HC-06, a global `protected` label is not a clean-test claim when the narrative and ledger explicitly retain unknown test protection.

## Uniform application and implementation handoff

Apply the revised rules to all 96 rows, both arms and every repeat, not only these 14. Retain a per-row decision record with exact answer quote, input references, old disposition, calibrated component verdict and reason. Keep independent metrics for diagnosis/causal recall, taxonomy, status, severity, ownership, authority, honesty, repair outcome, label/stop protocol, and delivery. Report unresolved per component and avoid calling a stricter conjunction a simple accuracy rate. Admit novel supported claims without retroactively making their discovery mandatory for other answers. Preserve the finite repair checks and the observed parser false positive.

Implement an additive calibration package and a successor adapter/transport in new paths. Do not alter a hash-bound historical guide, tool, collector, source or report merely to satisfy a new freeze. The shipped stateless delivery helper remains useful for byte checks; the needed freshness guarantee belongs to a per-turn host state machine. A future integration must actually route tool calls through that state machine rather than testing it in isolation and claiming the collector is fixed.

Required offline controls: indexed non-file evidence accepted; invented paths/indexes/quotes and mismatched input/answer hashes rejected; scoped protected plus unknown dimensions accepted; unsupported clean score rejected; supported low-impact severity accepted and unsupported Critical rejected; distinct policy/test causes admitted and duplicated cross-dimension policy deduction rejected; valid same-generation assembly passes; old/cross-turn receipt rejected; later finalization invalidates assembly; failed finalization does not advance; exact delivered bytes and post-assembly edits checked; captured ordinal-83 sequence fails prospective stale assembly. Equal tools and state rules must apply to both B and C. No automatic model retry or silent correction of an answer is permitted.

Offline replay can establish that the successor rejects stale delivery, not that a model will recover from that rejection or that any efficacy score improves. Keep future model execution gated on a separate frozen plan and user authorization.
