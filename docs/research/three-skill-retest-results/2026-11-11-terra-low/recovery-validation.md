# Three-skill retest recovery QA

**PASS** for the recovery source and original evidence archive.

- `npm run validate`: exit 0, version 1.9.1.
- `npm test`: exit 0, full offline suite including the 132-turn fake CLI study.
- `npm run evals`: exit 0, 64 structural scenarios.
- `node --test evals/research/skill-revision/recovery.test.mjs`: 6/6, including the previous default recovery, the 91-response parent and the exhausted elapsed-budget case.
- `git diff --check`: exit 0.
- Cross-document checks: four manifests, six README badges, JSON-LD and CHANGELOG agree on 1.9.1. The source inventory derives 12 books and the eval file contains 64 scenarios. The repo documentation agrees. All six descriptions carry negative trigger boundaries.
- Independently reconstructed the sealed real-parent registration. Its 41 ordinals are 92–132, with a cumulative ceiling of 133 attempts, known parent usage of 2,395,759 tokens, unknown usage on failed ordinal 92, and a charged parent span of 8,981,902 ms. Original evidence archive checksum verified. Extraction verified 91 completions, one failure and 40 unrun, and every extracted file hash matched the sealed parent tree.
- Live recovery admission uses the measured elapsed recovery clock. Offline replay can attest recorded recovery durations and sealed parent elapsed time, with no independent measure of gaps between new attempts.

No real model was called by this QA stage.
