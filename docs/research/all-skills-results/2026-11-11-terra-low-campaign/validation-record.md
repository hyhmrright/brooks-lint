# Semantic assessment validation record

## Evidence preservation and reconstruction

The root reviewer extracted both tracked raw archives into a fresh workspace and
verified the resulting runs, rather than relying solely on the original working
folders. `archive-verification.json` records the archive hashes and recovered
counts. Both archive SHA-256 digests match the previously committed READMEs.
There were no absolute paths, parent-directory traversal members, symlinks or hard
links in either archive.

`readRecovery(original, secondRecovery, [firstRecovery])` reconstructed 210
completed all-skills answers; `verifyRunArtifacts(runtimeRun)` verified 108
completed runtime answers. Their observed token sums are 3,313,206 and 1,977,505.
The original failures remain in the archives. Their missing usage prevents treating
5,290,711 as total consumption or billing. This verifies internal consistency,
not semantic truth, backend model identity or resistance to a coordinated rewrite.

## Targeted second review

The root reviewer is the current `gpt-6-astra` Codex session. These checks are a
second same-workflow model review, not independent human validation. The reviewer
had access to study design and rubrics. Checks used masked response packets;
case identity and guidance can be inferred from content. The targeted selection
below is not an independent accuracy sample of the annotators.

- Runtime `5fe1dd443c17738c0a38`: credit the counterfactual evidence. The answer
  explicitly distinguishes additive contributions yielding 25 from successive
  totals yielding 15, and identifies the missing business definition.
- Runtime `8f3abd524d8cb3de1e33` and `dcfc55157fa3d891780c`: withhold counterfactual
  evidence. Both identify missing cancellation policy and the observed cancelled
  result, but neither explains the independent-waiter violation versus permitted
  atomic-cohort cancellation. Their unresolved assessment remains correct.
- Runtime `0f1662e81ec4ce046b18` and `21f526a4cb8d4af3d67d`: the missing `b.cancel`
  interface is discussed conditionally. The observed A-cancels scenario is correctly
  assessed as contract-compliant; conditional questions are not affirmative false
  defects.
- All-skills `0e55bd109d9ec2b15421` and `15c1e1c0acc58ef155c9`: the reported
  unrounded composite 97.8 is incorrect. With scores 97, 99 and 100, the exact
  weighted calculation is `(97*.30 + 99*.25 + 100*.20)/.75 = 98.466666...`.
  Both numbers happen to round half-up to 98. The correct rounded headline does
  not erase the arithmetic error.
- All six AS-35 responses: inspect added input-validation claims separately from
  the two expected findings. The contract says "validated finite nonnegative
  integer cents" without unambiguously assigning invalid-input rejection to
  `quote`. Both valid-input precondition and function-owned validation readings
  require consideration. Such claims must not receive automatic novel-finding
  credit or be declared false merely because they are absent from frozen gold.
  Keep uncertainty explicit without changing the frozen rubric. Response
  `3f41d63d48ca69731365` also contradicts its headline 93 with its own computed
  and rounded 94; this inconsistency is independent of the contract ambiguity.

## Scope and operational-policy adjudications

The root reviewer read all six AS-19 answers and the frozen contract. The three
skill-guided answers name a local T5 gap but explicitly say the full suite is
unknown; the baseline makes the same local observation without a finding heading.
A heading alone must not change the semantic assessment to an affirmative
whole-suite defect. The final disposition is unresolved for all six; evidence
credit still depends on whether both possible coverage situations are explained.

The root also read all four debt answers proposing accidental handling for
prioritization (`421d3e644a6e7278369c`, `69628547bc9790717769`,
`907af5e68398cdcb6e13`, `cdda7378e9e41868ce8a`) and the frozen debt guide.
Each explicitly preserves unknown historical intent. The guide directs treating
intentional debt with no visible repayment plan as accidental for prioritization;
actually accidental debt is already treated that way. The operational handling
is not an assertion that the historical intent is known, and none of these
answers changes the supplied Pain × Spread calculation on that basis. Do not
count the bounded operational recommendation as a false historical claim.
Preserve this adjudication separately from the first reviewer interpretation.

## Frozen witness versus equivalent reasoning

During review, AS-01 and AS-35 exposed over-specific witness wording. AS-01 asks
for the 1,000-cent/110-point trace; other in-range point values can demonstrate
the same policy defect. AS-35 names the private rename `discount` to `rate`;
other behavior-preserving private renames can demonstrate the same brittle
source assertion. Primary evidence counts retain the literal frozen witnesses
for these cases. AS-04 also has equivalent rounding witnesses using other valid
cent values instead of the frozen 101-cent example. A separately labeled,
post-hoc equivalence sensitivity may credit
verified alternative witnesses. Such primary omissions are not necessarily
substantive reasoning failures, and cannot alone establish skill benefit. The
frozen gold files and original model inputs remain unchanged.

## Automated gate

Consistency-QA **PASS**. All commands exited 0:

- `npm run validate`
- `npm test` (129.667 seconds; includes runtime and campaign offline suites)
- `npm run evals` (64 structurally valid scenarios)
- `npm run benchmark` (30/30 severity fidelity and SARIF validity; 100% risk precision/recall)
- `npm run evals:codex:validate` (7 offline fixtures)
- `git diff --check`

Cross-document checks confirmed version 1.9.1, 12 books, 64 eval scenarios,
manifest/README/landing-page consistency, and skill negative trigger boundaries.
The archive-only reproduction generated six outputs byte-identical to the saved
versions. 113 cross-artifact assertions confirmed report tables, paired results,
usage, pending and unsupported counts, all 318 response IDs, seven retained
initial/final adjudications, and original annotation preservation. Each response
accounts for every evidence requirement as credited or explicitly missing.

See [QA report](qa-report.md) and `qa-logs.tar.gz` for the command logs, reproduction
hashes and cross-check records. No additional live benchmark calls were made.

QA log archive SHA-256: `8ddfbe478fd7ebdfad8eab49364de1ec58c5445c2026bb397e10094263c832ab`.
