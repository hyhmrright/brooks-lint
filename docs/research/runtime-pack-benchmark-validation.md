# Runtime pack benchmark offline validation

Date: 2026-11-10. Final status: PASS for offline preparation. Real model calls:
**zero**. No model or reasoning effort has been selected for this new study.

The [methods survey](skill-benchmark-methods.md) covers eight relevant projects
and reconnects the work to Discussion #45. The
[benchmark plan](runtime-pack-benchmark.md) implements twelve public development
cases, executable witnesses, scoped guidance comparisons, separate guardrails,
evidence-based annotation records and verified raw-record reporting.

## Two QA rounds

- [Round 1 — FAIL](runtime-preparations/2026-11-10-pack-benchmark/qa-round1.md):
  all automated gates passed, but independent inspection reproduced a scoring
  provenance gap. A summary answer could be changed and rehashed without changing
  its raw execution record.
- [Round 2 — PASS](runtime-preparations/2026-11-10-pack-benchmark/qa-round2.md):
  the public report CLI now rejects that exact corruption. It verifies safe
  artifact paths, raw hashes, prompt/registration identity, answers, status,
  simulation, model/effort, usage and timing before scoring. Legitimate archived
  records still generate a report.
- [Both rounds' command logs](runtime-preparations/2026-11-10-pack-benchmark/qa-logs.tar.gz)
  preserve the execution evidence. This is agent QA, not independent human review.

## Final checks

| Check | Result |
| --- | --- |
| `npm run validate` | PASS |
| `npm test` | PASS, including 17/17 targeted pack tests |
| `npm run evals` | PASS, 64 structural cases |
| `npm run benchmark` | PASS, frozen parser fidelity 100%; not model accuracy |
| `npm run evals:codex:validate` | PASS, seven offline behavioral fixtures |
| Full and smoke freeze/source validation | PASS |
| Public CLI original-forgery regression and valid archive report | PASS |
| Raw simulation archive path/credential/metadata inspection | PASS |
| Version/book/eval/skill-boundary consistency | PASS |

The [offline evidence](../../evals/research/runtime/pack-benchmark/offline-evidence.json)
contains fixture witnesses and handwritten simulated scoring controls.
The [fake CLI archive](../../evals/research/runtime/pack-benchmark/offline-fixture.tar.gz)
contains nine simulated turns, not actual Codex/model/provider execution. Its
900 reported tokens are synthetic and are not an account charge or estimate.

## Frozen execution alternatives

| Scope | Primary calls | SHA-256 |
| --- | --- | --- |
| Full: 12 cases × 3 arms × 3 repeats | 108 | `16fdce3cd1696da966115924f285a87547064af20a1b935cccb23c2ca771ad29` |
| Smoke: 3 cases × 3 arms × 1 repeat | 9 | `7758a822670bc640d73ee93ac63eab15c25aa2a606993780d781159762cf26a0` |

These are alternative scopes. Running both would require 117 primary calls and
an explicit scope decision. The full plan has a 3,000,000 observed-token admission
stop and six-hour study budget; smoke has 250,000 and thirty minutes. Both use a
180-second local turn deadline, stop on the first failed turn and have zero harness
retries. Usage limits are checked between calls and can overshoot by one call;
neither is a hard provider billing limit. No dollar cost or subscription allowance
claim is made.

After the maintainer selects a model and effort, bind an explicit registration
and verify actual CLI/login compatibility before executing the selected plan.
The preparation does not establish a measured skill benefit, harder benchmark,
independent holdout, native dynamic activation or production readiness. Current
text-guidance calibration results must remain separate from those future claims.
