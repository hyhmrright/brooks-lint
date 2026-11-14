# Dashboard score ledger

Prepare this ledger **after diagnosis**, configuration and the finding caps. The
helper calculates and renders scores; it does not diagnose code, choose findings,
verify evidence, or decide whether an assessment was actually performed.

## Input

All four dimensions are required, even when one is unassessed. Use these exact keys:

```json
{
  "strictness": "balanced",
  "hasDiff": true,
  "dimensions": {
    "pr": {"status": "assessed", "findings": [{"id": "P1", "risk": "R1", "severity": "warning"}]},
    "architecture": {"status": "assessed", "findings": []},
    "debt": {"status": "assessed", "findings": []},
    "test": {"status": "assessed", "findings": []}
  }
}
```

- `strictness` is the **resolved** `strict`, `balanced` or `legacy-friendly`
  preset; omission means `balanced`. Apply `common.md` configuration validation
  first, including its warning and balanced fallback for invalid config values.
  This helper deliberately rejects invalid resolved presets; it does not read YAML.
- `hasDiff` must be a boolean. With no diff, the PR entry must instead be
  `{"status":"skipped","reason":"No diff"}`. No other dimension may be skipped.
- For missing evidence or an unfinished assessment, use
  `{"status":"unassessed","reason":"Test sources unavailable"}`. Explain that
  reason in the report. Never encode unavailable evidence as `findings: []`.
- Each assessed entry has at most three retained findings. Debt also has at most
  two per risk code. An assessed empty list means the completed scan found none.
  Finding IDs must be unique within their dimension, using only letters, digits,
  dots, underscores or hyphens and starting with a letter or digit.
- Each finding supplies an `R1`–`R6`, `T1`–`T6` or already configured `C<number>`
  risk code and its resolved lowercase `critical`, `warning` or `suggestion`
  severity. IDs refer to the diagnosed or supplied ledger. The helper validates
  code syntax only; establish any custom risk's definition before using it.
- Exception for an already adjudicated, capped **supplied** ledger that contains
  only severities: set root `"suppliedCappedLedger": true` and omit unavailable
  `risk` fields. Use positional IDs such as `A1` only as references to entries in
  that source ledger; do not invent risk codes, diagnoses or source scans. The
  renderer labels the provenance as an input assertion and unspecified risks as
  such. It still enforces three findings per dimension and two per **known** debt
  risk; if any debt risk is missing, it explicitly says the per-risk cap was not
  verified. The assertion cannot override a known cap violation. Do not use it
  for an uncapped or unadjudicated source; obtain the missing facts or leave the
  affected dimension unassessed instead.
- Unknown fields, duplicate IDs, invalid statuses, extra findings and missing
  dimensions are errors. Correct the ledger from evidence; never truncate or
  silently drop findings just to pass the helper.

## Semantic reconciliation before finalization

Use one evidence map for scope, inspected inputs, governing obligations and any
blocking unknowns. Check the draft's scored finding IDs, owning dimensions and
severities against the ledger in both directions. A prose finding cannot coexist
with an assessed empty list in its owning dimension. Label supported observations
on unassessed dimensions as unscored; do not silently convert them to deductions.
A complete local assessment can coexist with explicitly unknown broader scope.
The arithmetic helper cannot perform this reconciliation: a successful receipt
for a semantically inconsistent ledger is still an invalid assessment.

## Tool-enabled finalization (required when permitted and available)

Resolve the helper from this skill's directory, not from an assumed project-relative
installation path. Save the adjudicated ledger once. Write the complete diagnosis,
graph and recommendations as a **score-free draft**, placing exactly one
`<!-- BROOKS_HEALTH_SCORE -->` line below the scope/configuration lines. Do not
include provisional totals, dimension scores, or score arithmetic elsewhere.

```sh
node /absolute/path/to/brooks-health/scripts/score-dashboard.mjs finalize /tmp/health-ledger.json /tmp/health-draft.md /tmp/health-final.md
node /absolute/path/to/brooks-health/scripts/score-dashboard.mjs check-report /tmp/health-ledger.json /tmp/health-final.md
```

`finalize` inserts the calculated block into the draft and writes a **new** final
file; it refuses to overwrite an existing artifact. On correction choose a new
output path so the rejected artifact remains inspectable. Both commands emit a
JSON verification receipt. Save it alongside the ledger, draft and final artifact.
The receipt binds `ledgerSha256` to `JSON.stringify(parsedLedger)` (not source JSON
whitespace) and `reportSha256` to the final report's exact UTF-8 bytes. The second
command must pass against the same ledger and actual final file. Deliver the final
artifact unchanged; edits to either input require fresh finalization and checking.

Determine capability from the actual session tool inventory and execution policy,
not from an unrelated code-mode warning. A direct host scorer may work without a
shell or code-mode wrapper. Use its exposed schema, preserve any attempted call's
result, and distinguish "not exposed", "prohibited", "attempt failed" and "verified".
Do not assert a call failed when no call was made. If tool use is required but
cannot be completed, retain the ledger and diagnosis without a numeric composite;
text-only arithmetic is not fulfillment of the required tool workflow.

A host may expose an equivalent scoring tool instead of shell execution. Its input
is `{ledger, draft}` with the JSON ledger described above and a draft string. It
must call the exported `finalizeDashboard(ledger, draft)` and then
`verifyDashboard(ledger, report)` from `scripts/score-dashboard.mjs`, returning the
report and receipt. Save those inputs and outputs in the host's execution record.
A successful host call performs both stages; do not claim CLI execution for it.

The block contains one numeric composite, dimension scores and deductions,
retained finding IDs, integer-weight products and the exact fraction used for
half-up rounding. Missing assessments suppress the composite instead of receiving
100 or losing weight. The finalizer rejects absent/duplicate placeholders; the
verifier rejects altered canonical scores/tables/arithmetic, stale-ledger output,
and conventional extra score surfaces outside the block (including `/100`,
`out of 100`, or a numeric assignment immediately following `score`, `composite` or
`overall`). Ordinary counts and risk IDs remain allowed. The `/100` guard is
intentionally conservative: write an unrelated ratio as a descriptive count
(e.g. “80 of 100 tests”), preserving its evidence.

These checks do **not** establish diagnosis truth, validate the draft's finding
inventory against source code, detect every natural-language score paraphrase,
or prove that an agent delivered the checked artifact. Inspect surrounding prose
for score restatements and retain execution evidence. A failed verification is
not permission to silently use text-only arithmetic. Correct the inputs from
evidence and retry; if blocked, disclose the limitation and omit a numeric total.
Never repair historical failed evaluation responses or their published grades.

The legacy `render LEDGER.json` and `check LEDGER.json REPORT.md` commands remain
available for block-only consumers. They do not replace the stricter finalization
workflow and their receipt explicitly limits verification to the canonical block.

## Text-only fallback

When execution is unavailable or prohibited, use the same ledger and output
order without claiming the helper ran:

1. Finish the per-dimension deductions and scores before composing the report.
2. Compute the integer products, their sum `N`, and the retained-weight sum `D`
   (100 with PR, 75 without it). Keep `N/D` exact.
3. Apply `floor((2*N + D)/(2*D))` once. Check products and their sum in reverse;
   the result must lie within the assessed dimension scores.
4. Fill one final `Composite Score:` line from that result. Show the dimension
   ledger and exact `N/D` below it, with no repeated rounded total elsewhere.
   When any required dimension is unassessed, use `Composite unavailable` instead
   and omit the weighted calculation. Explain the missing assessment.

If the calculation cannot be verified, state that scores are unverified and
omit the numeric composite. A text-only benchmark evaluates this fallback, not
helper execution. Offline helper tests cannot establish model adherence.

## Exact delivery after finalization

Use `scripts/deliver-dashboard.mjs` with the saved ledger, final artifact and
finalizer/check-report JSON receipt. It rejects a changed ledger, stale report,
omitted terminal newline, additional prose or any other byte difference:

```sh
node /absolute/path/to/brooks-health/scripts/deliver-dashboard.mjs check /tmp/health-ledger.json /tmp/health-final.md /tmp/health-receipt.json /tmp/health-delivered.md
```

For an explicitly requested JSON artifact, prepare its other allowed fields in
an object **without** `report`, then assemble directly from the checked artifact:

```sh
node /absolute/path/to/brooks-health/scripts/deliver-dashboard.mjs assemble /tmp/health-ledger.json /tmp/health-final.md /tmp/health-receipt.json /tmp/other-fields.json /tmp/health-output.json
```

The fresh output file contains the unchanged report string with JSON escaping;
validate the task's complete schema separately. Read or transmit that artifact
rather than reconstructing it. Host adapters can call `assembleDelivery` and
`verifyDelivery` from this helper on the final outgoing field. The receipt proves
only the bytes supplied to the check: chat rendering or later transport may still
change them. Do not silently normalize failed historical answers or replace strict
receipt equality with score-block equality. If a future consumer permits newline
normalization, define that separate transport policy before evaluating it.
