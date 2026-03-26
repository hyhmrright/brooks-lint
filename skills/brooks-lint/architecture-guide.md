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
