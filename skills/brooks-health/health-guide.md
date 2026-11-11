# Health Dashboard Guide — Mode 5

**Purpose:** Produce a cross-dimensional health dashboard for the codebase.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Analysis Process

### Step 1: Run Lightweight Scan Across Four Dimensions

For each dimension, run an abbreviated scan using the decay-risks definitions
from `_shared/`. Do NOT read the individual mode guide files — use the abbreviated
checklists below. Cap each dimension at 3 findings; for Debt: cap at 2 per risk code and 3 across all risk codes.

If the task supplies an already adjudicated, capped finding ledger and requests
its dashboard, use that ledger for Step 2. Do not add findings, infer missing
diagnoses, or imply that a source scan was performed. For source diagnosis,
separate demonstrated contract violations from missing facts: an input domain or
upstream validation precondition is not itself a local validation obligation.
Keep unresolved extra allegations outside the scored finding ledger and explain
the missing fact and the alternative verdicts.

**PR dimension (if changes exist):**
- Apply Auto Scope Detection (common.md)
- Scan for R2 (Change Propagation) and R1 (Cognitive Overload) in the diff

**Architecture dimension:**
- Gather codebase context: read top-level structure, entry points, import statements
- Draw a Mermaid dependency graph (follow standard graph rules from common.md)
- Scan for R5 (Dependency Disorder): circular deps, upward flows, fan-out > 5
- INCLUDE the Mermaid graph in output

**Debt dimension:**
- Scan for all six decay risks (R1-R6) across the codebase
- Skip Pain × Spread scoring (use severity tier only)

**Test dimension:**
- Build the Test Suite Map (unit/integration/E2E counts)
- Scan for T1 (Test Obscurity) and T2 (Test Brittleness) in test files

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
| Debt | 0.25 | 0.25 / 0.75 = 1/3 |
| Test | 0.20 | 0.20 / 0.75 = 4/15 |

**Score rules (must be deterministic — two runs on the same codebase must agree):**

- Each dimension's score is computed from the **capped** finding set shown in the dashboard
  (the cap at Step 1 bounds both what is displayed and what is deducted — do not deduct for
  findings beyond the cap).
- Floor each dimension score at 0 **before** weighting.
- A dimension with no findings scores **100** — it is never skipped. The **only** dimension
  ever omitted is PR, and only when no diff exists (its weight is then redistributed above).
- Round the weighted composite to the nearest integer (half-up).

Use one calculation ledger for the entire report:

1. Resolve the configured strictness and count each retained severity per
   dimension. Calculate `score = max(0, 100 - total deductions)` from that ledger.
   An unassessed dimension is unknown, not a zero-finding dimension; suppress an
   incomplete composite rather than silently assign 100 or drop its weight.
2. Use equivalent integer weights PR 25, Architecture 30, Debt 25, Test 20.
   Sum `N = Σ(weight × dimension score)` and `D = Σ(retained weights)`.
   Thus D is 100 with PR or 75 without PR. Keep N/D exact through the calculation;
   never reuse rounded display percentages as weights.
3. Round once: `composite = floor((2*N + D) / (2*D))`. Verify the weighted sum
   against its component products and confirm the result lies between the
   smallest and largest retained dimension scores. When permitted and available,
   use a calculator or small deterministic calculation; never claim tool execution
   when it was unavailable. Text-only work must still show checkable arithmetic.
4. Finish this ledger **before drafting the report**. Emit the rounded composite
   in exactly one `Composite Score:` line; do not independently restate it in a
   heading, recommendation or summary. A matching headline does not excuse an
   incorrect intermediate calculation.

**Render from the ledger, not from a provisional headline.** When Node.js execution
is available and permitted, read `score-ledger.md` and use the bundled
`scripts/score-dashboard.mjs` to render the canonical score block. Copy it unchanged
into the report, then run its `check` command against the final report. The helper
validates capped ledger structure, calculates the scores and checks block integrity;
it does not verify the diagnosis or unrelated prose. Resolve its path from this
skill's directory. Do not silently fall back after a validation error: correct the
ledger from evidence and rerun.
For an already adjudicated, capped supplied ledger with severities but no risk
codes, use the helper's explicit supplied-ledger form described in `score-ledger.md`;
retain missing risk codes and disclose any per-risk cap that cannot be verified.
Do not invent diagnoses just to satisfy the helper's ordinary input schema.

**Text-only fallback (no extra file or execution required):** use the four ledger
steps above. Complete deductions, dimension scores, each integer-weight product,
their sum N and denominator D before writing the score line. Check the products
and sum in reverse, then apply the half-up formula once. Output one block containing
the final `Composite Score:` line, a table with columns `Dimension`, `Score`,
`Deduction`, `Retained findings` (IDs or brief ledger references), and the explicit
weighted products and exact N/D fraction. Show skipped PR as `Skipped (no diff)`;
show unassessed dimensions as `Unassessed`, not 100. When a required dimension is
unassessed or the arithmetic cannot be verified, omit the numeric composite and
use `Composite unavailable` with the reason. Do not restate the rounded total
outside that single line. State that no tool verification was performed; do not
claim the bundled helper ran. This fallback is complete within this guide.

### Step 3: Output Dashboard

Use the dashboard report template below instead of the standard common.md template.
Insert the completed score block once; do not draft a separate score line ahead of
it. Outside the block, explain findings and recommendations without repeating the
composite. Remove a contradictory draft instead of appending a second, corrected
total. If verification is incomplete, report that limitation without a numeric
composite. This output procedure reduces score drift; only real model evaluation
can establish whether a model follows it consistently.

---

## Dashboard Report Template

````markdown
# Brooks-Lint Health Dashboard

**Mode:** Health Dashboard
**Scope:** [project name or directory]
[Canonical score block from the completed ledger, including its single
Composite Score line, dimension table and exact weighted calculation;
or Composite unavailable with the incomplete dimension table.]

## Module Dependency Graph
[Mermaid graph from architecture scan]

## Top Findings (max 5 across all dimensions)
[Standard Iron Law format, with Critical / Warning / Suggestion explicitly in each finding title, sorted by severity]

## Recommendation
[One paragraph: what to fix first, which dimension needs the most attention,
 suggest running the full individual skill for the worst dimension]
````
