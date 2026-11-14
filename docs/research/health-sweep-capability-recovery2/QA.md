# Independent offline QA

Verdict: **PASS** for preparation of the second capability recovery. No real model calls were made. This does not establish that remote connectivity is repaired or authorize execution.

Final freeze: `202ab8d1c5eb51a6f424326022f2832a3a263b6d75404f868cc5344dcee8f78f`.

## Automated gate

All commands ran after the final source freeze and exited zero, in order:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-validate.log` |
| `npm test` | 222 legacy checks and 1,382 Node tests; 1,604 total | `qa-test.log` |
| `npm run evals` | 64 structural scenarios | `qa-evals.log` |
| `npm run benchmark` | Frozen parser benchmark passes | `qa-benchmark.log` |
| `node --test evals/research/health-sweep-capability-recovery2/recovery.test.mjs` | 15/15 pass | `qa-targeted.log` |

The new recovery tests are run explicitly, separately from the repository test command. No source edits were needed during QA.

## Independent boundary checks

- Extracted `offline-evidence.tar.gz` to a new temporary directory. SHA-256 is `5619f85eacfd4d29924e828ed93e98ca9fc99441c99ddfc8644040af8a5aaf13`. Replayed the 41-answer success run and all nine stop controls through the verifier.
- Independently changed cumulative tokens, terminal reason, schedule ordinal, completion time, per-turn timeout, prompt hash and admission time. All seven mutations were rejected; original extracted bytes were restored after each mutation.
- Compared all 55 preserved annotations to the exact concatenation of the original 53 and first-recovery two annotations. Both failures remain distinct, original ordinals 54 and 56. No prior judgment was regraded.
- Revalidated all 360 directly bound historical files, original plan/source bindings and real smoke requirements. The recovery schedule is exactly ordinals 56–96. Previous totals are 57 attempts, 55 completed, 3,543,939 observed tokens and 1,641,455 ms. New limits are 41 attempts, 8,456,061 observed tokens and 27,158,545 ms, at most 98 lifetime attempts and 120,000 ms per model turn.
- Compared version 1.9.1 across package, four manifests, six README badges, landing-page JSON-LD and top CHANGELOG section. Derived 12 books from source frontmatter and compared README/AGENTS/GEMINI descriptions; actual 64 evals match AGENTS; all six skill descriptions contain negative-trigger boundaries.
- Reviewed explicit live admission, fresh directories, same original successful real-smoke receipt, model/toolchain/proxy binding, budget/deadline receipts, candidate evidence and cleanup verification, terminal consistency and new-answer-only merge admission. Docker and login transport implementations are unchanged and remain hash-bound.

Independent results and cross-document counts are recorded in `qa-independent.json`; raw check output is in `qa-independent.log`. Adding this QA report does not change the source seal.

## Diagnostic limits retained

Failure 54 was an account/read routing-discovery failure before any recorded thread/start or turn/start, with unknown usage. Failure 56 happened after two successful tool calls, reports 75,482 observed tokens and ended after 21,230 ms monotonic. It exposes `Reconnecting... 2/5`, a stream disconnection and connection refusal without an HTTP status. Both confirm process/private-home cleanup. These are different observed phases; no specific endpoint, common root cause, remote repair or zero billing is established. The earlier unknown usage remains explicit in renewed observed-token admission.

Captured failures are injected at the transport boundary during offline tests; this is not a newly reproduced real CLI routing fault. Hidden retries/backend identity and complete billing remain unverified. Historical scoring ambiguities and non-file evidence limitations remain unchanged. No unresolved blocking QA finding remains.
