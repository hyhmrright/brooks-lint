# Frozen v5 one-shot recovery preparation

Prepared offline on 2026-11-14 (Asia/Shanghai). **No real model call was made or authorized by preparation.** The user requested a plan to replace the failed first-repetition BV5-27 C request and execute the remaining unrun slots. The original 78 answers, original failure, registration, semantic annotations and report remain immutable. This is an additive second collection segment, not a replacement of historical evidence.

## Exact schedule, identity and admission limits

- Original attempt count: 79, including the retained transport-retry failure at ordinal 79. Original completed prefix: ordinals 1–78.
- Recovery schedule: **ordinals 79–324, 246 new collector submissions maximum**, in the original frozen order. At most 325 lifetime collector submissions including the original failure. No automatic retries or replacement requests inside this recovery.
- Model and effort: **gpt-6.1-terra / low**; pinned CLI 0.167.1, original toolchain, login channel, scoring tool, proxy fingerprint and unchanged prompt bytes.
- Original observed usage: 1,315,995 tokens. Cumulative admission limit remains **12,000,000 observed tokens**, leaving **10,684,005 observed tokens** before admission. Original failed-request usage is unknown; one admitted turn may overshoot. This is not a hard billable-token or dollar cap.
- Original recorded execution time: 1,590,911 ms. Cumulative limit remains **43,200,000 ms (12 hours)**, leaving **41,609,089 ms (11 h 33 m 29.089 s)**. The human pause is excluded; the original execution time is never reset. Each new turn receives at most **120,000 ms**, reduced to remaining cumulative time if needed.
- Stop immediately on turn failure, observed retry, new missing usage, identity/cleanup/receipt verification failure, source/toolchain/proxy admission drift, or exhausted token/time admission budget. No silent resume; a new recovery after a stop needs a separately reviewed plan and authorization.

`plan.json` binds the exact original execution hash, failure hash, all 78 retained raw hashes and the original annotation hash, schedule, limits, identity and recovery sources. The original registration still binds all model prompts and the original transport/scoring sources. Execution requires explicit `--live`, checks the original frozen registration/source and current toolchain/proxy at admission, and refuses existing output directories or an output inside the original run. No model-authored code executes.

The first failure included a provider reconnect indication. The record supports “no additional collector resubmission after detection,” not a claim that the provider performed zero internal retry. Current authentication freshness or backend availability cannot be proven offline. Model identity is recorded client selection, not independent backend attestation.

## Offline evidence and its limits

`targeted-tests-final.log` covers the preserved prefix/IDs, exact remaining schedule, budget accounting, explicit mode gate, forbidden live fixture injection, all stop controls, raw/intent/stop/counter/time tampering, no implicit resume and immutable original directory. `synthetic-raw.tar.gz` contains the final 246-success simulation and eight controls (failure, retry, wrong identity, incomplete cleanup, unknown usage, token admission, elapsed deadline and proxy drift), with raw records, intents, receipts, state and plans. The simulation uses **in-process authored record injection**, not Codex CLI or live login. It validates recovery orchestration and verification, not a new transport/login test or model ability. Every simulated record is marked `simulation: true`; it cannot be combined into the real adjudication run.

The identity/cleanup controls intentionally preserve invalid completed raw responses but stop with `verification-failure`; their completed transport status is not evidence of an admissible answer. Real combination rejects such an unverified segment. Frozen cases and old adjudications are not changed to accommodate them.

`history-hashes.json` pins the historical tracked v5 materials. Initial successful preparatory simulations remain ignored local scratch; the final source-bound simulation is committed. Required repository gates and independent QA are recorded separately before handoff.

## Reproduction and later authorization

Extract the retained original archive from `../skills-benchmark-v5-results/2026-11-13-stopped/raw-run.tar.gz` into a fresh directory. Commands from repository root:

```sh
npm run evals:skills:v5:recovery
node evals/research/skills-benchmark-v5-recovery/drill.mjs ORIGINAL FRESH_SYNTHETIC_OUTPUT
node evals/research/skills-benchmark-v5-recovery/recovery.mjs verify docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL RECOVERY_OUTPUT
```

After the user switches/confirms the model and authorizes real execution:

```sh
node evals/research/skills-benchmark-v5-recovery/recovery.mjs execute docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL FRESH_REAL_OUTPUT --live
```

No command here starts a real campaign implicitly. The original raw archive remains the source of the failed attempt even if its replacement succeeds. To produce combined packets and assess all completed answers afterward:

```sh
node evals/research/skills-benchmark-v5-recovery/recovery.mjs packets docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL RECOVERY_OUTPUT NEW_PACKETS.json
node evals/research/skills-benchmark-v5-recovery/recovery.mjs review docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL RECOVERY_OUTPUT ALL_COMPLETED_ANNOTATIONS.json NEW_ASSESSMENT.json
```

Combination retains the original registration identity and ordinals, so the existing 78 response IDs and answer hashes remain valid. The combined review command rejects missing or changed original annotation entries. Append only judgments for new completed answers; retain both failed attempts where applicable. The merged 324 planned slots are reported separately from the original replaced failure, unknown prior usage and the two collection periods. This recovery does not create independent samples or cure the disclosed oracle gaps and same-workflow judgment limitations.

Frozen plan SHA-256: `549fc80e8edd754681a359f14b2907dbc0a40e3437f2407d93414bd86fd12ea1`.

Final targeted validation: 16 recovery tests passed, and the full 246-record synthetic success path plus eight stop controls were rerun after the original-directory and original-judgment guards were added. The final archive root is `v5-recovery-offline-sealed/`. `npm run validate` and `npm run evals` (64 scenarios) passed. Full repository QA is a separate final gate; these records alone do not claim it passed.
