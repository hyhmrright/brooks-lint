# Architecture Audit Guide — Mode 2

**Purpose:** Diagnose module-level decay. Every finding follows the Iron Law:
Symptom → Source → Consequence → Remedy. Use `common.md` for severity, scoring and
report format and the shared risk definitions for source attribution.

For a monorepo, start with deployable services/libraries and their ownership;
inspect internal packages only within the requested boundary.

## Analysis Process

### Step 0: Gather Codebase Context

Establish the supplied boundary, module responsibilities and available inventory.
Read manifests, entry/composition points, relevant imports and exported interfaces
until the important dependency paths are supported. A directory tree alone does
not establish dependency edges. If sampling is needed, state what was inspected;
do not infer unseen wiring, production reach or team ownership.

Use the declared boundary for a local audit. Missing deployment context limits
exposure claims, not a demonstrated source-level violation. Separate unknown facts
that would reverse the diagnosis from unrelated missing project information.

### Step 1: Draw the Module Dependency Graph (Mermaid)

Draw only evidenced nodes/edges before assigning findings. Nodes are modules or
services; use files as nodes only when they are the supplied module boundary.
Solid arrows point from the depending module to its dependency. Distinguish import
edges from runtime calls/injection, and label unresolved bindings rather than
silently choosing one. Keep import, runtime-call and ownership relations distinct:
a return callback can close a call path without creating an import cycle, and a
composition root can supply an adapter without reversing source ownership. A cycle
claim needs a closed path of the claimed edge kind, with references for each edge.
Group layers where supported; collapse large graphs to
about 50 nodes and identify sampling. Annotate high fan-out as a cue, not a verdict.

Use `graph TD` (or `LR` for pipelines). Mark a confirmed cycle with a labeled dotted
edge. Add colors only after **all** checks: Critical red `#ff6b6b`, Warning yellow
`#ffd43b`, and assessed nodes with no findings or only Suggestions green `#51cf66`.
Leave unassessed nodes explicitly labeled; green is not proof of unseen safety.

### Step 2: Scan for Dependency Disorder

Inspect cycles, unstable dependencies, high fan-out and violated layer boundaries.
For each retained finding, provide a small **edge-and-change witness**:

- cite the depending module's responsibility, the depended-on module and the rule
  governing their relationship;
- trace the active composition/binding, or explicitly limit the claim to source;
- name a concrete policy/adapter change or substitution that crosses this boundary
  and the observable or maintenance consequence;
- specify where an interface/value should be owned, who supplies its implementation,
  and which edges change under the smallest remedy. Preserve required calls/effects.

This is the audit's value beyond listing suspicious imports. A domain module
importing transport differs from a composition root importing both and injecting a
function. A database-like name alone proves neither. If responsibility or binding
would change the verdict, give both interpretations as unscored investigation
items. When a source rule is explicit, score the local violation without inventing
production exposure. High fan-out and lack of a formal layering document alone
are not findings.

### Step 3: Scan for Domain Model Distortion

Compare names and invariant ownership with the domain vocabulary. Inspect logic
crossing bounded contexts, external models leaking into local decisions and data
records whose required invariants have no owner. Show the affected decision;
a services folder, data-only type or absent anti-corruption layer is not sufficient.

### Step 4: Scan for Remaining Four Risks

Use the same evidenced consequence and scoped-remedy discipline:

- **Knowledge Duplication:** show one shared decision and a coordinated change
  that can diverge. Independent policies with similar code are not shared knowledge.
- **Accidental Complexity:** identify a layer's cost and a simpler design that
  preserves its actual obligations; do not assume every small adapter is useless.
- **Change Propagation:** trace the modules that must change for one concrete
  requirement; distinguish necessary feature breadth from misplaced ownership.
- **Cognitive Overload:** identify ambiguous responsibilities or navigation burden
  that obstruct a specific change, rather than inferring difficulty from names alone.

### Step 5: Testability Seam Assessment

A seam permits substituting behavior without editing the subject (Feathers,
*Working Effectively with Legacy Code*, Ch. 4: The Seam Model). Trace the actual
replacement path at database, filesystem and network boundaries.

If a required isolated check cannot substitute the collaborator, identify the
blocked check and the smallest injection/configuration point that enables it.
Distinguish a collapsed seam from a valid composition root or an intentionally
integrated test. Missing interfaces alone do not prove harm. Calibrate severity
from the evidenced testing/change burden; no finding when existing seams suffice.

### Step 6: Conway's Law Check

Check team/module alignment only when ownership is known. Retain a mismatch only
with recurring coordination burden or another demonstrated consequence. Similar
team directories or multiple modules owned by one team are not evidence of such a
problem. A bounded recurring burden normally warrants Warning; Critical requires
serious impact and relevant exposure under `common.md`. Otherwise state the missing
context without inventing a team structure.

## Output

Use the Report Template from `../_shared/common.md`, Mode: Architecture Audit.
Place the Mermaid graph first under "Module Dependency Graph", then findings.
Reference graph nodes and concrete edges in each finding; apply colors after
Steps 2–6. Include only supported local conclusions and decisive unknowns, not a
mandatory recommendation for every scanned risk.
