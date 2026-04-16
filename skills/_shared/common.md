# Brooks-Lint — Shared Framework

Code and test quality diagnosis using principles from twelve classic software engineering books.
Use `source-coverage.md` to keep those sources grounded in real evidence, exceptions, and tradeoffs.

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

## Auto Scope Detection

When the user invokes a skill without specifying files or pasting code, automatically
detect the review scope:

**PR Review mode:**
1. Run `git diff --cached` — if non-empty, review staged changes
2. Else run `git diff` — if non-empty, review unstaged changes
3. Else run `git diff main...HEAD` (or the project's default branch) — review branch changes
4. If all empty, ask the user what to review

**Architecture Audit / Tech Debt Assessment mode:**
- Default: scan entire project (current behavior)
- If user says `--since=<ref>`: run `git diff <ref>...HEAD --name-only` to get changed
  files, then only analyze modules containing those files. Note in scope line:
  "Incremental audit — modules touched since <ref>"

**Test Quality Review mode:**
- Default: scan all test files (current behavior)
- Auto-detect: if `git diff --cached` or `git diff` shows changes, prioritize test files
  co-located with changed production files (e.g., `src/foo.ts` → check `src/foo.test.ts`
  or `tests/foo.test.ts`)

**Scope line in report:** Always state what was detected.
- `Scope: staged changes (git diff --cached, 3 files)`
- `Scope: branch changes vs main (git diff main...HEAD, 12 files)`
- `Scope: incremental audit — modules touched since v0.9.0`

---

## The Six Decay Risks

Navigation index only — canonical definitions (symptoms, severity guides, sources, "What Not
to Flag" guards) live in `decay-risks.md`. Do not duplicate or edit diagnostic questions here;
update `decay-risks.md` directly. Book-level coverage, exceptions, and tradeoffs are in
`source-coverage.md`.

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

## Remedy Mode

When the user passes `--fix` or asks to "fix the findings", read
`remedy-guide.md` from the `_shared/` directory before writing the report.

## Health Score Calculation

Base score: 100
Deductions:
- Each 🔴 Critical finding: −15
- Each 🟡 Warning finding: −5
- Each 🟢 Suggestion finding: −1
Floor: 0 (score cannot go below 0)

## History Tracking

After generating the Health Score, attempt to append a record to `.brooks-lint-history.json`
in the project root.

**Append logic:**
1. Read the file (or start with empty array if it doesn't exist)
2. Append: `{ date, mode, score, findings: { critical, warning, suggestion }, scope }`
3. Write the file back

**Trend display:** If the history file exists and contains at least one prior record for
the same mode, add a Trend line after the Health Score in the report:

  **Trend:** 85 → 82 (−3) over last 3 runs

Show the most recent prior score and the delta. If delta is 0: "Stable at 82".
If this is the first run for this mode: "First run — no trend data".

## Post-Report Triage (Optional)

**Guard:** Only offer triage in interactive sessions. If running in CI/headless mode
(no user to respond), or if the user has not responded to the initial prompt within
the same turn, skip triage entirely and proceed to output the report.

After outputting the report, if there are Warning or Suggestion findings, offer:

> Would you like to triage these findings? (accept / dismiss / defer / skip)

If the user engages:

For each finding (starting with lowest severity):
1. Show the one-line finding title
2. Ask: `[a]ccept (keep as-is) / [d]ismiss (suppress in future) / [f]defer (revisit later) / [s]kip triage`

**On dismiss:**
- Ask for a one-line reason
- Append to `.brooks-lint.yaml` under `suppress:`
- The finding remains in the current report but will be downgraded to info in future runs

**On defer:**
- Same as dismiss but add `expires: YYYY-MM-DD` (default: 90 days from now)
- After expiry, the finding resurfaces at its original severity

**Suppress matching at scan time:**
When loading `.brooks-lint.yaml`, for each suppress entry:
- Match `risk` against the finding's risk code
- Match `pattern` against the file path(s) in the finding's Symptom
- If both match: downgrade to info level (not counted in Health Score, shown in report
  under a collapsed "Suppressed" section)
- If `expires` is set and past: ignore the suppress entry (finding resurfaces at
  its original severity). Add a note in the report Summary: "N suppressed findings
  have expired and are now active again."

## Reference Files

Read on demand:

| File | When to Read |
|------|-------------|
| `source-coverage.md` | At the start of every review, before writing findings |
| `decay-risks.md` | Before any production-code review or architecture/debt assessment |
| `test-decay-risks.md` | Before any test review and before PR Review Step 7 |
