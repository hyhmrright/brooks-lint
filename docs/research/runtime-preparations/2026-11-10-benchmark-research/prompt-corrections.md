# Prompt-cue corrections after QA round 2

Scope: only six unresolved v2 context files, their evaluator cue audit, supporting
validation/tests, evidence/freeze and v2 design/README. Generic task and all fixture
source implementations, rubrics and operational drivers remain unchanged.

BV-03 now describes event-ingestion state and application-owned reporting semantics.
BV-06 now describes cache operations and read-service artifact ownership.
BV-09 now describes a multi-tenant component and gateway-owned identity/admission.
BV-12 now describes buffered worker operations and external scheduler ownership.
BV-15 retains API overlap semantics but no longer supplies expected judgments.
BV-18 retains pricing behavior/mutants and external CI orchestration boundaries.

Removed answer-shaped alternatives, explicit missing-contract verdicts and requests
to identify the already-named fact. Kept concrete facts required to reason fairly.
The BV-09 evaluator still requires verified immutable tenant binding, not mere
global ID uniqueness; the model is no longer handed that full answer in context.

`prompt-cue-audit.json` records old/new context hashes, per-case rationale, retained
operating facts and residual cues. Validation pins each audit entry to context bytes
and checks that all tasks remain identical. Regression checks copied full rubric
alternatives and unaudited context edits. These mechanical checks cannot detect all
paraphrase cueing; semantic cue reduction is an author judgment, not independent
blind review or empirically measured difficulty. The previous QA logs are preserved.

CLI validation PASS; 67 v2 tests PASS; git diff --check PASS. Reproduced observations
remain derived from the same executable source and contracts; freeze now covers
revised contexts and cue audit. Parent to regenerate its draft plan and run QA3.
No live model runs, commit or push performed by author.
