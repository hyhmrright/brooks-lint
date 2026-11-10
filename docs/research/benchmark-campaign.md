# All-skill benchmark campaign

Prepared 2026-11-10. This campaign expands coverage at the maintainer's request
from a targeted review/runtime comparison to **every shipped skill**, plus the
repository-local maintenance skill as a separately reported cohort. No live model
run is authorized by preparing or validating this document.

The [two-round validation record](all-skills-benchmark-validation.md) preserves
the fixed oracle/fairness issues, final gates, frozen identities and raw QA logs.

## Scope and research questions

The six shipped skills are brooks-review, brooks-audit, brooks-debt, brooks-test,
brooks-health and brooks-sweep. They make different promises; giving every skill
the same bug-hunting questions would not evaluate those promises. The new
[all-skill benchmark](all-skills-benchmark.md) gives each five development cases, plus one additional health integration case.
The repository-local brooks-harness has four maintenance contract cases, separate
from product capability scores. These do not perform actual publication or push.

| Target | Primary question |
| --- | --- |
| Review | Does a review identify supported change/code risks with causal evidence and calibrated restraint? |
| Audit | Does the architecture assessment use actual dependency direction and boundaries rather than directory names alone? |
| Debt | Does prioritization follow documented change burden, reach and tradeoffs instead of counting smells? |
| Test | Does it distinguish meaningful regression protection from passing tests that cannot detect the specified fault? |
| Health | Are dimension findings, config-sensitive deductions and no-diff score redistribution consistent and inspectable? |
| Sweep | Does the supplied repair artifact change the permitted temporary files correctly while preserving protected behavior and respecting edit authority? |
| Maintenance harness | Does the workflow contract choose required stages, preserve QA gates, and respect release/ownership boundaries? |

The [runtime pack study](runtime-pack-benchmark.md) remains a separate comparison
of case-only, selected core review guidance, and core plus runtime revision 2.
It answers Discussion #45's initial domain-extension question. Testing the core
skills broadens the product evidence; it does not erase that original purpose or
turn the runtime pilot into a claim about all skills.

## What is and is not exercised

The campaign uses explicit supplied guidance. It is not a measurement of native
skill discovery, implicit trigger precision, tool routing or repository navigation.
Out-of-scope cases measure restraint in the returned behavior, not proof that a
skill was physically loaded or skipped. The existing
[native Codex behavior suite](../codex-behavior-evals.md) remains distinct.

Sweep uses bounded model-produced file replacements, materialized and checked by
the harness in a temporary workspace. Passing requires the resulting artifact to
satisfy independent behavioral checks and preservation rules; a model claiming
that it fixed something or that tests passed is insufficient. This is a repair
artifact benchmark, not execution of the whole native sweep workflow. Its bounded
accepted language and allowed paths are visible task constraints. Complex
multi-module refactors and interactive iteration require a later native study.

The maintenance cohort evaluates workflow decisions, not actual subagent execution,
Git hosting, publishing or deployment. It must never be combined with a product
diagnosis metric to make the overall result look stronger.

## One campaign, separate studies and denominators

- Product cohort: 31 cases × 2 arms × 3 repeats = **186** primary responses.
- Maintenance cohort: 4 cases × 2 arms × 3 repeats = **24** primary responses.
- Runtime cohort: 12 cases × 3 arms × 3 repeats = **108** primary responses.
- Combined full plan: **318** primary responses, with zero automatic retries.

These counts exclude separate judge-model calls: none are authorized or silently
included. Semantic review occurs after responses are preserved, with exact
excerpts, reviewer/exposure records and explicit handling of pending discoveries.
The runtime smoke alternative is not added to these 318 calls. Repetitions improve
repeatability estimates but do not create new independent cases.

`evals/research/frozen-campaign.json` binds both sub-study freezes and exact
scheduled call counts. The planner derives the installed skill inventory rather
than relying only on this prose. Model and reasoning effort remain unset. When
the maintainer selects them, bind the same model and effort to both sub-studies,
verify actual CLI/login access, and execute in the recorded order. A failure stops
new campaign admission; preserve partial records and do not automatically rerun
failed calls or continue the next study.

The all-skill study proposes a 6,000,000 observed-token admission stop and an
eleven-hour local study deadline; the runtime study has 3,000,000 and six hours.
The sums are 9,000,000 tokens and seventeen hours of admission/deadline budgets,
not predicted consumption or a hard global cap. Both use a 180-second local turn
deadline. Between-turn usage checks can overshoot each study's stop by one turn,
and provider-internal retries/billing are not hard-capped. No model, monetary cost
or subscription allowance is inferred from these limits. Actual scope/model
selection precedes execution; do not automatically add the optional smoke plans.

For each skill, publish task completion, expected-issue recall, unsupported and
pending claims, evidence completeness, boundary failures and costs with their
actual denominators. Sweep additionally reports artifact and preservation checks.
Health calculations and maintenance stage decisions have their own criteria.
Record failures alongside quality; do not hide missing responses behind a
complete-case-only average. No single pooled accuracy is the campaign's verdict.

## Preparation and execution boundary

```bash
node evals/research/campaign-plan.mjs validate evals/research/frozen-campaign.json
```

This command is offline and starts no model. The companion benchmark documents
the individual execution and review interfaces. Registration and execution remain
explicit, and this campaign file does not itself start either runner.

All fixtures are public, same-workflow authored development cases. There is no
claim of independent holdouts, exhaustive coverage of every risk, measured extra
difficulty or established benefit. Third-party methods informed the design; their
benchmarks were not reproduced or imported as validated ground truth. See the
[methods survey](skill-benchmark-methods.md). Existing studies and frozen results
are preserved, and their scores are not directly comparable to this new design.
