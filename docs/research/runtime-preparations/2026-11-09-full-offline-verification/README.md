# Full offline verification report

## Scope and outcome

On 2026-11-09, 19 sequential offline commands completed successfully against
commit `2c1c432af7e2a07256747b8c7ae03e4909f018e7` on
`research/domain-packs`. The first 17 are repository and runtime verification
commands; the last two recompute historical model-review metrics and compare
exact output bytes with the committed metrics. All 19 exited zero; both byte
comparisons matched. See [results.json](results.json) for start/end timestamps,
command arguments, execution times, exit codes and SHA-256 hashes of the exact
stdout and stderr files under [logs/](logs/). All stderr files were empty.
The run tested that commit's content before adding this report. It did not test a
future commit or remote CI. The test commands' outputs are retained without
reformatting. No fresh real-model evaluation was run.

| Verification | Outcome and scope |
| --- | --- |
| `npm run validate` | PASS for version 1.9.1. Changelog coverage explicitly stood down because the version is already tagged; it was not audited. |
| `npm test` | PASS: 222 helper tests, 6 provider tests, and 553 main tests, with no failures. These are three suites from the same command. |
| `npm run evals` | PASS: 64 scenario IDs, required fields, mode/risk coverage and risk-code references validated structurally. |
| `npm run evals:runtime:offline` | PASS: 291 tests. This overlaps `npm test`; do not add its count to the main suite as independent coverage. |
| `npm run evals:runtime:prepared` | PASS: 195 tests plus calibration and candidate validators. These tests also overlap `npm test`. |
| `npm run evals:runtime:research:validate` | PASS: 43 research cases and offline A/B/C plan validation. |
| `npm run evals:runtime:drill` | PASS: 9 cases, 27 synthetic turns, 15 verified files, zero live model calls. |
| `npm run evals:runtime:reviews:validate` | PASS: 54 synthetic review entries and 12 files, zero live model calls. |
| `npm run evals:runtime:executor:validate` | PASS: 9 offline executor archive files, 81 synthetic turns, four boundary attempts. |
| `npm run evals:runtime:{process,channel,cli,stream,boundaries,completion}:validate` | Each of six separately invoked archive validators passed. They verify saved records and applicable offline guards, not a new native CLI or model run. Expected negative observations, including failed nested sandbox launches, remain negative findings even when the archive validator passes. |
| `npm run benchmark` | PASS on the frozen 30-report parser corpus: risk-code precision/recall 100% (56 true positives, zero false positives and false negatives), valid SARIF 30/30. This is parser fidelity, not model diagnostic accuracy. |
| `npm run evals:codex:validate` | PASS: 7 Codex behavioral fixtures validated offline; no model execution. |
| Historical dispute and RT-40 analysis scripts | Both exited zero and reproduced their committed `metrics.json` byte for byte. This verifies computation from existing records, not the semantic correctness of the judgments. |

## Historical model results and their limits

The earlier [RT-38–RT-43 comparison](../../runtime-results/2026-11-06-terra-dispute/README.md)
used `gpt-6.1-terra`, medium reasoning and Codex CLI 0.167.0: 53 of 54 planned
turns completed, with 17 complete A/B/C triplets. Frozen primary composite
correctness was A 16/17, B 13/17 and C 16/17. Each arm found all 5 expected
defect issues and made zero false defect assertions on 6 protected responses.
These denominators count repeated responses, and represent only six exposed
cases. Review was by a model, not an independent human. The original published
primary results are preserved.

The subsequent [RT-40 recheck](../../runtime-results/2026-11-06-terra-rt40-recheck/README.md)
identified inconsistent application of an explicit-evidence threshold: all nine
answers correctly diagnosed the unresolved contract. With that threshold applied
uniformly, the supplemental composite becomes A 16/17, B 13/17 and C 15/17;
this is a post-hoc sensitivity, not a replacement primary result. The small,
non-independent sample and model grading do not establish a causal or general
improvement from the experimental runtime skill. Revision 2 of its guidance has
not had a new live comparison.

## Readiness and unresolved work

The previous [owned-local completion archive](../2026-11-09-hc-executor-completion/README.md)
contains 128 native CLI attempts and four Node controls against local fixtures,
including an 81-turn protocol rehearsal. Those answers, model identities and
usage values are synthetic; availability of guidance files does not prove they
were read. Its 81 canonical study responses remain `not-run`; this report does
not add them to a model-performance denominator. Offline validators confirm
record consistency and enforce refusals; they do not resolve production
credentials, authenticated responding-model identity, provider retries or billing,
host IPC/keychain behavior, hostile descendant isolation, or independent human
review. The archive's `live_ready` remains false. Direct no-proxy routing and
nested built-in read-only tool behavior also remain unverified on this host.

The prior [Discussion check](../2026-11-09-discussion-check-completion/README.md)
recorded no outside reply at its last check; that is not independent human review.
Independently authored holdouts and human review remain outstanding. No live
provider/model requests, real credentials, releases or new native CLI captures
were used in this verification.
