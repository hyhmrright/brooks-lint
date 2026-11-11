# Semantic review record

This review completes the already collected campaign. It makes **no new responding-model calls**, no independent judge API calls, and no changes to frozen cases, guidance, or expected outcomes. The responding model was Codex CLI-selected `gpt-6.1-terra / low`. The continuation reviewer is `gpt-6-astra` in the current Codex session; its reasoning effort was not independently recorded. The previously published single review is retained verbatim with its original reviewer metadata rather than retroactively attributing it to the new reviewer.

The 210 all-skills responses and 108 runtime responses were read individually against their supplied source files, contracts and frozen rubrics. The harness eval stage delegated masked all-skills subsets to two session subagents; the stage reviewer assessed runtime and consolidated results. Exact nonempty answer excerpts support every credited assessment, issue/criterion and evidence element. `missingEvidence` explains omissions. A serializer and existing scorers validate identifiers, answer hashes, exact quotes, and arithmetic; they do not perform semantic judging. Identical arithmetic applied to annotations is not independent validation of those annotations.

Initial judgments used shuffled packets without arm/repetition mapping. Reviewers knew the fixtures and rubrics, and output style often revealed guidance. Mapping was used after the initial judgments for comparisons and discrepancy checks. This is **exposed, same-workflow model review**, not independent human validation, not an independently blinded study, and not an independent holdout. Three repetitions of a case remain correlated observations of one case.

## Separate outcomes

- **Frozen assessment agreement** compares the observed disposition with the frozen case label. A correct label can still lack causal evidence, miss required criteria, contain an unsupported claim, or produce an invalid artifact.
- **Expected-issue recall** applies to diagnostic cases only. Task-criteria and maintenance obligations are not bugs and are excluded from that denominator.
- **Required-criteria coverage** measures the task-criteria cases, including health arithmetic and maintenance decisions.
- **Evidence completeness** counts individually supported rubric elements. It must not be renamed model accuracy.
- **Complete supported response** requires the matching disposition, every expected issue/criterion, every evidence element, no confirmed unsupported claim, and a passing artifact oracle when applicable. Pending extra claims make semantic completeness unresolved, rather than forcing a failure or success.
- **Artifacts** are evaluated by the frozen bounded replacement oracle, independent of the model's assertions that it fixed code or ran tests. Invalid envelopes remain failures in the denominator.
- **Protected-response errors**, unresolved overclaims and routing errors are reported separately in the study summaries. A pending claim is not a confirmed false positive. Precision bounds retain pending claims explicitly.

Product skills, local maintenance harness, and runtime extension are reported separately. There is no pooled headline accuracy across incompatible tasks. Label agreement is not a demonstration of native skill discovery or full autonomous skill execution.

## Runtime adjudications

Every runtime answer selected the frozen assessment and recovered all expected defect issues. The discriminating deficit was counterfactual explanation on unresolved contracts: the baseline omitted eight required elements, core review omitted five, and core plus runtime omitted none. A statement that a contract is missing earns unresolved disposition credit but does not automatically earn the rubric's two contrasting interpretations and verdicts.

Masked runtime packets at indexes 62 and 93 identify possible shared versus per-handle ownership but do not explain the different allowed/violation outcomes; evidence element 2 was withheld. Packet 47 explicitly supplies additive output 25 and successive-total alternative 15, while withholding a verdict; that semantically supplies both interpretations and receives element 2. Indexes refer to the preserved runtime shuffled packet array, not execution order. The parent reviewer independently checked these boundary cases and agreed.

All nine atomic-cohort protected responses mention that B lacks a `cancel()` method. They frame the possible interface obligation conditionally outside the prescribed A-cancel/B-result sequence. The source indeed lacks that method, but the supplied contract does not prescribe its exposure. These are clarification questions, not affirmative additional defect findings, and are not counted as unsupported or pending defects. The original protected label is retained. This avoids turning every caveat into a false positive.

## Auditability and limits

Both failed all-skills attempts and the three original collection segments remain archived. The recovered view admits each scheduled answer once; it does not erase original failures or duplicate recovered answers. Raw verification establishes consistency of the archived bytes, registrations, prompts, receipts, identity fields and usage records. Hashes are not provider attestation or tamper-proof signatures. Actual backend identity and subscription billing remain unverified; known token totals exclude unknown failed-attempt usage.

See `annotations-all-skills.json`, `annotations-runtime.json` and `scored-responses.json` for individual judgments, and `reproduce.mjs` for offline report arithmetic. The original `annotations-in-progress.json` is preserved as historical evidence.

## Frozen witness specificity and sensitivity

Primary scoring retains the frozen AS-01 numeric witness (1,000 cents and 110
points), AS-04 rounding witness (101 cents), and AS-35 exact private rename (`discount` to `rate`). A different valid
numeric counterexample or explicit behavior-preserving rename can establish the
issue while missing that exact evidence requirement. This is a limitation of the
rubric's specificity, not proof that the model missed the substantive defect.

A separately labeled, post-hoc `equivalence-sensitivity.json` admits only manually
verified alternative numeric witnesses within the policy-mismatch interval,
alternative rounding examples with independently checked outputs, and explicit private renames that preserve output and break the source regex. Generic
brittleness claims do not qualify. Every supplementary credit has its own exact
quote and adjudication. This does not rewrite gold or replace frozen primary
results; conclusions must not depend on strict witness omissions alone.

## Health input-contract ambiguity

All six AS-35 answers assert both a missing input-validation obligation and
missing invalid-input test protection. The supplied phrase “returns90% of validated
finite nonnegative integer cents” can be an input precondition or a statement
assigning validation responsibility. No invalid-input rejection behavior is
specified. These 12 extra claims remain pending, with both readings recorded.
They are not automatically counted as false positives merely because they are
absent from gold, and they prevent a settled complete-supported verdict for these
six answers. Confirmed internal score contradictions are counted separately.
A future benchmark revision should specify this responsibility explicitly before
any new run; this evaluation does not retroactively rewrite the supplied contract.


## Final same-workflow adjudication

The initial subgroup reviewer classified three AS-19 severity-rated local test
findings as defect dispositions and four debt prioritization labels as
unsupported factual claims. Root re-read the full answers and supplied contracts.
The AS-19 answers explicitly preserve unknown suite-wide coverage while discussing
the attached test; finding formatting does not negate that limitation. Final
assessment is unresolved for all six AS-19 answers, with the missing counterfactual
evidence still withheld. The debt answers preserve unknown historical intent and
use accidental-for-prioritization as operational handling under the guide and
absent visible payback plan, not as known history. Their factual-claim penalties
were removed. `adjudication-log.json` retains the full initial reviews, exact IDs,
final changes and rationales; these are not silent gold edits or external review.

Three AS-01 extra missing-test findings remain pending. Unlike AS-19, where actual
supplied test behavior is assessed and suite-wide scoring is withheld, AS-01
deducts score for missing supplied tests without a complete test inventory. One
answer asserts no automated protection; two more carefully limit themselves to
no supplied tests. Whether the latter warrants an extra scored T5 defect is still
unresolved. This distinction concerns the evidential basis of the finding, not
the mere presence of a T5 heading.
