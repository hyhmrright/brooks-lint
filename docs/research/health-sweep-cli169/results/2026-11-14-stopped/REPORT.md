# CLI 0.169.0 health/sweep retest: stopped at transport retry

The collector stopped immediately on submission 38 after observing a transport retry. It completed 37 answers, retained one failed raw record, and did not run the remaining 10 slots. There was no model resubmission. The failed record reports 86,703 observed tokens; the run reports 2,879,712 observed tokens and 1,280,496 ms, within the 4.5M admission and 3-hour execution limits. The frozen rule allows one-turn token overshoot; observed usage is not an independently verified billing cap. Requested and CLI-selected model/effort were gpt-6.1-terra / low, CLI 0.169.0; backend serving identity is not independently attested. Previously missing 0.167.1 preflight occurred before any call.

All 37 completed answers were read against their individual frozen inputs and rubrics; the failed record is excluded from semantic evaluation. The reviewer is gpt-6.1-terra in the same workflow, not an independent human. `annotations.json` retains per-answer quotes and rationale; `assessment.json` is the frozen assessor's result. B is the generic checklist and C is skill guidance. The eight related authored cases are not independent holdouts; both arms were explicitly required to invoke finalize and assemble and deliver the artifact.

| Measure | B generic | C skill |
| --- | ---: | ---: |
| Completed / planned | 19/24 | 18/24 |
| Semantic complete | 17/19 | 18/18 |
| Strict complete | 17/19 | 18/18 |
| One-missing-LF normalized complete | 17/19 | 18/18 |
| Expected issue recall | 6/6 | 6/6 |
| False claims / pending | 0 / 0 | 0 / 0 |
| Host artifact exact / final artifact exact | 19/19 | 18/18 |
| Required tool compliance | 19/19 | 18/18 |
| Completed-answer observed tokens | 633,741 | 2,159,268 |

There are 18 complete case/repeat pairs. In these matched pairs B has 16/18 semantic and strict successes and C 18/18; B's additional unpaired ordinal 37 passes and is excluded from paired comparison. The failing C ordinal 38 is not a completed answer. Six planned C and five planned B slots are therefore without completed answers, including the failed submission; these are not semantic failures. C's completed-answer token sum is about 3.41 times B's, across different sample counts and prompt lengths; no cost-effectiveness conclusion follows.

| Mode | B semantic / strict | C semantic / strict |
| --- | ---: | ---: |
| health | 6/6 | 6/6 |
| sweep | 11/13 | 12/12 |

The two B failures (ordinals 13 and 30, HS-07) correctly identify the rejection defect and withheld edit authority but return `verification-blocked` rather than the frozen `no-progress` disposition. C's two matched HS-07 responses use the required no-progress stop. All five completed HS-03 responses, including both C responses, correctly choose `no-actionable-findings` for the protected local contract without letting unrelated unassessed dimensions block it. No out-of-domain rejection duty was invented. The explicit rejection defect is recognized in all six expected B and six expected C responses. Four HS-04 candidate proposals were inspected statically, not executed or applied; the recorded checks are source predictions, not proof of repair success.

Health's HS-01 reports leave unsupported debt and architecture unassessed, while HS-02 explicitly supplied complete local maintenance inventory and both arms assess local debt as clean; architecture remains unassessed. All twelve health responses have exact host and agent artifact delivery, including terminal LF counts; strict and normalized outcomes therefore coincide. Skill responses 2, 20 and 34 identify the valid local default-sort mutant gap; response 35 identifies an empty-input mutant. These supported novel local test gaps are not implementation false positives or evidence of broader coverage. Other answers not identifying these novel gaps are assessed only against the frozen obligations; the narrow test oracle does not measure discovery recall for them.

The prior 42-answer study used a different protocol, prompting, CLI and case details, so its headline results do not establish a causal before/after change. The present controlled comparison provides limited evidence that skill guidance improves stop selection on these paired examples, but the sample is small, related, explicitly scoped, author-developed, incomplete, and not independently human-graded. Strong public task instructions and mandatory tools are shared across both arms; native skill discovery and actual repair execution were not measured. No broad effectiveness claim follows.

Reproduce by restoring the raw archive and running the frozen `runner.mjs verify` and `review.mjs assess` commands with `annotations.json`; the resulting assessment is saved here. Offline reproduction verifies evidence and arithmetic, not semantic truth. The original run, the preflight failure and prior study remain unmodified.
