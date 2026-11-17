# Tech Debt Assessment Guide — Mode 3

**Purpose:** Identify, classify, and prioritize technical debt across the entire codebase.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Evidence Gathering

If you have insufficient evidence to assess the codebase, ask the user ONE question —
choose the single question most relevant to what you already know:

1. "Which part of the codebase takes the longest to modify for a typical feature?"
2. "Which module do developers avoid touching, and why?"
3. "Which parts of the system have the fewest tests and the most bugs?"
4. "Is there a module that only one person fully understands?"

After one answer, proceed. Do not ask more than one question.
If the user declines or says they don't know, proceed with available evidence and note
which areas could not be assessed.

---

## Analysis Process

Work through these four steps in order.

### Step 1: Full Decay Risk Scan

Scan for all six decay risks within the requested scope; label sampling and omitted
areas. List every finding before scoring
any of them. This prevents anchoring on early findings and missing systemic patterns.

For each risk, look for:

**Cognitive Overload:** Are there widespread naming problems, deeply nested logic, or
excessively long functions spread across many modules?

**Change Propagation:** Which modules cause the most ripple effects when changed?
Are there modules that everyone must modify when adding a new feature?

**Knowledge Duplication:** How many times is the same concept implemented independently?
Is the domain vocabulary consistent across the codebase?

**Accidental Complexity:** Are there architectural layers or abstractions that add no value?
Is the infrastructure overhead proportional to the problem being solved?

**Dependency Disorder:** Are there dependency cycles? Does domain logic depend on infrastructure?
Are there modules with no clear layering position?

**Domain Model Distortion:** Is business logic in the right layer?
Do code names match business names? Are domain objects anemic?

For Knowledge Duplication, distinguish multiple owners of the same decision from
similar mechanics governed by independent policies. A re-export or delegate to one
authoritative implementation is not another owner. State the shared requirement
and a concrete one-sided change: what changes in one place, what remains unchanged,
and which observable result or required coordination demonstrates the burden.
Include a runnable comparison or precise checks when feasible, labeling predicted
outcomes honestly. Repeated syntax and the possibility of hypothetical future
divergence alone do not establish debt; keep optional consolidation unscored when
its maintenance obligation or benefit is not established. Do not couple unrelated
policies merely to remove visually similar code.

### Step 2: Score Each Finding with Pain × Spread

After listing all findings, score each one using observed change history, supplied
maintenance evidence or a concrete traced change obligation. Cite the basis for
each factor; file count alone does not establish frequency, effort or team impact.
If Pain or Spread cannot be established, mark that factor and the product `unknown`;
do not assign 1, invent a precise rank, or discard supported findings elsewhere.
If a bounded factor range is justified, show its priority range and leave overlapping
ranks tied pending the fact that distinguishes them. Do not manufacture estimates.

**Pain score (1–3):** How much does this slow down development today?
- 3: Developers actively avoid touching this area; it causes bugs on most changes
  *(e.g., "nobody wants to touch the billing module because it always breaks something")*
- 2: This area is noticeably slower to work in than the rest of the codebase
  *(e.g., "adding a field takes 2–3x longer here than elsewhere")*
- 1: This is a quality issue but not currently causing active pain
  *(e.g., "inconsistent naming, but we always know what we mean")*

**Spread score (1–3):** How many files, modules, or developers does this affect?
- 3: Affects 5+ modules or all developers on the team
  *(e.g., "every new feature touches the God class in core/")*
- 2: Affects 2–4 modules or a subset of the team
  *(e.g., "the auth and notification modules are tightly coupled")*
- 1: Isolated to one module or one developer's area
  *(e.g., "legacy parser that only one person maintains")*

**Priority = Pain × Spread** (max 9)

| Priority | Classification | Action |
|----------|---------------|--------|
| 7–9 | Critical debt | Address in next sprint |
| 4–6 | Scheduled debt | Plan within quarter |
| 1–3 | Monitored debt | Log and watch |

These are debt-work priority classifications, not finding severity overrides.
Assign each finding's severity under `common.md` Severity Calibration; a high
Pain × Spread score alone does not establish Critical impact.

### Step 3: Classify Debt Intent

After scoring, classify each finding's intent where the evidence supports it:

**Intentional debt** — a conscious shortcut taken to meet a deadline, with the expectation
of paying it back. The team knows about it. It may be legitimate (a strategic prototype,
a known temporary workaround during a migration).

**Accidental debt** — degradation that accumulated without a deliberate decision: the team
did not choose it and may not even know it exists. This is the kind Ward Cunningham's
original definition warned against — not a tactical trade-off, but structural erosion.

Mark intent as `[intentional]`, `[accidental]`, or `[unknown]`, citing the decision
record or supplied history. Missing documentation does not prove accidental origin;
known intentional debt with no repayment plan remains intentional with that missing
plan noted. Intent is context, not a priority override. Rank observed pain and spread,
then stated deadlines, dependency constraints and feasible repayment cost; do not
prefer low-impact accidental debt over a costly intentional burden merely by label.
Unknown intent alone does not block an otherwise supported priority.

### Step 4: Group by Decay Risk

Report findings grouped by risk type, not by file or module.
Use risk grouping for navigation, not scheduling: an average across a risk category
can hide the highest-impact individual item. Order the actionable findings first;
keep unknown priorities visible with the one fact needed to compare them.
Grouping by risk reveals systemic patterns:
- "Change Propagation is systemic" → architectural intervention needed
- "Cognitive Overload is isolated" → localized refactoring sufficient

---

## Output

Use the standard Report Template from `../_shared/common.md`. Mode: Tech Debt Assessment.

After Findings, append a Debt Summary Table. Compute Avg Priority only from fully
known factors and show the known/total count alongside it; use `unknown` if none
are known. Do not replace unknown factors with zero or hide them in an average.
Mixed intent and priority classifications remain explicit, not forced into one label.

```
## Debt Summary
| Risk | Findings | Avg Priority (known/total) | Classification | Intent |
|------|----------|-------------|----------------|--------|
| Cognitive Overload      | N | X.X | Monitored/Scheduled/Critical | intentional/accidental/unknown |
| Change Propagation      | N | X.X | ... | ... |
| Knowledge Duplication   | N | X.X | ... | ... |
| Accidental Complexity   | N | X.X | ... | ... |
| Dependency Disorder     | N | X.X | ... | ... |
| Domain Model Distortion | N | X.X | ... | ... |

**Recommended next action:** [finding ID, evidence-backed priority or unresolved tie,
 smallest repayment step, required dependency/authority, and a check that it reduces
 the demonstrated coordination/change burden without coupling independent policies]
```
