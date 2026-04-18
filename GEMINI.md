# GEMINI.md

This repository is an AI-powered code quality tool grounded in twelve classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*, *A Philosophy of Software Design*, *Software Engineering at Google*).

## Core Purpose
**brooks-lint** is a Gemini CLI extension used to diagnose code quality across six "decay risk" dimensions: Cognitive Overload, Change Propagation, Knowledge Duplication, Accidental Complexity, Dependency Disorder, and Domain Model Distortion.

## Skill Integration
- **Auto-trigger:** You **must** proactively activate the appropriate skill whenever discussing code quality, PR reviews, architecture health, test quality, or technical debt.
- **Command Mapping:** 
  - `/brooks-review`: PR Review (loads `skills/brooks-review/`)
  - `/brooks-audit`: Architecture Audit (loads `skills/brooks-audit/`)
  - `/brooks-debt`: Tech Debt Assessment (loads `skills/brooks-debt/`)
  - `/brooks-test`: Test Quality Review (loads `skills/brooks-test/`)
  - `/brooks-health`: Health Dashboard (loads `skills/brooks-health/`)
- **After activation (CRITICAL):** Once a skill is activated via slash command, you MUST immediately read the skill's `SKILL.md` and follow every step in its **Setup** and **Process** sections — do NOT wait for additional user input. Treat the slash command as the trigger to start the review right away.

## Engineering Standards
- **Comment Preference:** All internal documentation and configuration should remain in English for international consistency.
- **The Iron Law:** NEVER suggest fixes before completing risk diagnosis. Every finding MUST follow: **Symptom → Source → Consequence → Remedy**.
- **Scoring System:** Base score 100. Deductions: 🔴 Critical (−15), 🟡 Warning (−5), 🟢 Suggestion (−1). Floor is 0.
- **Project Config:** If a `.brooks-lint.yaml` exists in the project root, read and apply it before running any review mode.

## Project Structure
- `skills/brooks-review/`: PR Review skill and guide.
- `skills/brooks-audit/`: Architecture Audit skill and guide.
- `skills/brooks-debt/`: Tech Debt Assessment skill and guide.
- `skills/brooks-test/`: Test Quality Review skill and guide.
- `skills/brooks-health/`: Health Dashboard skill and guide.
- `skills/_shared/`: Shared framework (common.md, source-coverage.md, decay-risks.md, test-decay-risks.md, remedy-guide.md, custom-risks-guide.md).
- `commands/`: Short-form command wrappers (used by Claude Code, not Gemini CLI).
- `hooks/`: SessionStart hook for Claude Code session-level awareness.
- `evals/`: Performance benchmark test cases (49 scenarios across R1–R6 and T1–T6, including false-positive and tradeoff checks). No automated runner — validate manually by running the skill against each scenario's input.

## Development & Debugging
- **Skill Testing:** After modifying `skills/` locally, refresh using `gemini skills reload`.
- **Extension Installation:** Users can install the extension in the current workspace via `/extensions install .`.

---
**Note:** Gemini CLI should prioritize instructions found in `GEMINI.md` when operating in this repository.
