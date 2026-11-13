# First semantic review checkpoint, BV4-01–03

Nine responses were individually inspected against the sealed case contracts and rubrics. `partial-annotations-01-03.json` preserves response hashes, answer excerpts, scoped dispositions and rubric credits. All nine align with their frozen scoped disposition; each arm identified the expected rounding-order issue in BV4-01. These nine answers are not representative of the whole benchmark; no overall per-skill accuracy or false-positive rates can be inferred.

This was a checkpoint before the remaining 99 answers were assessed. The completed 108-answer review, including these original nine annotations, is in `annotations-108.json`, `assessment-108.json`, and `REPORT.md`. The prior timed-out attempt's usage remains unknown. The partial JSON alone cannot be passed to the full assessor, which requires all 108 annotations.

Reproduce the combined raw provenance with `node docs/research/skills-benchmark-v4-recovery/combine.mjs verify _workspace/campaign-v4-live _workspace/campaign-v4-recovery-live`. The helper creates packets or, only after all 108 manual annotations exist, calls the frozen full assessor. Raw segments and the earlier failed attempt remain unchanged.
