# Health Dashboard Guide — Mode 5

**Purpose:** Produce a cross-dimensional health dashboard for the codebase.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Analysis Process

### Step 1: Run Lightweight Scan Across Four Dimensions

For each dimension, run an abbreviated scan using the decay-risks definitions
from `_shared/`. Do NOT read the individual mode guide files — use the abbreviated
checklists below instead.

**PR dimension (if changes exist):**
- Apply Auto Scope Detection (common.md)
- Scan for R2 (Change Propagation) and R1 (Cognitive Overload) in the diff
- Cap at top 3 findings

**Architecture dimension:**
- Gather codebase context: read top-level structure, entry points, import statements
- Draw a Mermaid dependency graph (follow standard graph rules from common.md)
- Scan for R5 (Dependency Disorder): circular deps, upward flows, fan-out > 5
- Cap at top 3 findings
- INCLUDE the Mermaid graph in output

**Debt dimension:**
- Scan for all six decay risks (R1-R6) across the codebase
- Cap at 2 findings per risk, 3 findings total
- Skip Pain × Spread scoring (use severity tier only)

**Test dimension:**
- Build the Test Suite Map (unit/integration/E2E counts)
- Scan for T1 (Test Obscurity) and T2 (Test Brittleness) in test files
- Cap at top 3 findings

### Step 2: Compute Dashboard Scores

Each dimension gets its own Health Score (base 100, same deduction rules from common.md).
Composite score = weighted average of dimension scores:

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| PR (code quality) | 0.25 | Only applies if changes exist; skip if no diff |
| Architecture | 0.30 | Structural issues have highest blast radius |
| Debt | 0.25 | Systemic but slower-moving |
| Test | 0.20 | Supporting signal |

If PR dimension is skipped (no changes), redistribute its 0.25 weight proportionally
across the remaining three dimensions by dividing each remaining weight by
(1 − 0.25) = 0.75. Compute redistribution dynamically — do not hardcode the values.

**Redistributed weights (PR skipped):**

| Dimension | Base Weight | Redistributed Weight |
|-----------|------------|---------------------|
| Architecture | 0.30 | 0.30 / 0.75 = 0.40 |
| Debt | 0.25 | 0.25 / 0.75 = 0.33 |
| Test | 0.20 | 0.20 / 0.75 = 0.27 |

### Step 3: Output Dashboard

Use the dashboard report template below instead of the standard common.md template.

---

## Dashboard Report Template

````markdown
# Brooks-Lint Health Dashboard

**Mode:** Health Dashboard
**Scope:** [project name or directory]
**Composite Score:** XX/100

| Dimension | Score | Top Finding |
|-----------|-------|------------|
| Code Quality | XX/100 | [one-line summary or "Clean"] |
| Architecture | XX/100 | [one-line summary or "Clean"] |
| Tech Debt | XX/100 | [one-line summary or "Clean"] |
| Test Quality | XX/100 | [one-line summary or "Clean"] |

## Module Dependency Graph
[Mermaid graph from architecture scan]

## Top Findings (max 5 across all dimensions)
[Standard Iron Law format, sorted by severity]

## Recommendation
[One paragraph: what to fix first, which dimension needs the most attention,
 suggest running the full individual skill for the worst dimension]
````
