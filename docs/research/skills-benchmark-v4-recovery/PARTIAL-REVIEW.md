# Partial semantic review, BV4-01–03

Nine responses were individually inspected against the sealed case contracts and rubrics. `partial-annotations-01-03.json` preserves response hashes, answer excerpts, scoped dispositions and rubric credits. All nine align with their frozen scoped disposition; each arm identified the expected rounding-order issue in BV4-01. These nine answers are not representative of the whole benchmark; no overall per-skill accuracy or false-positive rates can be inferred.

The remaining 99 answers have not been semantically assessed. The two segments combine into 108 completed records and 2,551,968 observed tokens; the prior timed-out attempt's usage remains unknown. Machine checks and tool receipt analysis are not substitutes for the pending per-answer semantic review. The partial JSON cannot be passed to the full assessor, which correctly requires all 108 annotations.

Reproduce the combined raw provenance with `node docs/research/skills-benchmark-v4-recovery/combine.mjs verify _workspace/campaign-v4-live _workspace/campaign-v4-recovery-live`. The helper creates packets or, only after all 108 manual annotations exist, calls the frozen full assessor. Raw segments and the earlier failed attempt remain unchanged.
