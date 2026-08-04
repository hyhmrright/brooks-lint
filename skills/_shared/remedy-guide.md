# Remedy Guide — Actionable Fix Mode

**Applies to the diagnostic modes only** (PR Review, Architecture Audit, Tech Debt,
Test Quality, Health Dashboard). They never write to the codebase — `--fix` there
means "make the Remedy specific enough to act on", not "apply it". Full Sweep
(`/brooks-sweep`) is the one mode that edits files; it follows
`brooks-sweep/sweep-guide.md`, which owns its own fix-classification and revert rules.

When `--fix` is active, enhance every finding's Remedy field to be directly actionable:

## Remedy Enhancement Rules

For each finding, the Remedy must include:
1. **Target**: exact file path and function/class name
2. **Action**: specific refactoring operation (e.g., "Extract lines 45-67 into a new
   function `calculateShippingCost(items, config)`")
3. **Rationale**: one sentence explaining why this specific fix (not just "refactor")

## Fixability Classification

Classify each finding after writing the enhanced Remedy:

| Tier | Criteria | Report label |
|------|---------|-------------|
| Quick fix | Single-file, mechanical: rename, extract constant, reorder imports | `[quick-fix]` |
| Guided fix | Requires a design choice: where to split, what interface shape | `[guided]` |
| Manual | Cross-module, needs domain knowledge or team discussion | `[manual]` |

Append the label to the finding title: `**R1 — Long function in OrderService [quick-fix]**`

## Output Addition

After the standard report, add a **Fix Summary** section:

| Finding | Tier | Target File | Action |
|---------|------|------------|--------|
| R1 — Long function | quick-fix | src/order.ts:45 | Extract `calculateTotal()` |
| R5 — Circular dep | manual | src/models/ ↔ src/services/ | Introduce interface boundary |

## What NOT to do
- Do NOT modify any files. Diagnosis + actionable plan is the whole deliverable.
- Do NOT generate diffs or code blocks. The Remedy text IS the deliverable.
- Do NOT re-score. The Health Score reflects current state, not projected state.
