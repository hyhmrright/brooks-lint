# Health dashboard score consistency repair

This is an offline repair following the stopped three-skill comparison. It is
not a completed model retest or a claim that model-generated dashboards can no
longer disagree with their inputs.

## Diagnosis

- **Symptom:** completed response `b9d405c4866db92c56b6` (AS-21, revised health
  guidance, repeat one) publishes `77/100` in its headline and `80/100` later in
  the same report. Its dimension scores are 92, 40, 98 and 100; the stated
  weighted sum is correctly 79.5, which rounds half-up to 80.
- **Source:** the existing guide already requests one calculation ledger and
  consistency checks, but leaves the score block to free-form generation. The
  observed failure is report assembly consistency, not an incorrect weighted
  formula or evidence that more findings should be deducted. The model's
  internal reason for emitting 77 is unknown.
- **Consequence:** a reader or downstream parser can take the wrong headline
  score despite correct supporting arithmetic. The answer fails the frozen
  whole-dashboard arithmetic criterion; correct component evidence does not
  excuse the headline.
- **Remedy:** calculate from a validated, already adjudicated ledger, render one
  authoritative score block and verify the final report against that block.
  Keep a tool-free path with explicit arithmetic and one published composite
  for agents or tasks that cannot execute the helper. Do not claim execution
  when tools are unavailable.

The original response, individual assessment and partial results remain in the
[stopped-study assessment](skill-revision-results/2026-11-11-terra-low/assessment.md).
The repair is informed by that response and the authored cases; it is development
regression coverage, not an independent holdout or human evaluation.

## Implementation and scope

The health skill now completes the ledger before composing the report. Its
bundled dependency-free Node helper,
[`score-dashboard.mjs`](../../skills/brooks-health/scripts/score-dashboard.mjs),
calculates dimension deductions, exact integer-weight arithmetic and half-up
rounding. It renders a single composite line together with its dimension ledger
and arithmetic. A missing assessment suppresses the composite; an assessed clean
dimension scores 100. Only PR with no diff can lose its weight.

The actual AS-21 input has severities without risk codes. An explicit supplied,
adjudicated, capped-ledger assertion lets the helper retain those absent codes
instead of fabricating diagnoses. Positional IDs refer to input entries. Known
cap violations still fail; unavailable debt risk codes are disclosed as an
unverified per-risk cap. The assertion is input provenance, not independent
evidence. CLI startup also supports the skill symlinks used by this checkout.

The helper's `check` command requires the unchanged generated block exactly once
and rejects extra `Composite Score:` labels, including the two bold formats in
the observed failed response. It does not silently rewrite the response. The
guide requires the agent to regenerate an invalid block and check again before
delivery. The checker is limited to this output contract: it does not understand
arbitrary natural-language statements outside the block or validate the evidence
behind a finding. An agent can still ignore its instructions; live adherence
remains unmeasured for this revision.

The full tool-free calculation and single-composite procedure stays inside
`health-guide.md`, so a text-only runner need not read an omitted support file.
The supplementary [ledger contract](../../skills/brooks-health/score-ledger.md)
documents helper inputs, commands and its limitations. No new risk code, trigger
boundary, dimension weight or strictness deduction was introduced.

## Offline evidence

The original run was verified using the pinned `2e38033` source. All 11 completed
answers and the failed attempt
passed that verifier; regenerating the old summary produced byte-identical
output. No historical answer, annotation, summary or archive was corrected to
make the new check pass.

The regression suite uses independently stated expected arithmetic, incomplete
and malformed ledgers, changed or duplicate score blocks, the actual preserved
AS-21 answer, and CLI/installation checks. These are local program tests; they do
not generate new model answers. See the
[offline validation record](health-score-consistency-validation.md) for commands,
results and the limits of the verification.

## Evaluation version boundary

The earlier frozen 132-response experiment remains incomplete: 11 completed,
one failed and 120 not run. Its original freeze, raw archive, annotations and
summary are preserved. Its recovery implementation at commit
`2e38033adcfff14bab568d4f5f77e95878bcd97d` still targets the earlier candidate;
current-source drift checks must reject that registration after the guide edit.
Use a clean checkout of that commit for original verification or separately
authorized original recovery, retaining the parent's absolute evidence path.

Testing the repaired health guide requires a separately named freeze,
registration and result set. Do not combine later-candidate responses with the
11 existing responses to describe one experiment. The current text-only runner
forbids tools and supplies Markdown guidance, so it can test adherence to the
tool-free instructions but cannot test invocation of the new helper. A native
helper workflow needs a separately specified tool-enabled evaluation.

No real model run, model fallback, extra judge call or change to the frozen
study's budget is part of this repair. Provider capacity and timeout recovery
remain unverified by offline tests.
