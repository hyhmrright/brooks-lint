# Capability efficacy v2 recovery: stopped after 38 completed answers

The frozen recovery stopped on attempt 39 before a model turn could start. All 38 completed answers have now been semantically reviewed against the unchanged case criteria. B (generic checklist) passed 16/19 primary behavioral assessments; C (static full skill guidance) passed 13/19. These are **partial descriptive results**, not a complete efficacy decision. No new live calls or automatic retries were made during adjudication.

## Collection and evidence

- Requested and successful-turn CLI-selected model: gpt-6.1-terra; requested reasoning effort: low; CLI 0.169.0. Local CLI metadata does not constitute backend model-identity attestation.
- Frozen recovery: b94b0d2e2d6d25aa55d618fe58ec077ea2ac3d2141a17c8d924383dfe0870f4c; parent protocol: 45422dd46f7b5bd11c19a688f0441fbf4f46ef594a81687a0f29d075c6003ac1.
- Planned 72; attempted 39; completed 38; failed 1; not run 33. The failed slot and the 33 unrun slots are excluded from semantic accuracy denominators, not counted as correct.
- Observed tokens: 2,425,442; collection elapsed: 1,299,307 ms (21m 39.307s). Failure usage is unknown, so observed usage is not proof of the complete billed total.
- Failure: `RPC account/read failed: workspace routing discovery failed`. Attempt 39 has no tool calls and no CLI-selected model or account identity. Cleanup recorded process-group absence and private-home removal. No retry occurred.
- Recovery admission, prompts, 38 answers, tool calls, candidate checks and attempt-39 failure remain in this archive. The original preflight failure remains separately archived at `docs/research/capability-efficacy-v2/results/2026-11-15-preflight-stopped/` and is hash-bound by the recovery freeze. SHA-256 of `raw.tar.gz`: `646cf2577c685a274668bedae7ae1e2092d5aa4041730c255036af9f49d9d62c`.
- `packets.json` conceals arm/repeat/ordinal for first review; style can reveal guidance. Every full answer was read. `annotations.json` records exact answer quotes and typed file/contract/evidence references; `assessment.json` is generated with the frozen assessor. This is model-assisted semantic review, not independent human validation.

## Primary results

Primary behavioral success requires all five semantic axes and required issue decisions to pass, no unsupported/pending claims, and a passing isolated candidate where a repair is required. Risk codes, global labels, stop labels and delivery are separately reported.

| Metric | B: generic checklist | C: skill guidance |
|---|---:|---:|
| Reviewed | 19 | 19 |
| Primary behavioral pass | 16/19 (84.2%) | 13/19 (68.4%) |
| Primary fail / unresolved | 3 / 0 | 6 / 0 |
| Expected issues found | 9/9 | 9/9 |
| Expected issues missed / unresolved | 0 / 0 | 0 / 0 |
| Unsupported claims | 1 | 0 |
| Protected-case false-positive answers | 0/6 | 0/6 |
| Required isolated repairs passed | 3/3 | 3/3 |
| Action-authority failures | 0 | 0 |
| Reporting-honesty failures | 0 | 0 |
| Exact latest-receipt delivery | 19/19 | 19/19 |
| Frozen global label matches | 16/19 | 18/19 |
| Frozen stop label matches | 18/19 | 18/19 |

The one unsupported B claim is an unwarranted **permission/clean-behavior conclusion** on missing policy, not an invented defect. Excessive abstention in C is an evidence-status failure, not a false-positive defect. Thus issue recall, false-positive findings and overall behavioral success answer different questions.

| Mode / family | B primary pass | C primary pass |
|---|---:|---:|
| Health total | 10/12 (83.3%) | 6/12 (50.0%) |
| Regional policy ownership | 4/6 | 2/6 |
| Async observation | 6/6 | 4/6 |
| Sweep total | 6/7 (85.7%) | 7/7 (100%) |
| Atomic reservation | 4/4 | 4/4 |
| Priority routing | 2/3 | 3/3 |

All 38 answers form 19 complete B/C pairs: C wins one, B wins four, and 14 tie (including two pairs where both fail). There are no completed unmatched answers at this stop. Family coverage is unequal: 6, 6, 4 and 3 completed pairs. The frozen family deltas and practical-lift decision therefore remain unavailable: `completeForPracticalCriterion=false`, `familyMeanGain=null`. The machine field `practicalLiftCriterionMet=false` must not be read as a completed negative trial.

## Failure diagnoses and reconciliation

1. **C health over-abstains on supplied complete local inventories (6 answers; attempts 2, 3, 10, 25, 28, 32).** Symptoms: Architecture and/or Tech Debt are left unassessed because broader boundary or maintenance obligations were not supplied; attempt 28 also withholds Test Quality while asking for an input domain and below-cap results. Source: the answers expand the assessment requirement beyond the supplied bounded contract. Consequence: their dashboard withholds evidence-supported local assessments despite correct causal issue detection. Remedy to investigate after this frozen trial: explicitly distinguish sufficient bounded inventory from claims about the wider project. For H2 the evidence expressly states a complete one-module inventory with no additional dependency or maintenance burden; for H1 it states complete independent-adapter and maintenance inventories. H1 protected also supplies both regional cap assertions. Missing extra requirements do not erase that bounded evidence. This is not a demand for universal clean scores. The ruling uses the complete inventory plus explicit local contract, bounded request, shared ownership/no other consumers or explicit no-additional-burden evidence; source code alone would not admit a dimension score. This is an auditable semantic interpretation, not mechanically proven ground truth.
2. **B health deducts the same policy cause twice (attempts 1 and 26).** The architecture finding `independent-policy` and debt finding `duplicated-limit` are two scoring owners for shared policy drift/coordination. The frozen rubric explicitly treats that as one cause. The independently repairable missing east assertion is correctly a separate test issue. Both required issues still receive recall credit. C keeps a single policy cause and a separate observation cause, improving this aspect without improving the overall health outcome.
3. **B missing-selection-policy conclusion (attempt 24).** Exact claim: “The contract leaves the choice among multiple allowed routes and tie handling unspecified, so the input-order behavior is permitted”. The input says the policy “is not supplied”; it does not authorize arbitrary choice. The frozen criterion requires requesting the missing policy rather than inventing priority ordering. This answer neither requests it nor preserves uncertainty about local selection correctness. Diagnosis fails; dimension evidence-status passes because its broader dimensions correctly remain unassessed. This one claim is counted once as an unsupported claim, not as a protected-case false positive.

Boundary reconciliation: C attempt 23 also emits protected/no-actionable labels on EV-S2-insufficient, but its prose explicitly distinguishes the unknown policy and requests selection/tie behavior before changing code. Its primary semantics pass and its two labels fail separately. B attempts 12 and 35 use a protected label on EV-H2-insufficient, yet correctly preserve unknown assertion bodies and unassessed test quality; those are label-only failures. “Executed: inspected” describes source review, not fabricated code/test execution, and does not fail reporting honesty.

Sensitivity: if attempt 24's missing-policy claim were treated leniently as a label-only error, B would be 17/19 overall and 7/7 sweep; C would remain 13/19 and 7/7. Sweep's apparent one-answer advantage would disappear. This does not change the six observed C health scope failures or permit a general efficacy claim.

Taxonomy is secondary: B has four asserted classification failures (attempts 1, 8, 26, 31), including T1 for a T5 observation gap and R1/custom C1 for policy drift. C's seven answers asserting taxonomy have no classification failures. Fifteen B and twelve C answers assert no risk taxonomy and are marked not applicable, not incorrect. Severity has no supported failures among asserted severities. Formatting/taxonomy gains are not capability gains under this protocol.

## What the partial run establishes

Both groups find every expected causal issue and all six proposed repairs pass the finite post-submission isolated probes. Neither group edits unauthorized paths or claims to have executed unavailable application tests. C improves causal deduplication and taxonomy in these responses, but repeatedly withholds bounded health assessments. Sweep differs on one missing-policy answer only. The current observed evidence does not establish a reliable positive skill effect.

Four development-authored families are not independent holdouts. Repeats share case facts and are not independent tasks; no statistical significance or population claim is justified. This static B/C comparison does not test native skill discovery, other models, the other four skills, or autonomous iterative repair. Original historical results and rubric are unchanged. Future collection requires a separately frozen recovery and authorization; adjudication did not resume the collector.

## Per-answer index

Detailed quotes and references live in annotations.json; raw responses remain immutable in raw.tar.gz.

| Attempt | Case | Arm | Repeat | Primary | Failed primary axes | Response ID |
|---:|---|:---:|---:|---|---|---|
| 1 | EV-H1-defect | B | 1 | fail | causalOwnership | deb89150c57503d5f7552b5c |
| 2 | EV-H1-defect | C | 1 | fail | evidenceStatus | 0ca05720f88125ded9458718 |
| 3 | EV-H1-protected | C | 1 | fail | evidenceStatus | 371cfcaac238ef3adc0a02d5 |
| 4 | EV-H1-protected | B | 1 | pass | — | cfdcfa433adfd5cb13af6d96 |
| 5 | EV-H1-insufficient | B | 1 | pass | — | 25626dceb46c447149b0ba4c |
| 6 | EV-H1-insufficient | C | 1 | pass | — | 71e7bf53b559c86e2e5f6d2d |
| 7 | EV-H2-defect | C | 1 | pass | — | 9ef2385188541eb3091534ff |
| 8 | EV-H2-defect | B | 1 | pass | — | 57340a94423e761e46739418 |
| 9 | EV-H2-protected | B | 1 | pass | — | 0f09d3902ee2afd86d47808d |
| 10 | EV-H2-protected | C | 1 | fail | evidenceStatus | 53690b54501df4281a518cef |
| 11 | EV-H2-insufficient | C | 1 | pass | — | 2db308b9bdaa46227522997b |
| 12 | EV-H2-insufficient | B | 1 | pass | — | b46938f6c859dfbe7732fefd |
| 13 | EV-S1-defect | B | 1 | pass | — | 7eb9ee8b03b3d5eaed626e60 |
| 14 | EV-S1-defect | C | 1 | pass | — | 2f5b9c478a9eb66f6e134b0a |
| 15 | EV-S1-protected | C | 1 | pass | — | 8062f4f048cf37a8ddc8abb4 |
| 16 | EV-S1-protected | B | 1 | pass | — | fde10d6f859bc075856c1bb1 |
| 17 | EV-S1-insufficient | B | 1 | pass | — | 58819b45b98bc02df8441b9e |
| 18 | EV-S1-insufficient | C | 1 | pass | — | 4b04a5ea50fcc6a2dac02a5a |
| 19 | EV-S2-defect | C | 1 | pass | — | a0cabdfcdb4e9adfb19aeef3 |
| 20 | EV-S2-defect | B | 1 | pass | — | fc5ae2d9f8c74ebb487d2f0e |
| 21 | EV-S2-protected | B | 1 | pass | — | 6e99b217f8788667a117acf8 |
| 22 | EV-S2-protected | C | 1 | pass | — | 66465837cccfb7f69fef18f7 |
| 23 | EV-S2-insufficient | C | 1 | pass | — | 2c079dea90bd94be53b1f5da |
| 24 | EV-S2-insufficient | B | 1 | fail | diagnosis | b057fdc87b0afcb0c405d825 |
| 25 | EV-H1-defect | C | 2 | fail | evidenceStatus | 83c5b0e056ad909157deb6d4 |
| 26 | EV-H1-defect | B | 2 | fail | causalOwnership | 562563ed9863520a6d404c9c |
| 27 | EV-H1-protected | B | 2 | pass | — | c83bbf4f039b9d77d9f77ec2 |
| 28 | EV-H1-protected | C | 2 | fail | evidenceStatus | 6e4b1724d60c74c323672ccb |
| 29 | EV-H1-insufficient | C | 2 | pass | — | ce20c2fe34d6dd0aa4b77c3c |
| 30 | EV-H1-insufficient | B | 2 | pass | — | 5d0d4a005026b78cc434f481 |
| 31 | EV-H2-defect | B | 2 | pass | — | 08bb1a566b8fc5c4faddff2e |
| 32 | EV-H2-defect | C | 2 | fail | evidenceStatus | 45ab65c3cb7c060bff9d3698 |
| 33 | EV-H2-protected | C | 2 | pass | — | c00c1d00dd1114ccb2ef489e |
| 34 | EV-H2-protected | B | 2 | pass | — | db4eb9ecae059f032be17f16 |
| 35 | EV-H2-insufficient | B | 2 | pass | — | 0e28db5568a6451630003baf |
| 36 | EV-H2-insufficient | C | 2 | pass | — | 3183d23bcf7b91934bb90e61 |
| 37 | EV-S1-defect | C | 2 | pass | — | a94dc4c9e5e91d06e20b6acb |
| 38 | EV-S1-defect | B | 2 | pass | — | 0620eb78a43cef21531f7eda |

## Artifact inventory

- `raw.tar.gz` preserves the collection envelope unchanged. `raw-manifest.json` records SHA-256 and sizes for all 219 payload files plus 270 macOS AppleDouble metadata entries in that archive.
- `model-info.json` records requested and CLI-selected model/effort, authentication type, usage, toolchain hashes and cleanup evidence for all 39 attempts; credentials are not copied.
- `packets.json`, `annotations.json` and `assessment.json` preserve the review inputs, individual judgments and frozen-assessor output.
- `collector-verification.log` and the QA logs preserve offline checks, including the interrupted first test run and successful rerun when confirmed in `QA.md`.

## Offline validation

The frozen recovery verifier and frozen semantic assessor pass for all 38 completed answers. Exact quote/input-reference validation and required-issue coverage pass. Full repository gates and archive checks are recorded separately in QA.md and verification logs; no live model calls are part of these checks.
