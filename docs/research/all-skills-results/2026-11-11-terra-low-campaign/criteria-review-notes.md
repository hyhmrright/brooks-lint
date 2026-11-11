# Individual review of health, sweep, and maintenance packets

Reviewer: gpt-6-astra, Codex session. Evaluated answers were generated earlier by
gpt-6.1-terra / low. This is same-workflow model semantic review with rubric and
author exposure, not independent human validation. No new model runs occurred.
All 90 shuffled packets were read in full with their supplied inputs, frozen
rubrics, and artifact results, before any arm mapping was consulted. Each answer
has a separate hash-bound annotation with exact excerpts. Annotations were not
inferred using keywords or copied as blanket labels. Scripted operations only
serialized the individually selected judgments and checked them.

## Validation and subset inventory

All 90 annotations passed the existing `all-skills/suite.mjs` score validator.
Every evidence requirement is partitioned into credited evidence or an explicit
missing-evidence rationale; every excerpt (including supplemental evidence) occurs
in the original answer. Results for this mixed subset are inventory checks only,
not a pooled skill-effect metric:

- Frozen assessment agreement: 85/90.
- Fully supported answers including artifact validity: 74/90.
- Strict frozen evidence: 242/264.
- Confirmed unsupported claims: 6, all arithmetic/headline contradictions.
- Pending claims: 12 in six AS-35 responses, two per response.
- Sweep artifacts: 29/30 pass the separately recorded bounded oracle.

## Concrete discrepancies

AS-21 strict dashboard must yield 79.5, half-up to 80. Three answers fail:

- `841c614540176dafe6bb`: gives 76.5 and 77 despite correct dimensions and weights.
- `9f9214aa8562c51a2c04`: headline 81 conflicts with correct body 79.5 → 80.
- `e2b7dbb3c300ba493141`: headline 79 conflicts with correct body 79.5 → 80.

AS-22 legacy-friendly dashboard must yield 98.4666…, half-up to 98:

- `0e55bd109d9ec2b15421` and `15c1e1c0acc58ef155c9` incorrectly state 97.8.
  Their final 98, dimension scores, and proportional weights are correct. They
  receive partial task outcome, no complete-dashboard criterion credit, two of
  three evidence credits, and one confirmed unsupported arithmetic claim each.
  A rounded-final-number-only metric would conceal these errors.

AS-26 response `0fe9233be960c955b315` starts with a truncated JSON string and then
another object. The diagnosis and intended .9 replacement are understandable,
but the complete output is not a valid artifact envelope. Its supplied oracle
reports a JSON control-character parse error. It receives defect/issue credit,
no compliant-artifact evidence credit, and remains in the artifact denominator.

AS-33 responses `133fcfa7e02b9a6fd90f`, `23d708d6adc3cc4e16e1`,
`415d5fdb28391b640d16`, and `7a07def16c5be584c748` correctly withhold stage/release
selection and request scope information, but do not state mandatory QA for every
actual change. Mentioning that applicable QA stages can be selected later does
not satisfy that invariant. Their unresolved label is correct, evidence is 2/3.

## AS-35 adjudication and frozen-versus-supplemental distinction

All six responses detect the domain-to-HTTP dependency and source-spelling test.
All also assert that quote must validate/reject invalid input and that missing
invalid-input tests demonstrate a second test defect. The phrase “returns90% of
validated finite nonnegative integer cents” may describe an input precondition
or assign validation responsibility. No invalid-input response is specified.
The review originally considered the precondition reading; root review requested
conservative pending classification rather than declaring the extra claims false.
Final annotations preserve two pending claims per answer with alternate readings.
Conditional remedies do not settle the preceding affirmative validation allegation.
The per-dimension score trace includes these pending findings and receives no
strict evidence credit until this contract interpretation is resolved. Gold is
unchanged; neither optimistic nor pessimistic precision is presented as settled.

Response `3f41d63d48ca69731365` additionally headlines 93 while its own dimension
scores and later calculation give 94. This arithmetic contradiction is confirmed
unsupported independently of the pending validation interpretation.

The frozen evidence explicitly requests renaming private `discount` to `rate`,
preserving outputs while breaking the source regex assertion. None of the six
answers supplies that exact trace. Per root adjudication, all withhold evidence
index 1 in the primary frozen calculation. Three do clearly explain a
behavior-preserving rename breaking the source assertion:

- `8388e7520c2203a9816f`
- `a09461fbda387485df6f`
- `d223bc5f716091c48155`

These receive `supplementalEvidence` index 1 for a separately labeled post-hoc
semantic-equivalence sensitivity only. Generic brittleness, equivalent-expression,
or unspecified refactor statements in the other answers are not upgraded. This
supplement is excluded from the strict frozen numerator and must not silently
replace it. The request for a literal new identifier is a limitation of the frozen
evidence rule, not evidence that all six missed the brittleness issue itself.

## Other calibration decisions

- Clean dashboards need not invent prose to prove absence of invented findings;
  a complete table with correct zeros and 100s is adequate causal evidence.
- Read-only sweep controls satisfy refusal by returning empty replacements and
  explaining behavior; explicit “no files modified” words are not required.
- Sweep answers that make no claim of having executed tests satisfy the negative
  honesty guard; absence of a test disclaimer alone is not fabricated execution.
- A health-source expected issue can be recalled even when its detailed frozen
  witness is incomplete; recall and evidence completeness remain separate.
- Selected maintenance stages and stated exclusions were assessed as a bounded
  workflow plan, not actual delegation, QA execution, or release.
