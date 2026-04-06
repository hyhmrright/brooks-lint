# GEMINI.md

This repository is an AI-powered code quality tool grounded in ten classic engineering books (e.g., *The Mythical Man-Month*, *Code Complete*, *A Philosophy of Software Design*, *Software Engineering at Google*).

## Core Purpose
**brooks-lint** is a Gemini CLI extension used to diagnose code quality across six "decay risk" dimensions: Cognitive Overload, Change Propagation, Knowledge Duplication, Accidental Complexity, Dependency Disorder, and Domain Model Distortion.

## Skill Integration
- **Auto-trigger:** You **must** proactively activate and use the `skills/brooks-lint` skill whenever discussing code quality, PR reviews, architecture health, or technical debt.
- **Command Mapping:** 
  - `/brooks-review`: Executes Mode 1 (PR Review)
  - `/brooks-audit`: Executes Mode 2 (Architecture Audit)
  - `/brooks-debt`: Executes Mode 3 (Tech Debt Assessment)
  - `/brooks-test`: Executes Mode 4 (Test Quality Review)

## Engineering Standards
- **Comment Preference:** All internal documentation and configuration should remain in English for international consistency.
- **The Iron Law:** NEVER suggest fixes before completing risk diagnosis. Every finding MUST follow: **Symptom → Source → Consequence → Remedy**.
- **Scoring System:** Base score 100. Deductions: 🔴 Critical (−15), 🟡 Warning (−5), 🟢 Suggestion (−1). Floor is 0.
- **Project Config:** If a `.brooks-lint.yaml` exists in the project root, read and apply it before running any review mode.

## Project Structure
- `skills/brooks-lint/`: Core skill definitions and diagnostic guides.
- `commands/`: Detailed instruction sets for different review modes.
- `evals/`: Performance benchmark test cases (37 scenarios across R1–R6 and T1–T6).

## Development & Debugging
- **Skill Testing:** After modifying `skills/brooks-lint/` locally, refresh using `gemini skills reload`.
- **Extension Installation:** Users can install the extension in the current workspace via `/extensions install .`.

---
**Note:** Gemini CLI should prioritize instructions found in `GEMINI.md` when operating in this repository.
