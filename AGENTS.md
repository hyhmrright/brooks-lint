# AGENTS.md

This repository is an AI-powered code quality tool grounded in twelve classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*, *A Philosophy of Software Design*, *Software Engineering at Google*).

## Core Purpose
**brooks-lint** is a portable Agent-Skills code quality tool — it runs on any Agent-Skills-compatible agent (Codex CLI, OpenCode, Cursor, Antigravity, pi, and others that read `AGENTS.md` and load `SKILL.md` skills) to diagnose code quality across twelve "decay risk" dimensions: six in production code (R1 Cognitive Overload, R2 Change Propagation, R3 Knowledge Duplication, R4 Accidental Complexity, R5 Dependency Disorder, R6 Domain Model Distortion) and six in the test suite (T1 Test Obscurity, T2 Test Brittleness, T3 Test Duplication, T4 Mock Abuse, T5 Coverage Illusion, T6 Architecture Mismatch).

## Skill Integration
- **Auto-trigger:** You **must** proactively use the appropriate skill whenever discussing code quality, PR reviews, architecture health, test quality, or technical debt.
- **Skill invocation:** Activate the matching skill with `$brooks-review`, `$brooks-audit`, `$brooks-debt`, `$brooks-test`, `$brooks-health`, or `$brooks-sweep`.

## Engineering Standards
- **Comment Preference:** All internal documentation and configuration should remain in English for international consistency.
- **The Iron Law:** NEVER suggest fixes before completing risk diagnosis. Every finding MUST follow: **Symptom → Source → Consequence → Remedy**.
- **Scoring System:** Base score 100, floor 0. Per-finding deductions depend on the `strictness` preset in `.brooks-lint.yaml` — `balanced` applies when the key is absent. Canonical table lives in `skills/_shared/common.md`:

  | Preset | 🔴 Critical | 🟡 Warning | 🟢 Suggestion |
  |--------|------------|-----------|--------------|
  | `strict` | −20 | −8 | −2 |
  | `balanced` (default) | −15 | −5 | −1 |
  | `legacy-friendly` | −8 | −3 | −1 |

- **Project Config:** If a `.brooks-lint.yaml` exists in the project root, read and apply it before running any review mode — including `strictness`, which changes the weights above.
- **SKILL.md Process vs guide steps:** `SKILL.md` Process is a high-level skeleton (3–6 items) that cites guide Step ranges inline (e.g. `Scan decay risks (Steps 1–7 of the guide)`); the guide owns the detailed numbered steps. Counts do NOT need to match 1:1. Automated: `npm run validate` checks guide step continuity (sub-steps like `2a`/`6b` allowed) and SKILL.md Process-section presence.
- **Trigger descriptions:** Every `SKILL.md` `description:` field must include a "Do NOT trigger for:" clause defining the negative boundary to prevent false triggering.

## Project Structure
- `skills/brooks-{review,audit,debt,test,health,sweep}/`: the six skills — PR Review, Architecture Audit, Tech Debt, Test Quality, Health Dashboard, Full Sweep — each a `SKILL.md` plus its guide.
- `skills/_shared/`: shared framework (common.md, source-coverage.md, decay-risks.md, test-decay-risks.md, remedy-guide.md, custom-risks-guide.md).
- `.codex-plugin/`: Plugin metadata for Codex CLI installation.
- `hooks/`: SessionStart hook for session-level awareness (not used by Codex CLI).
- `commands/`: Short-form command wrappers for Claude Code (not used by Codex CLI).
- `evals/`: 57 scenarios across R1–R6 and T1–T6, including false-positive and tradeoff checks — `npm run evals` (structural), `npm run evals:live` (against the AI, needs `ANTHROPIC_API_KEY`). `evals/benchmark-corpus.json` is a frozen corpus of 30 real model-generated reports for the deterministic parser-fidelity benchmark: `npm run benchmark`.

---
**Note:** Codex CLI should prioritize instructions found in `AGENTS.md` when operating in this repository.
