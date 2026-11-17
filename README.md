<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

**English** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

![Source version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

Six focused workflows for code review, architecture, technical debt, test quality, a health dashboard, and scoped repairs — grounded in twelve classic engineering books.

Published versions: [npm](https://www.npmjs.com/package/brooks-lint) · [GitHub Releases](https://github.com/hyhmrright/brooks-lint/releases)

[Migration from 1.9.1 to 2.0.0](docs/migration-v2.md)
brooks-lint is a collection of Agent Skills, shared guidance and small deterministic reporting tools. Your coding agent performs the diagnosis; the project supplies a repeatable workflow, risk vocabulary and reporting contract. It is not a static analyzer and it does not guarantee that a model finds every defect.

## Quick start: Codex

```bash
# Source checkout: Git + Bash
git clone https://github.com/hyhmrright/brooks-lint.git
cd brooks-lint
bash scripts/install.sh codex
```

```text
$brooks-review Review the current diff and identify supported maintainability risks.
$brooks-health Assess this repository; distinguish missing evidence from clean dimensions.
```

This installs the current source into the global Codex skills directory. Start a new session if skills are not discovered. To install into another project, run the installer by its absolute path from that project with `codex --project`. Keep `_shared` beside the six skill folders. See the [Codex guide](docs/codex-setup.md) for layout and capability checks.

Install the latest published package with Node.js 20+: `npx brooks-lint@latest install codex`. See [getting started](docs/getting-started.md) for other installation targets.

## Choose the smallest workflow that fits

| Skill | Use it for | Changes files? |
|---|---|---|
| `$brooks-review` | A diff or specified code: governing contract, supported risks and a discriminating witness. | No |
| `$brooks-audit` | Module dependencies, ownership and boundary integrity; onboarding also has a dedicated guide. | No |
| `$brooks-debt` | Maintainability debt, priorities and a repayment plan. | No |
| `$brooks-test` | An existing test suite: what failures its assertions do and do not detect. | No |
| `$brooks-health` | An abbreviated four-dimension assessment and evidence-scoped dashboard. | No |
| `$brooks-sweep` | Diagnose and apply authorized, verifiable repairs within a bounded scope. | Yes |

Use `$brooks-review` in Codex; other hosts have their own invocation syntax. Natural-language discovery depends on the host and model. Health is a summary, not four exhaustive audits. Sweep requires editing and verification capabilities and respects existing authorization; it does not demand another approval merely because a change spans files.

## What a report means

A retained finding follows **Symptom → Source → Consequence → Remedy**: observable evidence, the relevant engineering principle, its consequence, and a scoped response. Book references explain the framework; they do not prove a diagnosis or a chapter-level claim. Protected behavior and unresolved obligations should be reported without invented deductions. Predictions must be distinguished from checks actually executed.

The score is a configured summary of retained findings, **not a probability of correctness**. Health uses one ledger for Code Quality, Architecture, Tech Debt and Test Quality. When execution is available and permitted, bundled Node tools calculate and finalize the report. A required dimension with missing decisive evidence is **unassessed**, so no numeric composite is emitted. Only PR quality with no diff is **skipped**, with its weight redistributed. An assessed dimension with no supported findings is different from an unknown dimension.

The delivery helper checks that supplied output bytes equal the finalized report and match its receipt. It does not verify diagnostic truth, later UI rendering or transport. Without permitted tool execution, the guide requires explicit verification limits; it must not invent a tool receipt. [Ledger and tool contract](skills/brooks-health/score-ledger.md).

Sweep defaults to **three total repair rounds**, including the initial and Critical-only rounds. User time/tool budgets also apply. It reports a supported stop reason and unresolved work. A clean local scope can coexist with unknown broader dashboard dimensions. [Sweep guide](skills/brooks-sweep/sweep-guide.md).

## Risk vocabulary

| Production code | Tests |
|---|---|
| R1 — Cognitive Overload | T1 — Test Obscurity |
| R2 — Change Propagation | T2 — Test Brittleness |
| R3 — Knowledge Duplication | T3 — Test Duplication |
| R4 — Accidental Complexity | T4 — Mock Abuse |
| R5 — Dependency Disorder | T5 — Coverage Illusion |
| R6 — Domain Model Distortion | T6 — Architecture Mismatch |

## The Twelve Books

| Book | Author |
|---|---|
| *The Mythical Man-Month* | Frederick P. Brooks Jr. |
| *Code Complete* | Steve McConnell |
| *Refactoring* | Martin Fowler |
| *Clean Architecture* | Robert C. Martin |
| *The Pragmatic Programmer* | Andrew Hunt & David Thomas |
| *Domain-Driven Design* | Eric Evans |
| *A Philosophy of Software Design* | John Ousterhout |
| *Software Engineering at Google* | Titus Winters, Tom Manshreck & Hyrum Wright |
| *The Art of Unit Testing* | Roy Osherove |
| *How Google Tests Software* | James Whittaker, Jason Arbon & Jeff Carollo |
| *Working Effectively with Legacy Code* | Michael Feathers |
| *xUnit Test Patterns* | Gerard Meszaros |

The detailed [source coverage matrix](skills/_shared/source-coverage.md) records concepts, tradeoffs and false-positive guards. These risks are this project’s synthesis, not an official taxonomy authored jointly by the books’ writers.

<a id="benchmark"></a>

## Benchmark: choose a workflow, inspect its results

Try a skill on a task you already need to do: a review with a concrete witness, a dependency diagnosis, a debt plan, a test gap, a scoped dashboard or a verified repair. The table shows **all six skills**, including ties and regressions. Workflow usefulness and measured improvement are separate claims.

| Experiment | Skill / evidence | Baseline → skill | Observed change |
|---|---|---:|---|
| E1 | [review](docs/benchmark-evidence.md#review) | 6/6 → 6/6 | No additional passes |
| E1 | [audit](docs/benchmark-evidence.md#audit) | 6/6 → 6/6 | No additional passes |
| E1 | [test](docs/benchmark-evidence.md#test-the-difference-and-the-correction) | 5/6 → 6/6 | **+1 passing answer**; BV5-23 |
| E2 | [debt](docs/benchmark-evidence.md#debt--older-case-only-baseline) | 11/15 → 12/15 | **+1 complete-supported answer**; older baseline |
| E3 | [health](docs/benchmark-evidence.md#health--adverse-result-remains-visible) | 15/18 → 10/18 | **−5 passing answers**; excessive abstention |
| E3 | [sweep](docs/benchmark-evidence.md#sweep--advantage-limited-to-one-family) | 15/18 → 18/18 | **+3 passing answers**; repeats in one family |

**Read within each experiment, not across rows.** E1: generic checklist versus focused guidance, six cases per skill, one response per arm. E2: older case-only baseline versus guidance, five debt cases × three repeats; counts complete-supported answers, not E1’s primary passes. E3: generic checklist versus full guidance, 18 responses per skill and arm in the 72-answer health/sweep campaign. Sweep’s gain is confined to one priority-routing family. Health’s later fixes have offline coverage but **no completed post-fix efficacy result**. Do not combine these counts into an overall accuracy or a six-skill ranking.

**E1** — CLI-selected `gpt-6.1-terra / low`; 18 cases × two groups = **36 answers**, one answer per case and group. The E1 rows count primary behavioral passes after offline adjudication: all five axes (diagnosis, contract scope, discriminating witness, remedy and verification honesty) must pass, with no missed expected issue or established false claim.

**A concrete difference — BV5-23:** the contract requires an integer for a numeric string. The skill answer identified a 309-digit input that becomes `Infinity` and a protection gap in the two supplied tests. The checklist answer failed the required mutant-comparison axis; it was not penalized retrospectively for missing this newly supported observation.

**A correction — BV5-24:** we initially rejected the checklist answer, then accepted its behaviorally equivalent assertion-failure witness. The original judgments and revisions remain available. One paired advantage in reused development cases is not general superiority.

### Put it to work on your own code

These are starting prompts and intended deliverables, not additional benchmark wins. Supply a concrete scope and review the evidence before acting.

| Skill | A useful first task |
|---|---|
| `$brooks-review` | Review this diff against its contract; show a minimal input that distinguishes a defect from protected behavior. |
| `$brooks-audit` | Trace this dependency across module boundaries; identify the owner of the violated rule. |
| `$brooks-debt` | Rank these maintenance problems by change impact; propose the smallest repayment step. |
| `$brooks-test` | Show a faulty implementation these tests would accept, and the assertion that distinguishes it. |
| `$brooks-health` | Assess this scope with one finding ledger; separate supported findings, clean dimensions and unknowns. |
| `$brooks-sweep` | Diagnose and repair this authorized scope within three total rounds; run available checks and report what remains. |

These studies use related development-authored cases and non-independent grading. Repeated answers are not independent projects. Static supplied instructions do not test native skill discovery, all models or the whole current 2.0.0 source tree.

| Evidence | What it checks |
|---|---|
| Product regressions | Installation, scoring arithmetic, exact delivery and bounded-stop fixtures |
| 30-report parser benchmark | Severity/risk extraction and SARIF, not whether diagnoses are true |
| Model comparisons | Specified tasks, models, instruction revisions and rubrics |

[Frozen plan](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/plan.json) · [Raw answers and records](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live) · [Quoted judgments and corrections](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [All six skills: evidence and limits](docs/benchmark-evidence.md)

<a id="installation"></a>

## Installation and compatibility

Maintainer verification currently covers **Codex**. Other integrations remain available, but earlier host verification is historical; installer layout tests are not end-to-end compatibility tests. Community reports should include host version and reproduction steps. The installers support 13 named targets plus the generic `agents` destination.

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

The existing Claude Code marketplace commands are retained; this path is not currently maintainer-tested:

```text
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

## Configuration

```yaml
version: 1
strictness: balanced
ignore:
  - "**/vendor/**"
sweep:
  max_iterations: 3
# Optional: deliberately omit a risk from this review.
# disable:
#   - T5
```

Copy [`.brooks-lint.example.yaml`](.brooks-lint.example.yaml). The shared contract defines `strictness`, `severity`, `ignore`, `focus`/`disable`, custom `Cx` risks and scoped suppression. Disabling T5 intentionally omits its diagnosis; T5 is not merely a code-coverage percentage check. [Configuration and report contract](skills/_shared/common.md).

## CI integration is a separate path

The shipped GitHub Action uses an **Anthropic-compatible API**, not Codex login. It supports **review of the collected diff only**, without interactive repository tools or repairs. This historical provider path is not part of current maintainer live verification. Use a published tag in this example.

```yaml
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v2.0.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

See [runner contracts](docs/runner-contracts.md) and the [full workflow template](docs/github-action-example.yml) for base-config trust, fork restrictions, invalid reports and permissions. No fixed per-run price is promised; usage depends on the selected provider, model and input.

## Development and contributions

Offline validation:

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

Live Codex evaluation is opt-in and uses a separately chosen model and budget. Do not run the historical Anthropic evaluation as part of ordinary offline checks. Read [CONTRIBUTING.md](CONTRIBUTING.md), [the changelog](CHANGELOG.md) and [historical examples](docs/gallery.md). Thanks to contributors, including [@Sad-happy](https://github.com/Sad-happy) for the native DSH integration in [#44](https://github.com/hyhmrright/brooks-lint/pull/44).

MIT — [LICENSE](LICENSE).

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
