# Health Dashboard Guide — Mode 5

**Purpose:** Produce a cross-dimensional health dashboard for the codebase.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Analysis Process

### Step 1: Run Lightweight Scan Across Four Dimensions

Build the uncapped candidate inventory before choosing the scoring view. Retain
the most severe supported, independent causes first; break equal-severity ties by
observed impact, then stable finding ID. Do not let discovery order decide which
findings count. This is a capped dashboard, not an exhaustive safety score. State that its scores
cover the declared scope and abbreviated checks below; an assessed 100 means no
retained deductions under those checks, not all possible risks were excluded.

For each dimension, run an abbreviated scan using the decay-risks definitions
from `_shared/`. Do NOT read the individual mode guide files — use the abbreviated
checklists below. Cap scored findings at 3 per dimension. For Debt, cap scored
findings at 2 per risk code and 3 across all risk codes.

If the task supplies an already adjudicated, capped finding ledger and requests
its dashboard, use that ledger for Step 2. Do not add findings, infer missing
diagnoses, or imply that a source scan was performed. For source diagnosis,
separate demonstrated contract violations from missing facts: an input domain or
upstream validation precondition is not itself a local validation obligation.
Keep unresolved extra allegations outside the scored finding ledger and explain
the missing fact and the alternative verdicts.

**Dimension admission gate — scope before status:** fix the assessment boundary
from the user's request before scanning. A supplied snapshot or named directory
bounds all four scans; use the whole project only when that is the requested or
auto-detected scope. Do not expand a bounded request to project-wide assurance,
or shrink an incomplete project scan after the fact to obtain a score.

Build one compact evidence map per dimension:
`declared scope → inspected inputs → governing obligation → remaining blocker`.
Then complete the applicable scan below and choose its status:

| Evidence in the declared scope | Status and reporting |
| --- | --- |
| Relevant source/inventory and obligations permit the dimension's scan; no material question remains | `assessed`, with retained findings or an empty list after a clean scan. Explicitly limit the conclusion to that scope. |
| A named missing fact can change that dimension's verdict or prevent its scan | `unassessed`, with that fact and the competing outcomes it leaves open. Preserve supported observations in prose, without a numeric dimension score. |
| No PR diff | PR alone is `skipped`; this is not a status for other dimensions. |

**Local sufficiency is not global completeness.** A complete local module and
relationship inventory plus the supplied responsibilities can support a bounded
Architecture scan; a separate architecture policy document is not mandatory.
Inspect the listed dependencies and boundaries, and state which were checked.
A complete local maintenance inventory, source and ownership/change obligations
can likewise support a Debt scan. Present, demonstrated change burden is enough;
unknown historical intent alone does not block it. Explicit independent ownership
can support a clean local duplication assessment. Do not demand hypothetical
additional layering or maintenance obligations just because the scan is small.

Conversely, a bare import edge or a correct function result does not establish
Architecture or Debt coverage. A test excerpt or discovery result without assertion
bodies does not establish Test coverage. “No finding was reported” and “this looks
simple” are not completed scans. A declaration that an inventory is complete
bounds the supplied scope; still inspect its contents and resolve contradictions.
If a necessary ownership rule is actually missing, keep that dimension unassessed
rather than inventing the rule or marking it assessed to retain a numeric total.

Evaluate Test against the supplied behavior obligations and complete inventory,
not every conceivable input or behavior. For example, a complete inventory with
assertions distinguishing a stated limit can be assessed for that limit even when
unrelated validation policy is unknown. A test name alone cannot show that its
assertions distinguish the behavior. When only Test is blocked, keep completed
Architecture and Debt assessments; missing evidence in one dimension does not
propagate automatically to the others. Any unassessed required dimension still
suppresses the composite under Step 2.

Assign each causal finding one scoring owner across the passes; separately
supported mechanisms remain distinct even if their remedies overlap. Classify by
the risk definitions, not by convenient code numbers. A local validation failure
does not establish architectural decay without a boundary/dependency mechanism;
a test-protection gap belongs to Test. If no dimension has sufficient assessment
evidence for an established local defect, keep it as an unscored observation. The
helper does not accept findings on an unassessed dimension. Do not invent a scored
owner to fit the arithmetic schema.

**PR dimension (if changes exist):**
- Apply Auto Scope Detection (common.md)
- Scan for R2 (Change Propagation) and R1 (Cognitive Overload) in the diff

**Architecture dimension:**
- Gather context within the declared scope: inspect its module inventory, entry
  points, responsibilities and imports; identify what is complete versus omitted
- Draw a Mermaid dependency graph (follow standard graph rules from common.md)
- Scan for R5 (Dependency Disorder): verify cycles and forbidden dependency
  directions against responsibilities; fan-out > 5 is an inspection cue, not a finding
- INCLUDE the Mermaid graph in output

**Debt dimension:**
- Scan for all six decay risks (R1-R6) across the declared scope, using its
  supplied ownership and change obligations
- Skip Pain × Spread scoring (use severity tier only)

**Test dimension:**
- Build the Test Suite Map (unit/integration/E2E counts)
- Scan for T1 (Test Obscurity) and T2 (Test Brittleness) in test files
- Check supplied explicit behavior obligations against that inventory for a
  demonstrated T5 protection gap; distinguish a complete inventory from an excerpt

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

**Score rules (the same resolved ledger must produce the same scores):**

- Compute each dimension's score from the **capped** set under Findings used in
  scoring. Report supported findings beyond the cap under Additional observations
  without deducting for them.
- Floor each dimension score at 0 **before** weighting.
- A completed, **assessed** dimension with no findings scores **100**. An
  unassessed dimension has no numeric score and prevents a numeric composite.
  The **only** dimension ever skipped is PR when no diff exists (its weight is
  then redistributed above); missing evidence never redistributes weight.
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

**Establish execution capability before finalization:** inspect the tools actually
exposed in this session and the task's execution policy. A shell capability and a
host scoring capability are separate routes: disabled code-mode or absent shell
does not by itself establish that a directly exposed scorer is unavailable. Use
the exposed scorer's actual schema; do not invent a tool name or wrapper. When a
required scorer is exposed, attempt it and preserve its result or exact failure.
If no route is exposed, report that observation narrowly, without claiming an
attempt occurred or attributing a backend cause. Do not report a completed scoring
workflow without a successful receipt. An explicit tool-required task cannot be
satisfied by the text-only fallback: deliver the evidence and ledger, omit the
numeric composite, and mark finalization incomplete.

**Required tool-enabled path:** when the bundled Node.js helper or a host scoring
tool is available and permitted, read `score-ledger.md` and use its
`finalize` → `check-report` workflow. Complete one ledger from the capped findings,
then write a score-free report draft with exactly one
`<!-- BROOKS_HEALTH_SCORE -->` placeholder. The helper inserts the canonical block;
do not copy a separately calculated total into the draft. The host equivalent may
accept `{ledger, draft}` and return the finalized report and verification receipt;
it must invoke the same exported finalizer and verifier. No shell is necessary
when that host tool is exposed.

Keep the ledger, draft, final report and receipt together. Check the **final report
bytes** against the **same ledger**, then deliver that artifact unchanged. If the
report or ledger changes, finalize and check again before delivery. Do not rewrite
or summarize the total after verification. Put all explanation, scope limitations,
graphs, and findings into the score-free draft **before** calling the finalizer.
For a host result containing `finalReport`, return that entire string as the health
report, not just its score block; do not add a preface, footer, or reconstructed
table afterward. If an explanation was omitted, update the draft and finalize it
again. A successful receipt for an earlier draft does not cover the delivered edit.
Resolve the helper from this skill's directory rather than an assumed project
path. Do not silently fall back after a
validation error: correct the ledger from evidence or remove score restatements
from the draft and rerun. If execution fails or the ledger cannot be established,
report the limitation and omit the numeric composite.

For an already adjudicated, capped supplied ledger with severities but no risk
codes, use the helper's explicit supplied-ledger form described in `score-ledger.md`;
retain missing risk codes and disclose any per-risk cap that cannot be verified.
Do not invent diagnoses just to satisfy the helper's ordinary input schema.
The checker verifies arithmetic and conventional duplicate score surfaces; it
cannot prove diagnoses or detect every natural-language paraphrase. Inspect prose
for any remaining restatement of the total before finalization.

**Text-only fallback (execution unavailable or explicitly prohibited):** use the four ledger
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

Treat delivery as a final state transition, not another drafting pass:

1. Reconcile the draft with the ledger: every scored finding ID appears once in
   its owning dimension; every prose claim of a scored finding has a matching
   ledger entry and severity. Unscored observations are explicitly labeled.
2. Confirm each `assessed`, `unassessed`, or skipped status matches the evidence
   map. Resolve contradictions in the inputs before calling the finalizer.
3. Finalize and verify those inputs. Select the successful returned `finalReport`
   as the sole delivery source. Do not regenerate it from remembered content.
4. Preserve terminal newlines as well as visible content. If a delivery field is available, compare its exact content with that returned
   string before sending. A discovered omission sends the workflow back to the
   draft and a new receipt; it never permits an edited report under an old receipt.
   With no comparison capability, copy the returned report without claiming that
   a mechanical delivery check occurred.


When local files or a host adapter permit deterministic delivery, use the delivery
helper documented in `score-ledger.md`: check the candidate against the retained
receipt, or assemble the structured report field directly from the final artifact.
Do not retype a verified report into a fresh draft. A plain chat channel may alter
terminal whitespace; local equality does not prove downstream transport equality.
Report that limit rather than claiming a delivery guarantee. A receipt or checksum
must not be substituted for the requested report itself.


Use the dashboard report template below instead of the standard common.md template.
In tool-enabled work, deliver the finalized, checked report unchanged. In
text-only work, insert the completed score block once; do not draft a separate
score line ahead of it. Outside the block, explain findings and recommendations without repeating the
composite. Remove a contradictory draft instead of appending a second, corrected
total. If verification is incomplete, report that limitation without a numeric
composite. This output procedure reduces score drift; only real model evaluation
can establish whether a model follows it consistently.

---

## Dashboard Report Template

This is the score-free draft template. The finalizer replaces its placeholder
with the canonical score block. In the explicitly text-only fallback, replace
the same placeholder with the verified calculation block before delivery.

````markdown
# Brooks-Lint Health Dashboard

**Mode:** Health Dashboard
**Scope:** [project name or directory]
<!-- BROOKS_HEALTH_SCORE -->

## Module Dependency Graph
[Mermaid graph from architecture scan]

## Findings used in scoring
[Every retained scoring ID, once under its owning dimension, with Iron Law evidence
 and literal severity. Highlight up to five priorities without duplicating findings.]

## Additional observations
[Supported findings beyond the scoring caps, unscored uncertainties and limitations;
 explicitly excluded from deductions, with the reason]

## Recommendation
[One paragraph: what to fix first, which dimension needs the most attention,
 suggest running the full individual skill for the worst dimension]
````
