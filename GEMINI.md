# GEMINI.md

This repository is an AI-powered code quality tool grounded in twelve classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*, *A Philosophy of Software Design*, *Software Engineering at Google*).

## Core Purpose
**brooks-lint** is a Gemini CLI extension used to diagnose code quality across twelve "decay risk" dimensions: six in production code (R1 Cognitive Overload, R2 Change Propagation, R3 Knowledge Duplication, R4 Accidental Complexity, R5 Dependency Disorder, R6 Domain Model Distortion) and six in the test suite (T1 Test Obscurity, T2 Test Brittleness, T3 Test Duplication, T4 Mock Abuse, T5 Coverage Illusion, T6 Architecture Mismatch).

## Skill Integration
- **Auto-trigger:** You **must** proactively activate the appropriate skill whenever discussing code quality, PR reviews, architecture health, test quality, or technical debt.
- **Command Mapping:** 
  - `/brooks-review`: PR Review (loads `skills/brooks-review/`)
  - `/brooks-audit`: Architecture Audit (loads `skills/brooks-audit/`)
  - `/brooks-debt`: Tech Debt Assessment (loads `skills/brooks-debt/`)
  - `/brooks-test`: Test Quality Review (loads `skills/brooks-test/`)
  - `/brooks-health`: Health Dashboard (loads `skills/brooks-health/`)
  - `/brooks-sweep`: Full Sweep & Auto-Fix (loads `skills/brooks-sweep/`)
- **After activation (CRITICAL):** Once a skill is activated via slash command, you MUST immediately read the skill's `SKILL.md` and follow every step in its **Setup** and **Process** sections — do NOT wait for additional user input. Treat the slash command as the trigger to start the review right away.

## Engineering Standards
- **Language:** Repo source and configuration stay in English for international consistency. Review output follows the user's language — see the "Language rule" in `skills/_shared/common.md` (Iron Law field labels, book titles, and smell names stay in English even when the prose is translated).
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
- `commands/`: Short-form command wrappers (used by Claude Code, not Gemini CLI).
- `hooks/`: SessionStart hook for Claude Code session-level awareness.
- `evals/`: 57 scenarios across R1–R6 and T1–T6, including false-positive and tradeoff checks — `npm run evals` (structural), `npm run evals:live` (against the AI, needs `ANTHROPIC_API_KEY`). `evals/benchmark-corpus.json` is a frozen corpus of 30 real model-generated reports for the deterministic parser-fidelity benchmark: `npm run benchmark`.

## Development & Debugging
- **Skill Testing:** After modifying `skills/` locally, exit the Gemini CLI (`/quit`) and relaunch to pick up the changes.
- **Extension Installation:** Users can install the extension in the current workspace via `/extensions install .`.

---
**Note:** Gemini CLI should prioritize instructions found in `GEMINI.md` when operating in this repository.
