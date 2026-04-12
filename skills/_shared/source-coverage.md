---
books:
  - The Mythical Man-Month
  - Code Complete
  - Refactoring
  - Clean Architecture
  - The Pragmatic Programmer
  - Domain-Driven Design
  - A Philosophy of Software Design
  - Software Engineering at Google
  - xUnit Test Patterns
  - The Art of Unit Testing
  - Working Effectively with Legacy Code
  - How Google Tests Software
---

# Source Coverage Matrix

Use this file after selecting a mode and before writing findings.
It exists to prevent shallow "book-name citation" reviews.

## Review Discipline

- Cite a book only when the observed symptom actually matches that book's principle.
- A threshold crossing is a hint, not a verdict. Check context, intent, and blast radius.
- Look for justified tradeoffs before flagging a smell as debt.
- Prefer concrete architectural or domain consequences over abstract style complaints.
- If two books pull in different directions, state the tradeoff instead of pretending there is no tension.

---

## Frederick Brooks — *The Mythical Man-Month*

**Encoded today**
- Change propagation as communication overhead
- Second-System Effect
- Conceptual Integrity

**Do not ignore**
- Whether the design shows a single coherent idea or competing local optimizations
- Whether cross-team coordination cost is becoming part of feature cost

**Do not over-flag**
- Large systems are not automatically second systems
- Multi-module designs are acceptable when they preserve conceptual integrity

**Questions to ask**
- Does this design make the team coordinate more than the feature deserves?
- Does one coherent policy drive the structure, or did modules accrete independently?

---

## Steve McConnell — *Code Complete*

**Encoded today**
- Routine length, nesting, naming, and magic numbers
- Construction-phase YAGNI checks
- Defensive programming and error-handling discipline (guard clauses, input validation,
  explicit error paths, assertions for invariants)

**Do not ignore**
- Whether low-level readability choices compound into operational risk
- Whether missing error handling makes failure modes invisible to maintainers

**Do not over-flag**
- Small, explicit guard clauses are not cognitive overload
- A long routine may be acceptable when it is linear, well-named, and single-purpose

**Questions to ask**
- Would a maintainer understand the happy path and failure path without tracing every branch?
- Are constants and names carrying their share of the explanatory load?

---

## Martin Fowler — *Refactoring*

**Encoded today**
- Long Method, Long Parameter List, Message Chains
- Shotgun Surgery, Divergent Change, Feature Envy, Inappropriate Intimacy
- Duplicate Code, Speculative Generality, Lazy Class, Middle Man, Data Class
- Flag Arguments: boolean parameters that split a function into two behaviors
- Primitive Obsession: domain concepts expressed as raw primitive types instead of value types

**Do not ignore**
- Whether the code smell is local or systemic
- Whether a refactoring target has a natural home in the model

**Do not over-flag**
- Temporary duplication during an active extraction is not always debt
- A data-focused structure is acceptable when it is intentionally a DTO or boundary record

**Questions to ask**
- What specific refactoring would reduce the risk here?
- Is the smell a stable design problem or a short-lived transition state?

---

## Robert C. Martin — *Clean Architecture*

**Encoded today**
- DIP, ADP, SDP, SAP, and layering direction
- ISP: fat interfaces that force callers to depend on methods they do not use
- LSP: subclasses that break the behavioral contract of their parent type
- SRP and OCP: classes with multiple reasons to change; modules closed to modification
  but open to extension via abstraction

**Do not ignore**
- Policy vs detail boundaries
- Whether dependency arrows preserve replaceability and testability

**Do not over-flag**
- Composition roots may depend on concrete infrastructure by design
- Thin adapter layers can import both directions when they are explicitly boundary glue

**Questions to ask**
- Is business policy insulated from framework and infrastructure details?
- Is this dependency a boundary violation or an intentional assembly point?

---

## Andrew Hunt & David Thomas — *The Pragmatic Programmer*

**Encoded today**
- Orthogonality
- DRY
- Law of Demeter

**Do not ignore**
- Whether knowledge duplication is really duplicated decision-making
- Whether coupling is accidental or a deliberate local simplification

**Do not over-flag**
- Similar code in different bounded contexts is not automatically a DRY violation
- Direct object access inside a cohesive aggregate is not always a Demeter problem

**Questions to ask**
- If one rule changes, how many places must a human remember to edit?
- Does this dependency leak knowledge across an unnecessary boundary?

---

## Eric Evans — *Domain-Driven Design*

**Encoded today**
- Ubiquitous Language
- Bounded Context
- Anemic Domain Model
- Entity vs Value Object: objects with identity and lifecycle vs. objects defined solely by
  their attributes (Money, Email, Address should be immutable value types, not mutable entities)
- Aggregate Roots: who owns the invariant boundary; cross-aggregate access only through the root

**Do not ignore**
- Aggregate boundaries, invariant ownership, and anti-corruption layers
- Whether names match the business language used by experts

**Do not over-flag**
- CRUD-heavy workflows may legitimately use transaction scripts
- Thin entities are acceptable when the domain itself is simple

**Questions to ask**
- Where do the business invariants live today?
- Are cross-context translations explicit, or is foreign terminology leaking inward?

---

## John Ousterhout — *A Philosophy of Software Design*

**Encoded today**
- Deep vs shallow modules
- Strategic vs tactical programming
- Information Leakage: a design decision encoded in more than one module, creating
  change coupling even when no explicit import exists between the modules

**Do not ignore**
- Interface complexity relative to hidden complexity
- Whether repeated tactical patches are raising long-term cognitive load
- Whether a "helper" exposes internal design decisions that callers should not know

**Do not over-flag**
- Internal implementation complexity is fine when the interface stays simple
- A small wrapper is acceptable when it meaningfully absorbs volatility

**Questions to ask**
- Is this module buying simplicity for its callers?
- Are we paying complexity now to avoid repeating it everywhere else later?

---

## Titus Winters, Tom Manshreck, Hyrum Wright — *Software Engineering at Google*

**Encoded today**
- Hyrum's Law
- Dependency management and upgrade blockage
- Code sustainability: whether code as written can be maintained, migrated, and upgraded
  over a multi-year horizon without heroic effort
- Backward compatibility: whether API changes preserve existing callers or force
  coordinated upgrades across the organization

**Do not ignore**
- De facto APIs created by observable behavior
- The maintenance cost of exposing too much surface area
- Whether the dependency graph will allow independent upgrades over time

**Do not over-flag**
- A stable public API is not a liability if it is intentionally supported
- Fan-out alone is not disorder when dependency policy is explicit and governed

**Questions to ask**
- What behavior are callers relying on beyond the declared contract?
- Will this dependency choice make future upgrades or migrations organizationally expensive?

---

## Gerard Meszaros — *xUnit Test Patterns*

**Encoded today**
- Assertion Roulette, Mystery Guest, General Fixture
- Eager Test, Lazy Test, Test Code Duplication, Behavior Verification
- Erratic Test: tests that produce non-deterministic results due to shared state,
  time dependence, or ordering assumptions between tests

**Do not ignore**
- Whether test failures are diagnosable
- Whether the suite shape amplifies maintenance cost

**Do not over-flag**
- Multiple assertions are acceptable when they express one behavior with one failure story
- Shared fixtures are acceptable when every field is relevant to the scenario

**Questions to ask**
- Would a failing assertion tell the reader what behavior regressed?
- Is the test pattern clarifying the behavior or obscuring it?

---

## Roy Osherove — *The Art of Unit Testing*

**Encoded today**
- Test naming discipline
- Test isolation
- Mock usage guidelines
- Completeness of edge-path tests

**Do not ignore**
- Whether tests verify behavior rather than wiring
- Whether seams are used to simplify tests, or production code is being contorted for testability

**Do not over-flag**
- A mock is acceptable when the dependency is nondeterministic and the assertion still verifies behavior
- Naming conventions are guidance; clarity is the goal

**Questions to ask**
- Does this test fail only when behavior breaks?
- Are mocks serving the test, or is the test serving the mocks?

---

## Michael Feathers — *Working Effectively with Legacy Code*

**Encoded today**
- Legacy code as code without tests
- Sensing and Separation
- Seams
- Characterization Tests

**Do not ignore**
- Whether the team can change a risky area safely today
- Whether the code offers any seam for isolating behavior under change

**Do not over-flag**
- Untested code is not automatically legacy if it is stable and not under active change
- Characterization tests are most important before modifying unclear existing behavior

**Questions to ask**
- If this module changed tomorrow, how would the team prove it still works?
- What seam could be introduced with the lowest risk?

---

## Google Engineering — *How Google Tests Software*

**Encoded today**
- Change coverage vs line coverage
- Pyramid shape and suite portfolio economics

**Do not ignore**
- Whether the suite reflects business risk, not just percentages
- Whether expensive tests dominate feedback loops

**Do not over-flag**
- A non-70:20:10 ratio can be healthy when justified by platform constraints or product risk
- High coverage is useful when paired with meaningful branch and change protection

**Questions to ask**
- Does this suite spend effort where failures are most expensive?
- Are coverage numbers hiding important untested change paths?
