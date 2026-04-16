# AGENTS.md

This repository is an AI-powered code quality tool grounded in twelve classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*, *A Philosophy of Software Design*, *Software Engineering at Google*).

## Core Purpose
**brooks-lint** is a Codex CLI plugin used to diagnose code quality across six "decay risk" dimensions: Cognitive Overload, Change Propagation, Knowledge Duplication, Accidental Complexity, Dependency Disorder, and Domain Model Distortion.

## Skill Integration
- **Auto-trigger:** You **must** proactively use the appropriate skill whenever discussing code quality, PR reviews, architecture health, test quality, or technical debt.
- **Skill invocation:** Activate the matching skill with `$brooks-review`, `$brooks-audit`, `$brooks-debt`, `$brooks-test`, or `$brooks-health`.

## Engineering Standards
- **Comment Preference:** All internal documentation and configuration should remain in English for international consistency.
- **The Iron Law:** NEVER suggest fixes before completing risk diagnosis. Every finding MUST follow: **Symptom → Source → Consequence → Remedy**.
- **Scoring System:** Base score 100. Deductions: 🔴 Critical (−15), 🟡 Warning (−5), 🟢 Suggestion (−1). Floor is 0.
- **Project Config:** If a `.brooks-lint.yaml` exists in the project root, read and apply it before running any review mode.
- **Step numbering alignment:** Each skill's `SKILL.md` Process section must list steps matching the guide's step count and numbering. Automated: `npm run validate` checks guide step continuity and SKILL.md Process section presence.
- **Trigger descriptions:** Every `SKILL.md` `description:` field must include a "Do NOT trigger for:" clause defining the negative boundary to prevent false triggering.

## Project Structure
- `skills/brooks-review/`: PR Review skill and guide.
- `skills/brooks-audit/`: Architecture Audit skill and guide.
- `skills/brooks-debt/`: Tech Debt Assessment skill and guide.
- `skills/brooks-test/`: Test Quality Review skill and guide.
- `skills/brooks-health/`: Health Dashboard skill and guide.
- `skills/_shared/`: Shared framework (common.md, source-coverage.md, decay-risks.md, test-decay-risks.md).
- `.codex-plugin/`: Plugin metadata for Codex CLI installation.
- `hooks/`: SessionStart hook for session-level awareness (not used by Codex CLI).
- `commands/`: Short-form command wrappers for Claude Code (not used by Codex CLI).
- `evals/`: Performance benchmark test cases (49 scenarios across R1–R6 and T1–T6, including false-positive and tradeoff checks). No automated runner — validate manually by running the skill against each scenario's input.

---
**Note:** Codex CLI should prioritize instructions found in `AGENTS.md` when operating in this repository.
