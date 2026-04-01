# AGENTS.md

This repository is an AI-powered code quality tool grounded in six classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*).

## Core Purpose
**brooks-lint** is a Codex CLI plugin used to diagnose code quality across six "decay risk" dimensions: Cognitive Overload, Change Propagation, Knowledge Duplication, Accidental Complexity, Dependency Disorder, and Domain Model Distortion.

## Skill Integration
- **Auto-trigger:** You **must** proactively use the `brooks-lint` skill (located at `skills/brooks-lint/`) whenever discussing code quality, PR reviews, architecture health, test quality, or technical debt.
- **Skill invocation:** Activate with `$brooks-lint`, then describe the task (e.g., "review this PR", "audit the architecture", "assess tech debt", "review test quality").

## Engineering Standards
- **Comment Preference:** All internal documentation and configuration should remain in English for international consistency.
- **The Iron Law:** NEVER suggest fixes before completing risk diagnosis. Every finding MUST follow: **Symptom → Source → Consequence → Remedy**.
- **Scoring System:** Base score 100. Deductions: 🔴 Critical (−15), 🟡 Warning (−5), 🟢 Suggestion (−1). Floor is 0.

## Project Structure
- `skills/brooks-lint/`: Core skill definitions and diagnostic guides.
- `.codex-plugin/`: Plugin metadata for Codex CLI installation.
- `commands/`: Claude Code slash command definitions (not used by Codex CLI).
- `evals/`: Performance benchmark test cases.

---
**Note:** Codex CLI should prioritize instructions found in `AGENTS.md` when operating in this repository.
