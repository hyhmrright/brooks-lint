# Brooks-Lint — Shared Framework

Code and test quality diagnosis using principles from twelve classic software engineering books.

## The Iron Law

```
NEVER suggest fixes before completing risk diagnosis.
EVERY finding must follow: Symptom → Source → Consequence → Remedy.
```

Violating this law produces reviews that list rule violations without explaining why they
matter. A finding without a consequence and a remedy is not a finding — it is noise.

## Project Config

Before executing the review, attempt to read `.brooks-lint.yaml` from the project root.
If the file exists, parse and apply its settings before proceeding.
If the file does not exist, continue with defaults (all risks enabled, no ignores).

In a multi-mode session, re-read only if the user says the config has changed.

### Supported settings

**`disable`** — list of risk codes to skip entirely. Findings for disabled risks are
silently omitted from the report and do not affect the Health Score.
Valid codes: `R1` `R2` `R3` `R4` `R5` `R6` `T1` `T2` `T3` `T4` `T5` `T6`

**`severity`** — override the severity of a specific risk for this project.
Valid values: `critical` `warning` `suggestion`
Example: `R1: suggestion` means every R1 finding is downgraded to Suggestion regardless
of what the guide says.

**`ignore`** — list of glob patterns. Files matching any pattern are excluded from
analysis. Findings that arise solely from ignored files are omitted.
Common entries: `**/*.generated.*`, `**/vendor/**`, `**/migrations/**`

**`focus`** — non-empty list of risk codes to evaluate; all others are skipped.
Omit this key (or leave it empty) to evaluate all non-disabled risks.
Cannot be combined with a non-empty `disable` list.

### Example `.brooks-lint.yaml`

```yaml
version: 1

disable:
  - T5   # no coverage metrics enforced on this project

severity:
  R1: suggestion   # high cognitive load is accepted in this domain

ignore:
  - "**/*.generated.*"
  - "**/vendor/**"
```

### Config Validation

Before applying, check for errors and mention each in the report:
- Invalid risk code (not R1–R6 or T1–T6): skip it, note `"Config warning: X is not a valid risk code"`
- Invalid severity value (not `critical`/`warning`/`suggestion`): skip it, note the error
- Both `disable` and `focus` are non-empty: treat as a config error, ignore both, note it

If the YAML fails to parse entirely, skip config loading and proceed with defaults.

### Config Reporting

If a config file was found and applied, add this line immediately after the **Scope** line
in the report:
`Config: .brooks-lint.yaml applied (N risks disabled, M paths ignored)`

Include N and M even if zero. Omit this line if no config file was found.

---

## The Six Decay Risks

(Full definitions, symptoms, sources, and severity guides are in `decay-risks.md` in this
directory — read it after loading this file.)

| Risk | Diagnostic Question |
|------|---------------------|
| Cognitive Overload | How much mental effort to understand this? |
| Change Propagation | How many unrelated things break on one change? |
| Knowledge Duplication | Is the same decision expressed in multiple places? |
| Accidental Complexity | Is the code more complex than the problem? |
| Dependency Disorder | Do dependencies flow in a consistent direction? |
| Domain Model Distortion | Does the code faithfully represent the domain? |

---

## Report Template

**Language rule:** Output the report in the same language the user is using. Translate the
per-finding content and the one-sentence verdict to match the user's language. Keep the
following in English: Iron Law field labels (Symptom / Source / Consequence / Remedy),
book titles, principle and smell names (e.g. "Shotgun Surgery", "Divergent Change"),
and fixed structural headers from the template below (`Findings`, `Summary`,
`Module Dependency Graph`, `Critical`, `Warning`, `Suggestion`).

````
# Brooks-Lint Review

**Mode:** [PR Review / Architecture Audit / Tech Debt Assessment / Test Quality Review]
**Scope:** [file(s), directory, or description of what was reviewed]
**Health Score:** XX/100

[One sentence overall verdict]

---

## Module Dependency Graph

<!-- Mode 2 (Architecture Audit) ONLY — omit this section for other modes -->
<!-- classDef colors: see architecture-guide.md Step 1 Rule 6 -->

```mermaid
graph TD
    ...
```

---

## Findings

<!-- Sort all findings by severity: Critical first, then Warning, then Suggestion -->
<!-- If no findings in a severity tier, omit that tier's heading -->

### 🔴 Critical

**[Risk Name] — [Short descriptive title]**
Symptom: [exactly what was observed in the code]
Source: [Book title — Principle or Smell name]
Consequence: [what breaks or gets worse if this is not fixed]
Remedy: [concrete, specific action]

### 🟡 Warning

**[Risk Name] — [Short descriptive title]**
Symptom: ...
Source: ...
Consequence: ...
Remedy: ...

### 🟢 Suggestion

**[Risk Name] — [Short descriptive title]**
Symptom: ...
Source: ...
Consequence: ...
Remedy: ...

---

## Summary

[2–3 sentences: what is the most important action, and what is the overall trend]
````

## Health Score Calculation

Base score: 100
Deductions:
- Each 🔴 Critical finding: −15
- Each 🟡 Warning finding: −5
- Each 🟢 Suggestion finding: −1
Floor: 0 (score cannot go below 0)
