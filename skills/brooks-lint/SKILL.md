---
name: brooks-lint
description: >
  Use for code review, architecture review, or tech debt assessment.
  Triggers when: user asks to review code, discuss architecture health,
  assess maintainability, or mentions Brooks's Law / Mythical Man-Month /
  conceptual integrity / second system effect / no silver bullet.
  Also triggers when user asks why the codebase is hard to maintain,
  why adding developers isn't helping, or why complexity keeps growing.
---

# Brooks-Lint

Code quality reviews through the lens of *The Mythical Man-Month* (Frederick Brooks, 1975).

## The Iron Law

**Every system has two kinds of complexity: essential (inherent to the problem domain) and accidental (introduced by implementation choices).**

The sole purpose of a Brooks-Lint review is to identify and eliminate accidental complexity. Essential complexity must be accepted — never flag it as a problem.

```
NO REVIEW WITHOUT FIRST ASKING: IS THIS COMPLEXITY ESSENTIAL OR ACCIDENTAL?
```

Violating this law produces reviews that fight the problem domain instead of improving the implementation.

## When to Use

**Auto-triggers** (the Skill tool loads this skill when relevant):
- User asks to review code, check a PR, or assess code quality
- User shares code and asks "what do you think?" or "is this good?"
- User discusses architecture, module structure, or system design
- User asks why the codebase is hard to maintain, why velocity is declining, or why adding developers isn't helping
- User mentions: Brooks's Law, Mythical Man-Month, conceptual integrity, second system effect, no silver bullet, tar pit, surgical team, Conway's Law, ADR, architecture decision record, 团队边界, documentation coverage

**Slash command triggers** (forced mode, skip mode detection):
- `/brooks-review` → Mode 1: PR Review
- `/brooks-audit` → Mode 2: Architecture Audit
- `/brooks-debt` → Mode 3: Tech Debt Assessment

## Mode Detection

Choose the mode that matches available context:

| Context Available | Mode |
|-------------------|------|
| Code diff, specific files, functions to review, PR description | **Mode 1: PR Review** |
| Project directory structure, multiple files, architectural question | **Mode 2: Architecture Audit** |
| User asks "why is it slow/hard/getting worse?" without providing specific code | **Mode 3: Tech Debt Assessment** |
| User used a slash command | **Forced to that command's mode** |

When context is genuinely ambiguous, ask once: "Should I do a PR-level code review, a broader architecture audit, or a tech debt assessment?"

## Mode 1: PR Review

**Trigger:** User provides specific code, a diff, or asks to review a particular file or function.

**Steps:**
1. Read `pr-review-guide.md` in this directory for the complete review checklist
2. Evaluate the code across the 7 Brooks dimensions using that guide
3. Skip any dimension that clearly scores 4-5 — do not manufacture problems for healthy code
4. Output the report using the Output Format below

**Focus:** Specific, actionable findings at the code level. Report only what you find — a short report with real problems beats a long report with padding.

## Mode 2: Architecture Audit

**Trigger:** User provides project directory structure, multiple related files, or asks about system-level design.

**Steps:**
1. Read `architecture-guide.md` in this directory for the full audit framework
2. Draw the module dependency structure in text form using the template in that guide
3. Evaluate across the 7 Brooks dimensions at the system level
4. Output the report using the Output Format below

**Focus:** Module boundaries, dependency direction, communication overhead, conceptual integrity across the whole system.

## Mode 3: Tech Debt Assessment

**Trigger:** User asks why the system is hard to maintain, why velocity is declining, or requests a health check without providing specific code.

**Steps:**
1. Read `debt-guide.md` in this directory for the debt classification framework
2. If you have insufficient evidence, ask the user ONE targeted question (e.g., "Which part of the codebase is most painful to change?") then proceed with available evidence — do not ask multiple rounds of questions.
3. Classify identified debt into the 5 categories from the guide
4. Output the report using the Output Format below, including the debt repayment roadmap

**Focus:** Systemic patterns, not individual files. Identify which Brooks principles are being violated at scale and why.

## Output Format

All modes produce a report in this structure:

```
# 🏗️ Brooks-Lint Review

**Mode:** [PR Review / Architecture Audit / Tech Debt Assessment]
**Scope:** [file(s), directory, or description of what was reviewed]
**Overall Health:** ★★★☆☆

## Brooks 7-Dimension Scores

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Conceptual Integrity | ⬛⬛⬛⬜⬜ 3/5 | [one-line finding, or ✅ if clearly healthy] |
| Module Autonomy | ⬛⬛⬜⬜⬜ 2/5 | |
| Essential vs Accidental | ⬛⬛⬛⬛⬜ 4/5 | ✅ |
| Second System Effect | ⬛⬛⬛⬜⬜ 3/5 | |
| Communication Overhead | ⬛⬛⬜⬜⬜ 2/5 | |
| Throwaway Readiness | ⬛⬛⬛⬜⬜ 3/5 | |
| Tar Pit Score | ⬛⬛⬛⬛⬜ 4/5 | ✅ |
| Documentation | ⬛⬛⬜⬜⬜ 2/5 | 代码级 2/5 · 架构级 1/5 |

## Key Findings

### 🔴 Critical (fix immediately / before merge)
[Only include if any dimension scores ≤ 2. Skip section if none.]

### 🟡 Warning (plan to address)
[Issues that compound over time if ignored.]

### 🟢 Strengths
[What's working well. Always include at least one — even struggling codebases have things worth keeping.]

## Recommendations

### P0 (blocking — do this sprint)
### P1 (important — next sprint)
### P2 (backlog — tech debt register)

## Brooks Quote

> [One quote from The Mythical Man-Month that best illuminates the most important finding in this review]
```

**Scoring rules:**
- Read `brooks-principles.md` when you need the exact rubric for a score
- 5 = exemplary, 4 = good, 3 = acceptable with caveats, 2 = needs attention, 1 = critical
- Mark healthy dimensions as ✅ and move on — do not write padding
- If a dimension has no evidence (e.g., Second System Effect in a single-function review), mark it as N/A with one-line reason and exclude it from the overall health calculation.
- Overall health: weighted mean where Conceptual Integrity and Communication Overhead count double (denominator = 10)

## Reference Files

Read these files on demand — do not preload all of them:

| File | When to Read |
|------|-------------|
| `brooks-principles.md` | When you need the exact scoring rubric for any dimension |
| `pr-review-guide.md` | At the start of every Mode 1 (PR Review) execution |
| `architecture-guide.md` | At the start of every Mode 2 (Architecture Audit) execution |
| `debt-guide.md` | At the start of every Mode 3 (Tech Debt Assessment) execution |
