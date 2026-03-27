# Architecture Audit Guide — Mode 2

**Purpose:** Analyze the module and dependency structure of a system for decay risks that
operate at the architectural level. Every finding must follow the Iron Law:
Symptom → Source → Consequence → Remedy.

**Monorepo note:** Treat each deployable service or library as a top-level module. Draw
dependencies between services, not between their internal packages. Apply the Conway's Law
check at the service ownership level. Within a single service, apply standard module-level analysis.

---

## Analysis Process

Work through these five steps in order.

### Step 1: Draw the Module Dependency Map

Before evaluating any risk, map the dependencies in this format:

```
[ModuleA] ──► [ModuleB]     (depends on)
[ModuleA] ──► [ModuleC]
[ModuleB] ──► [ModuleD]
[ModuleC] ──► [ModuleD]

Circular: [ModuleX] ──► [ModuleY] ──► [ModuleX]  ⚠️
```

Rules:
- Arrows point FROM the depending module TO the dependency
- Group by layer: UI → Domain → Infrastructure (arrows should generally flow downward)
- Mark circular dependencies with ⚠️
- Note any module with fan-out greater than 5 (imports from more than 5 others)

### Step 2: Scan for Dependency Disorder

*The most architecturally consequential risk — scan this first.*

Look for:
- Circular dependencies (any ⚠️ in the map above)
- Arrows flowing upward (high-level domain depending on low-level infrastructure)
- Stable, widely-depended-on modules that import from frequently-changing modules
- Modules with fan-out > 5
- Absence of a clear layering rule (no consistent answer to "what depends on what?")

### Step 3: Scan for Domain Model Distortion

Look for:
- Do module names match the business domain vocabulary?
- Is there a layer called "services" that contains all the business logic while domain objects
  are pure data structures?
- Are there modules that cross bounded context boundaries (e.g., billing logic in the user module)?
- Is there an anti-corruption layer where external systems interface with the domain?

### Step 4: Scan for Remaining Four Risks

Check each in turn:

**Knowledge Duplication:**
- Are there multiple modules implementing the same concept independently?
- Does the same domain concept appear under different names in different modules?

**Accidental Complexity:**
- Are there entire layers in the architecture that do not add value?
- Are there modules whose responsibility cannot be stated in one sentence?

**Change Propagation:**
- Which modules are "blast radius hotspots"? (A change here requires changes in many other modules)
- Does the dependency map reveal why certain features are slow to develop?

**Cognitive Overload:**
- Can the module responsibility of each module be stated in one sentence from its name alone?
- Would a new developer know which module to add a new feature to?

### Step 5: Conway's Law Check

After the six-risk scan, assess the relationship between architecture and team structure:

- Does the module/service structure reflect the team structure?
  (Conway's Law: "Organizations design systems that mirror their communication structure")
- If yes: is this intentional design or accidental coupling?
- A mismatch that causes cross-team coordination overhead for every feature is 🔴 Critical.
- A mismatch that is theoretical but not yet causing pain is 🟡 Warning.
- If team structure is unknown, note this as context missing and skip the check.

---

## Applying the Iron Law

For every finding identified above, write it in this format:

```
**[Risk Name] — [Short title]**
Symptom: [the exact structural evidence — reference module names from the dependency map]
Source: [Book title — Principle or Smell name]
Consequence: [what architectural consequence follows if this is not addressed]
Remedy: [concrete architectural action]
```

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: Architecture Audit
Scope: the project or directory audited.

Include the dependency map as a code block in the report before the Findings section,
labeled "Module Dependency Map".
