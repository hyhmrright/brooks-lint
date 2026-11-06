# RT-40 reassessment and runtime guidance revision 2

2026-11-06. This is an unblinded, post-hoc model recheck by `gpt-6.1-terra`
(Codex skill-author), not independent or human adjudication. The nine exact
RT-40 answers, unchanged rubric and existing offline reproducer were inspected.
**All nine answers correctly classify the missing success-arbitration contract
as unresolved.** The earlier strict evidence grading was inconsistent: it
penalized A/2 and B/1 for not spelling out both contract-dependent judgments,
but accepted C/3 with the same omission. This affects evidence completeness,
not detection of a defect, a false alarm, or incorrect certainty.

The [original study](../2026-11-06-terra-dispute/README.md), raw answers, rubric,
judgments and primary metrics remain frozen. The supplemental
[adjudication](adjudication.json) contains exact excerpts and answer hashes for
all nine responses. No new model execution was performed.

## Contract and trace recheck

The visible context leaves two decisions open: whether success is determined at
transport settlement or boundary Promise delivery, and what wins at exactly the
deadline. The existing `dispute-cases.test.mjs` reproducer establishes:

1. Complete transport at 99 and synchronously advance to 100 before yielding:
   transport releases its slot at 99, deadline wins boundary arbitration, and
   caller receives `timed-out`.
2. Await the response after completion at 99 before advancing: caller receives
   `ok`, and the boundary timer is cancelled.
3. At exactly 100 the implementation returns `timed-out` in both tested callback
   orders. This observed behavior does not supply the missing contractual rule.

A settlement-before-deadline contract makes the first trace a violation; a
boundary-delivery-before-deadline contract can permit it. The private test
countermodels establish that opposite judgments are compatible with visible
inputs, not that either policy is a hidden input fact. Response arbitration after
slot release does not demonstrate a retained transport slot.

## Answer-by-answer adjudication

All nine give both observed event orders, name the missing settlement-versus-
delivery and tie rules, bound their conclusions to the synthetic input, and
withhold an unconditional violation. “Explicit comparison” below means both
hypothetical rules are individually connected to their differing judgments;
it is a narrower reporting requirement than correctly diagnosing uncertainty.

| Response | Exact distinguishing excerpt | Correct unresolved diagnosis | Explicit comparison |
| --- | --- | --- | --- |
| A/1 | “If success instead depends on delivery through the boundary’s promise reaction, the timeout is consistent with that interpretation.” | Yes | Yes |
| B/1 | “**does success occur when the transport settles or when the boundary processes its Promise reaction?**” | Yes | No |
| C/1 | “If settlement at 99 determines success, the first outcome violates that rule; if boundary delivery determines success, it can be permitted.” | Yes | Yes |
| A/2 | “The 99-to-100 sequence matters if transport settlement determines success.” | Yes | No |
| B/2 | “If success instead requires the boundary’s promise reaction to run before the deadline, the observed timeout is consistent with that rule.” | Yes | Yes |
| C/2 | “Under a transport-settlement rule, the 99-to-100 sequence would incorrectly report a timeout; under a boundary-delivery rule, it can be consistent with the contract.” | Yes | Yes |
| A/3 | “That behavior conflicts with a contract in which transport settlement before 100 determines success.” | Yes | Yes |
| B/3 | “If settlement before 100 must win, the current timeout result is a defect; if boundary delivery governs, it is consistent with that choice.” | Yes | Yes |
| C/3 | “That rule is needed to judge the outcome and choose any remedy.” | Yes | No |

The excerpts are selections; the JSON records preserve sufficient surrounding
text and the linked original `results.json` contains every full answer. A/2
already gives conditional reasoning. B/1 and C/3 identify both rules and their
relevance. The omission is only that neither rule's resulting judgment is fully
spelled out as a pair. Accepting those implications semantically is defensible;
requiring both to be explicit is also defensible as an evidence standard, if
applied consistently. The original rubric says to show how two compatible
completions change the judgment but provides no calibrated examples resolving
this threshold. This review therefore reports both interpretations rather than
relabeling correct uncertainty as a missed issue.

## Post-hoc sensitivity analysis

These reuse the same 17 complete triplets; RT-41/3 remains excluded because B
failed execution. Every judgment outside RT-40 is unchanged, including the
RT-38 countertrace requirement and two uncertain B supplementary output concerns.
They are sensitivities, not replacement primary results or new experiments.

| Interpretation | A | B | C |
| --- | ---: | ---: | ---: |
| Frozen primary composite | 16/17 (94.1%) | 13/17 (76.5%) | 16/17 (94.1%) |
| Uniform explicit RT-40 evidence: mark A/2, B/1 and C/3 incomplete | 16/17 (94.1%) | 13/17 (76.5%) | 15/17 (88.2%) |
| RT-40 diagnosis only: accept all nine unresolved assessments | 17/17 (100%) | 14/17 (82.4%) | 16/17 (94.1%) |

All three interpretations leave each arm's defect misses at **0/5** and protected
false defect assertions at **0/6**. C's apparent evidence advantage over B is
sensitive to a reporting threshold; no RT-40 diagnostic advantage is established.
Across the broader six-case study, every arm found all expected defect issues.
Only six exposed development cases, repeated answers, one failed turn and model
review remain insufficient to establish causal or general benefit from the skill.

Reproduce the supplemental numbers and verify exact quote/answer hashes and the
six frozen result files, without model calls:

```bash
python3 docs/research/runtime-results/2026-11-06-terra-rt40-recheck/analyze.py > /tmp/rt40-recheck-metrics.json
diff -u docs/research/runtime-results/2026-11-06-terra-rt40-recheck/metrics.json /tmp/rt40-recheck-metrics.json
```

## Supported improvement areas and implemented guidance

The experimental prototype is revision 2; shipped skills, public risk codes and
book mappings are unchanged. These edits target observed weaknesses and improve
review instructions. Offline checks verify consistency, not improved model behavior.

| Symptom → source → consequence | Revision-2 remedy |
| --- | --- |
| RT-38 had four answers missing its awaited-success countertrace, including one C answer → tracing one schedule omits the discriminating control → correct detection can still lack required evidence. | Trace the relevant order and a contrasting permitted order; distinguish settlement, boundary observation, caller delivery and release. |
| RT-40 A/2, B/1 and C/3 leave contractual judgments partly implicit → unresolved alternatives are named without a complete comparison → reviewers can grade the same reasoning inconsistently. | Explicitly connect two compatible rules to differing judgments, name the smallest deciding artifact, and separate observed schedules from normative contracts. |
| RT-41 uses rejection after acquisition; RT-43 omits input-validity policy → assuming validity or cleanup semantics can overstate the diagnosis → temporary retained timers can be mistaken for permanent leakage. | Trace validation and synchronous/asynchronous rejection against resource acquisition and owner cleanup; require supplied validity and rejection contracts. This is preventive guidance, not evidence these answers missed the issue. |
| Two B outputs used an insufficiently supported core R6 label or whole-codebase score → runtime behavior alone does not establish domain-model distortion or overall quality → classification and scoring can overreach. | Require evidence for the core risk's defining mechanism and disallow deriving a whole-codebase score from bounded runtime protection. C did not exhibit these concerns in this small study; the edit is preventive. |

The Iron Law remains required for supported findings. Conditional hypotheses
remain separate from established findings and remedies. No case IDs or desired
answers were inserted into generic guidance. No public source claims were added;
this analysis is confined to repository evidence.

## Next research steps

Before a new live comparison, freeze a fresh plan with revision-2 digests; never
reuse revision-1 plans against edited guidance. Predeclare separate assessment,
issue-detection, evidence-completeness and certainty metrics; calibrate whether
implicit alternatives meet the evidence standard using examples outside these
six cases. Include delayed observation, different tie rules, rejected setup and
post-acquisition asynchronous failure controls authored independently of these
exposed answers. Guidance edits based on observed failures are training/development
work and require independent holdouts to assess benefit.

Human review of one matched defect/protected pair and the RT-40 threshold, plus
independently authored holdouts, remains outside autonomous validation. No live
rerun, release, or wider integration is implied by offline completion.
