# Architecture Audit Guide — Mode 2 Framework

**Core principle:** Architecture reveals intent. Before scoring, draw the dependency graph — it makes violations visible that prose descriptions hide.

**Monorepo note:** In a monorepo, treat each deployable service or library as a top-level module in the dependency map. Draw dependencies between services (not between their internal packages). Apply the Conway's Law check at the service ownership level, not the file level. Within a single service, apply the standard module-level analysis.

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

**Essential vs Accidental Complexity (architecture level):**
- 5: The dependency graph reflects the problem domain. Framework and infrastructure choices are invisible — they serve the domain without imposing their structure on it.
- 3: Infrastructure overhead is noticeable but domain logic remains the primary concern.
- 1: Infrastructure or framework constraints dominate the architecture. Developers spend more time satisfying the framework than solving the actual problem.

**Throwaway Readiness (architecture level):**
- 5: Every module is replaceable independently. Clear interface contracts at all boundaries. Critical paths have test coverage sufficient to verify a replacement.
- 3: Core modules are replaceable; integration and infrastructure modules are more tightly coupled.
- 1: No module can be replaced without cascading changes throughout the system. Interfaces are absent or tightly implementation-coupled.

**Tar Pit Score (architecture level):**
- 5: No "forbidden zones." All modules have active ownership. Architectural documentation matches current implementation.
- 3: Some accumulated cruft (deprecated modules still in the dependency graph, orphaned services). No truly untouchable areas.
- 1: Significant portions of the architecture are effectively frozen — too risky to modify because no one understands them or tests cover them.

**Documentation Completeness (architecture level):**

Code-level:
- 5: All sampled public interfaces have complete documentation, complex logic has why-comments, new developers can use any module without reading its implementation.
- 3: Main interfaces documented; edge cases or complex logic partially missing.
- 1: Almost no documentation; understanding any module requires reading its implementation.

Architecture-level:
- 5: ADRs complete and consistent with current implementation; cross-team interfaces have spec documents; README describes current architecture.
- 3: Partial ADR coverage or lagging; key interfaces have some description.
- 1: No ADRs, no interface specs; README describes historical architecture or doesn't exist.

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

---

## Step 5: Conway's Law Check

**Prerequisite:** This section requires team structure information from the user. If not yet provided, request it once:
> "The Conway's Law check requires understanding your team structure. Please briefly describe: which teams own which modules? For example: 'Frontend team owns UI/, platform team owns core/ and api/'"

If the user explicitly states they cannot provide this or do not need this check, skip this section and note at the end of the report: "Conway's Law check skipped (team structure not provided)."

---

### 5a. Structural Alignment

Compare the team boundaries described by the user against the code module boundaries:

- Do team boundaries align with module boundaries?
  - ✅ Aligned: each team owns a clear, independent set of modules
  - ⚠️ Partial: some modules are co-maintained across teams
  - ❌ Misaligned: core modules are modified by multiple teams

- Is the cross-team dependency direction reasonable?
  - ✅ Unidirectional (Team A's modules depend on Team B's modules, not vice versa)
  - ❌ Bidirectional (A depends on B, B depends on A → implies very high cross-team coordination cost)

### 5b. Tower of Babel Risk Assessment

Brooks identifies in Ch.7 two root causes of the Tower of Babel's failure:

**1. No common language** (as seen in code):
- Do cross-team interfaces have a unified data format / protocol specification?
- Do modules from different teams use different naming conventions or error-handling strategies?
- Are there cases where one team defines an interface and another team implements it according to their own interpretation?

**2. No organization** (as seen in code):
- Are there "ownerless modules" (shared code no team is clearly responsible for)?
- Do cross-team changes require coordinating multiple teams to complete a single feature?
- Are there modules left unmaintained long-term because no one knows who to contact?

### 5c. Report Output Format

Append to the end of the Architecture Audit report:

```
## Conway's Law Check

**Team Structure:** [description provided by user]
**Structural Alignment:** ✅ Good / ⚠️ Partial issues / ❌ Severe misalignment

| Check | Status | Finding |
|-------|--------|---------|
| Team boundaries ↔ module boundaries | ✅/⚠️/❌ | [one-line description] |
| Cross-team dependency direction | ✅/⚠️/❌ | [one-line description] |
| Common language (interface specs) | ✅/⚠️/❌ | [one-line description] |
| Ownerless module risk | ✅/⚠️/❌ | [one-line description] |

**Tower of Babel Risk Level:** Low / Medium / High
[2-3 sentences summarizing the most critical findings]
```
