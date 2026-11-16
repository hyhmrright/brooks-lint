# Focused review, audit and test retest

## Finite question

One prospective developmental comparison tests whether concise review, audit and
test guidance adds **substantive task value over the unchanged V5 generic checklist**.
The hypotheses and historical limitations are in [ANALYSIS.md](ANALYSIS.md).
There are no new domains: retain the existing six V5 cases per selected skill,
two families per skill, one B/C pair per case: **18 cases, 36 calls total**.
No case-only arm, repetitions, new skills or automatic follow-up campaign.

B is the exact V5 generic checklist. C retains V5's full shared Markdown plus
selected-mode Markdown assembly, so this trial does not silently optimize the
loading scheme. Both arms receive the same sources, contract and authority;
no execution/scoring tools, file access or delegation. This is supplied static
instruction comparison, not native skill activation or autonomous coding.
Three guides shrink 34.2% in UTF-8 bytes; this is not the whole-prompt or token saving.
Each frozen prompt records bytes; `footprint.json` compares old/new complete prompt
bytes with the same new public inputs. Cost during live execution is separately
recorded by arm/skill. The old-guide prompts are measurement only, not a third arm.

## Clarifications, not rewritten history

Only new `cases.json` copies have two explicit obligation clarifications:

- BV5-05: callers already provide strictly ascending unique integers; page/query
  need not sort, deduplicate or validate out-of-domain inputs.
- BV5-24: the displayed local smoke check must propagate its own assertion failures.
  Broader parser contract and other tests remain unknown. The explicit local defect
  `local-failure-propagation` is now mandatory; a global unresolved assessment can
  coexist with it. Exact global label is secondary.

Original V5 input/rubric/oracle/answer files and disputed historical grades remain
unchanged and hash-protected. These clarified obligations and the prospective
semantic axes prohibit a direct causal before/after rate comparison. Cases were
seen during guide development and are not independent holdouts. Known novel
supported findings and equivalent causal witnesses are accepted without adding
retroactive requirements to other answers.

## Frozen execution and budget

- Model **gpt-6.1-terra**, reasoning **low**, Codex CLI **0.169.0**, ChatGPT login.
- Maximum **36 submissions**, **2,000,000 observed tokens**, **2 hours**, **120 seconds per turn**.
- Same pinned executable/toolchain/proxy as the previous prepared plan; verify hashes
  and selected identity again at live admission. No live model is authorized here.
- Stop on first execution failure, visible retry, unknown usage, identity/source
  drift, cleanup or isolation violation. No automatic retry or implicit recovery.
  Preserve completed answers and the failure; a recovery needs a new user decision.
- The 2M allowance is about 55.6k tokens per slot; prior whole C-arm V5 average was
  about 41.2k, while B averaged14.4k. This is a planning basis, not a guarantee for
  individual cases. Token ceilings are admission bounds and a turn can overshoot;
  observed usage is not billing. Model backend identity/hidden retries unverified.
- No new scorer smoke is needed for these read-only textual modes: scoring tools
  are explicitly disabled. Their former health-specific readiness receipt is not
  imported or reused as authorization. Actual connectivity remains a live check.

The previous bounded-health 2+56 plan is now stale because its static bundle hashes
these changed guides. It is preserved unchanged, not re-frozen. An offline-only
archive helper restores the exact four original Markdown files from commit46a2a83
inside a disposable copy, checking them against the old plan. Its old tests still
run there; current live admission continues to reject the stale plan. This does
not authorize, continue or supersede that campaign with a new health run.

## Judging and stopping the research loop

Primary complete task requires all five semantic axes: diagnosis, contract scope,
discriminating witness, scoped remedy and verification honesty; all mandatory
issues; no confirmed unsupported claim and no unresolved primary claim. Use exact
answer quotes and typed references to supplied evidence for every judgment.
Private case `axisCriteria` and `taskOutcome` govern judgments. Specific formatting,
book citations, risk taxonomy, severity and global labels are secondary. Novel
valid findings are separately recorded; provenance validation is not semantic proof.

Report per-skill B/C completion, recall/misses, false-claim answers, unresolved
answers, semantic axes and observed input/output cost. Six cases per skill remain
six development cases, not an independent sample multiplied by repeats. Arm-hidden
packets conceal assignment but report style may reveal it; model judging is not
independent human ground truth.

A skill has a **bounded positive signal** only if C completes more paired tasks than
B, with no increase in false-claim answers, scope failures or honesty failures.
Otherwise report no incremental gain; a tie/regression ends this planned experiment.
Do not automatically grow the case set or repeat until an advantage appears.
Keep justified simplifications and proceed to release decisions. Even a positive
signal cannot establish statistical significance or general superiority. No
aggregate result may hide a mode regression. Incomplete execution or unresolved
primary judgments yields no efficacy decision, not a silently reduced denominator.

## Commands

Offline only:

```sh
npm run evals:focused-skills
node evals/research/focused-skill-retest/drill.mjs FRESH_SIMULATION_DIRECTORY
```

After explicit user approval:

```sh
node evals/research/focused-skill-retest/runner.mjs execute formal FRESH_RUN_DIRECTORY --live
node evals/research/focused-skill-retest/runner.mjs verify formal FRESH_RUN_DIRECTORY
node evals/research/focused-skill-retest/review.mjs packets FRESH_RUN_DIRECTORY PACKETS.json
node evals/research/focused-skill-retest/review.mjs assess FRESH_RUN_DIRECTORY ANNOTATIONS.json REPORT.json
```

Save raw identity/usage/events, all answers, failures, quoted annotations and the
result report. Simulations are labeled and cannot become real model evidence.
