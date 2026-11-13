# V4 six-skill comparison: completed semantic review

Date: 2026-11-13. The frozen 36 cases each received one answer in three arms: **A** case-only, **B** generic checklist, and **C** supplied mode skill guidance. All arms used the same task files, neutral output vocabulary, scoring defaults, and tool contract. The model was recorded as `gpt-6.1-terra / low` through Codex CLI `0.167.1`; this is client-selected identity, not independent backend attestation. The two raw segments contain all 108 completed answers. The initial collection stopped at ordinal 39; its failed request and unknown usage remain in the original archive. The separately authorized recovery supplied the remaining 70 completed answers without changing the first 38.

## Results

Each of the 108 answers was judged against its case contract and rubric, with answer hash, quoted evidence, criterion decisions, and claim inventories in `annotations-108.json`. `assessment-108.json` is the frozen assessor's aggregate. A correct frozen label means that the answer's scoped defect/protected/unresolved disposition matched the case; it does **not** mean every statement or artifact was correct.

| Skill | Arm | Frozen label | Expected issue recall | Task criteria | Evidence | Required tool workflow |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| brooks-review | A / B / C | 6/6 / 6/6 / 6/6 | 2/2 / 2/2 / 2/2 | — | 24/24 / 24/24 / 24/24 | — |
| brooks-audit | A / B / C | 6/6 / 6/6 / 6/6 | 2/2 / 2/2 / 2/2 | — | 22/24 / 24/24 / 23/24 | — |
| brooks-debt | A / B / C | 6/6 / 6/6 / 6/6 | 2/2 / 2/2 / 2/2 | — | 21/24 / 21/24 / 24/24 | — |
| brooks-test | A / B / C | 6/6 / 6/6 / 6/6 | 3/3 / 3/3 / 3/3 | — | 21/24 / 22/24 / 23/24 | — |
| brooks-health | A / B / C | 6/6 / 6/6 / 6/6 | 1/1 / 1/1 / 1/1 | 6/6 / 6/6 / 4/6 | 30/30 / 30/30 / 29/30 | 6/6 / 6/6 / 4/6 |
| brooks-sweep | A / B / C | 6/6 / 6/6 / 6/6 | 1/1 / 1/1 / 1/1 | 6/6 / 6/6 / 6/6 | 36/36 / 36/36 / 33/36 | 6/6 / 6/6 / 6/6 |
| **All six** | **A / B / C** | **36/36 / 36/36 / 36/36** | **11/11 / 11/11 / 11/11** | **12/12 / 12/12 / 10/12** | **154/162 / 157/162 / 156/162** | **12/12 / 12/12 / 10/12** |

No arm has a missed frozen issue or a confirmed false defect claim under this rubric. Arm A has one supported **novel** R5 boundary finding in BV4-19, outside the frozen expected issue; the contract and source support it, so it is recorded as an oracle gap, not a false positive. One A claim remains pending in BV4-21. Four C answers have other unsupported score or ledger statements: BV4-16, 17, 18, and 31. Two C `brooks-health` answers (BV4-31 and 32) changed the returned report after a successful finalizer call, so the exact retained-report criterion and workflow failed. Their scoped labels were still correct. The sweep answers returned the required shape and finalizer report, but proposed code was **not** executed during collection.

## Interpretation

This run shows that all three prompts can solve the frozen disposition and expected-issue tasks on these cases. It does not show a diagnostic gain from supplying skill guidance: label accuracy and issue recall were tied; C gained some evidence credits in debt and test, lost some in audit and sweep, and underperformed on the health finalizer contract. Arm C used 1,448,913 observed tokens, versus 569,698 for A and 533,357 for B (about 2.54× A and 2.72× B). The 2,551,968 observed-token sum excludes the first failed request's unknown usage. Token totals describe this run, not general cost efficiency.

The visible gaps are specific. BV4-10 A and BV4-12 A/B lacked a paired original-and-renamed test check. BV4-16 C and BV4-17 C treated architecture as clean despite insufficient boundary evidence; BV4-18 C's debt ledger contradicted its own scored finding. BV4-31 C claimed the test dimension unassessed despite the supplied complete inventory and contract. The two C health finalizer failures show that arithmetic receipt validity alone does not guarantee exact final report preservation. These are not separate frozen-label misses, and the report does not convert them into false defect counts.

This is a same-workflow comparison, not an independent holdout. The case authoring workflow had seen earlier cases and adjudication defects; there is one response per arm per case, no repetitions for variance, unequal prompt lengths, and no native skill discovery. Manual review is evidence-linked but not independent or blinded in a strong sense. The benchmark is useful as a regression and workflow check; its saturated 108/108 frozen labels make it weak evidence of an overall skill advantage. Future causal claims need independently authored cases, repeated runs, and separate checks of any proposed patch in a bounded sandbox.

## Provenance and reproduction

- Frozen plan, model metadata, and arm definitions: `../skills-benchmark-v4.md` and `../skills-benchmark-v4-registration.json`.
- Original stopped run and failed record: `../skills-benchmark-v4-results/2026-11-13-stopped/raw-run.tar.gz`.
- Recovery plan and raw records: `plan.json` and `raw-recovery.tar.gz`.
- Individual decisions: `annotations-108.json`; aggregate: `assessment-108.json`. The source fixture and raw answers were not changed by adjudication.

Extract the two archives into separate directories, then run `node combine.mjs verify ORIGINAL RECOVERY` and `node combine.mjs review ORIGINAL RECOVERY annotations-108.json NEW_ASSESSMENT.json`. The latter validates complete coverage and exact response hashes and quotes before computing metrics; compare `NEW_ASSESSMENT.json` with the committed aggregate. The archives and plan retain the original failure and both collection segments. The regular offline repository gates are `npm run validate`, `npm test`, `npm run evals`, and `npm run benchmark`; no live model evaluation is part of this report.

Validation on 2026-11-13: both archives were extracted afresh; combined verification returned 108 completed answers and 2,551,968 observed tokens, and the regenerated assessment matched `assessment-108.json` byte for byte. `npm run validate`, `npm test`, `npm run evals` (64 structural scenarios), `npm run evals:codex:validate` (seven offline fixtures), and `npm run benchmark` (30 frozen parser reports) passed. The first `npm test` attempt was interrupted after the workspace sandbox denied local loopback binding (`listen EPERM`); the complete rerun with local fixture permissions passed. No real model was called during adjudication or validation.
