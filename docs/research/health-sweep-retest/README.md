# Frozen targeted health/sweep retest

This is offline preparation, not authorization to call a model. It follows the complete 324-answer v5 campaign without changing its answers, strict scores or failed-attempt records. The new plan is `evals/research/health-sweep-retest/freeze.json`; `anchor.json` seals its complete body, including prompts, private rubrics, skill sources, executor sources and toolchain/proxy binding.

## Fixed execution budget

- Model: **gpt-6.1-terra**, reasoning **low**, Codex CLI **0.167.1**, ChatGPT file login.
- **8 cases × 2 arms × 3 repeats = 48 submitted turns maximum**; 24 per arm. B receives a generic checklist; C receives the current relevant skill guidance. There is no case-only arm in this targeted study.
- Ceiling: **3,000,000 observed tokens**, **10,800,000 ms (3 hours)** execution, and **120,000 ms per turn** bounded further by remaining cumulative time. The inherited executor additionally allows up to 3,000 ms for bounded cleanup; verification permits a 1,000 ms timestamp/event accounting tolerance. Cleanup is included in cumulative elapsed time and can carry the last admitted turn beyond the admission deadline; no next turn is admitted. Human pause is excluded by starting a new run only after confirmation.
- Stop immediately on first execution failure, observed retry, unknown usage, selected-model/effort mismatch, cleanup failure, source/toolchain/proxy drift or failed record verification. No automatic retries, continuation, recovery or implicit resume; existing output directories are refused.
- Observed-token admission may overshoot by one admitted turn. Unknown failed usage and provider-side behavior are not a hard billing cap or dollar estimate. No fresh provider authentication or backend model attestation is claimed by offline preparation.

The maintainer must confirm the model/effort before the explicit live command. The request and CLI-selected identity are recorded separately. New tool integration has been exercised with an auth-free local protocol fixture, **not** with a live provider. The first authorized turn is the first live exposure of this adapter; any failure consumes a submission and ends the run without a replacement.

## Cases and comparison

| Case | Skill | Boundary |
| --- | --- | --- |
| HS-01 | health | Protected local source; one final LF; quoted, Unicode and backslash text |
| HS-02 | health | Same controlled source with two final LFs; formatting variant, not independent task |
| HS-03 | sweep | Finite-integer precondition; out-of-domain validation is not required |
| HS-04 | sweep | Same implementation with explicit arbitrary-input rejection duty; candidate proposal allowed |
| HS-05 | sweep | Missing obligation; assessment is blocked, not clean |
| HS-06 | sweep | Exhausted task-work cap plus missing obligation; report cap and residual blocker |
| HS-07 | sweep | Known defect with no authorized safe edit; no progress |
| HS-08 | sweep | Known defect with required external verification unavailable; verification blocked |

Task inputs and output schema are identical between arms. Both arms receive the same host tool, authorization and limits. Only checklist versus skill text differs. Arm order alternates by case and repeat. Rubrics/expected labels are retained in the private freeze but never sent to the model; identifiers and schedule metadata are not injected into prompts. These are authored development/calibration cases, zero independent holdouts, only a few related families and 3 repeated responses each. Prompt sizes differ. This tests supplied guidance, not native skill discovery or broad skill superiority.

## Delivery and safety boundaries

The isolated app-server collector is a derivative of the previously used v3 transport; only its host-tool import and record scope change. A regression compares the entire derivative to those exact permitted substitutions. Credentials, proxy handling, disabled shell/plugins/delegation, fresh auth-only home, retry detection, bounded process cleanup, usage and completed-message selection remain unchanged. Old collectors and historical plans remain byte-identical.

Both arms can invoke `brooks_health_finalize` with `action: finalize`, then `action: assemble`. The latter calls the **shipped** `assembleDelivery`/`verifyDelivery` helper inside the host; it accepts data, not paths, shell commands or network access. A successful host artifact is never substituted for the agent's final response. Both are retained and measured independently. The model must choose to call the helper and return the output. This is a real host-tool exercise, not native shell execution. No proposed model patch is executed or applied. Authored domain witnesses run offline separately and do not prove candidate repairs work.

Health variants require an exact terminal LF count and matching Unicode/escaping. Delivery metrics are: host assembled report versus finalizer, agent decoded report versus finalizer, complete agent JSON versus assembled JSON, helper-use rate, and a separate **at most one missing terminal LF** comparison. That normalization accepts only exact equality or finalizer report equal to agent report plus one LF. It never ignores an extra LF, extra prose, other whitespace, score edits or a second missing LF. Semantic judgments are separate. No historical grade is rewritten under this new sensitivity metric.

## Commands after confirmation

From repository root, using a fresh output directory:

```bash
node evals/research/health-sweep-retest/runner.mjs execute _workspace/health-sweep-retest-live --live
node evals/research/health-sweep-retest/runner.mjs verify _workspace/health-sweep-retest-live
node evals/research/health-sweep-retest/review.mjs packets _workspace/health-sweep-retest-live _workspace/health-sweep-retest-packets.json
```

Read every completed answer against `CRITERIA.md` and its private rubric, save explicit annotations with reviewer identity, verbatim supporting quotes, criteria/issue credits, false claims and pending claims. Then:

```bash
node evals/research/health-sweep-retest/review.mjs assess _workspace/health-sweep-retest-live _workspace/health-sweep-retest-annotations.json _workspace/health-sweep-retest-assessment.json
```

The assessor rejects simulation data, duplicate/missing review IDs, changed answer hashes and quotes not present in the answer. Do not replace semantic review with keyword matching. Save raw execution, model information, time/token accounting, any failure and annotations/report separately; show partial denominators if stopped. Strict and normalized outcomes must both be reported. A rerun or recovery requires a separately approved frozen plan.

## Offline verification

`npm run evals:health-sweep:retest` checks freeze/schedule/arm boundaries, transport derivative parity, a full 48-turn injected simulation plus seven stop controls, fresh-output/live-mode safety, raw tamper/gap rejection, prefix token admission and intent/deadline/finish-time binding, host-versus-agent delivery distinction, executable domain witnesses and two-action app-server protocol integration. It is included in `npm test`.

The archived drill uses authored protocol records only, no credentials, CLI model, upstream connection, fresh login proof or semantic model grades. `offline/summary.json` and `offline/raw-simulation.tar.gz` retain all 48 success records plus failure/retry/identity/cleanup/unknown-usage/token/deadline controls. This establishes offline readiness; final repository QA is a separate gate.

Frozen plan body SHA-256: `e9d461ebd6146e2cd183aec5c94f876288a5caa12faeb3792b2085acc7ef5a62`. Final sealed evidence is `qa-fixed-sealed-tests.log`, `offline/drill-qa-fixed.log`, `offline/summary.json` and `offline/raw-simulation.tar.gz`. Earlier passing development logs remain labeled separately.
