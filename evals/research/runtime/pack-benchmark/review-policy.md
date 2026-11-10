# Targeted runtime pack review policy, revision 1

This is a development calibration, not an independent holdout. Primary question:
does adding the runtime prototype to targeted brooks-review guidance improve
contract-sensitive runtime diagnosis without worsening false positives? Do not
present this as a test of all shipped skills, native loading, or production value.

## Before execution

Freeze inputs, contracts, rubrics, guidance, runner and this policy. Record CLI
version, exact selected model and reasoning effort only after the maintainer selects
them. No default selection is authorization. Full plan: 12 cases × 3 arms × 3
repetitions = 108 calls; smoke is a distinct 3-case × 3-arm × 1 = 9-call plan.
Freeze both before observing either. Never tune on smoke and then call the full
plan a holdout. A smoke result is not a repeated full-study result.

## Review

Give the reviewer only shuffled review-packets.json. Keep registration, arm/repeat
mapping and original response ordering away until judgments are saved. Preserve
answer hashes, exact excerpts, reviewer identity, exposure and disagreements.
Arm masking is procedural, not independent blinding: authors know case intent,
answer prose may reveal guidance, and same-workflow model judging is not human
validation. No rubric is supplied to the responding model.

For each response annotate assessment (defect, protected, unresolved, out-of-scope,
or no-answer), expected issues and satisfied evidence indexes, each with its own exact supporting
quote and rationale. Record reviewer identity, exposure and method; confirmed
unsupported or novel claims also require adjudication evidence/references. Pending
claims leave complete-answer status null and enter precision bounds.
The scorer validates inventory arithmetic and excerpts, not the truth of judgments.
An unanswered question or empty answer earns no assessment/evidence credit. An
unresolved answer needs the decisive missing contract and both compatible
interpretations, not a generic request for more context. A protected answer needs
the causal protection trace; silence alone is not correctness.

Report findings on supplied contracts; source mappings justify inspection but do
not establish production exposure. A remedy conditional on a missing fact is not
an affirmative defect. Use code behavior rather than preferred style. Novel claims
are pending until independently checked; absent-from-gold does not mean false.
Retain original frozen assessment agreement and separate versioned supplemental
adjudications. Never silently rewrite labels to improve any arm's score.

## Metrics and decision

Compare C−B for runtime incremental value; B−A is only targeted core guidance.
Primary runtime denominator: 9 cases / 3 families, 3 expected defect issues,
3 protected and 3 unresolved cases per repetition. Guardrails: PB-10–PB-12
reported separately (one compound expected issue, one clean review, one syntax
request). Do not pool guardrails into runtime recall. Repeated answers are linked
observations, not 27 independent runtime cases.

Report per-arm, per-family and per-repeat assessment agreement, expected issue
recall, missing issues, protected false-defect responses, unresolved overclaims,
unsupported claims, pending discoveries, confirmed novel issues and evidence
completeness. Report numerators and denominators, including no-op controls.
Report incomplete/failed executions separately; no complete-case-only uplift claim
when failures could differ by arm. Report matched completed triples as a secondary
view with exclusions. Paired outcomes: C improves / ties / regresses versus B;
retain disagreements. Tokens, duration and observed usage are required alongside
quality; they are not exact ChatGPT billing. No combined score or single headline
accuracy can replace these axes.

For development, retain a candidate improvement only if a prespecified runtime
criterion improves without a confirmed new false positive or guardrail regression;
otherwise revise or report no detectable benefit. This gate is descriptive, not
statistical significance. With three mechanisms and exposed authorship, no outcome
licenses promotion to a shipped pack or claims of generalization. A future
separate study must add generic-runtime-checklist/context-cost ablations, actual
selective loading telemetry and admitted repository examples before those claims.
