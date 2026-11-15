# Offline QA: second efficacy recovery

Verdict: **PASS** for offline recovery preparation. No real model calls were made.
This does not establish that the external workspace-routing failure is resolved.

The final frozen plan is
`53fd92a406740bafde0315a78c7544644080a235c832719b63671768f002b3e3`.
All new code is additive; no tracked historical source, raw response, annotation,
assessment, failure record or archive differs from the preceding commit.

## Validation evidence

| Check | Result | Record |
| --- | --- | --- |
| Repository validation | Exit 0, including a repeat after the final source change | `qa/validate.log`, `qa/validate-final.log` |
| Complete `npm test` chain | Exit 0; historical recovery suites completed | `qa/test.log` |
| Structural evals | Exit 0, 64 scenarios | `qa/evals.log` |
| Frozen parser benchmark | Exit 0, 30 reports, 100% parser fidelity | `qa/benchmark.log` |
| Final recovery protocol tests | Exit 0, 11 passed, 0 failed/skipped; 107.763 seconds | `qa/protocol-final.log` |
| Final plan validation | Exit 0, final hash and remaining budgets match | `qa/freeze-validation.log` |
| Archived payload and diagnostic verification | Exit 0, 219 payload hashes, 38 completed answers and 1 failed attempt | `qa/archive-check.log` |
| Cross-document comparison | Exit 0 | `qa/cross-document.log` |

`qa/protocol.log` preserves the author's earlier 11-test pass on initial freeze
`78f8c098b2b3ca622fe22a0711a4d4f12e42b36e65703739517698fea37cb012`.
The final source adds admission-envelope verification and mutation coverage;
`qa/protocol-final.log` is the applicable result for the final frozen plan. The
ordinary `npm test` command does not include this new protocol suite, so it was
run separately. All changed recovery sources are covered by the final focused
suite; the full repository suite also completed successfully.

## Boundary comparisons

- Original slots 1–38 remain preserved; new schedule is exactly original slots
  39–72, with unchanged case IDs, prompts, arms and repeats. The maximum is 34
  additional attempts and 73 lifetime attempts including the retained failure.
- Remaining observed-token allowance is 7,574,558; adding prior 2,425,442 yields
  the original 10,000,000 ceiling. Remaining active collector time is 20,300,693 ms;
  adding prior 1,299,307 ms yields 21,600,000 ms. Per-turn deadline is 120,000 ms,
  shortened to remaining collector time. Tests exercise token exhaustion, time
  exhaustion, shortened deadlines, unknown usage and retry notifications.
- First routing failure stops after one attempt and leaves 33 unexecuted slots.
  A preflight failure leaves an admission record and cannot silently reuse its
  directory. Verification rejects changed admission plan hash, admission status
  or preflight model-turn count, and changed per-attempt routing diagnostics.
- The prior raw archive retains SHA-256
  `646cf2577c685a274668bedae7ae1e2092d5aa4041730c255036af9f49d9d62c`.
  All 219 payload sizes/hashes were checked after temporary extraction, followed
  by the original campaign verifier. The saved attempt-39 diagnostic equals the
  independently recomputed diagnostic from that archive.
- Original annotations regenerate the original assessment exactly. Merge rejects
  duplicate or wrong slot identities, keeps failed attempts outside answer
  denominators, and refuses simulated runs as live semantic evidence. Synthetic
  completion tests demonstrate mechanics only, not skill effectiveness.
- Model and effort remain `gpt-6.1-terra / low`, CLI `0.169.0`; original executable,
  tool-host, proxy, isolation, delivery and smoke requirements remain bound.
- Package and four manifests, six README badges, landing-page JSON-LD and top
  CHANGELOG all agree on 1.9.1. The source inventory derives 12 books and agrees
  with README/AGENTS/GEMINI wording. AGENTS agrees with 64 structural scenarios.
  All six shipped skill descriptions contain the required negative boundary.

## Limits retained

Attempt 39 failed during `account/read`, before any observed `thread/start` or
`turn/start`; its endpoint, network/proxy/account/provider cause and billing remain
unverified. There is no speculative credential, route or automatic-retry change.
Missing usage is not converted to zero billing. Token admission can overshoot by
one in-flight call. The clock counts active collection, not inter-campaign waiting
or prior uninstrumented preflight time. Historical verification still requires
the retained local smoke directories; missing prerequisites fail closed. Explicit
user authorization is required before a new real collection.
