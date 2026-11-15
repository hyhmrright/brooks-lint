# Bounded health follow-up: frozen prospective protocol

## Question and scope

The completed 72-answer historical run found health B 15/18 versus C 10/18 and
sweep B 15/18 versus C 18/18. Historical answers, failure records and grades are
immutable. The revised health guide narrows evidence admission to the supplied
scope; the scorer now rejects duplicate explicit finding IDs across dimensions.
Neither change has behavioral evidence yet.

This follow-up compares the **unchanged generic checklist B** with the **current
full static mode bundle C**, with identical tools, task contracts and supplied
inputs. It does not test native discovery, all skills, autonomous iteration or
independent repositories. Four existing causal families use transformed health
surface domains and retained sweep repair controls; two new contradictory-inventory
variants form a fifth family. These are authored development cases, not holdouts.
Source transformations do not create independent evidence from the parent cases.

Eight health cases cover complete shared and independent retention policies,
unknown ownership, upload completion observation and omitted assertion bodies,
plus contradictory test and dependency inventories. Explicit private dimension
status expectations distinguish over-abstention from unsupported clean scores.
Six sweep cases retain defect/protected/insufficient-policy controls for atomic
reservation and priority routing. Keep causal deduplication, honest one-shot
repair reporting, material-policy stopping and immutable-input checks.

## Frozen stages and authorization

| Stage | Calls | Observed-token ceiling | Wall budget | Per turn |
| --- | ---: | ---: | ---: | ---: |
| New scorer tool smoke | 2 (B and C) | 300,000 | 10 minutes | 120 seconds |
| Formal comparison | 56 (14 cases × 2 arms × 2 repeats) | 8,000,000 | 5 hours | 120 seconds |
| Combined maximum | 58 | 8,300,000 | 5 hours 10 minutes | 120 seconds |

Both stages bind **gpt-6.1-terra / low**, Codex CLI **0.169.0**, existing ChatGPT
login, executable/toolchain/proxy hashes and current source hashes. Observed token
ceilings are admission limits, not billing or hard per-turn token caps: an admitted
turn can overshoot. The formal allowance is approximately 143k tokens per call;
previous observed maxima near 136k are a planning basis, not a guarantee.

**No live calls are authorized by this freeze.** The next approval is for the two
smoke calls only. After they pass, separate user authorization is required for the
56 formal calls. The formal runner requires a fully verified real smoke from this
exact campaign and scorer. Historical or simulated smoke cannot satisfy readiness.
Do not reseal a stale receipt or restore the old scorer for live collection.

The smoke deliberately asks for one rejected duplicate-ID ledger, then valid
finalization/assembly A and revised finalization/assembly B. Both arms must return
exactly the newest assembly. Rejection of that intentional tool input is an
expected test outcome, not a transport failure. At most eight tool requests per
model turn. The smoke tests tool protocol, not skill efficacy.

Fresh output directories only. Stop at first execution, visible retry, missing
usage, identity/source drift, cleanup, isolation or delivery failure; no automatic
retry or implicit resume. Preserve partial results and raw failures. A semantic
mistake or unsuccessful candidate regression is a measured outcome, not a reason
to discard a response. Token and elapsed budgets are separate per stage and sum to
the combined ceilings above. Preflight may fail before any model request; its
admission record is retained. Hidden backend retries and actual backend identity
remain unverified beyond CLI-reported metadata.

## Judging and decision

Use opaque answer packets and exact quotations with typed input references.
Assignment is concealed but style can reveal the arm. Judge each primary axis:
causal diagnosis, evidence/dimension status, action authority, reporting honesty,
and causal ownership. Required repair must also pass the existing isolated finite
Docker probes. Score/delivery/labels/taxonomy/severity are separate secondary axes.
Explicit duplicate IDs are mechanically rejected; distinct IDs still need semantic
cause review. Do not upgrade arithmetic validity into diagnostic truth.

Report pass/fail/unresolved, recall/misses, false claims, protected false-positive
answers, required repair results and delivery by arm, mode, case and family.
Health evidence-status scoring must use each case's private dimensionStatus,
including preserving assessable dimensions when one inventory is missing.
Do not count unknown expected issues as definite misses or hide unresolved axes.
All answers and expected issue decisions must be resolved before an efficacy claim.

Equal-weight each of the five family mean paired gains; the contradiction family
has two cases, others three. Report health and sweep separately because they have
unequal case counts (eight and six). The preregistered descriptive criterion stays
at least 10 percentage points equal-family gain, positive gain in both modes, no
increase in protected false-positive answers or authority/honesty failures. Two
repetitions measure consistency, not independent sample size. A health gain with
sweep parity can support a targeted health improvement but does not meet that
stronger combined criterion. Historical before/after rates are descriptive due to
changed inputs and scorer; no causal attribution to one guide sentence is possible.

## Commands

Offline preparation only:

```sh
npm run evals:bounded-health
node evals/research/bounded-health-retest/drill.mjs FRESH_SIMULATION_DIRECTORY
```

After separate approval for each stage:

```sh
node evals/research/bounded-health-retest/runner.mjs execute smoke FRESH_SMOKE_DIRECTORY --live
node evals/research/bounded-health-retest/runner.mjs verify smoke FRESH_SMOKE_DIRECTORY
# Only after successful smoke AND separate formal authorization:
node evals/research/bounded-health-retest/runner.mjs execute formal FRESH_FORMAL_DIRECTORY --live FRESH_SMOKE_DIRECTORY
node evals/research/bounded-health-retest/runner.mjs verify formal FRESH_FORMAL_DIRECTORY
node evals/research/bounded-health-retest/review.mjs packets FRESH_FORMAL_DIRECTORY NEW_PACKETS.json
node evals/research/bounded-health-retest/review.mjs assess FRESH_FORMAL_DIRECTORY ANNOTATIONS.json NEW_REPORT.json
```

The frozen inputs, prompts, rubrics, toolchain and source hashes are committed in
smoke-freeze.json, formal-freeze.json and anchor.json. history.json protects the
prior completed campaign and two failure archives. Offline injected responses are
marked simulation and cannot become model evidence. Docker/proxy/auth availability
must still pass live admission; offline tests do not prove current network access.
