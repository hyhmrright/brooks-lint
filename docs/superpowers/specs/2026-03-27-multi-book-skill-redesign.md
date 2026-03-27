# Brooks-Lint Multi-Book Skill Redesign

**Date:** 2026-03-27
**Status:** approved

## Goal

Expand brooks-lint from a single-book (The Mythical Man-Month) framework to a six-book code quality review skill, reorganized around software decay risks rather than book-by-book dimensions.

## Architecture

The skill retains its existing three modes (PR Review / Architecture Audit / Tech Debt) and multi-file structure. The core change is replacing the eight Brooks dimensions with six decay risk dimensions synthesized from all six books. The behavioral model also shifts: from scoring dimensions 1-5 to diagnosing findings with a Symptom → Source → Consequence → Remedy chain.

**Six source books:**
1. The Mythical Man-Month — Brooks
2. Code Complete — McConnell
3. Refactoring — Fowler
4. Clean Architecture — Martin
5. The Pragmatic Programmer — Hunt & Thomas
6. Domain-Driven Design — Evans

## File Structure

No structural changes to the directory. Five files remain:

```
skills/brooks-lint/
├── SKILL.md              # Entry point: mode detection, Iron Law, output template
├── decay-risks.md        # Six decay risks: definitions, symptoms, sources, severity guide
├── pr-review-guide.md    # Mode 1: PR review analysis process
├── architecture-guide.md # Mode 2: Architecture audit analysis process
└── debt-guide.md         # Mode 3: Tech debt classification and prioritization
```

`brooks-principles.md` is deleted. `decay-risks.md` is created as its replacement.

## The Six Decay Risks

Each risk answers one diagnostic question. All six books contribute to at least one risk.

| Risk | Diagnostic Question | Primary Sources |
|------|---------------------|-----------------|
| Cognitive Overload | How much mental effort to understand this? | Code Complete, Refactoring, DDD |
| Change Propagation | How many unrelated things break on one change? | Refactoring, Clean Architecture, Pragmatic |
| Knowledge Duplication | Is the same decision expressed in multiple places? | Pragmatic DRY, Refactoring, DDD |
| Accidental Complexity | Is the code more complex than the problem? | Refactoring, Code Complete, Brooks |
| Dependency Disorder | Do dependencies flow in a consistent direction? | Clean Architecture, Brooks, Pragmatic |
| Domain Model Distortion | Does the code faithfully represent the domain? | DDD, Refactoring |

## Behavioral Model

### Iron Law

```
NEVER suggest fixes before completing risk diagnosis.
EVERY finding must follow: Symptom → Source → Consequence → Remedy.
```

This replaces the current dimension-scoring approach. Claude diagnoses and explains rather than scores.

### Severity Labels

Every finding gets one of three labels:

- **🔴 Critical** — structural problems that make the system hard to evolve or control
- **🟡 Warning** — accumulating decay signals not yet causing active pain
- **🟢 Suggestion** — quality improvements that are not urgent

### Health Score

Base score: 100
Deductions: Critical −15, Warning −5, Suggestion −1
Floor: 0

Replaces the previous per-dimension 1–5 scoring with a single health score derived from actual findings.

## Output Template

```
### [Mode] Report

**Health Score: XX/100**
[One sentence overall verdict]

---

**Findings** (sorted by severity)

🔴 [Risk Name] — [Short title]
  Symptom: [what was observed in the code]
  Source: [Book title — Principle/Smell name]
  Consequence: [what breaks if not fixed]
  Remedy: [concrete action]

🟡 ...
🟢 ...

---

**Summary**
[2-3 sentences: most important action, overall trend]
```

## Mode Responsibilities

| Mode | Trigger | Risk Focus |
|------|---------|------------|
| PR Review | PR diff, "review this PR" | Change Propagation, Cognitive Overload first |
| Architecture Audit | "audit", system structure questions | Dependency Disorder, Domain Model Distortion first |
| Tech Debt | "tech debt", "where to refactor" | All six risks, sorted by Pain × Spread priority |

### Architecture Audit: Conway's Law Check

After the six-risk scan, the architecture audit includes one additional check:
- Does the module/service structure reflect the team structure?
- If yes: is that intentional design or accidental coupling?
- A mismatch between org structure and architecture is flagged as a 🟡 Warning unless it actively causes coordination overhead, in which case 🔴 Critical.

### Tech Debt Priority Formula

Each finding is scored:
- **Pain score** (1–3): how much does this slow down development today?
- **Spread score** (1–3): how many files/modules does this affect?
- **Priority** = Pain × Spread (max 9)

| Priority | Classification | Action |
|----------|---------------|--------|
| 7–9 | Critical debt | Address in next sprint |
| 4–6 | Scheduled debt | Plan within quarter |
| 1–3 | Monitored debt | Log and watch |

## Key Differences from Current Version

| Aspect | Current (v0.3) | New (v0.4) |
|--------|---------------|-----------|
| Knowledge source | The Mythical Man-Month only | Six classic engineering books |
| Scoring unit | 8 Brooks dimensions, 1–5 each | Per-finding severity labels |
| Health score | Average of 8 dimension scores | 100 minus deductions |
| Finding format | Dimension score + notes | Symptom → Source → Consequence → Remedy |
| Source attribution | "Brooks Principle X" | Book title + specific principle/smell name |
| Mode detection | Loose | Iron Law: must identify mode before proceeding |
| Architecture file | `brooks-principles.md` | `decay-risks.md` |

## Design Principles

**Why decay risks instead of dimensions?**
Dimensions ask Claude to score abstract qualities. Decay risks ask Claude to find concrete evidence of a specific failure mode. The latter produces more actionable output and better leverages LLM reasoning.

**Why keep three modes?**
Modes reflect the reviewer's context (what they need to decide), not the books. They remain valid and useful.

**Why a single health score instead of per-risk scores?**
A single score is faster to read. The detail lives in the findings list. Per-risk scores would encourage optimizing scores rather than fixing problems.

**Design references:**
- superpowers (obra/superpowers): Iron Law pattern, process-first skill design
- everything-claude-code (affaan-m/everything-claude-code): multi-file structure, symptom/remedy patterns
