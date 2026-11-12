# Six-skill benchmark v2: prospective development coverage

This revision preserves every previous case, freeze, raw answer and judgment. It
adds **36 executable development cases: 18 regression cases in six families and 18 challenge cases in one shared repository family**, with a defect,
protected near-miss and unresolved-contract sibling for each shipped skill. It is
not an independently authored holdout, a claim of hundredfold difficulty, or a
claim that the revised skills work better. The author knows the historical results.
The family structure improves causal controls; it does not create thirty-six
independent topics. Difficulty and discrimination remain unmeasured until a new
model study.

## Coverage and executable checks

| Cases | Skill | Contrast and offline witness |
| --- | --- | --- |
| BV2-01–03 | review | Caller → checkout → pricing; line-versus-invoice rounding. Same behavior is a defect only under an explicit per-line contract. Validation belongs to the supplied caller. |
| BV2-04–06 | audit | Domain import versus composition-root injection; both return 90. A generated excerpt without active-build provenance stays conditional. |
| BV2-07–09 | debt | One-sided policy mutation produces 80/90. Shared ownership/history justify extraction; independently owned rules do not; absent ownership does not prove debt. |
| BV2-10–12 | test | A behavior-preserving private rename breaks a source-regex test but not a behavior test. Incomplete inventory permits a local T2 finding while global coverage stays unknown. |
| BV2-13–15 | health | Deterministic strict-ledger result 80, clean result 100, missing dimension gives no composite. No invented diagnostics from supplied ledgers. |
| BV2-16–18 | sweep | Authorized sum fix, protected implementation, and verification-blocked variant. The original legacy failure and unrelated user note survive. All five phases and a two-round total cap are required. |

## Repository challenge stratum

BV2-19–36 reuse one ten-source/support-file tenant-commerce repository family:
review 19–21, audit 22–24, debt 25–27, test 28–30, health 31–33, sweep 34–36.
Each group has defect/protected/unknown-contract variants. The causal chain is
route authentication → service/preview → two key builders → shared stateful cache
→ tenant-scoped repository. Authentication, repository data and cache identity
are competing explanations; checking one return value cannot distinguish them.

The executable witness interleaves preview and purchase for tenants sharing an
item ID, then checks cross-route reuse and the collision between `(A:x, y)` and
`(A, x:y)`. Correct compound keys pass. A delimiter-concatenated key, a one-route
repair, or disabled caching fails an independent contract obligation. Source
health must diagnose and derive a ledger rather than merely calculate a supplied
one. Sweep author-control patches touch multiple files; the checker preserves
other files and tests both routes. Semantic review must still establish the
layering remedy and ledger truth; the executable witness is not the whole rubric.

These 18 tasks are strongly correlated because they share a repository. Report
regression and challenge results separately, then per skill; do not count this as
18 independently authored repositories. The new family adds state, ownership,
competing diagnoses and multi-file repair obligations, but an actual increase in
model discrimination remains an empirical question.

The test cases explicitly allocate input validation to the caller, removing the
AS-35 ambiguity prospectively without rewriting its historical pending judgments.
The review cases similarly allocate that responsibility. A supported local test
finding is compatible with an unresolved whole-suite assessment.

The sweep checker executes only explicitly trusted, author-created offline control patches under authored Node tests. It rejects missing `artifactOrigin: authored-offline-control`; this flag is an explicit trust assertion, not a security sandbox. Never apply it to a model-generated artifact. A separate external sandbox must be integrated before admitting untrusted model code.
It rejects unauthorized paths, missing health phase, out-of-bound round counts,
incorrect repairs and edits in protected/blocked cases. Tests include unsafe-path rejection; no untrusted code execution is authorized. Phase names and claimed
round counts remain self-reports: this does **not** establish native filesystem
editing, actual five-skill discovery, or real autonomous iteration. Deduplication,
baseline interpretation and final-snapshot assessment also require semantic review.
The bounded baseline fixture intentionally fails before and after a valid repair;
"all tests green" would be an incorrect success criterion.

## Rubric and metrics

Each case separates model-visible task/contracts/source from `rubric.json` and
`oracle.json`. Expected issue IDs, task criteria, evidence and accepted risk codes
are declared before execution. A reviewer must apply the risk-code mapping when
crediting an issue; the current schema does not mechanically infer risk codes from
prose. Equivalent numeric inputs, variable names and executable witnesses are
accepted if they demonstrate the same mechanism and contract. A generic assertion
without a concrete witness receives no witness credit. Quote membership and
aggregation checks do not establish semantic truth.

`score()` requires exact answer hash, reviewer identity, evidence quotes and
rationales. It separates expected diagnostic recall, task criteria, evidence,
confirmed false-defect claims, other unsupported claims and pending claims.
`summarize()` returns arm, skill and cohort breakdowns and keeps failed/unrun executions, artifact checks and observed token
usage in separate denominators; unknown failed-turn usage is not zero. A false
headline is not automatically a false defect allegation. Do not pool repeated
answers as independent samples or turn label agreement into whole-answer accuracy.

## Three arms and prospective plan

- **A:** identical case, authority and output contracts only.
- **B:** the same inputs plus a generic engineering checklist.
- **C:** the same inputs plus current selected skill/shared guidance. Sweep receives
  the five focused guides because its treatment is their orchestration.

All arms must have identical execution/tool permissions. The generic checklist is
not length-matched to the skills; the freeze records prompt character counts and
later runs must retain actual observed tokens/latency. This comparison cannot by
itself isolate content from added context or prove cost efficiency.

`prepared-freeze.json` seals inputs, rubric, witnesses, guidance text, prompt hashes
and the rotated schedule: **36 cases × 3 arms × 1 repeat = 108 planned answers**.
It deliberately has `liveAuthorized: false` and unbound model/effort/CLI fields.
It is a preparation artifact, not permission or a live registration. `campaign.mjs` supplies a separately registered collector; it does not run until explicitly invoked.

Before any campaign:

1. Complete a separately authorized **one-turn real scoring-tool probe** and verify
   its tool receipt and unchanged final report. Local fake-upstream success is not
   a substitute. A missing/failed call stops progression.
2. Bind the selected model, reasoning effort, CLI plus companion-host identity,
   assessor identity, total/turn time limits, observed-token budget, attempt limit,
   no-hidden-retry policy and immutable recovery rules in a new live registration.
3. Select one scoring treatment explicitly. The dynamic-tool route and host-rendered
   route are different interventions; do not silently substitute or pool them.
   Health task inputs must include the ledger schema identically for all arms.
4. Register the isolated collector only after the successful real probe. Its complete
   108-turn authored-response exercise is tested offline. The collector supplies
   frozen prompts plus the same public ledger schema and tool capability to every
   arm; it collects returned artifacts but never executes model-generated code.
5. Review every completed answer using the sealed rubric, retain pending claims,
   and report per-skill paired outcomes and all execution failures. New independent
   repository tasks and independent adjudication remain separate future evidence.

No real model was run while creating this revision. No native activation or
production-quality superiority claim is supported by its offline checks.

## Offline reproduction

```sh
npm run evals:skills:v2
node evals/research/skills-benchmark-v2/suite.mjs freeze /tmp/new-skills-v2-freeze.json
```

The freeze command refuses to overwrite an existing file. Tests cover all 36
witnesses, allowed and forbidden repairs, task/rubric separation, freeze tampering,
quote provenance and execution-versus-semantic denominators. Synthetic controls are
labeled in test inputs and are not model answers.

## Collector registration and audit

`campaign.mjs` exposes `register`, `execute`, `readRun`, `packets` and `assessRun`.
A registration requires the externally retained case-freeze anchor, explicit model,
effort, CLI version, absolute CLI path, assessor, and budget with exactly `calls`,
`observedTokens`, `totalMs` and `turnMs`. Calls must equal the sealed schedule.
The CLI and companion host hashes are both bound. A live registration also requires
`probeAnchor` and the retained probe plan, result, parsed record, and exact
`rawRecordBytes`. It verifies the anchor, raw hash, non-simulation status, specified
probe ledger, successful unchanged receipt, matching identities and source hashes.
This is artifact provenance verification, not independent provider attestation.

The collector uses the sealed guidance text, not whatever skill files happen to be
on disk later. The scoring/witness source hashes from the prepared freeze and the
collector/adapter/helper source hashes must match. All arms get identical common
output/schema instructions in addition to their sealed prompt. The source snapshot
should be retained at the resulting commit for future verification.

Every turn gets a pre-submit intent, raw record, hash receipt and a place in the
full execution ledger. The first failure, unknown usage or exhausted admission
budget stops the run; no retries or resume are implicit. Wall and monotonic elapsed
time are both considered, using the greater duration. A completed final turn can
overshoot an observed-token admission threshold; unknown failed-turn cost is not
zero. Native backend retry behavior and billing are not hard-capped by the client.

Readback recomputes raw hashes, prompt identity, selected model/effort, final-message
provenance, successful tool outputs, cleanup and usage totals. Review packets retain
all completed commentary and final answer, with masked response IDs. Every completed
answer needs one explicit semantic annotation before `assessRun` generates the
arm/skill/cohort report. Tool-workflow adherence is a separate metric: health requires
an actual successful receipt and unchanged final report; sweep requires that report
preserved inside its JSON `report` field. Missing evidence permits an unassessed
ledger and unavailable composite; it is not a ban on calling the finalizer. No call
cannot pass a required workflow, regardless of fluent text.

Offline registration requires `simulation: true`, the checked-in fake CLI fixture
and a loopback endpoint. It cannot be switched to live execution. The tests run all
108 authored turns, then verify packets and aggregation; failure, missing usage,
budget admission, tampering, absent real probe and simulated-probe rejection are
separate controls. These synthetic outputs do not establish skill effectiveness.

After a separately approved live registration has been written, CLI interfaces are:

```sh
node evals/research/skills-benchmark-v2/campaign.mjs execute REGISTRATION ANCHOR NEW_OUT --live
node evals/research/skills-benchmark-v2/campaign.mjs verify RUN_DIR
node evals/research/skills-benchmark-v2/campaign.mjs review RUN_DIR ANNOTATIONS NEW_REPORT
```

No such live registration or invocation is authorized by this document.

## Protected-control correction

QA found that the initial shared protected repository's complete test inventory
did not distinguish a delimiter-concatenated cache key: its ordinary tests passed
while the collision contract failed. A T5 finding would therefore have been
justified, contradicting the protected label. All six protected siblings now test
`(A:x,y)` versus `(A,x:y)`, reverse-route reuse, exact returned identities and read
counts. An unauthorized request must not read the repository. The mutation gate
requires both the ambiguous key and disabled-caching mutant to fail each protected
suite. The earlier fake-CLI archive is preserved as superseded; the r2 archive uses
the corrected case freeze and contains source snapshots for reproduction. There
were no real model answers to regrade.

The current prepared freeze is
`933cf78cc7abe9c90457d756eabdc1d3dd790693758080e210f9fa8182bae6b4`.
Counts remain 36 cases, three arms, one repeat and 108 planned responses.

## CLI path-alias correction

QA found that comparing `process.argv[1]` directly with `import.meta.url` could
silently skip the CLI body on macOS `/var`/`/private/var` or symlink entry paths.
Both suite and collector entrypoints now compare canonical `realpathSync` paths.
The regression invokes the collector through a symlink and requires actual verify
JSON output plus a newly written review report, then compares that report with the
API result. The suite symlink command must likewise create its freeze. Exit code
zero alone is not accepted as proof that a command executed. The r3 simulation
archive supersedes r2's runner while preserving every r2 byte; r2 source still
reproduces with a canonical entry path, as its README explains.
