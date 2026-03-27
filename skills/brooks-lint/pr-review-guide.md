# PR Review Guide — Mode 1 Checklist

**Core principle:** Every question in this guide must be answerable by reading the diff. Skip dimensions where all questions clearly answer "no problem" — mark that dimension ✅ and move on.

---

## How to Use

1. Read through the diff or code provided
2. For each dimension, answer the questions below
3. Record findings only where you find problems (score ≤ 3)
4. Use the quick-skip rule: each dimension has a quick-skip condition — if it's clearly satisfied, score that dimension ✅ and move on without reading all the questions

**Auto-generated code:** If the diff contains generated files (protobuf stubs, OpenAPI clients, ORM migrations, lock files, minified bundles), skip those files entirely for all dimensions — generated code reflects tool choices, not developer decisions, and flagging its style or structure produces noise without value. Note in the report which files were skipped and why.

---

## Dimension 1: Conceptual Integrity

**Quick skip:** Are all new names consistent with existing names in the same file? Does error handling match the pattern used elsewhere? If both yes → ✅ skip.

Questions:
- Do new function/variable names follow the same convention as existing ones in this file (verb tense, casing, abbreviation style)?
- Does the new error handling strategy match the existing strategy (same exception types, same error object shape, same use of optionals)?
- If new abstractions are introduced, do they sit at the same level as existing abstractions in this layer?
- Are any new log messages consistent in format with existing log messages?
- Does any new public API follow the same patterns (parameter order, naming) as existing public APIs?

**Score 4-5:** All new code is indistinguishable in style from the surrounding code.
**Score 3:** 1 inconsistency, isolated and low-impact.
**Score 2:** 2+ inconsistencies, or 1 inconsistency in a high-traffic path.
**Score 1:** New code introduces a completely different style that conflicts with the module.

---

## Dimension 2: Module Autonomy

**Quick skip:** Can you understand what each changed function does without looking outside this file? If yes → ✅ skip.

Questions:
- Can you understand the changed code by reading this file alone, without looking up other modules?
- Does any changed function do more than one thing? (Functions named "processAndSave" or "validateAndUpdate" are red flags)
- Does the diff expose internal implementation details through a public interface?
- Does any function take more than 5 parameters? (Suggests it is doing too much or needs a parameter object)
- Is any single function longer than 50 lines after this change?
- Does the change add public methods to a class that are only used within that class? (Should be private)

**Score 4-5:** Each changed function has a clear single purpose. No new coupling introduced.
**Score 3:** Minor responsibility leakage; understandable with moderate context.
**Score 2:** Functions doing multiple things, or significant new coupling introduced.
**Score 1:** The change makes a module meaningfully harder to understand in isolation.

---

## Dimension 3: Essential vs Accidental Complexity

**Quick skip:** Does every new abstraction have at least 2 call sites in the current codebase (including this diff)? If yes → ✅ skip.

Questions:
- Does every new function, class, or interface have at least 2 call sites in the current codebase (including this diff)?
- Is every new configuration option actually used with a non-default value somewhere?
- Could any new indirection layer be removed without losing meaningful capability?
- Is the new code solving the actual problem, or solving a more general problem than required?
- Would a reader immediately understand *why* this layer of abstraction exists?

**Score 4-5:** All complexity is justified by the problem domain.
**Score 3:** 1 unnecessary abstraction, low blast radius.
**Score 2:** Multiple abstractions that add complexity without clarity.
**Score 1:** The change is more complex than the problem it solves.

---

## Dimension 4: Second System Effect

**Quick skip:** Does the change implement only what was asked for? If yes → ✅ skip.

Questions:
- Does the diff contain any code that isn't needed for the current stated requirement?
- Are there any TODO comments suggesting "future flexibility" that isn't required now?
- Are any new interfaces more generic than the current usage requires?
- Does the change add a plugin or extension mechanism where there is currently only one use case?
- Are any new config flags added that only one environment will ever use?

**Score 4-5:** Change does exactly what was asked, nothing more.
**Score 3:** 1 minor over-generalization that doesn't significantly increase complexity.
**Score 2:** Notable YAGNI violation in a core path.
**Score 1:** The change is primarily infrastructure for hypothetical future requirements.

---

## Dimension 5: Communication Overhead

**Quick skip:** Does the diff touch fewer than 3 modules AND introduce no new imports between previously unconnected modules? If yes → ✅ skip.

Questions:
- Does the diff introduce any new dependency from a higher-level module to a lower-level one?
- Does the diff create any circular dependency (A imports B, B imports A)?
- Does a single logical change require modifications to more than 3 files?
- Does the diff introduce new shared mutable state accessible across module boundaries?
- Are any new function signatures so wide (many parameters) that callers need detailed knowledge of the implementation?

**Score 4-5:** Change is well-contained. Dependency direction unchanged or improved.
**Score 3:** 1 new cross-module coupling that is justified and documented.
**Score 2:** Multiple new coupling points, or a new circular dependency.
**Score 1:** The change makes it harder to reason about module boundaries.

---

## Dimension 6: Throwaway Readiness

**Quick skip:** Is all new logic separated from infrastructure (I/O, HTTP, DB)? If yes → ✅ skip.

Questions:
- Is any new business logic embedded directly in infrastructure code (HTTP handlers, database queries, CLI parsing)?
- Could you swap the underlying data store or transport layer without modifying the business logic added in this diff?
- If this module needed to be replaced, would callers need to change?
- Does the diff reduce test coverage on any critical path?
- Are any new magic values (hardcoded strings, URLs, credentials) embedded in logic instead of injected?

**Score 4-5:** Business logic and infrastructure remain separated. New code is testable in isolation.
**Score 3:** Minor coupling, not in a critical path.
**Score 2:** Business logic embedded in infrastructure in a meaningful way.
**Score 1:** The change makes a critical module significantly harder to replace or test.

---

## Dimension 7: Tar Pit Score

**Quick skip:** No new TODO/HACK/FIXME markers? No dead code? If yes → ✅ skip.

Questions:
- Does the diff add any TODO, FIXME, or HACK markers without an associated issue number?
- Does the diff leave any commented-out code?
- Does the diff add any code that is explicitly noted as "temporary" without a cleanup plan?
- Does the diff reduce test coverage for any code path that was previously covered?
- Does any new comment describe how the old code worked rather than how the new code works?

**Score 4-5:** No new technical debt. All markers have owners. Test coverage maintained.
**Score 3:** 1-2 TODO markers with context (issue number or clear explanation).
**Score 2:** Multiple unmarked TODOs or commented-out code left in.
**Score 1:** The change deliberately incurs debt with no stated repayment plan.

---

## Dimension 8: Documentation Completeness

**Quick skip (code-level):** Do all new public functions/interfaces have explanatory comments? Do complex logic blocks have why-comments? If both yes → ✅ skip code-level.

**Quick skip (arch-level):** Does this PR involve no architectural decisions or cross-team interface changes? → ✅ arch-level N/A.

Code-level questions:
- Do newly added public functions/methods have comments describing their behavior to callers?
- Do complex or non-obvious implementations have why-comments (not what-comments)?
- If an existing public interface was modified, was its documentation updated accordingly?
- Are new parameter names self-explanatory, or are they explained in a comment?

Arch-level questions (only when the PR involves significant architectural decisions):
- Does this change require creating or updating an ADR?
- If cross-team interfaces changed, is there a corresponding interface spec update?

**Score 4-5:** New public interfaces have complete documentation, complex logic has why-comments. No architectural changes, or ADR already updated.
**Score 3:** 1-2 public interfaces missing documentation, or architectural change has no ADR but impact is limited.
**Score 2:** Multiple public interfaces undocumented, or significant architectural change with no ADR update.
**Score 1:** Large number of new interfaces undocumented, or major architectural decision with no record at all.
