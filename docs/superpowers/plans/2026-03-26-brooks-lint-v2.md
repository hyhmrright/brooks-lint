# Brooks-Lint v0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform brooks-lint from a prototype into a marketplace-ready Claude Code plugin by adding plugin infrastructure, hooks, slash commands, and rewriting all skill content to follow superpowers conventions.

**Architecture:** One main skill (`skills/brooks-lint/SKILL.md`) with three operating modes (PR Review, Architecture Audit, Tech Debt Assessment), triggered automatically via SessionStart hook and explicitly via three slash commands. All skill content is prompt-driven — no external scripts. Reference files in the skill directory are loaded on-demand during execution.

**Tech Stack:** Bash (session-start hook), Markdown (all skill/command/reference files), JSON (plugin metadata and hooks config)

---

## Task 1: Plugin metadata infrastructure

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Create `.claude-plugin/` directory and `plugin.json`**

```bash
mkdir -p .claude-plugin
```

Write `.claude-plugin/plugin.json`:

```json
{
  "name": "brooks-lint",
  "description": "Code quality reviews through the lens of The Mythical Man-Month — Brooks's 7 principles as a Claude Code skill",
  "version": "0.2.0",
  "author": {
    "name": "hyhmrright",
    "email": "hyhmrright@gmail.com"
  },
  "homepage": "https://github.com/hyhmrright/brooks-lint",
  "repository": "https://github.com/hyhmrright/brooks-lint",
  "license": "MIT",
  "keywords": [
    "code-quality",
    "code-review",
    "brooks-law",
    "mythical-man-month",
    "architecture",
    "tech-debt"
  ]
}
```

- [ ] **Step 2: Create `marketplace.json`**

Write `.claude-plugin/marketplace.json`:

```json
{
  "name": "brooks-lint-marketplace",
  "description": "Marketplace for brooks-lint plugin",
  "owner": {
    "name": "hyhmrright",
    "email": "hyhmrright@gmail.com"
  },
  "plugins": [
    {
      "name": "brooks-lint",
      "description": "Code quality reviews through the lens of The Mythical Man-Month",
      "version": "0.2.0",
      "source": "./",
      "author": {
        "name": "hyhmrright",
        "email": "hyhmrright@gmail.com"
      }
    }
  ]
}
```

- [ ] **Step 3: Verify**

```bash
cat .claude-plugin/plugin.json | python3 -m json.tool > /dev/null && echo "plugin.json valid"
cat .claude-plugin/marketplace.json | python3 -m json.tool > /dev/null && echo "marketplace.json valid"
```

Expected: both print "valid"

- [ ] **Step 4: Commit**

```bash
git add .claude-plugin/
git commit -m "feat: add .claude-plugin metadata for marketplace installation"
```

---

## Task 2: Package metadata and changelog

**Files:**
- Create: `package.json`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "brooks-lint",
  "version": "0.2.0",
  "type": "module"
}
```

- [ ] **Step 2: Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to brooks-lint are documented here.

## [0.2.0] - 2026-03-26

### Added
- `.claude-plugin/` infrastructure for marketplace installation (`/plugin install brooks-lint`)
- `hooks/session-start` — SessionStart hook that injects brooks-lint awareness into every Claude session
- `commands/brooks-review.md` — `/brooks-review` slash command for forced PR review mode
- `commands/brooks-audit.md` — `/brooks-audit` slash command for forced architecture audit mode
- `commands/brooks-debt.md` — `/brooks-debt` slash command for forced tech debt assessment mode
- `skills/brooks-lint/brooks-principles.md` — Scoring rubrics for all 7 Brooks dimensions
- `skills/brooks-lint/pr-review-guide.md` — Detailed PR review checklist (Mode 1)
- `skills/brooks-lint/architecture-guide.md` — Architecture audit framework with dependency graph template (Mode 2)
- `skills/brooks-lint/debt-guide.md` — 5-category tech debt classification framework (Mode 3)

### Changed
- `SKILL.md` moved from root to `skills/brooks-lint/SKILL.md` and fully rewritten
- Skill now follows superpowers mode-switch pattern with explicit mode detection
- Reference files reorganized from `references/` into `skills/brooks-lint/` and split by mode
- Skill is now fully prompt-driven (no external script dependencies)

### Removed
- `scripts/complexity_analyzer.py` — replaced by Claude's native analysis capability
- `references/` directory — content migrated to `skills/brooks-lint/`
- Root `SKILL.md` — replaced by `skills/brooks-lint/SKILL.md`

## [0.1.0] - 2026-03-26

### Added
- Initial release: SKILL.md, references/, scripts/complexity_analyzer.py, assets/logo.svg
```

- [ ] **Step 3: Commit**

```bash
git add package.json CHANGELOG.md
git commit -m "feat: add package.json and CHANGELOG"
```

---

## Task 3: SessionStart hook

**Files:**
- Create: `hooks/hooks.json`
- Create: `hooks/session-start` (bash script)

- [ ] **Step 1: Create `hooks/` directory and `hooks.json`**

```bash
mkdir -p hooks
```

Write `hooks/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Create `hooks/session-start` bash script**

Write `hooks/session-start`:

```bash
#!/usr/bin/env bash
# SessionStart hook for brooks-lint plugin
# Injects lightweight awareness of brooks-lint into every Claude session.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# The context injected must be SHORT (<150 words).
# Do NOT inject the full SKILL.md — it loads on demand via the Skill tool.
context="You have the brooks-lint plugin installed. When the user asks to review code, discuss architecture, assess tech debt, or mentions The Mythical Man-Month / Brooks's Law / conceptual integrity / second system effect / no silver bullet, use the Skill tool to load the 'brooks-lint' skill before responding. Available slash commands: /brooks-review (PR review), /brooks-audit (architecture audit), /brooks-debt (tech debt assessment)."

# Escape for JSON embedding
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

context_escaped=$(escape_for_json "$context")

# Output format differs by platform
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
    printf '{\n  "additional_context": "%s"\n}\n' "$context_escaped"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
    printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$context_escaped"
else
    printf '{\n  "additional_context": "%s"\n}\n' "$context_escaped"
fi

exit 0
```

- [ ] **Step 3: Make script executable**

```bash
chmod +x hooks/session-start
```

- [ ] **Step 4: Verify script runs without error**

```bash
CLAUDE_PLUGIN_ROOT="$(pwd)" bash hooks/session-start | python3 -m json.tool > /dev/null && echo "hook output valid JSON"
```

Expected: prints "hook output valid JSON"

- [ ] **Step 5: Commit**

```bash
git add hooks/
git commit -m "feat: add SessionStart hook for session-level brooks-lint awareness"
```

---

## Task 4: Slash commands

**Files:**
- Create: `commands/brooks-review.md`
- Create: `commands/brooks-audit.md`
- Create: `commands/brooks-debt.md`

- [ ] **Step 1: Create `commands/` directory and `brooks-review.md`**

```bash
mkdir -p commands
```

Write `commands/brooks-review.md`:

```markdown
---
description: Run a Brooks-Lint PR review on the current code or diff
---

Use the brooks-lint skill to perform a PR review (Mode 1).
Load the skill via the Skill tool, then analyze the current code, diff, or
file the user has provided from the perspective of Brooks's 7 principles.
Read pr-review-guide.md from the skill directory for the detailed checklist.
```

- [ ] **Step 2: Create `brooks-audit.md`**

Write `commands/brooks-audit.md`:

```markdown
---
description: Run a Brooks-Lint architecture audit on the current project
---

Use the brooks-lint skill to perform an architecture audit (Mode 2).
Load the skill via the Skill tool, then analyze the project structure,
module dependencies, and architectural patterns from the perspective of
Brooks's 7 principles.
Read architecture-guide.md from the skill directory for the audit framework.
```

- [ ] **Step 3: Create `brooks-debt.md`**

Write `commands/brooks-debt.md`:

```markdown
---
description: Run a Brooks-Lint tech debt assessment on the current codebase
---

Use the brooks-lint skill to perform a tech debt assessment (Mode 3).
Load the skill via the Skill tool, then classify and prioritize technical
debt using Brooks's framework.
Read debt-guide.md from the skill directory for the debt classification
framework and repayment roadmap template.
```

- [ ] **Step 4: Verify all three files have valid frontmatter**

```bash
for f in commands/*.md; do
  python3 -c "
import sys
content = open('$f').read()
assert content.startswith('---'), f'Missing frontmatter in $f'
assert 'description:' in content, f'Missing description in $f'
print(f'$f: OK')
"
done
```

Expected: three "OK" lines

- [ ] **Step 5: Commit**

```bash
git add commands/
git commit -m "feat: add /brooks-review, /brooks-audit, /brooks-debt slash commands"
```

---

## Task 5: Rewrite SKILL.md in new location

**Files:**
- Create: `skills/brooks-lint/SKILL.md`

This is the core of the plugin. It must be self-contained — Claude should be able to run any mode after reading only this file.

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p skills/brooks-lint
```

- [ ] **Step 2: Write `skills/brooks-lint/SKILL.md`**

```markdown
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
- User mentions: Brooks's Law, Mythical Man-Month, conceptual integrity, second system effect, no silver bullet, tar pit, surgical team

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
2. If you have insufficient evidence, ask the user 2-3 targeted questions (e.g., "Which part of the codebase is most painful to change?")
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
- Overall health: weighted mean where Conceptual Integrity and Communication Overhead count double

## Reference Files

Read these files on demand — do not preload all of them:

| File | When to Read |
|------|-------------|
| `brooks-principles.md` | When you need the exact scoring rubric for any dimension |
| `pr-review-guide.md` | At the start of every Mode 1 (PR Review) execution |
| `architecture-guide.md` | At the start of every Mode 2 (Architecture Audit) execution |
| `debt-guide.md` | At the start of every Mode 3 (Tech Debt Assessment) execution |
```

- [ ] **Step 3: Verify frontmatter is present**

```bash
python3 -c "
content = open('skills/brooks-lint/SKILL.md').read()
assert content.startswith('---'), 'Missing frontmatter'
assert 'name: brooks-lint' in content, 'Missing name'
assert 'description:' in content, 'Missing description'
print('SKILL.md: frontmatter OK')
"
```

Expected: prints "frontmatter OK"

- [ ] **Step 4: Commit**

```bash
git add skills/brooks-lint/SKILL.md
git commit -m "feat: add skills/brooks-lint/SKILL.md — full rewrite with mode-switch pattern"
```

---

## Task 6: Write `brooks-principles.md`

**Files:**
- Create: `skills/brooks-lint/brooks-principles.md`

This is the scoring authority. Each principle gets: core insight, code-level symptoms, and a 1-5 rubric with concrete descriptions at each score level.

- [ ] **Step 1: Write the file**

```markdown
# Brooks Principles — Scoring Rubrics

**Core principle:** Read this file when you need the exact criteria to assign a score to any of the 7 dimensions. Each dimension has: the original Brooks insight, observable code-level symptoms, and a 1-5 rubric.

---

## 1. Conceptual Integrity

**Brooks's insight:** "I will contend that conceptual integrity is the most important consideration in system design. It is better to have a system omit certain anomalous features and improvements, but to reflect one coherent design philosophy, than to have one that contains many good but independent and uncoordinated ideas." *(Ch. 4)*

**Code-level symptoms of violation:**
- Mixed naming conventions (camelCase functions next to snake_case functions in the same module)
- Multiple error-handling strategies coexisting (exceptions + error codes + null returns)
- Inconsistent abstraction levels in one layer (raw SQL next to ORM calls)
- API style inconsistency (some endpoints return `{data: ...}`, others return raw objects)
- Comments in multiple languages

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Reads as if one person wrote the entire codebase. Every naming, error handling, and abstraction choice is consistent. A new developer could infer the style from any 10-line sample. |
| 4 | Good | One coherent style with 1-2 minor inconsistencies that don't affect readability. |
| 3 | Acceptable | 2-3 distinct style traditions coexist but are at least internally consistent within each module. |
| 2 | Needs attention | Mixed styles within the same file or function. Error handling is unpredictable. |
| 1 | Critical | No discernible design philosophy. Each function or class appears written by a different person with different conventions. |

---

## 2. Module Autonomy (Surgical Team Principle)

**Brooks's insight:** "The surgical team... the chief programmer does the design, all of the coding, writes all of the documentation." *(Ch. 3)* — Small, focused units with clear ownership and minimal interface surface area.

**Code-level symptoms of violation:**
- God classes or god functions (one class does everything)
- Functions that require reading 3+ other modules to understand
- Modules with no clear stated responsibility
- Leaky abstractions (implementation details exposed through the interface)
- "Don't touch this" comments indicating knowledge monopolies

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Each module can be read and understood independently. Interfaces expose only what callers need. A developer new to the codebase could modify any single module without reading its dependencies. |
| 4 | Good | Modules are well-bounded with minor cross-cutting concerns. |
| 3 | Acceptable | Modules have identifiable responsibilities but some leakage. Understanding one module requires some knowledge of 1-2 others. |
| 2 | Needs attention | Multiple god classes or modules where the responsibility is "everything in this area." |
| 1 | Critical | No meaningful module boundaries. Understanding any function requires understanding the whole system. |

---

## 3. Essential vs Accidental Complexity (No Silver Bullet)

**Brooks's insight:** "The complexity of software is an essential property, not an accidental one... much of the complexity that [developers] must master is arbitrary complexity, forced without rhyme or reason by the many human institutions and systems to which their interfaces must conform." *(No Silver Bullet, 1986)*

**Code-level symptoms of accidental complexity:**
- Framework choice fighting the problem domain
- Abstraction layers that add indirection without adding clarity
- Configuration systems more complex than the problems they configure
- Infrastructure code outweighing domain code
- "Magic" framework behavior that developers must memorize

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Complexity budget clearly spent on the problem domain. Framework and infrastructure are invisible. |
| 4 | Good | Minor accidental complexity present but not dominant. |
| 3 | Acceptable | Noticeable framework/infrastructure overhead but domain logic remains readable. |
| 2 | Needs attention | Accidental complexity competes with domain logic for developer attention. |
| 1 | Critical | Developers spend more time fighting infrastructure than solving the actual problem. |

---

## 4. Second System Effect

**Brooks's insight:** "The second is the most dangerous system a man ever designs... The general tendency is to over-design the second system, using all the ideas and frills that were sidetracked on the first one." *(Ch. 5)*

**Code-level symptoms:**
- Abstractions with only one concrete implementation (premature generalization)
- Config options that have never been changed from their defaults
- Plugin systems for problems that have only one known use case
- "Framework" code larger than the applications it powers
- YAGNI violations: features built for requirements that don't exist yet

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Every abstraction has ≥2 concrete uses. No unused configuration. Features match stated requirements. |
| 4 | Good | Minor over-engineering in isolated areas, not the main paths. |
| 3 | Acceptable | Some premature abstractions present but isolated. Core paths are appropriately sized. |
| 2 | Needs attention | Significant over-engineering in core paths. Multiple unused abstractions or config systems. |
| 1 | Critical | The system is a framework for a problem that has one solution. Maintaining the abstractions costs more than they save. |

---

## 5. Communication Overhead (Brooks's Law)

**Brooks's insight:** "Adding manpower to a late software project makes it later... The bearing of a child takes nine months, no matter how many women are assigned." *(Ch. 2)* — And in code: adding modules to a tangled graph makes it harder to reason about.

**Code-level symptoms:**
- Circular dependencies between modules
- High fan-out: modules that import from many others
- Changes to one module require changes in many others (high change propagation radius)
- Shared mutable state accessed across module boundaries
- Interface breadth: modules exposing dozens of public methods

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Dependency graph is a clean DAG. High-level modules depend on low-level modules, never the reverse. A typical feature change touches ≤2 modules. |
| 4 | Good | Clean dependency direction with minor coupling between sibling modules. |
| 3 | Acceptable | Some horizontal coupling. A typical change touches 3-4 modules. No circular dependencies. |
| 2 | Needs attention | Multiple circular dependencies or modules with excessive fan-out. A typical change touches 5+ modules. |
| 1 | Critical | Circular dependencies pervasive. Impossible to change anything without ripple effects across the system. |

---

## 6. Throwaway Readiness (Plan to Throw One Away)

**Brooks's insight:** "Plan to throw one away; you will, anyhow." *(Ch. 11)* — Systems that cannot be replaced in parts decay faster than systems that can.

**Code-level symptoms of low throwaway readiness:**
- Prototype or experimental code in production with no replacement plan
- Modules tightly coupled to their consumers (no interface isolation)
- Business logic embedded in infrastructure (e.g., queries in HTTP handlers)
- Missing tests on critical paths (fear to replace = can't verify replacement)
- Configuration values hardcoded inside logic instead of injected

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Any module could be replaced with a different implementation without changing its callers. Clear interfaces everywhere. Critical paths have test coverage. |
| 4 | Good | Most modules are replaceable. Some tight coupling at the edges. |
| 3 | Acceptable | Core modules replaceable; peripheral or integration modules tightly coupled. |
| 2 | Needs attention | Key modules are practically irreplaceable without major refactoring of dependents. |
| 1 | Critical | The system cannot be meaningfully refactored because there is no safe way to verify correctness of replacements. |

---

## 7. Tar Pit Score (The Tar Pit)

**Brooks's insight:** "The tar pit of software engineering will continue to be sticky for a long time to come... it is this that makes great programming teams, over time, so easy to bog down." *(Ch. 1)*

**Code-level symptoms of tar pit accumulation:**
- TODO/FIXME/HACK markers without owner or date
- Dead code (commented-out blocks, unreachable functions)
- "Don't touch" zones documented in comments
- Documentation that describes how the code *used to* work
- Test coverage dropping over time in key modules
- Increasing time-to-merge for PRs in the module over historical trend

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | No dead code. TODOs have owners and issues. Documentation matches code. Test coverage stable or growing. |
| 4 | Good | Minor TODO accumulation. No dead code. Documentation mostly current. |
| 3 | Acceptable | Some TODO/HACK accumulation. Minor documentation lag. No "untouchable" zones. |
| 2 | Needs attention | Multiple HACK markers in critical paths. Some dead code. At least one module avoided by the team. |
| 1 | Critical | Significant portions of the codebase are effectively frozen — too risky to modify without extensive archaeology. |
```

- [ ] **Step 2: Verify file has all 7 principles**

```bash
python3 -c "
content = open('skills/brooks-lint/brooks-principles.md').read()
principles = [
    'Conceptual Integrity',
    'Module Autonomy',
    'Essential vs Accidental',
    'Second System Effect',
    'Communication Overhead',
    'Throwaway Readiness',
    'Tar Pit Score'
]
for p in principles:
    assert p in content, f'Missing: {p}'
print('brooks-principles.md: all 7 principles present')
"
```

Expected: prints "all 7 principles present"

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/brooks-principles.md
git commit -m "feat: add brooks-principles.md — scoring rubrics for all 7 dimensions"
```

---

## Task 7: Write `pr-review-guide.md`

**Files:**
- Create: `skills/brooks-lint/pr-review-guide.md`

Each dimension gets 5-8 concrete yes/no questions. Questions must be directly answerable by reading the diff — no vague principles.

- [ ] **Step 1: Write the file**

```markdown
# PR Review Guide — Mode 1 Checklist

**Core principle:** Every question in this guide must be answerable by reading the diff. Skip dimensions where all questions clearly answer "no problem" — mark that dimension ✅ and move on.

---

## How to Use

1. Read through the diff or code provided
2. For each dimension, answer the questions below
3. Record findings only where you find problems (score ≤ 3)
4. Use the quick-skip rule: if the first 2 questions for a dimension are clearly fine, score it ✅ and skip to the next dimension

---

## Dimension 1: Conceptual Integrity

**Quick skip:** Are all new names consistent with existing names in the same file? Does error handling match the pattern used elsewhere? If both yes → ✅ skip.

Questions:
- Do new function/variable names follow the same convention as existing ones in this file (verb tense, casing, abbreviation style)?
- Does the new error handling strategy match the existing strategy (same exception types, same error object shape, same use of optionals)?
- If new abstractions are introduced, do they sit at the same level as existing abstractions in this layer?
- Are any new log messages consistent in format with existing log messages?
- Does any new public API follow the same patterns (parameter order, naming) as existing public APIs?

**Score 4-5:** All new code is indistinguishable in style from the surrounding code.
**Score 3:** 1 inconsistency, isolated and low-impact.
**Score 2:** 2+ inconsistencies, or 1 inconsistency in a high-traffic path.
**Score 1:** New code introduces a completely different style that conflicts with the module.

---

## Dimension 2: Module Autonomy

**Quick skip:** Can you understand what each changed function does without looking outside this file? If yes → ✅ skip.

Questions:
- Can you understand the changed code by reading this file alone, without looking up other modules?
- Does any changed function do more than one thing? (Functions named "processAndSave" or "validateAndUpdate" are red flags)
- Does the diff expose internal implementation details through a public interface?
- Does any function take more than 5 parameters? (Suggests it is doing too much or needs a parameter object)
- Is any single function longer than 50 lines after this change?
- Does the change add public methods to a class that are only used within that class? (Should be private)

**Score 4-5:** Each changed function has a clear single purpose. No new coupling introduced.
**Score 3:** Minor responsibility leakage; understandable with moderate context.
**Score 2:** Functions doing multiple things, or significant new coupling introduced.
**Score 1:** The change makes a module meaningfully harder to understand in isolation.

---

## Dimension 3: Essential vs Accidental Complexity

**Quick skip:** Does every new abstraction have at least 2 call sites in this diff? If yes → ✅ skip.

Questions:
- Does every new function, class, or interface have at least 2 call sites in the current codebase (including this diff)?
- Is every new configuration option actually used with a non-default value somewhere?
- Could any new indirection layer be removed without losing meaningful capability?
- Is the new code solving the actual problem, or solving a more general problem than required?
- Would a reader immediately understand *why* this layer of abstraction exists?

**Score 4-5:** All complexity is justified by the problem domain.
**Score 3:** 1 unnecessary abstraction, low blast radius.
**Score 2:** Multiple abstractions that add complexity without clarity.
**Score 1:** The change is more complex than the problem it solves.

---

## Dimension 4: Second System Effect

**Quick skip:** Does the change implement only what was asked for? If yes → ✅ skip.

Questions:
- Does the diff contain any code that isn't needed for the current stated requirement?
- Are there any TODO comments suggesting "future flexibility" that isn't required now?
- Are any new interfaces more generic than the current usage requires?
- Does the change add a plugin or extension mechanism where there is currently only one use case?
- Are any new config flags added that only one environment will ever use?

**Score 4-5:** Change does exactly what was asked, nothing more.
**Score 3:** 1 minor over-generalization that doesn't significantly increase complexity.
**Score 2:** Notable YAGNI violation in a core path.
**Score 1:** The change is primarily infrastructure for hypothetical future requirements.

---

## Dimension 5: Communication Overhead

**Quick skip:** Does the diff touch fewer than 3 modules? If yes → ✅ skip.

Questions:
- Does the diff introduce any new dependency from a higher-level module to a lower-level one?
- Does the diff create any circular dependency (A imports B, B imports A)?
- Does a single logical change require modifications to more than 3 files?
- Does the diff introduce new shared mutable state accessible across module boundaries?
- Are any new function signatures so wide (many parameters) that callers need detailed knowledge of the implementation?

**Score 4-5:** Change is well-contained. Dependency direction unchanged or improved.
**Score 3:** 1 new cross-module coupling that is justified and documented.
**Score 2:** Multiple new coupling points, or a new circular dependency.
**Score 1:** The change makes it harder to reason about module boundaries.

---

## Dimension 6: Throwaway Readiness

**Quick skip:** Is all new logic separated from infrastructure (I/O, HTTP, DB)? If yes → ✅ skip.

Questions:
- Is any new business logic embedded directly in infrastructure code (HTTP handlers, database queries, CLI parsing)?
- Could you swap the underlying data store or transport layer without modifying the business logic added in this diff?
- If this module needed to be replaced, would callers need to change?
- Does the diff reduce test coverage on any critical path?
- Are any new magic values (hardcoded strings, URLs, credentials) embedded in logic instead of injected?

**Score 4-5:** Business logic and infrastructure remain separated. New code is testable in isolation.
**Score 3:** Minor coupling, not in a critical path.
**Score 2:** Business logic embedded in infrastructure in a meaningful way.
**Score 1:** The change makes a critical module significantly harder to replace or test.

---

## Dimension 7: Tar Pit Score

**Quick skip:** No new TODO/HACK/FIXME markers? No dead code? If yes → ✅ skip.

Questions:
- Does the diff add any TODO, FIXME, or HACK markers without an associated issue number?
- Does the diff leave any commented-out code?
- Does the diff add any code that is explicitly noted as "temporary" without a cleanup plan?
- Does the diff reduce test coverage for any code path that was previously covered?
- Does any new comment describe how the old code worked rather than how the new code works?

**Score 4-5:** No new technical debt. All markers have owners. Test coverage maintained.
**Score 3:** 1-2 TODO markers with context (issue number or clear explanation).
**Score 2:** Multiple unmarked TODOs or commented-out code left in.
**Score 1:** The change deliberately incurs debt with no stated repayment plan.
```

- [ ] **Step 2: Verify all 7 dimensions present**

```bash
python3 -c "
content = open('skills/brooks-lint/pr-review-guide.md').read()
for i in range(1, 8):
    assert f'Dimension {i}:' in content, f'Missing Dimension {i}'
print('pr-review-guide.md: all 7 dimensions present')
"
```

Expected: prints "all 7 dimensions present"

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/pr-review-guide.md
git commit -m "feat: add pr-review-guide.md — Mode 1 PR review checklist"
```

---

## Task 8: Write `architecture-guide.md`

**Files:**
- Create: `skills/brooks-lint/architecture-guide.md`

- [ ] **Step 1: Write the file**

```markdown
# Architecture Audit Guide — Mode 2 Framework

**Core principle:** Architecture reveals intent. Before scoring, draw the dependency graph — it makes violations visible that prose descriptions hide.

---

## Step 1: Draw the Module Dependency Map

Before evaluating any dimension, map the dependencies in this text format:

```
[ModuleA] ──► [ModuleB]     (depends on)
[ModuleA] ──► [ModuleC]
[ModuleB] ──► [ModuleD]
[ModuleC] ──► [ModuleD]

Circular: [ModuleX] ──► [ModuleY] ──► [ModuleX]  ⚠️
```

Rules for the map:
- Arrows point FROM the depending module TO the dependency
- Group by layer: UI → Domain → Infrastructure (arrows should generally flow downward)
- Mark circular dependencies with ⚠️
- Count fan-out (number of arrows leaving a node) — flag any module with fan-out > 5

---

## Step 2: Module-Level Analysis

Evaluate each module against these questions:

**Boundary clarity:**
- Can you state the responsibility of this module in one sentence?
- Does the module name match what it actually does?
- Would a new developer know where to add a new feature of type X?

**Interface width:**
- How many public functions/methods/endpoints does this module expose?
- Could any of them be made private without breaking callers?
- Do callers need to know implementation details to use this module correctly?

**Cohesion:**
- Do all the things in this module belong together, or are they grouped by accident (e.g., "utils")?
- If this module were split in two, would both halves still be independently useful?

---

## Step 3: System-Level Analysis

**Dependency direction (Brooks's Law applied):**
- Does data flow in a consistent direction (e.g., UI → Domain → Infrastructure)?
- Are there any upward dependencies (low-level modules depending on high-level ones)?
- Can you trace a user request from entry to exit in a straight line, or does it bounce between layers?

**Conway's Law check:**
- Does the module structure match the team structure?
- Are there "seam" points between modules that correspond to team or service boundaries?
- If the team structure changed, which module boundaries would need to change?

**Conceptual integrity at scale:**
- Does the architecture look like it was designed by one mind or assembled by committee?
- Are there multiple approaches to the same architectural problem coexisting (e.g., two different ways to handle cross-cutting concerns like logging, auth, or errors)?
- Could you explain the architecture's philosophy in 2 sentences?

**Change propagation radius:**
- Pick a typical feature request. Count how many modules would need to change.
- If the answer is > 4, which interfaces would need to be redesigned to contain it?

---

## Step 4: Scoring Guide for Architecture Mode

For each dimension, apply these architecture-specific criteria:

**Conceptual Integrity (architecture level):**
- 5: One coherent philosophy. All modules follow the same patterns for cross-cutting concerns.
- 3: 2-3 competing patterns coexist but are at least consistent within each subsystem.
- 1: No discernible architectural philosophy. Patterns chosen module-by-module.

**Module Autonomy (architecture level):**
- 5: Every module has a clear one-sentence responsibility. No "utils" or "helpers" modules.
- 3: Most modules well-bounded. 1-2 catch-all modules with unclear responsibility.
- 1: Multiple god modules. Most modules require understanding 3+ other modules to use.

**Communication Overhead (architecture level):**
- 5: Dependency graph is a clean DAG. No circular deps. Fan-out ≤ 3 for most modules.
- 3: Some circular deps in peripheral modules. Core modules are clean. Typical change touches 3-4 modules.
- 1: Circular deps in core modules. Typical change touches 5+ modules.

**Second System Effect (architecture level):**
- 5: Architecture solves the problems the system actually has. No speculative infrastructure.
- 3: Some over-engineering at the edges (e.g., plugin system with one plugin).
- 1: More architecture than product. The system is primarily a framework.

---

## Module Dependency Map Template

Use this when writing your audit report:

```
## Module Dependency Map

Layer: Presentation
  [ComponentA]
  [ComponentB]

Layer: Domain
  [ServiceX] ──► [RepositoryInterface]
  [ServiceY] ──► [RepositoryInterface]

Layer: Infrastructure
  [RepositoryImpl] implements [RepositoryInterface]
  [RepositoryImpl] ──► [Database]

Cross-cutting concerns:
  [Logger] ◄── all modules
  [Auth] ──► [TokenStore]

⚠️ Violations found:
  [ServiceX] ──► [Database]  (bypasses repository abstraction)
  [ComponentA] ──► [ServiceY]  (presentation depends on domain ✓)
  [ServiceX] ──► [ComponentB]  (domain depends on presentation ✗)
```
```

- [ ] **Step 2: Verify key sections present**

```bash
python3 -c "
content = open('skills/brooks-lint/architecture-guide.md').read()
required = ['Draw the Module Dependency Map', 'Module-Level Analysis', 'System-Level Analysis', 'Conway', 'Change propagation']
for r in required:
    assert r in content, f'Missing section: {r}'
print('architecture-guide.md: all key sections present')
"
```

Expected: prints "all key sections present"

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/architecture-guide.md
git commit -m "feat: add architecture-guide.md — Mode 2 architecture audit framework"
```

---

## Task 9: Write `debt-guide.md`

**Files:**
- Create: `skills/brooks-lint/debt-guide.md`

- [ ] **Step 1: Write the file**

```markdown
# Tech Debt Assessment Guide — Mode 3 Framework

**Core principle:** Not all debt is equal. Classify before prioritizing — the urgency of debt depends on how much it compounds and how much it blocks future work.

---

## Evidence Gathering

Before classifying, ask the user up to 3 of these questions if you lack sufficient evidence:

1. "Which part of the codebase takes the longest to modify for a typical feature?"
2. "Which module do developers avoid touching, and why?"
3. "How has time-to-merge for PRs changed over the past 6 months?"
4. "Which parts of the system have the fewest tests and the most bugs?"
5. "Is there a module that only one person understands?"

One or two answers are usually enough to classify the dominant debt type.

---

## The 5 Debt Categories

### Category 1: Conceptual Debt

**Brooks principle:** Conceptual Integrity
**Definition:** The codebase has no coherent design philosophy. Multiple competing patterns coexist.

**Identification features:**
- Multiple naming conventions in the same module (camelCase + snake_case, mix of languages)
- Multiple error-handling strategies (exceptions + error codes + nulls) with no rule for which to use
- Multiple data access patterns (ORM + raw SQL + stored procedures) without clear rules
- API inconsistency: some endpoints return `{data: ..., error: ...}`, others return raw objects

**Severity:**
- **High:** Inconsistency in core domain logic or public API — affects every developer, every day
- **Medium:** Inconsistency confined to one subsystem or integration layer
- **Low:** Inconsistency in tooling, scripts, or configuration files only

**Repayment approach:** Establish the canonical pattern, document it, then migrate opportunistically (fix on touch, not in bulk).

---

### Category 2: Structural Debt

**Brooks principle:** The Tar Pit / Communication Overhead
**Definition:** Module boundaries have eroded. Dependencies are tangled.

**Identification features:**
- Circular dependencies between modules
- "God" modules that everything depends on
- Business logic scattered across layers (domain logic in HTTP handlers, UI logic in services)
- Shared mutable global state
- A change in one module reliably breaks something in an unrelated module

**Severity:**
- **High:** Circular dependencies in core modules, or business logic in infrastructure — blocks refactoring and testing
- **Medium:** Circular dependencies in peripheral modules, or mild layer violations
- **Low:** Slightly oversized modules with clear responsibility despite the size

**Repayment approach:** Strangler Fig pattern — introduce clean interfaces at module boundaries and migrate code behind them incrementally. Do not attempt big-bang refactors.

---

### Category 3: Over-Engineering Debt

**Brooks principle:** Second System Effect
**Definition:** The system is more complex than the problem requires. Abstractions have only one implementation.

**Identification features:**
- Interfaces with exactly one implementing class, unchanged for 6+ months
- Configuration options never set to non-default values
- Plugin or extension systems with only one plugin
- Framework code larger than the application code it supports
- Features that exist "for flexibility" but have never been used by any real user

**Severity:**
- **High:** Core user flows require navigating multiple indirection layers to trace or modify
- **Medium:** Over-engineering in supporting infrastructure (e.g., config system)
- **Low:** A single unused abstraction in a low-traffic path

**Repayment approach:** YAGNI enforcement — delete unused abstractions, simplify interfaces to their actual usage. This type of debt is uniquely easy to repay (deletion is cheap).

---

### Category 4: Knowledge Debt

**Brooks principle:** Surgical Team Principle
**Definition:** Critical knowledge about the system is held by one person or lost entirely.

**Identification features:**
- Modules commented "DO NOT TOUCH without asking [name]"
- No tests in critical modules (can't verify correctness of changes without the original author)
- Business rules embedded in code with no documentation of *why* they exist
- Only one person makes PRs in a given module over a 3-month window
- Onboarding a new developer in this area takes > 1 week

**Severity:**
- **High:** Knowledge about core business rules exists only in one person's head — single point of failure
- **Medium:** One person is the primary expert but others could figure it out with significant effort
- **Low:** One person is the most efficient expert but documentation exists

**Repayment approach:** Documentation sprints + pairing. Write ADRs (Architecture Decision Records) for the most obscure decisions. Knowledge debt is repaid by spreading, not by refactoring.

---

### Category 5: Test Debt

**Brooks principle:** Plan to Throw One Away
**Definition:** Critical paths cannot be safely changed because there is no way to verify correctness.

**Identification features:**
- Coverage < 40% on modules that change frequently
- Tests that only test the happy path with no edge cases
- Tests that rely on mocking so heavily they don't test real behavior
- Integration tests that are flaky or disabled
- A module where the last 5 PRs all introduced regressions

**Severity:**
- **High:** Core business logic or data mutation paths have no tests — dangerous to modify
- **Medium:** Edge cases uncovered in important paths, or tests exist but are unreliable
- **Low:** Low coverage on stable, low-risk utility modules

**Repayment approach:** Write tests for the highest-risk paths first (not the highest-traffic paths). A test that catches a $1M bug is worth more than 100 tests for string utilities.

---

## Debt Report Template

Use this structure in the output:

```
## Tech Debt Classification

### Dominant Debt Type: [Category Name]
[1-2 sentences on why this is the dominant type and what evidence supports it]

### Full Debt Inventory

| Category | Severity | Key Evidence | Estimated Impact |
|----------|----------|-------------|-----------------|
| Conceptual Debt | High | Mixed error handling in auth module | Slows every PR that touches auth |
| Structural Debt | Medium | Circular dep: UserService ↔ NotificationService | Risk of cascading failures |
| Over-Engineering Debt | Low | PluginSystem with one plugin | Minor cognitive overhead |
| Knowledge Debt | High | Payment module: only Alice understands it | Bus factor = 1 |
| Test Debt | Medium | <20% coverage on checkout flow | Regressions in last 3 deploys |

## Debt Repayment Roadmap

### P0 — Address this sprint (blocking growth)
[Items that are actively blocking feature development or causing frequent incidents]

### P1 — Address next sprint (compounding)
[Items that get worse over time if ignored]

### P2 — Backlog (stable, low-urgency)
[Items that are real debt but stable — track them, address opportunistically]

### Not debt — Accept as-is
[Things that look like debt but are actually justified complexity]
```
```

- [ ] **Step 2: Verify all 5 debt categories present**

```bash
python3 -c "
content = open('skills/brooks-lint/debt-guide.md').read()
categories = ['Conceptual Debt', 'Structural Debt', 'Over-Engineering Debt', 'Knowledge Debt', 'Test Debt']
for c in categories:
    assert c in content, f'Missing: {c}'
print('debt-guide.md: all 5 categories present')
"
```

Expected: prints "all 5 categories present"

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/debt-guide.md
git commit -m "feat: add debt-guide.md — Mode 3 tech debt assessment framework"
```

---

## Task 10: Clean up old files

**Files:**
- Delete: root `SKILL.md`
- Delete: `references/` directory
- Delete: `scripts/` directory

- [ ] **Step 1: Remove old files**

```bash
git rm SKILL.md
git rm -r references/
git rm -r scripts/
```

- [ ] **Step 2: Verify old files are gone and new structure is correct**

```bash
# Old files should not exist
test ! -f SKILL.md && echo "root SKILL.md removed ✓"
test ! -d references/ && echo "references/ removed ✓"
test ! -d scripts/ && echo "scripts/ removed ✓"

# New files should exist
test -f skills/brooks-lint/SKILL.md && echo "skills/brooks-lint/SKILL.md ✓"
test -f skills/brooks-lint/brooks-principles.md && echo "brooks-principles.md ✓"
test -f skills/brooks-lint/pr-review-guide.md && echo "pr-review-guide.md ✓"
test -f skills/brooks-lint/architecture-guide.md && echo "architecture-guide.md ✓"
test -f skills/brooks-lint/debt-guide.md && echo "debt-guide.md ✓"
```

Expected: 8 lines all with ✓

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove legacy SKILL.md, references/, and scripts/"
```

---

## Task 11: Update README.md and CLAUDE.md

**Files:**
- Modify: `README.md` (installation section)
- Modify: `CLAUDE.md` (reflect new structure)

- [ ] **Step 1: Update README.md installation section**

Replace the existing "Quick Start" / "Claude Code Skill" / "As a CLI tool" section with:

```markdown
## Installation

### Via Claude Code Plugin Marketplace (recommended)

```bash
/plugin install brooks-lint@hyhmrright-marketplace
```

### Manual install (any Claude Code project)

Copy the skill into your project's Claude skills directory:

```bash
cp -r skills/brooks-lint ~/.claude/skills/brooks-lint
```

Then in your Claude session, the skill will be available automatically.

### Slash Commands

Once installed, use these explicit triggers:

| Command | What it does |
|---------|-------------|
| `/brooks-review` | PR-level code review across 7 Brooks dimensions |
| `/brooks-audit` | Full architecture audit with module dependency map |
| `/brooks-debt` | Tech debt classification and repayment roadmap |

The skill also triggers automatically when you discuss code quality, architecture, or maintainability.
```

- [ ] **Step 2: Update CLAUDE.md to reflect new structure**

Replace the "Architecture" section in `CLAUDE.md` with:

```markdown
## Architecture

### Structure

```
brooks-lint/
├── .claude-plugin/          # Plugin metadata for /plugin install
├── skills/brooks-lint/      # The skill itself
│   ├── SKILL.md             # Main skill — self-contained workflow + mode detection
│   ├── brooks-principles.md # Scoring rubrics for all 7 dimensions (read on demand)
│   ├── pr-review-guide.md   # Mode 1: PR review checklist (read when running Mode 1)
│   ├── architecture-guide.md# Mode 2: Architecture audit framework
│   └── debt-guide.md        # Mode 3: Tech debt classification
├── hooks/                   # SessionStart hook for session-level awareness
└── commands/                # /brooks-review, /brooks-audit, /brooks-debt
```

### How the skill works

1. `hooks/session-start` injects a brief note into every session: "brooks-lint is installed, use Skill tool to load it for code reviews"
2. When triggered, Claude loads `skills/brooks-lint/SKILL.md` via the Skill tool
3. SKILL.md detects the mode (PR Review / Architecture Audit / Tech Debt) from context
4. Claude reads the relevant guide file (`pr-review-guide.md`, `architecture-guide.md`, or `debt-guide.md`)
5. Claude scores across 7 Brooks dimensions using `brooks-principles.md` as the scoring rubric
6. Output follows the standard report template in SKILL.md

### Running the analyzer

No scripts required. The skill is entirely prompt-driven.
```

- [ ] **Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update README installation instructions and CLAUDE.md architecture section"
```

---

## Task 12: Final verification and push

- [ ] **Step 1: Verify complete file structure**

```bash
echo "=== Plugin infrastructure ==="
test -f .claude-plugin/plugin.json && echo ".claude-plugin/plugin.json ✓"
test -f .claude-plugin/marketplace.json && echo ".claude-plugin/marketplace.json ✓"
test -f package.json && echo "package.json ✓"
test -f CHANGELOG.md && echo "CHANGELOG.md ✓"

echo "=== Hooks ==="
test -f hooks/hooks.json && echo "hooks/hooks.json ✓"
test -f hooks/session-start && echo "hooks/session-start ✓"
test -x hooks/session-start && echo "hooks/session-start is executable ✓"

echo "=== Commands ==="
test -f commands/brooks-review.md && echo "commands/brooks-review.md ✓"
test -f commands/brooks-audit.md && echo "commands/brooks-audit.md ✓"
test -f commands/brooks-debt.md && echo "commands/brooks-debt.md ✓"

echo "=== Skill files ==="
test -f skills/brooks-lint/SKILL.md && echo "SKILL.md ✓"
test -f skills/brooks-lint/brooks-principles.md && echo "brooks-principles.md ✓"
test -f skills/brooks-lint/pr-review-guide.md && echo "pr-review-guide.md ✓"
test -f skills/brooks-lint/architecture-guide.md && echo "architecture-guide.md ✓"
test -f skills/brooks-lint/debt-guide.md && echo "debt-guide.md ✓"

echo "=== Legacy files removed ==="
test ! -f SKILL.md && echo "root SKILL.md removed ✓"
test ! -d references/ && echo "references/ removed ✓"
test ! -d scripts/ && echo "scripts/ removed ✓"
```

Expected: 17 lines all with ✓

- [ ] **Step 2: Verify hook runs clean**

```bash
CLAUDE_PLUGIN_ROOT="$(pwd)" bash hooks/session-start | python3 -m json.tool > /dev/null && echo "session-start hook produces valid JSON ✓"
```

Expected: "produces valid JSON ✓"

- [ ] **Step 3: Verify all JSON files are valid**

```bash
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json hooks/hooks.json package.json; do
    python3 -m json.tool "$f" > /dev/null && echo "$f valid ✓"
done
```

Expected: 4 lines all with ✓

- [ ] **Step 4: Tag and push**

```bash
git tag -a v0.2.0 -m "v0.2.0 — marketplace-ready plugin with hooks, slash commands, and rewritten skill content"
git push origin main
git push origin v0.2.0
```

- [ ] **Step 5: Update GitHub release**

```bash
gh release create v0.2.0 \
  --title "brooks-lint v0.2.0 — Marketplace-Ready Plugin" \
  --notes "Complete rewrite as a proper Claude Code plugin. Installable via \`/plugin install\`, with SessionStart hook, three slash commands (/brooks-review, /brooks-audit, /brooks-debt), and fully rewritten prompt-driven skill content. See CHANGELOG.md for full details."
```

Expected: GitHub release URL printed
