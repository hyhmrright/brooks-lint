# Skill benchmark methods and the original research question

Research date: 2026-11-10. Primary-source review; no external benchmark was run,
no new model responses were collected, and upstream performance claims are not
independently reproduced. This record accompanies the new
[runtime pack benchmark](runtime-pack-benchmark.md).

## Restore the purpose before choosing tests

[Discussion #45, Durable Value](https://github.com/hyhmrright/brooks-lint/discussions/45)
proposed moving beyond a growing book prompt toward versioned engineering
concepts, project-specific semantic contracts, evidence requirements,
false-positive guards, and continuous evaluation. It proposed selectively
activated core, runtime, data, security, delivery, and messaging packs. Our reply
chose a narrow runtime-containment pilot before committing to that architecture.
The public page inspected on this date showed five maintainer comments and no
subsequent reply from the originator. Participation is not a prerequisite for
maintainer research, nor evidence of endorsement.

The decision question remains: **does a scoped runtime pack add useful diagnosis
beyond the existing core while preserving restraint and respecting project
contracts?** Model puzzle difficulty, number of books, number of findings, and
report consistency are not substitutes for that question. Native activation,
deployment integration, and broader domain packs require separate evidence.

The original [proposal](domain-packs-proposal.md) preserves the compatibility
boundaries: no new public risk codes, combined score, or production installation
from this experiment. The historical 54-response HB/BV study remains unchanged.
Its label agreement is not unconditional diagnostic accuracy: a valid new
boundary finding conflicted with a frozen protected label. Retain its versioned
gold amendment rather than silently rewriting that study.

## Sources inspected and what their evidence actually supports

URLs below refer to upstream main-branch documents retrieved on the research
date. They are mutable references, not pinned reproducible upstream snapshots.
Only methods are adopted; no third-party fixture corpus or source code is copied.
Future fixture imports require commit pinning, license/provenance records,
reviewed revision identification, and an independent oracle admission check.

| Project and primary source | Observed method | Adoption and limit |
| --- | --- | --- |
| [Superpowers: writing skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md) | Observe baseline failures, add guidance, retest; distinguish discipline, technique, pattern and reference failures; use realistic pressures | Test task behavior and known failure mechanisms. Iteration on the same cases is development evidence, not independent generalization. |
| [Superpowers: CLI tests](https://github.com/obra/superpowers/blob/main/tests/claude-code/README.md) and [integration script](https://github.com/obra/superpowers/blob/main/tests/claude-code/test-subagent-driven-development-integration.sh) | Both response-pattern checks and a temporary project with implementation, tests and commits | Separate stated compliance from observed execution. A simple arithmetic fixture can test workflow; hard algorithms are not required. We do not adopt its Claude execution dependency. |
| [Matt Pocock: maintenance contract](https://github.com/mattpocock/skills/blob/main/CLAUDE.md), [review](https://github.com/mattpocock/skills/blob/main/docs/engineering/code-review.md), [TDD](https://github.com/mattpocock/skills/blob/main/docs/engineering/tdd.md) | Observable “It's working if” criteria; documented user friction and limitations; separate standards from specification review | Turn each intended behavior into a check, and turn known failures into regressions. The inspected README, maintenance file, package scripts and scripts directory did not establish a repository-wide controlled benchmark. Absence from this inspection is not proof that no private tests exist. |
| [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) and [comparator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/agents/comparator.md) | With/without or old/new comparisons, assertion evidence, cost and variance summaries, anonymized output comparison | Preserve per-answer evidence, repeated runs and token/time measures. Freeze our semantic rubric before running; do not borrow post-output rubric construction or a preference for avoiding ties. Formatting must not compensate for incorrect diagnosis. |
| [Sentry Skillet](https://github.com/getsentry/skillet/blob/main/README.md) | Spec-to-behavior mapping; dry evaluation detects cases a no-op passes; baseline comparisons; workspace checks; existing CLI login | Add deliberate no-op, always-flag and always-abstain verifier controls. A protected-case abstention may pass classification, but cannot satisfy missing causal evidence. Do not change global CLI configuration or install another execution harness for this research. |
| [Sentry skill-writer evaluation guidance](https://github.com/getsentry/skills/blob/main/skills/skill-writer/references/skill-evals.md) | Separate evaluation artifacts from runtime skill routing; deterministic checks where possible; evidence-citing judges and blind comparisons | Keep rubrics and witnesses evaluator-side, while input and guidance exports remain separately inspectable. Its recommendation of AXIS is upstream guidance, not a requirement to replace our already-tested Codex adapter. |
| [Sentry Warden evals](https://github.com/getsentry/warden/blob/main/packages/evals/README.md) | Real pipeline and verifier-only tests; should-find and should-not-find expectations; PR fixture acquisition; preserve verified failures rather than weakening labels | Test both expected issues and forbidden unsupported claims. Warden explicitly distinguishes pipeline evaluation from individual-skill A/B improvement. Upstream passing thresholds are not our acceptance thresholds. |
| [Vercel agent-browser evals](https://github.com/vercel-labs/agent-browser/blob/main/evals/README.md) | Loading, selection, command use, reference routing and context cost; response-pattern tests plus a separate real local-browser smoke with actual page/CLI records | Label text-guidance studies honestly. Actual activation claims need observed tool events and task effects, not a skill name in prose. Their smoke caveats are useful; we neither run their gateway/judge nor infer universal browser reliability. |
| [Trail of Bits c-review engineering/evaluation record](https://github.com/trailofbits/skills/blob/main/plugins/c-review/AGENTS.md) | Bare, fanout, taxonomy and complete-system ablations; planted false claims for judge calibration; cost, unique findings, repeatability and oracle-access checks | Make the core comparator narrow and credible; report marginal runtime benefit and cost. Add wrong-answer controls for the evaluator. Their sealed harness is explicitly not in the public repository; reported outcomes are upstream observations, not reproduced evidence. |

Popularity is not an experimental result. These projects offer useful but
different evidence: design contracts, regressions, behavior traces, private
experiments, or controlled comparisons. This survey is purposive, not exhaustive,
and does not rank overall project quality.

## Diagnosis that motivates this revision

Scoped benchmark-method diagnosis (not a repository health score):

- **Symptom:** the previous B arm includes all six skills and shared material,
  while every selected case concerns runtime behavior. **Source:**
  `benchmark-audit/login-runner.mjs` recursively collects `skills/**/*.md`.
  **Consequence:** a difference cannot be assigned to one core review workflow,
  and context size is confounded with guidance. **Remedy:** a new, separately
  versioned comparator uses only the review skill and required supporting text;
  compare C against B for the incremental runtime hypothesis. Do not rewrite the
  old frozen study or equate scores across different arm definitions.
- **Symptom:** all three prior arms detected every frozen expected issue, but
  all overasserted the under-specified outbox contract. **Source:** the saved
  [HB/BV review](runtime-results/2026-11-10-hb-bv-terra-low/review-report.md).
  **Consequence:** more recall-only scoring can miss the actual weakness, namely
  using business contracts and expressing uncertainty. **Remedy:** executable
  contract-sensitive triads with causal evidence and unsupported-claim checks;
  keep recall, restraint and evidence denominators separate.
- **Symptom:** valid new findings can contradict a frozen case label.
  **Source:** BV-05's recorded numerical-boundary adjudication.
  **Consequence:** label agreement can punish a useful discovery and obscure
  performance. **Remedy:** preserve frozen agreement as one metric and maintain
  pending/confirmed/rejected novel findings separately; any revised gold uses
  a new version and is applied symmetrically to all arms.

## Implementation decisions

The companion benchmark keeps the research unit small and inspectable: runtime
contract triads plus separate core/non-runtime guardrails. It has three arms:
case-only, selected core review guidance, and the same core plus runtime revision
2. This is still a text-guidance experiment. Explicit task eligibility is tested;
native skill discovery and dynamic loader implementation are not claimed.

The runtime prototype itself is unchanged. This separates a benchmark redesign
from a simultaneous treatment rewrite. The design improves relevance and
falsifiability; model difficulty or uplift remains unmeasured until execution.

Required evidence for the next run:

1. Freeze inputs, guidance, rubric, schedule and implementation before binding
   an explicitly selected model and reasoning effort.
2. Keep oracle artifacts out of responder inputs. New material is exposed,
   agent-authored development data, not independent holdouts.
3. Use repeated, paired arms. Report outcomes by mechanism and case kind;
   repetitions do not multiply the number of independent cases.
4. Keep primary runtime outcomes separate from core/non-runtime regression
   controls. No aggregate accuracy may hide a restraint regression.
5. Require cited answer evidence for semantic grading. Pseudonymous packets
   reduce arm-label anchoring but cannot guarantee blindness: prose can expose
   a skill, and authors already know the cases.
6. Test the evaluator using known wrong and incomplete simulated answers. Those
   records establish tooling behavior only, never measured model quality.
7. Record selected model/effort, raw responses, errors, elapsed time and observed
   usage. CLI selection is not independent backend identity attestation; token
   counts are not a dollar bill or a guaranteed subscription allowance cap.

## Decision after model execution

Use the results to choose continue, revise or stop for the runtime pilot. A
candidate improvement needs inspectable paired gains, no hidden protected-case
or scope regression, and an acceptable observed cost. Mixed or ceiling results
are inconclusive, not a reason to tune labels or add obscure tricks until an arm
wins. Review uncertain discoveries before judging precision. Report uncertainty
and case-level counts rather than treating repeated answers as independent data.

Native selective activation, repository-scale external cases, independent
authorship and downstream repair outcomes remain additional tracks. Existing
quarantined public PR candidates are not admitted by this methods survey.
No production domain-pack architecture or new domain rollout is justified by
offline fixture validation alone.

This is not a claim that the repository has no native behavioral evaluation.
The existing [Codex behavioral suite](../codex-behavior-evals.md) already checks
catalog isolation, observed skill reads, semantic judgments and non-trigger
controls for seven fixtures. It is a separate system-level study; its existing
results must not be relabeled as native activation evidence for this runtime
prototype. Reuse that machinery when a selectively activated pack is actually
implemented, instead of creating a second independent activation harness.

## Maintainer scope expansion, 2026-11-10

The maintainer subsequently requested benchmark coverage for every current skill,
not only the targeted review comparator. The [all-skill campaign](benchmark-campaign.md)
adds per-skill product cases and a separate repository-maintenance cohort while
retaining the frozen runtime comparison. These are two distinct research questions:
whether each core skill meets its own promises, and whether the runtime extension
adds value beyond its matched core comparator. Neither result substitutes for the
other; report them separately. All live execution remains deferred until model
selection and campaign authorization.
