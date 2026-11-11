# Three-skill revision preparation and validation

Final status: **QA PASS**, before live model execution. The maintainer explicitly
selected `gpt-6.1-terra / low`. Local Codex CLI is 0.167.0 and ChatGPT login-file
readiness was checked without exposing credentials. No real calls occurred during
this preparation. Execution registration must record the committed candidate hash.

The final revision-2 freeze is
`2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`.
It binds 22 cases, original/revised guidance, three repeats and 132 calls. Budget:
5,000,000 observed-token admission stop, eight hours, 180 seconds per turn, zero
automatic retries. One-turn token overshoot is possible; these are not billing caps.
The superseded b7056c... preflight was never executed and remains archived separately.

## Stages and corrections

- [Author diagnosis](author-diagnosis.md): three guide edits; the initial sweep
  attribution is explicitly superseded by the later collector audit.
- [Initial eval preparation](eval-preparation.md): new cases, equality of pair
  inputs, bounded artifact oracles and prospective semantic-equivalence rules.
- [QA round 1](qa-round1.md): FAIL on an older historical readiness validator
  comparing archived guidance to current files.
- [Historical loopback](eval-loopback.md): explicit pinned verification preserves
  old freezes and 54 simulated records while current live gates remain strict.
- [Collector correction](collector-fix-summary.md): successful answers exclude
  abandoned delta items; completed commentary is retained, partial diagnostics
  preserved, empty/conflicting completed messages fail closed.
- [QA round 2](qa-round2.md): PASS on full validation, tests, structural evals,
  parser benchmark, Codex offline fixture validation and diff checks. Full tests
  took 154.349 seconds. Thirty cross-document checks also passed.

QA independently scanned all 318 historical raw answers. Exactly two had abandoned
fragments; the additive [historical correction](../all-skills-results/2026-11-11-terra-low-campaign/collector-correction/README.md)
restores sweep B to 15/15 and leaves other skill/runtime results unchanged. Original
raw archives, annotations and result JSON remain unchanged. Four corrected outputs
reproduce byte for byte from a clean pinned checkout and the original archives.

The new 132-turn fake-CLI tests verify raw receipts, model/effort identity, equal
inputs, no gold leakage, stop/budget behavior and reconstructed answer selection.
They are simulations of execution integrity, not evidence that a skill improved.
No trigger descriptions, risk codes, book inventory or version were changed; no
release is requested. See the [study design](../skill-revision-study.md).

Raw validation logs are in `validation-logs.tar.gz`.
SHA-256: `0bf3b477ca397da133dd22e57ef177ca9f819de4638fd9c4edd01a47db4387cc`.
