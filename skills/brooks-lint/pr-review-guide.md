# PR Review Guide — Mode 1

**Purpose:** Analyze a code diff or specific files for decay risks that are directly visible
in the changed code. Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Before You Start

**Auto-generated files:** If the diff contains generated files (protobuf stubs, OpenAPI clients,
ORM migrations, lock files, minified bundles), skip those files entirely. Generated code reflects
tool choices, not developer decisions. Note in the report which files were skipped and why.

---

## Analysis Process

Work through these six steps in order. Do not skip steps.

### Step 1: Understand the scope

Read the diff or files and answer:
- What is the stated purpose of this change?
- Which files were modified?
- Flag immediately if the PR changes more than 10 unrelated files — that itself is a
  🟡 Warning: Change Propagation (a PR that touches many unrelated things is a sign
  that responsibilities are tangled).

### Step 2: Scan for Change Propagation

*Scan this first — it is the most visible risk in a diff.*

Look for:
- Does this change touch files in modules that have no conceptual connection to the stated purpose?
- Does any modified class change for more than one business reason in this diff?
- Does any method use more data from another class than from its own?

If the diff shows no cross-module changes beyond what the feature requires → skip, no finding.

### Step 3: Scan for Cognitive Overload

Look for:
- Are any new or modified functions longer than 20 lines?
- Is there nesting deeper than 3 levels in new or modified code?
- Are there more than 4 parameters in any new function signature?
- Are there magic numbers or unexplained constants in new code?
- Do new variable or function names require reading the implementation to understand?
- Are there train-wreck chains (3+ method calls chained)?

### Step 4: Scan for Knowledge Duplication

Look for:
- Does this change introduce logic that already exists elsewhere in the codebase?
- Does this change introduce a new name for a concept that already has a name?
- Does this change add a class to a hierarchy that has a parallel in another module?

### Step 5: Scan for Accidental Complexity

Look for:
- Does this change add an abstraction with only one concrete use?
- Does this change add a class that only wraps another class or delegates everything?
- Does this change add configuration options or extension points that serve no current requirement?

### Step 6: Scan for Dependency Disorder and Domain Model Distortion

Look for Dependency Disorder:
- Do any new imports create a dependency from a high-level module to a low-level one?
- Do any new imports introduce a cycle?

Look for Domain Model Distortion:
- Do new class or variable names match the language the business uses?
- Does any new class hold only data with no behavior, where behavior was expected?

---

## Applying the Iron Law

For every finding identified above, write it in this format:

```
**[Risk Name] — [Short title]**
Symptom: [the exact thing you saw in the diff — quote line numbers if helpful]
Source: [Book title — Principle or Smell name]
Consequence: [what will happen if this is not addressed]
Remedy: [concrete action, specific to this code]
```

Do not write a finding that you cannot complete fully. If you can identify a symptom but
cannot state a consequence, you have not understood the risk well enough — re-read
`decay-risks.md` for that risk before writing the finding.

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: PR Review
Scope: list the files reviewed (excluding skipped generated files).
