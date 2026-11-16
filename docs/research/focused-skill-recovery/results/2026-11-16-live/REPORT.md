# Focused skill comparison: recovery results

The frozen recovery completed all 36 planned B/C responses on 2026-11-16. The
[original account-routing failure](../../../focused-skill-retest/results/2026-11-16-stopped/REPORT.md)
remains archived. This recovery observed no failure or transport retry; 598,848
observed tokens and 569,220 ms were recorded (569,721 ms including the prior
501 ms failure). Provider work and billing for the original failure remain
unknown. The selected CLI model was `gpt-6.1-terra`, effort `low`, using Codex
CLI 0.169.0 and ChatGPT login. The provider did not independently report model
identity; selected identity is not a provider-verified identity. Individual
records, events, answers, receipts, and the execution manifest are retained here.

All 36 answers were reviewed against the frozen case criteria, with quoted
answer and input provenance in [annotations.json](annotations.json). The
[assessment](assessment.json) is reproducible with the frozen offline scorer.
Each cell is primary behavioral pass / reviewed, followed by unresolved counts.
B is the generic checklist; C includes the focused skill. A pass requires all
five primary axes, no missed expected issue and no established false claim.

| Skill | B generic | C skill | Expected issues found B / C | Established false-claim answers B / C |
| --- | --- | --- | --- | --- |
| review | 6/6 | 6/6 | 2/2 / 2/2 | 0 / 0 |
| audit | 6/6 | 6/6 | 2/2 / 2/2 | 0 / 0 |
| test | 4/6 | 5/6, one unresolved | 3/3 / 3/3 | 0 / 0 |

Review and audit show no observed primary pass advantage over the generic
checklist in these cases. In test, C satisfied the requested discriminating
witness on BV5-24 where B changed the assertion instead of the parser and did
not show the required catch-removal comparison. On BV5-23, B omitted the
requested mutant comparison; C provided one but also asserted a new overflow
problem. The contract does not specify numeric-string grammar or integer
representation, so that extra claim is recorded as pending rather than a
confirmed defect or false positive. BV5-22 B's wording attributes a test
coverage obligation to the contract although it explicitly specifies parser
behavior and failure propagation; the local swallowed-assertion diagnosis is
supported, but that wording deserves care in interpreting scope.

The unresolved BV5-23 assessment makes the frozen scorer return
`completeForPracticalCriterion: false` and `not-ready` for its per-skill
criterion; do not interpret the provisional counts as a confirmed overall
gain. This is one non-independent semantic review, not independent human
validation. There is one paired response per case, from six reused
research-authored case families; static supplied skill instructions do not
measure native skill discovery or performance on other models or populations.
Predicted witnesses were not executed during collection. No cases or live
calls were added beyond the frozen plan.
