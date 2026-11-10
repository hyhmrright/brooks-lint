# HB/BV calibration review policy, revision 1

Freeze this policy before execution. This is a 54-response calibration study:
18 calibration cases, one repetition, three text-context arms. It is not the
reserved study and does not authorize it. A has only case inputs, B adds the core
skills, C adds the same core plus the runtime prototype revision 2. Guidance is
provided as text; skill discovery and tool use are not being evaluated.

The frozen per-case rubric defines assessment, expected causal issue IDs,
evidence requirements and allowed severities. The frozen runtime scoring protocol
supplies assessment/evidence separation, null denominators, pairing, uncertainty
and exact-excerpt rules. No parser or execution status establishes semantic truth.

For every successfully executed response, retain answer hash, reviewer identity,
review method/model, exposure, exact supporting excerpts, rationale, uncertainty,
assessment, completion, each expected issue match and each evidence requirement.
Use `benchmark-v2/suite.mjs` `scoreIssues` for deduplicated issue arithmetic only;
it is not a semantic judge and it does not by itself score assessment or evidence.
Review packets omit the arm, but are not independently blinded: answers, public
rubrics and ordinal order can expose treatment. Preserve disagreements and report
sensitivity rather than changing a disputed judgment selectively across arms.

Inventory all affirmative issue claims. Classify each distinct causal claim as
matched, rejected, pending or novel-confirmed. Pending claims are not false
positives. Keep confirmed false positives, pending counts and precision bounds
separate. A confirmed novel discovery does not silently alter frozen expected
recall: publish a versioned gold amendment and re-adjudicate all arms uniformly.
Deduplicate a repeated causal issue, even across multiple affected components.

Report full planned execution counts first, including failed/interrupted/not-run
responses and successful but not-yet-reviewed responses. Partial failed streams
remain archived but are not semantically scored. An answer that completes the
transport but fails the task remains in semantic denominators. Show A/B/C both on
all eligible individual responses and on complete, reviewed case/repetition
triplets. Never substitute a recovery response without explicitly linking the
separate execution and reporting the original missingness.

Report assessment accuracy, issue recall and missed IDs, response-level misses,
protected false-defect rate, unresolved certainty errors, evidence completeness,
severity calibration and supplementary concerns separately, with numerators and
denominators. Show HB/BV and runtime/core-test/transfer scope separately where
applicable. Calibration has six nominal families, with related mechanisms;
responses are not independent samples and this small, public calibration does not
establish general skill benefit. Compare B versus C for runtime guidance and A
versus B for core guidance, acknowledging the extra-context-length confound.

No current response labels or observed model scores are supplied. Any rubric or
prompt revisions informed by calibration must create a new version; reserved
cases remain unexecuted. The 50 upstream PR candidates remain quarantined.
