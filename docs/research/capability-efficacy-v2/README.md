# Targeted capability efficacy pilot v2

## What the existing evidence establishes

The original 96-response health/sweep campaign found B 26/48 versus C 39/48 under its frozen behavioral rule, with both arms recalling all 30 expected issues and passing all 9 required repair probes. Subsequent calibration separates semantic truth from risk taxonomy, exact labels and delivery, and is exploratory because it was developed after seeing answers. Historical reports and grades remain immutable. The six-call latest-receipt retest passed B 3/3 and C 3/3, verifying instructed artifact lifecycle consistency, not diagnostic advantage. Neither a clean parser benchmark nor a protocol success rate establishes skill efficacy.

This new **four-family developmental pilot** asks whether the full health/sweep instruction bundles improve substantive judgments and one-shot authorized repairs over a generic checklist. It does not benchmark all six shipped skills, native skill discovery, autonomous repair, unseen repositories or other models. The regional-policy family deliberately revisits a known weakness with new counterfactual obligations; none of these author-created cases is an independent holdout.

## Frozen design

Twelve cases: two health families (regional policy ownership; asynchronous test observation) and two sweep families (atomic inventory reservation; priority routing). Each has a demonstrated defect, a near-miss protected variant and an insufficient-evidence variant. Public prompts contain source, contracts, inventories and authorization only: no case IDs, variant names, private probes, expected findings, answers or reference fixes. B and C receive identical task/tool/output contracts. B gets a general evidence/contract/authorization/regression checklist; C gets complete frozen mode guidance. Every case runs three times per arm, interleaved with counterbalanced arm order: **72 calls**. The case/family, not the repeat, is the unit for interpreting gains.

Model: **gpt-6.1-terra / low**, Codex CLI **0.169.0**, existing ChatGPT login route. Budget: **10,000,000 observed tokens**, **6 hours**, **120 seconds per turn**, maximum 72 submissions. The previous six-call run used 419,318 tokens; the largest call used 136,243. Seventy-two calls at that largest observed size are 9,809,496 tokens. This is a planning basis, not a bound on future output: admitted turns can cross the observed-token admission threshold, and observed tokens are not billing. Backend identity/hidden provider retries remain unverified. Stop on first execution, visible retry, unknown usage, identity/source drift, cleanup, delivery or isolation failure. No automatic retry or implicit resume. Record every completed answer and failure; semantic mistakes and failed candidate regression tests are outcomes, not transport failures.

The freeze binds sources, prompts, toolchain, proxy, historical file hashes, pinned no-network Docker policy and the successful six-call protocol run. The earlier successful real repair smoke is reverified on live admission. No new live smoke is necessary merely to rewrite inputs, but both prerequisites and Docker must still verify. Live execution requires a fresh directory, explicit `--live` and separate user authorization.

## Judging and decision rule

Produce answer packets sorted by opaque response hash with arm/repeat/ordinal omitted. Style may still reveal the arm; this is concealment, not guaranteed blinding. Review every completed answer against its frozen rubric. Required issues carry exact answer quotations and typed input references (file, contract or indexed evidence). Novel supported claims are admitted without making them retroactively mandatory for other answers. False and pending claims remain separate. Evidence hashes and quotations prove provenance, not truth; a reviewer must still check causality. Reviewers should decide without inspecting arm mapping; disagreements remain unresolved until justified reconciliation is recorded.

Primary axes are causal diagnosis, evidence/dimension status, action authority, honest reporting and causal ownership. The primary behavioral outcome also requires a passing isolated repair when a proposal is required. **Taxonomy, severity, global label, stop label, score formatting and delivery are separate secondary/protocol outcomes**: improving them alone cannot satisfy the efficacy criterion. Unsupported clean dimensions fail evidence status; regional differences alone do not imply shared ownership; missing test bodies do not establish a missing assertion. One cause cannot receive duplicate deductions, but independently repairable production and observation defects can coexist.

Report pass/fail/unresolved counts, expected issue recall, false-claim counts, protected false-positive answers, repair eligibility/pass and protocol compliance by arm, mode, case and family. Do not hide unresolved answers in an accuracy denominator. Preserve incomplete pairs after a stop and withhold the practical improvement decision until all 72 answers are available and every primary axis, expected-issue decision and pending claim resolved (even when another axis already makes an answer fail). Aggregate each family equally (nine B/C repeat pairs per family). The preregistered descriptive criterion is at least **10 percentage points family-mean behavioral gain**, positive behavioral gain in **both modes**, no increase in protected false-positive answers, and no increase in authority or reporting-honesty failures. Publish family deltas even if the criterion fails. Four correlated development families cannot establish statistical significance or broad efficacy; meeting the criterion warrants a larger externally authored holdout, not a universal skill claim.

Sweep candidates are tested once after submission with private finite probes in the existing inspected read-only, no-network, non-root, resource-bounded Docker isolation. Immutable observer modules record outputs and both inputs before/after; candidates cannot replace observers. The host exposes neither probes nor results during the model turn. The reference repair, original, incorrect repair and input-mutating repair are exercised offline. Finite probes cannot prove correctness for every input or prevent deliberate overfitting. No model-generated code runs on the host.

## Commands

Offline:

```sh
node evals/research/capability-efficacy-v2/suite.mjs validate
node --test evals/research/capability-efficacy-v2/protocol.test.mjs
node evals/research/capability-efficacy-v2/drill.mjs FRESH_SIMULATION_DIRECTORY
node evals/research/capability-efficacy-v2/witnesses.mjs FRESH_DOCKER_EVIDENCE_DIRECTORY
```

Only after separate user model-run authorization:

```sh
node evals/research/capability-efficacy-v2/runner.mjs execute formal FRESH_LIVE_DIRECTORY --live _workspace/latest-receipt-live
node evals/research/capability-efficacy-v2/runner.mjs verify formal FRESH_LIVE_DIRECTORY
node evals/research/capability-efficacy-v2/review.mjs packets FRESH_LIVE_DIRECTORY NEW_PACKETS.json
node evals/research/capability-efficacy-v2/review.mjs assess FRESH_LIVE_DIRECTORY ANNOTATIONS.json NEW_REPORT.json
```

Raw records, identity, usage, candidate evidence and failures must be archived before semantic reporting. Preserve earlier results. All offline fake responses are marked simulation and cannot enter real result packets. A failed run requires a new explicit recovery freeze; the collector never silently starts over.
