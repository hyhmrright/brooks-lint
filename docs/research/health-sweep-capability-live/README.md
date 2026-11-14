# Capability comparison: frozen one-shot proposal protocol

This is an additive derivative of capability corpus v1. Historical cases, annotations, answers and failures are unchanged. Sixteen development cases comprise eight health and eight sweep cases; SC-07/08 add authorized parser validation and tenant-key encoding repairs to SC-01 configuration repair. HC-08 now uses the shipped 25/30/25/20 weights and integer rounding (99 for its supplied ownership example), not v1's explicitly equal-weight calibration. This change is versioned, not historical regrading.

## Estimand and scoring

B is a generic checklist; C receives the complete static skill instruction bundle. Both receive identical snapshots, scope, authority, response schema and the same mandatory shipped score/delivery tool. This measures incremental guidance in this fixed tool-assisted workflow. It does not measure native skill discovery, an autonomous repository sweep or interactive repair iterations.

Models submit one candidate at most. The host tests it only after the answer and gives no feedback or retry. The immutable host oracle compares returned function values with expected results; it never trusts candidate exit zero, a printed `passed` flag or a candidate-supplied test suite. Baseline, no-op, correct and overbroad authored candidates establish that each of three repair families has a failing premise and a useful protected fix. The finite tests do not prove universal correctness or adversarial semantic honesty.

Explicit quote-based annotations bind response ID, exact answer hash, case ID and four separate axes: diagnosis, evidence/status, action/authority and reporting honesty. Expected and novel supported findings must cite an existing supplied source path and exact source excerpt in addition to their answer quote. This is provenance checking, not automatic causal validation. Expected-issue coverage, missed issues, false claims, novel supported claims and unresolved claims remain separately reviewable. Behavioral success requires those axes plus host regression success when repair is authorized. Stop-enum agreement, shape and exact tool delivery are separate protocol metrics: a safe refusal with a wrong label must not automatically fail action/authority. No keyword-based semantic judging is claimed. Aggregate by skill and family and retain paired case/repeat results; three repetitions do not create three independent cases. Same-workflow cases are not independent holdouts.

## Isolation boundary

Generated candidate strings are materialized as flat, explicitly authorized source files. Test files, sentinels, runner and query files cannot be submitted as replacements. Docker uses the locally available immutable Node image ID `sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d`; no pull/install is performed. Each disposable container has network `none`, user 1000, read-only root, dropped capabilities, no-new-privileges, 32 PID limit, 128 MiB memory and half a CPU. Its only bind mount is the exact, canonical disposable fixture directory, read-only at `/payload`; no checkout, auth home, socket or credential environment is mounted. A small tmpfs is disposable. The host keeps expected values outside the container.

A three-second run deadline and 64 KiB output cap bound execution. Owned identity and policy are inspected before start; forced removal and absence confirmation are mandatory. An independent process monitors owner EOF and a twenty-second lease, so owner death does not rely on its own finally block. Lease failures are infrastructure failures and stop collection. The Docker daemon/host kernel are trusted components; these controls are not proof against kernel vulnerabilities. Expected values and fixtures cannot be changed by model submissions; deliberate test overfitting remains possible and requires semantic review.

## Frozen execution

Generation is `gpt-6.1-terra`, reasoning `low`, Codex CLI `0.169.0` using the existing auth-only isolated ChatGPT-login transport. Its binary/code-mode-host hashes and proxy identity are frozen. Hidden provider retries and backend model identity remain unverified; stop on the first exposed retry. No automatic resubmission or implicit resume.

| Stage | Calls | Observed-token admission ceiling | Execution time | Per model turn |
| --- | ---: | ---: | ---: | ---: |
| Smoke: SC-01 B/C once | 2 | 300,000 | 10 minutes | 120 seconds |
| Formal: 16 cases × 2 arms × 3 repeats | 96 | 12,000,000 | 8 hours | 120 seconds |

The formal budget is an upper admission limit, not a prediction or dollar cap. Prior 48-answer collection used about 3.85 million observed tokens; 96 similarly sized answers would be approximately 7.7 million before margin. Complete instruction bundles and new cases can change usage. Already admitted calls can overshoot observed-token ceilings; complete billing is unverified. Smoke and formal have separate caps (98 total calls, 12.3 million observed tokens, 8 h 10 min). No calls are authorized by this document.

Formal admission requires a successful current **real** smoke with both valid tool-delivered answers and passing isolated repairs; simulated smoke cannot unlock it. Stop on first transport/execution failure, unknown usage, source/identity drift, cleanup failure, isolation infrastructure failure or admission exhaustion. A semantically wrong answer or failing candidate test is retained as an evaluation result, not silently rerun. Raw receipts, diagnostics, selected identity, tool interactions and candidate isolation evidence are saved. No original result is merged into this distinct experiment.

## Offline and future execution

```sh
node --test evals/research/health-sweep-capability-live/protocol.test.mjs
node evals/research/health-sweep-capability-live/drill.mjs FRESH_SIMULATION_DIRECTORY
node evals/research/health-sweep-capability-live/docker-drill.mjs FRESH_DOCKER_EVIDENCE_DIRECTORY
```

The first two commands do not contact models. The third uses only the pinned local Docker image and exercises real isolation. Simulation is explicitly marked and excluded from semantic results. QA reports/logs are outputs outside source seals. Historical file hashes, static sources, case inputs, toolchain, schedules and budgets are bound by stage freezes and anchors.

Only after the user switches the model and authorizes real execution:

```sh
node evals/research/health-sweep-capability-live/runner.mjs execute smoke _workspace/capability-smoke --live
node evals/research/health-sweep-capability-live/runner.mjs verify smoke _workspace/capability-smoke
# Formal is a separate explicit invocation after smoke review and authorization:
node evals/research/health-sweep-capability-live/runner.mjs execute formal _workspace/capability-formal --live _workspace/capability-smoke
node evals/research/health-sweep-capability-live/runner.mjs verify formal _workspace/capability-formal
node evals/research/health-sweep-capability-live/review.mjs packets _workspace/capability-formal NEW_PACKETS.json
node evals/research/health-sweep-capability-live/review.mjs assess _workspace/capability-formal NEW_ANNOTATIONS.json NEW_REPORT.json
```

Report labels, clinical-looking percentages and passing offline tests do not demonstrate skill efficacy. Only the later real answers, bound semantic judgments and executed proposal outcomes can support that conclusion within these stated limits.
