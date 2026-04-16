# Custom Risk Loading Guide

When `.brooks-lint.yaml` contains a `custom_risks` map, this guide governs how those
risks are loaded and scanned. Custom risks use `Cx` codes (C1, C2, …) — no conflict with
the standard R1–R6 and T1–T6 namespaces.

---

## Loading

1. For each entry in `custom_risks`, validate that it has:
   - `name` — non-empty string
   - `question` — the diagnostic question to ask
   - `symptoms` — non-empty list of symptom patterns
   - `severity` — map with at least one of: `critical`, `warning`, `suggestion`

2. Register each valid entry as a `Cx` code alongside R1–R6 / T1–T6. Once loaded,
   `Cx` codes become valid targets for `disable`, `focus`, and `severity` fields in
   the same config file.

3. Report any validation errors as config warnings (do not abort the review):
   - Missing required field: `"Config warning: C1 missing 'symptoms'"`
   - Invalid code format (must be `C` followed by digits): skip, note error
   - Code conflicts with R/T namespace: skip, note error

---

## Scanning

During the analysis, treat each custom risk as an additional step after the standard
process:

- Use `question` as the diagnostic question
- Use `symptoms` as the symptom lookup list
- Use the `severity` map for tier classification
- Apply the Iron Law: `Source` field should be `"[Project-defined risk] — <risk name>"`
- Include custom risk findings in the Health Score (same deduction rules as R/T codes)
- In the report, custom findings appear after standard findings under a
  **### Project-Specific Risks** sub-heading

---

## Config Validation additions

The following codes are valid in `disable`, `focus`, and `severity`:
- Standard: `R1`–`R6`, `T1`–`T6`
- Custom: any `Cx` code defined in `custom_risks`
- Any other code: skip it and emit `"Config warning: X is not a valid risk code"`
