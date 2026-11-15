# Capability efficacy v2: second recovery, 34 remaining slots

Status: frozen for explicit authorization; no live model calls during preparation.
This is a continuation of the same 72-answer developmental experiment, not a new
independent sample. Preserve all 38 completed responses, their annotations, and
attempt 39's failure under the previous committed results directory.

## Diagnosis and bounded repair

Attempt 39 initialized successfully, requested `account/read` at 50 ms, received
an error at 1,539 ms, and completed cleanup at 1,575 ms. Its retained error is
`RPC account/read failed: workspace routing discovery failed`. No `thread/start`
or `turn/start` request, selected model identity, tool call, or usage receipt was
observed. Process-group absence and private-home removal were confirmed.

Symptom → Source → Consequence → Remedy: the collector stops before model submission
when the CLI's account routing discovery fails → the retained account/read RPC
error establishes the phase, but not the failing endpoint or external cause →
slot 39 has no answer and the remaining 33 slots are unexecuted → preserve the
failed attempt, add independently recomputable phase/turn/cleanup diagnostic
receipts, enforce fail-stop, and resume only the uncompleted schedule after explicit
authorization. Historical raw files and the frozen transport remain unchanged.

The diagnostic gap is repaired locally; the upstream failure is **not proven
fixed**. Account, proxy, network, and provider causes remain unverified. The old
transport deliberately omits account/read response bodies to avoid preserving
account data. This plan does not widen credential scope, add a route bypass, retry
account discovery, substitute a model, or treat absent usage as zero billing.
Future per-attempt `routing-diagnostic.json` files distinguish attempted collector
slots from observed model-turn submissions and are checked against raw records.

## Frozen allocation

| Item | Allocation |
| --- | --- |
| Model / reasoning | `gpt-6.1-terra` / `low` |
| CLI | `0.169.0`, original executable and tool-host hashes |
| New attempts | At most 34: original slots 39–72, same prompts/order/arms/repeats |
| Prior attempts / successful answers | 39 / 38 |
| Lifetime attempt ceiling | 73, including the retained failed attempt |
| Remaining observed tokens | 7,574,558 (10,000,000 minus 2,425,442) |
| Remaining active collector time | 20,300,693 ms = 5 h 38 m 20.693 s |
| Prior active collector time | 1,299,307 ms; cumulative ceiling 6 hours |
| Per attempt | 120 seconds, shortened to remaining collector time |
| Retry policy | Zero automatic retries; stop at first failure or observed retry |

Tokens are an admission ceiling: an in-flight turn can overshoot the remaining
observed-token ceiling, after which no subsequent turn is admitted. Provider-side
work and billing for the failed attempt remain unknown. Time excludes offline
preparation and waiting between collections, as in the parent plan. Docker/model
admission preflight precedes the collector clock; per-attempt execution, candidate
checks and cleanup are in the collector clock. The original zero-call preflight
failure is retained separately and its unknown duration remains excluded.

## Preserved measurements and merge

B remains the generic checklist; C remains the static full skill instruction
bundle. Cases, source files, grading axes, parent snapshot, model selection,
latest-receipt verification, candidate isolation and the six-response smoke gate
are unchanged. This study measures health and sweep within four authored families;
it does not establish six-skill or unseen-project effectiveness.

The new plan hashes every committed prior result, including raw archive,
annotations, assessment, model information, and both QA rounds. The archive is
verified before execution; historical payloads are extracted only into a fresh
temporary directory and all 219 manifest payload hashes are checked during merge.
The old campaign verifier checks original receipts and candidate evidence. It still
requires the retained local smoke directories (`_workspace/latest-receipt-live` and
its historical dependencies); the archive is durable evidence, not a standalone
portable verifier. Missing smoke prerequisites fail closed. A fresh admission
envelope is written before Docker/smoke admission so a preflight failure is retained
without any model call and cannot silently resume.

Merge keeps original successful slots 1–38 and new completed slots 39–72 exactly
once. The old failed 39 remains in its archive and history metadata, never enters
the answer denominator, and is never overwritten. Historical annotations are
loaded unchanged; only new successful responses need new annotations. A partial
second recovery remains partial and cannot satisfy the full-study efficacy gate.
Simulation is explicitly prohibited as live semantic evidence.

## Commands

Offline preparation and validation:

```sh
node evals/research/capability-efficacy-v2-recovery2/suite.mjs
node --test evals/research/capability-efficacy-v2-recovery2/protocol.test.mjs
```

Only after explicit user authorization, with the pinned CLI, login, proxy and
Docker prerequisites intact, use a fresh output directory:

```sh
node evals/research/capability-efficacy-v2-recovery2/runner.mjs execute formal _workspace/capability-efficacy-v2-recovery2-live --live _workspace/latest-receipt-live
node evals/research/capability-efficacy-v2-recovery2/runner.mjs verify formal _workspace/capability-efficacy-v2-recovery2-live
node evals/research/capability-efficacy-v2-recovery2/review.mjs packets _workspace/capability-efficacy-v2-recovery2-live NEW_PACKETS.json
node evals/research/capability-efficacy-v2-recovery2/review.mjs assess _workspace/capability-efficacy-v2-recovery2-live NEW_ANNOTATIONS.json MERGED_REPORT.json
```

No semantic improvement is claimed by the offline tests. They exercise recovery
selection, budget admission, failure-stop, diagnostics, immutable history, and
merge accounting. The completion report must keep model-selection attestation
limits and provider billing uncertainty visible.
