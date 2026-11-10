# Hard runtime benchmark: prospective measurement protocol

Status: offline design, 2026-11-10. No model execution is authorized by this
file. This protocol does not amend the completed 81-answer study, its rubric,
or the runtime prototype. The [case collection](runtime-hard-benchmark.md)
records the implemented mechanisms and executable evidence.

## What “harder” means

The maintainer requested a very large increase in case difficulty. There is no
ratio scale on which these cases can honestly be called 100 times harder.
Difficulty is unmeasured until responding models are evaluated. More lines,
more tokens, arbitrary missing facts, or stricter wording requirements alone do
not demonstrate harder reasoning.

Instead, record inspectable demands: cross-file causal links, interacting
runtime mechanisms, explicit event ordering, ownership or contract boundaries,
and closely matched controls whose different conclusion has a concrete cause.
The executable oracle establishes bounded observations, not a model's required
reasoning effort or production failure frequency. A complex fixture that all
arms solve remains a valid control, but provides little discriminatory evidence.

The intended suite has twelve mechanism families, each with a defect, protected,
and insufficient-information variant. The family is the unit of split and
analysis; thirty-six prompts are not thirty-six independent mechanisms.

## Development split and revision policy

Assign four complete families to calibration and eight complete families to a
reserved evaluation split before any live response. Do not distribute siblings
across splits. All thirty-six cases are agent-authored, public, and exposed in
this development workflow. “Reserved” means a prospective restriction on tuning,
not independent authorship, secrecy, external validation, or absence of possible
training contamination. Independent human calibration has not happened.

Freeze exact input, rubric, executable fixture and test digests. Any change after
responses exist creates a new revision and retains the old plan and raw records.
If a reserved case informs guidance changes, mark its family as used for tuning;
do not silently restore its reserved status. Correcting a faulty oracle warrants
an explicit invalidation report and sensitivity, not silently editing ground truth.

Calibration is allowed to discover ambiguity or a ceiling/floor. No fixed target
baseline error rate is an acceptance gate: selecting only cases that a particular
baseline misses would bias the comparison. Preserve every pilot result and every
case exclusion with the reason and timing. Do not turn a failed candidate into a
secret reserved case.

## Offline acceptance before any model call

Each family must have actual executing fixture code, a reproducible event trace,
a bounded invariant, and tests that distinguish its defect from its protected
peer. Use logical clocks, controlled gates or deterministic event drivers rather
than relying on wall-clock timing. Counterfactual schedules and cleanup checks
must test the asserted mechanism, not merely compare a hardcoded verdict.

Insufficient-information cases must omit a decisive artifact from the visible
input. The evaluator supplies two compatible completions that produce different
contract judgments of the visible behavior. Neither completion is an undisclosed
fact that a model is expected to guess. If the supplied code already proves the
failure under both completions, the case is not insufficient information.

Visible bundles contain only the explicit input whitelist. Rubrics, oracle
outputs, split labels, defect/protected labels, expected issue inventories,
sibling answers and tests are evaluator material. Test the exporter boundary.
A hidden driver trace is one witness, not a required verbatim answer. Accept any
valid causal witness within the supplied environment. Protected-case evidence
must not require seeing a sibling implementation; a supported explanation of
the actual guard and its contract boundary suffices. Never require undisclosed
constants, a particular adversarial schedule, or facts absent from visible inputs.

Public evaluator material is still not permitted in the model's isolated working
directory. Mechanism-relevant contracts belong in the prompt even when they make
the answer easier; ambiguity is not a substitute for difficulty.

## Later live experiment, not executed here

A new reviewed execution plan must pin the new case adapter and exact bundles,
model selection, reasoning effort, actual reported identity and its verification
limits, CLI version, login channel, guidance digests, limits and scoring schema.
The old HC execution plan must not be repurposed merely by replacing its inputs.
Readiness of these cases does not establish that the live executor accepts them.

Use identical tasks and independent sessions for three primary treatments:

- A: case inputs and common analytical instruction.
- B: the same plus the frozen core guidance.
- C: the same plus core guidance and the frozen runtime prototype.

A fourth, separately predeclared control may add a generic checklist to B with a
comparable token budget to C. It can help probe prompt-length and generic
instruction effects, but equal length does not isolate all content effects. Do
not add it retrospectively to explain an inconvenient primary result.

Start with the twelve calibration cases. Three arms with one repetition are 36
responses; three repetitions are 108. A reserved-only three-arm, three-repetition
run is 24 × 3 × 3 = 216 responses. Running all thirty-six with that design is 324.
A fourth arm changes those totals and requires a revised budget. These counts
are plans, not permission or a token/currency estimate. Confirm model and budget
with the maintainer before live execution. Record every retry as a separate
attempt; preserve failures and never substitute a recovery invisibly.

Randomize treatment execution order with a recorded seed, keep resource and
time limits comparable, and prevent shared conversation state or answer access.
Perform semantic review on masked response IDs where practical, before revealing
arm mappings; retain exact answer hashes, excerpts, rationales and disagreements.
An agent familiar with the cases is not a blind independent reviewer merely
because the arm name was hidden.

## Primary measurements and interpretation

Apply the [existing scoring protocol](runtime-scoring-protocol.md), with separate
axes and explicit numerators/denominators:

- Execution and review availability over all planned turns.
- Task completion and assessment correctness.
- Expected-issue recall and issue false negatives; defect responses missing any
  expected issue. A correct top-level label does not cover missing causal issues.
- Protected false-defect rate and unsupported assertions across every case kind.
- Unresolved certainty error, including unsupported unconditional safety claims.
- Evidence requirements satisfied and fully evidenced answers.
- Explicit severity calibration, with absent severity reported separately.
- Token use and latency, with recorded versus unverified accounting distinguished.

Only complete, successful, annotated case/repetition triplets enter paired
comparisons; publish exclusions and individual-arm results as well. Keep
incomplete answers in the appropriate semantic denominators. A requirement
omission is not automatically a missed defect. Require causal meaning, not a
specific phrase, formatting, runtime risk code, or a model executing tests.
For supported findings use Symptom → Source → Consequence → Remedy.

For unresolved evidence, explicitly grade the observed behavior, the missing
artifact, two compatible contracts, and the different judgment under each.
Publish any relaxed-threshold sensitivity uniformly across all arms and retain
the primary frozen labels. The previous study showed why this distinction matters:
C's evidence advantage over B disappeared under a more permissive alternative-
contract criterion, while all three arms had perfect assessment accuracy.

Report pooled response counts alongside family-level results and matched arm
differences. Repetitions and sibling variants are correlated; do not use them as
independent evidence in significance claims. This small, purposively authored
collection is descriptive and cannot estimate production accuracy. Stronger
inference requires more independently sourced families and separate review.

A useful next result would be fewer causal misses or false assertions for C,
without worsening restraint on protected and unresolved cases. Improvements only
in evidence formatting or explicitness remain useful, but must be named as such.
Equal scores, worse scores, floor effects and high execution failure are valid
outcomes; report them rather than retrofitting the benchmark to show benefit.
