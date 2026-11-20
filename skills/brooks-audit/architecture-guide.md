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

### Step 7: Verify a Proposed First Refactoring Step

Use this step when the user asks for a concrete refactoring step or the audit
proposes one. Apply it only to the boundary the step would move.

1. Start from the relevant entry points. Follow registrations, factories, injected
   values and deferred callbacks to the implementation actually selected, and cite
   the code or configuration that selects it. Record the evidenced callers in
   scope, then distinguish those the first step changes, those that still work
   through an existing contract, and those deferred or unresolved.
2. Trace the lifecycle of the objects whose ownership or binding will change.
   Identify who creates, retains and releases them, when bindings change, and
   which caller runs in each relevant context. Include strong references,
   teardown and fallback behavior where they can change the cut. Treat an
   unresolved binding that could reverse the recommendation as a condition on
   the step.
3. Choose the smallest independently mergeable step that preserves those
   obligations. For every constraint that affects the cut, cite the evidence and
   an existing executable test or give a minimal runnable check. Use the real
   entry point or binding where the constraint depends on runtime behavior.
   State the setup, command and observable result expected on the baseline and
   candidate, including what would fail if the obligation were broken.
4. For a delivered patch or test file, apply the exact candidate to the intended
   baseline in an authorized workspace or disposable checkout, including any new
   regression tests. Find existing static checks in the project's configuration,
   scripts, or CI. When the environment and scope permit, run the relevant
   regressions and project-declared static checks for the changed source and test
   files, such as type checking or linting. Use the project's configuration and
   pinned tool versions when specified. If a failure may predate the patch,
   compare against the baseline with the same check. Fix introduced failures,
   including syntax errors, collection errors, and static diagnostics, then rerun
   the affected regression and static checks on the exact version you will hand off.
5. If unavailable tooling or dependencies block any of these checks, verify patch
   applicability and use an available compiler or parser to check changed source
   and test files without executing them. Fix syntax errors and repeat the check.
   Report commands and observed results separately from predictions. Name each
   regression, static check, or syntax check that remains unverified and why.
   Make the merge recommendation conditional on outstanding decisive checks.

## Output

Use the Report Template from `../_shared/common.md`, Mode: Architecture Audit.
Place the Mermaid graph first under "Module Dependency Graph", then findings.
Reference graph nodes and concrete edges in each finding; apply colors after
Steps 2–6. When Step 7 applies, include the first step, its caller impact, and its
regression checks with their status. Include only supported local conclusions and
decisive unknowns, not a mandatory recommendation for every scanned risk.
