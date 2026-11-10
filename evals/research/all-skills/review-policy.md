# All-skills review policy, revision 1

Freeze before model execution. This is public, same-workflow development calibration.
Primary comparisons are A case-only versus B selected skill guidance within each
skill, not one global score. Native discovery and full autonomous workflows are not
measured by these text/artifact tasks. Review all completed answers, report failures
and missing pairs; never remove a bad artifact from task-quality denominators.

The 31 product cases cover six shipped skills; four maintenance cases are separate.
The two health fixed-ledger computations and clean ledger test measure arithmetic,
not diagnosis. AS-35 measures health source diagnosis. AS-11 tests prioritization of
verified facts. Maintenance tests policy application, not actual delegation or release.
Normative arithmetic, priority and maintenance rules appear in both arms' inputs.
Task-criteria cases use completed/partial/unresolved/out-of-scope/no-answer outcomes
and expectedCriteria. They never earn expected bug recall for arithmetic compliance.
Diagnostic cases use defect/protected/unresolved/out-of-scope/no-answer and expectedIssues.

Use per-answer semantic annotations with reviewer identity, method and exposure;
answerSha256; assessment and assessmentSupport {quote,rationale}; issues, evidence,
unsupportedClaims, pendingClaims, novelConfirmedClaims arrays. Each item needs id,
exact nonempty answer quote and rationale. The issues array holds expected issue IDs
or expected criterion IDs according to metricKind; the report separates denominators.
Evidence indexes are zero-based rubric entries. Confirmed extra claims require an
adjudication reference/rationale. Never treat unmatched findings as automatically false.
Pending claims prevent a complete-supported result and receive precision bounds.

Read shuffled review-packets.json before registration/mapping. Pseudonyms reduce
label anchoring, not inferable style or author exposure. Same-model grading is not
human validation. Exact quote validation is not proof that the reasoning is correct.
Do not reward format for unsupported content. No-op handwritten controls validate
arithmetic only; a model judge still needs independent adversarial calibration.

Sweep answers must satisfy the artifact envelope. The harness applies only the
allowlisted source replacement to a new temporary filesystem and independently
checks literal behavioral cases plus preservation. It does not execute generated
code: a restricted arithmetic parser implements the task's declared function grammar.
Malformed JSON, forbidden edits, no-op positive repair and failing behavior are task
failures, not excluded runs. Other sweep cases must preserve the entire fixture.
Report artifact success separately from diagnostic/evidence quality. This cannot
establish native tool sequencing, real test execution by the model, convergence,
large refactors, or general JavaScript repair ability.

The full plan is35×2×3=210 responses, with rotated A/B order and no harness retries.
Smoke is7×2×1=14 responses and overlaps full; the two are alternatives, not holdouts.
Repeated answers do not create independent fixtures. Keep runtime PB comparison
separate. No plan authorizes calls: record selected model, effort, CLI and scope first.
Do not change gold or guidance based on results without versioning the next study.
