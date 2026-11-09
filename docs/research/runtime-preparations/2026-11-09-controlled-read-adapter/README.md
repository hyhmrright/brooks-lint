# Self-led executor development: controlled-read adapter

## Decision and outcome

The maintainer requested completion of design, implementation, verification and
reporting without waiting for Discussion replies or external reviewers. This is
an explicit **self-led, model-assisted review disposition**, not independent human
validation. Existing frozen plans, examples, scores and historical records remain
unchanged. External participation is optional; missing production evidence still
blocks live execution.

The new `controlled-read-fixture-v1` adapter implements a small alternative:
a trusted parent owns fixture credentials and HTTP transport; model-authored tool
requests can retrieve only exact preloaded file bytes through `read_file`. Tool
requests cannot execute code, spawn processes, read OS paths or select endpoints.
This removes those capabilities from this adapter rather than claiming an OS
sandbox can contain arbitrary tools. The trusted Node parent is outside this
boundary. It is **not the native Codex CLI, not an OpenAI API implementation, not
equivalent to the frozen 81-turn study and not a live-ready executor**.

Eight corrected owned-local HTTP controls retain request/response body bytes, auth-match
booleans, requested/reported identity, read hashes, transport errors and reservation
ledger entries in [observations](observations/). All responses and the fixed
`fixture-only-...` credentials are authored public test data. There are zero real
model calls and zero real credentials. The recorder saves Node application body
bytes, not wire/TCP captures. The earlier collection is retained under
[development-initial-observations](development-initial-observations/): it predates
the shared monotonic deadline, aggregate packet caps and full authored response
body recording. Its successful controls do not establish those later properties.
`development-before-late-check/` preserves the next collection before adding an
explicit post-response monotonic deadline check. The QA1 collection is now preserved in `qa1-failed-observations/`; it missed
server-body capture on a deadline because server closure could precede response
closure. [QA1](qa/report.md) remains unchanged. Corrected `observations/` pins the
repaired adapter source; no earlier collection was overwritten.

## Implemented controls and diagnosis

- **Symptom:** Native CLI tools shared the model broker's network authority.
  **Source:** Same allowed socket/port is not client identity.
  **Consequence:** A hostile tool can consume transport budget.
  **Remedy:** This alternate adapter exposes only an immutable in-memory read
  capability, while transport stays in trusted parent code. Test unknown tools,
  traversal, extra fields, unknown files, mutated packets and evaluation-only
  filenames. Arbitrary tool execution remains unsupported.
- **Symptom:** Local response strings could be mistaken for verified model identity.
  **Source:** Request settings and response reports are different evidence.
  **Consequence:** Wrong-model runs could contaminate comparisons.
  **Remedy:** Record both fields, stop on missing/mismatched model or reasoning,
  keep actual responding model null and reported matches explicitly unauthenticated.
- **Symptom:** Continuations can spend more time or money than one request.
  **Source:** Per-request bounds do not bound a whole run.
  **Consequence:** Tool loops may exceed intended limits.
  **Remedy:** Share one monotonic run deadline, cap requests and bytes, bound file
  count and aggregate packet size, reserve integer fixture cost units before each
  dispatch, and reject model/effort changes. A two-exchange delayed regression
  verifies that continuations do not reset the deadline. These fixture units are
  not token estimates, prices or a production billing cap; actual cost is null.
- **Symptom:** Credential errors can trigger hidden extra attempts or leaks.
  **Source:** Refresh/retry and response echo paths.
  **Consequence:** Unexpected spend or disclosure.
  **Remedy:** Parent-only fixture auth, no automatic retry/refresh/redirect, explicit
  401/403/429/503 controls, credential replacement only in a fresh run, and literal
  fixture-key echo rejection. Arbitrary encoded echoes and production OAuth remain
  unverified; this is not a general secret scrubber.

## Full development-to-report workflow

| Stage | State | Completion condition |
| --- | --- | --- |
| Scope and review disposition | Recorded | Self-led review accepted; independence limits disclosed |
| Adapter design and offline implementation | Implemented | Restricted reads, transport, identity and budget guards |
| Owned HTTP tests and archived controls | Recorded | Positive/negative controls, exact bytes, source snapshots |
| Repository and independent agent QA | [QA1 FAIL](qa/report.md) preserved; [QA2 PASS](qa-round2/report.md) | Required gates pass and missing timeout capture fixed |
| Native arbitrary-tool containment | Blocked on environment | Working OS-owned VM/container boundary, hostile detached-child and owner-death tests |
| Production authentication | Not run | Reviewed credential channel, actual login/access/expiry evidence |
| Test model selection and price | Unbound | Verify available economical model and disclose quantity/budget before calls |
| Smoke test | Not run | Limited separately registered real calls, excluded from study |
| Frozen comparison | Not run | Preserve 9 cases × 3 arms × 3 repetitions; new adapter needs its own registration/design |
| Scoring and report | Prepared historically; new results absent | Blind arm labels where feasible, rubric grading, dispute log, rates and execution failures |
| Commit and push | Parent orchestrator after QA | Task-owned files only; no tag/release |

[model-switch-journal.json](model-switch-journal.json) records the development
session model from system context, no performed switch, unbound test model and
future switch requirements. It does not claim server-observed identity or that
changing the chat model changes a test executor. No automatic expensive fallback
is permitted. A future live batch must separately pin model, reasoning, provider,
executor, prompt assembly and budget. Server usage is untrusted reported evidence;
missing price/usage cannot be interpreted as zero cost.

## Actual environment limit and next implementation

Read-only [host probes](host/) found Docker CLI 29.9.2, but no running Docker API:
its desktop-linux socket is absent. No Podman, Colima, Lima, Orb or QEMU binary
was found on the inspected PATH. Seatbelt exists, but earlier results do not prove
containment of arbitrary detached descendants, host IPC or keychain isolation.
No daemon was started, software installed, host security policy changed, credential
file read, production endpoint contacted or native CLI executed in this phase.

For native Codex execution, the next environment step is making a disposable
VM/container backend available, then proving tool/client network separation,
job ownership, owner-death cleanup, immutable inputs, credential isolation and
bounded output. A Docker client alone is not enough. This alternative read adapter
can continue evolving offline now; substituting it for the frozen CLI experiment
would change the treatment and requires a separately frozen study. Matching
response names never authenticate the underlying model, and provider internal
retry/billing behavior remains outside local observation.

## Reproduction and evidence

```bash
node --test evals/research/runtime/prospective/controlled-read-adapter.test.mjs
npm run evals:runtime:controlled:validate
```

Default `npm test` and prepared tests include the new regressions. Archive
validation hashes saved sources and body evidence without executing archived
source. A new collection can be written to a new directory with
`node evals/research/runtime/prospective/controlled-read-drill.mjs record /new/path`.
[author-validation.json](author-validation.json) and `logs/` retain sequential
command metadata and exact stdout/stderr. Offline success is not live readiness.

## QA1 failure and bounded capture repair

Independent QA1 found that the deadline receipt had eight client-observed bytes
but a null server-body record. All automated commands had passed; the old archive
validator did not enforce the missing evidence. This is a recorder/validation
failure, not a model result. The failed evidence and QA report remain preserved.

The repaired fixture waits for both server close and each response close under a
one-second capture deadline. Unknown cleanup is explicit and rejected by archive
validation. Server write calls retain a bounded prefix, written/retained counts
and hashes, terminal state and status. Client-observed retained body bytes have a
separate base64 field/hash/count. The validator checks exact request bytes against
adapter request hashes and structured bodies; it requires complete terminal
capture and checks client/server common prefixes. A completed transport additionally
requires equal complete bodies and status; a deadline may legitimately have a
server-written suffix never received by the client. Server writes do not prove
client receipt. All fixture auth strings are public dummy values; raw fixture
body recording is not a production credential-safe logging implementation.

Two new regressions repeat drip deadlines and reject missing/corrupt/cross-layer
receipt evidence. There are now 27 focused tests. The final source-bound corrected
collection has eight passing authored controls. `remediation-validation.json` and
`remediation-logs/` retain the post-repair full author gate. [Independent QA2](qa-round2/report.md) passed the repaired final sources: validate, test, structural evals and controlled archive validation. The test command passed 222 helper, six provider and 580 main tests; the 27 controlled-read tests are included in the main count. [QA2 results](qa-round2/results.json) preserve exact logs and hashes; QA1 failure records remain unchanged.
