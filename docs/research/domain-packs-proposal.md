# Domain packs: research proposal

Status: draft for collaboration, 2026-11-06. This is a research proposal, not an
accepted roadmap or a released capability.

Origin: [Discussion #45 — Durable Value](https://github.com/hyhmrright/brooks-lint/discussions/45)
by [@scottschreckengaust](https://github.com/scottschreckengaust).
Research branch: [`research/domain-packs`](https://github.com/hyhmrright/brooks-lint/tree/research/domain-packs).
Next: [runtime pilot research plan](runtime-pilot-plan.md).

## Problem and hypothesis

The current framework addresses maintainability and test quality. Discussion #45
proposes extending its coverage to runtime reliability, distributed data, security,
delivery, and messaging through selectively activated domain packs.

The hypothesis is that a small, explicitly scoped pack can improve diagnosis of
domain-specific failures while preserving restraint on clean or under-specified
cases. Adding books, finding counts, or report consistency alone cannot establish
that improvement. A useful extension needs inspectable evidence, meaningful
counterexamples, and repeatable evaluation against the current framework.

This research will first test runtime failure containment. Other domains remain
candidates, with no implementation order or delivery dates assigned.

## Proposed pack contract

The table describes information a prototype should supply. Field names, file
layout, discovery mechanism, and configuration syntax remain undecided.

| Element | Research requirement |
| --- | --- |
| Identity and revision | Identify the experimental pack and exact content revision used in a run. |
| Scope and activation | Define eligible tasks, required context, negative boundaries, and explicit opt-in. |
| Diagnostic rules | State the failure mechanism, evidence threshold, exceptions, and alternative explanations. |
| Project context | Record relevant behavioral contracts and where each assumption came from; distinguish supplied facts from inferences. |
| Evidence protocol | Trace each finding to inspected files, behavior, and operating assumptions; record missing evidence. |
| False-positive guards | Pair each rule with protected implementations, intentional tradeoffs, and insufficient-context examples. |
| Source grounding | Map rules to verified sources and precise sections; record edition or retrieval date where relevant. |
| Evaluation | Keep fixtures, independently authored expected outcomes, raw evidence, and reviewed results versioned. |

Project context might include request deadlines, retry ownership, resource limits,
or dependency behavior. It must never be invented to complete a diagnosis. This
research does not introduce a new project configuration file or extend the
currently supported `.brooks-lint.yaml` keys.

## Activation and evidence boundaries

For the pilot, contributors explicitly select the experimental material in an
isolated research session. Automatic pack selection comes later, if justified.
The presence of networking code or a missing local timeout is a reason to inspect
context, not sufficient evidence for a finding.

A runtime diagnosis should connect an entry point, a dependency call, the relevant
controls, and the affected resource or behavior. Inspect upstream and downstream
controls before claiming they are absent. Configuration and tests may supply
evidence, but a test result alone does not prove production exposure.

When decisive context is missing, the report should identify the missing fact and
the conclusion it prevents. In an interactive session it can ask a focused question;
in a fixed fixture it should record an unresolved assessment. Neither outcome
counts as evidence that the system is safe. A suspected failure is not an active
finding until the supplied evidence supports it.

The existing [runner contracts](../runner-contracts.md) still apply. In particular,
the diff-only CI runner cannot claim to have inspected callers or deployment
configuration outside its supplied input. This proposal does not enable runtime
analysis in that runner.

## Relationship to the existing framework

Experimental findings retain **Symptom → Source → Consequence → Remedy** and
explicit severity calibrated to demonstrated impact and scope. A missing resilience
pattern does not automatically justify a Critical label.

The pilot uses research case identifiers, not new public risk codes. It does not
add R7, reinterpret R1–R6 or T1–T6, or register a shipped skill. A result that is
already adequately diagnosed by the core must be recorded as overlap rather than
claimed as a new capability. One underlying failure should not earn duplicate
findings or deductions merely because two packs can describe it.

Keep experimental runtime observations in a separate, clearly labeled research
artifact without a numeric runtime or combined Health Score. Existing core scores
retain their current meaning; a research artifact is not input to production
parser, SARIF, history, or release gates. Public identifiers, score composition,
suppression semantics, and interchange compatibility need a separate design
decision if the pilot earns further work.

## Sources to investigate

Discussion #45 suggests *Release It!* and Google's SRE material for runtime
reliability, alongside sources for other domains. Treat these as candidate sources.
Before incorporating a principle, verify the edition, availability, relevant
section, applicability, and exceptions using an authoritative source. This proposal
does not certify the publication details stated in the discussion.

The research should capture short references and original diagnostic rules, not
reproduce copyrighted chapters. Live standards may need retrieval dates and an
update policy. Expanding the canonical book inventory is outside this branch's
initial documentation scope.

## Collaboration and decisions

Contributors are invited to help with the proposal, realistic failure examples,
counterexamples, source mapping, evaluation rubrics, and eventually implementation.
No participation or ownership is assumed for the discussion author.

Use Discussion #45 for direction and questions. Submit focused PRs targeting
`research/domain-packs` for reviewable changes; external contributors can fork
the repository and select this upstream branch as the PR base. Link the discussion
and the relevant pilot case in each PR. Draft PRs are welcome before an approach
is settled. Use synthetic or explicitly licensed examples with secrets and private
operational data removed.

Suggested contribution order:

1. Agree on the pilot scope and evidence needed for each case.
2. Co-author fixtures and expected outcomes before writing diagnostic prompts.
3. Draft the smallest experimental guidance that addresses those cases.
4. Evaluate it, inspect failures together, and record a continue/revise/stop decision.

Record substantive decisions below with a date, rationale, and discussion or PR
link. Unanswered questions remain open rather than silently becoming requirements.

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-11-06 | Start a documentation-only research branch. | Make scope, evidence expectations, and contribution paths reviewable before implementation. |
| 2026-11-06 | Implement the first RT-01/RT-02 offline fixture pair on the research branch. | Maintainer authorized timeout/cancellation cases, tests, and rubrics; live evaluation remains on hold. |
| 2026-11-06 | Add the RT-03/RT-04 offline retry-ownership pair. | Maintainer authorized amplification/single-owner cases, tests, and rubrics; no live model evaluation. |
| Open | Broader case set and next domain. | The first four runtime cases are implemented; further scope remains open to collaborator feedback. |
| Open | Pack loading and public identifiers. | Defer until a small prototype demonstrates value. |
| Open | Score composition and compatibility. | Preserve existing score meaning during research. |

## Promotion boundary

Proceed to a prototype only after reviewers agree on the fixture contracts and
evaluation plan in the [pilot plan](runtime-pilot-plan.md). Broader integration
requires evidence of added diagnostic value, reviewed false positives, source
grounding, and an explicit compatibility decision. A negative result should be
published with the research and can justify narrowing or stopping the proposal.

Merging research documents or offline fixtures does not authorize enabling packs, changing
scores, running live evaluations, or publishing a release. Those are separate
implementation and evaluation tasks.
