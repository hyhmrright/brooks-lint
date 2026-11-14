# Brooks-Lint — Full Sweep Guide

One entry point for all five focused skills: **review → test → debt → audit →
health**. The first four passes diagnose and apply authorized repairs; health
summarizes the verified final snapshot. Reuse their guides and one evidence ledger
instead of treating five overlapping reports as five independent sets of defects.

Sweep is an orchestration convenience, not a sixth independent diagnostic vote.
Its value must be assessed through preserved user work, verified changes, bounded
termination and usable residuals. Five pass names alone establish none of these.

Every finding follows the Iron Law: **Symptom → Source → Consequence → Remedy**.

**Runner and output contract:** The native workflow below edits and verifies the
authorized workspace. If a task instead explicitly requests a bounded repair
artifact, honor its supplied files, permitted paths, edit authority and output
schema. Returning replacement text does not mean files were edited or tests ran;
do not claim native pipeline steps occurred. A requested artifact is not blanket
permission for wider fixes. Keep refused, ambiguous or unauthorized changes out
of the replacement set and explain them through the permitted output fields.

---

### Step 0 — Scope and authorization

State the selected scope, the five-pass order and the permitted edit boundaries.
Honor authorization already given in the conversation; do not ask the user to
approve the same work again. If edit authority is absent, request it before
mutations. A read-only request belongs to health or the focused analysis skills.

Preserve existing user changes. Never require a clean tree as permission to erase
or stash user work. Record the starting file state so each reversal can target only
this sweep's patch. Do not commit or push implicitly because the skill was invoked;
follow the user's and repository's explicit standing commit/push instructions.
High-risk or ambiguous repairs remain residuals unless separately authorized.

Resolve a finite round cap (default 3, or a positive integer
`sweep.max_iterations` in configuration; warn and use 3 for an invalid value). It bounds **all** repair rounds,
including critical-only rounds. A user time or tool budget also bounds execution.
Stop and report the remainder on exhaustion rather than claiming convergence.

---

### Step 1 — Scope enumeration and state init

1a. Apply Auto Scope Detection from `../_shared/common.md` if the user did not
   specify files or a directory. Otherwise honor the user's explicit scope.

1b. Read `.brooks-lint.yaml` from the project root if present. Apply `disable`,
   `severity`, `ignore`, `focus`, and `custom_risks` per common.md. Record the
   applied config values and reuse them across all iteration rounds — do not
   re-read the file in Step 6 even if files were modified.

1c. Initialize pipeline state (persists across all rounds):

   - **`unresolvable`** (set): findings retired after 3 failed attempts — keyed by stable finding ID and causal signature, retaining current file/line evidence. Never re-queued.
   - **`rounds`** (int, 0): count every repair round, including the initial pass.
   - **`finding_ledger`**: stable IDs, evidence, owning dimension, related dimensions,
     source snapshot, severity, status and verification. Merge the same causal
     defect seen by review/debt/audit; priority is metadata, not another deduction.
     Count it once in global totals and assign one scoring dimension. Revalidate
     any entry affected by an edit; moving line numbers do not make a new defect.
   - **`fix_log`** (list): each fix with file, line range, risk code, description, and outcome (`applied` / `reverted` / `retired`).

Before diagnosis or edits, apply common.md's contract-domain check. Put explicit
input preconditions and required rejection behavior in separate ledger fields.
Only an in-domain violation or independently established validation duty can
justify a repair; adding defensive checks changes behavior and is not automatically
a safe cleanup. Missing obligations are blockers, not zero-finding evidence.

1d. Record the scope file list and run the relevant existing test/lint commands
before edits. Preserve command, exit status and failures as the baseline. An
existing failure is not evidence this sweep caused it. Without a usable baseline,
keep repairs requiring that safety evidence as Residual; do not revert unrelated
changes to make the baseline green.

---

### Step 2 — brooks-review pass (R1–R6 code decay)

Read `../brooks-review/pr-review-guide.md` and apply its evidence and uncertainty
rules to the authorized scope. Scan production files against all R-series risks defined in
`../_shared/decay-risks.md`.

2a. For each R-risk, apply its symptom checklist. Record each hit as a finding
   with: risk code, file + approximate line range, Symptom, Source,
   Consequence, Remedy, Severity (Critical / Warning / Suggestion), and
   **Fix-Class** (see Step 2b).

2b. Assign Fix-Class per finding:

   | Class | Criteria |
   |-------|----------|
   | **Safe** | Single-file, fully local, with established behavior and a relevant verification method. A private rename or constant extraction can qualify; a null guard or alleged dead-code removal requires contract/reachability evidence and is not safe merely because it is local. Exported-symbol changes are NOT Safe. |
   | **Extended-Safe** | Multi-file but (a) relevant tests cover the changed behavior and pass pre-fix, AND (b) the change does not rename, remove, or alter the signature of any publicly exported symbol, AND (c) touches ≤ 5 files in this pass. |
   | **Residual** | Public API break, cross-service boundary change, no test coverage to fall back on, or remedy ambiguous. NOT applied — carried to the Step 8 residual report. |

2c. Skip any finding that matches an entry in the `unresolvable` set.

2d. Finish the pass's Iron Law diagnosis and merge duplicate ledger entries before
   editing. Apply every Safe and Extended-Safe fix in this dimension, lowest risk
   within each severity tier first. For each fix: Edit or Write, then append
   one row to `fix_log` with outcome `applied`. If two fixes touch overlapping
   line ranges in the same file, apply higher-severity first, re-read the file,
   then apply the next.

2e. After all fixes in this dimension, run the project test/lint command if one
   exists (`package.json` scripts, `pytest`, `cargo test`, `go test ./...`, etc.).
   If a new failure appears relative to baseline: revert only this sweep's patches
   from this dimension in reverse order, re-running the relevant command after
   each revert until the baseline is restored. Never use a whole-file checkout to
   overwrite pre-existing changes. If attribution or safe reversal is uncertain,
   stop mutations and report the limitation.
   Mark each reverted fix with outcome `reverted` in `fix_log` and promote the
   finding to **Residual**. If no test command is found, note this once in the
   report and continue.

2f. Record dimension summary: N scanned, M Safe applied, K Extended-Safe applied,
   R reverted, P Residual.

---

### Step 3 — brooks-test pass (T1–T6 test decay)

Read `../brooks-test/test-guide.md`, build its suite map, and distinguish an
excerpt from the full test inventory. Scan test files against T-series risks defined
in `../_shared/test-decay-risks.md`.

Follow the same sub-steps as Step 2 (classify → apply → verify → summarize),
using T-prefix risk codes. Missing supplied tests do not prove missing project
coverage. Record T5 only with evidence of a concrete behavior or risk left
unprotected; otherwise retain a coverage question without a scored finding.
A behavior-based test with an established contract can be Safe; new test
infrastructure or an unknown intended behavior remains Residual.

---

### Step 4 — brooks-debt pass (tech debt accumulation)

Read `../brooks-debt/debt-guide.md`, including its distinction between unknown
historical intent and prioritization. Re-classify existing ledger findings through a debt lens — same symptoms at accumulation scale:
repeated duplication, layered workarounds, stale `TODO`/`FIXME` clusters, dead
flags. Score each with **Pain (1–3) × Spread (1–3)** to prioritize debt work.
Use the score and pattern-level occurrences as evidence about burden and reach,
not as automatic severity conversions or bumps. Assign the final finding severity
under `common.md` Severity Calibration; Critical still requires serious impact
and relevant exposure, even when many modules are affected.

Follow the same sub-steps as Step 2. Debt findings often span multiple files
and are more likely to land in Extended-Safe or Residual than Safe.

---

### Step 5 — brooks-audit pass (architecture integrity)

Read `../brooks-audit/architecture-guide.md`; produce its dependency graph and
assess seams and boundary evidence. Scan the full scope for architecture-level issues. The dependency-direction
symptoms (inverted dependencies, circular imports, cross-domain coupling) are
defined in `../_shared/decay-risks.md` Risk 5 — use that checklist. Step 5
additionally covers architecture-only concerns that R5 does not: missing
abstraction layers, god modules, leaked infrastructure inside domain code,
and seam-boundary violations.

Most architecture findings are **Residual** by definition — they require human
judgment on module boundaries. A few are Extended-Safe (e.g. extract a shared
constant used in 3+ modules into a new module that nothing else imports yet).
Do not auto-refactor module layouts, rename packages, or change public exports.

Follow the same sub-steps as Step 2.

---

### Step 6 — Iteration loop

**Goal:** Re-scan what the fixes touched and converge. Stop on clean round,
cap, or no progress.

6a. Build the re-scan scope:
   - every file modified in Steps 2–5 of the current round, PLUS
   - every file in the same module as a modified file, PLUS
   - every file that statically imports from a modified file.

   Do not re-scan files whose dependencies were not touched. On monorepos
   where a "module" may span hundreds of files, narrow the same-module bucket
   to files that import from or are imported by a modified file (direct
   dependency graph only).

6b. Count the just-completed repair round. Revalidate affected findings and
   verification results. Retired, unsafe and unresolved-contract items stay in
   the residual set, not an automatic retry queue.

6c. Select the stop reason from the evidence, not from the replacement count:
   - Stop on an exhausted round/time/tool budget; report that cap and any blockers.
   - Otherwise, if an unknown governing obligation or missing verification prevents
     the required assessment or safe next repair, stop as **verification blocked**.
     Name the missing fact/check and leave the affected replacement set empty.
   - Use **no actionable findings** only after the required scope is assessed and
     no actionable findings or assessment blockers remain. Zero edits alone is
     insufficient: protected behavior and unknown behavior are different states.
   - With known actionable findings but no safe progress, use **no progress** and
     retain the residuals. Otherwise repeat Steps 2–5 on the re-scan scope.
   A Critical finding does not bypass any cap. Map these meanings to the exact
   enum supplied by a structured-output task (for example, `verification-blocked`);
   do not replace a blocked state with a clean state because both have no patches.
   Retain unmodified evidence only where dependencies and assumptions are unchanged.

6d. After three failed verification attempts for the same causal finding, retire
   it with `"3-retry budget exhausted"`. Count attempts across moved line numbers
   using the stable finding ID. Retirement does not mean the issue was fixed.

---

### Step 7 — Residual aggregation

Collect everything that was NOT fixed in place, de-duplicated:

- All Residual-class findings from Steps 2–5 (first round + re-scan rounds)
- All `unresolvable` entries with their retirement reason
- All iteration-cap residuals from Step 6c

Sort Critical → Warning → Suggestion. Within each severity, list file path,
risk code, Symptom (one line), Remedy (one line), and the reason it was not
applied (`public API break` / `no test coverage` / `3-retry budget` /
`iteration cap`).

---

### Step 8 — Health dashboard and sweep report

Read `../brooks-health/health-guide.md` and complete the fifth pass from the
**final** source snapshot. Reuse the deduplicated diagnosis ledger and the
architecture graph/suite map; verify stale entries before reuse. Apply health's
per-dimension caps to an explicit scoring view; keep all other residuals visible
without secretly deducting for them. Do not run an abbreviated scan that discards
known unresolved findings. For each dimension, record which final-source evidence
actually completed its assessment; completing five passes by name is not evidence
that every dimension is assessed. Missing ownership facts or test evidence can
leave a dimension unassessed even when a local repair succeeded. Preserve those
limitations, use health's unassessed status, and suppress the composite rather than
assigning a clean score. Full-source review without a diff does not invent a PR
dimension for the health calculation.

Before finalization, reconcile the report and scoring view in both directions:
each scored finding must have one owning ledger entry and every retained ledger
entry must have current source evidence. An assessed empty dimension cannot
also contain a scored finding in prose. Carry unknown broader scope separately
from completed local assessments, and never infer a clean architecture merely
from a short dependency graph. Record proposed, applied, reverted and verified
changes distinctly; a proposed patch does not change the source snapshot used
for the dashboard. A separately verified candidate has its own snapshot and
receipt, which cannot substitute for missing model execution evidence.

Use health's single-ledger finalizer/check workflow when permitted and available.
Omit numerical health estimates when verification is unavailable under a required
tool workflow. Do not calculate a separate sweep score. Include exactly one final
health score block in the combined report. Put the combined explanation into the
score-free draft before finalization and preserve the full finalized report
unchanged. For a structured artifact, embed that exact report string in its allowed
report field; JSON escaping may change the serialization, not the decoded report.
Do not append additional score-bearing commentary after verification. Report
changes by finding status rather than fabricating a before/after score from
snapshots that were not assessed alike.

Output the final report. Use the standard Report Template from
`../_shared/common.md` with these additions:

If the task explicitly requires a machine-readable artifact, that output contract
takes precedence over this Markdown presentation. Finalize the intended repair
before serializing, then return exactly one complete value matching the requested
schema. For JSON, use valid escaping and emit no code fences, commentary outside
the object, partial drafts, duplicate objects, or trailing text. Put explanations only
in schema-permitted fields. Check the entire final value with a parser when tools
are available and permitted; otherwise inspect the complete serialization without
claiming it was parsed. Check allowed paths and edit authority separately from
syntax, and intended behavioral correction separately from both. Valid JSON does
not prove a repair works; a plausible repair in invalid JSON is not a usable
artifact. Report verification actually performed and its limits in the allowed
fields. Without an explicit structured-output request, retain the native report
below rather than imposing JSON on ordinary sweep users.

```
# Brooks-Lint — Full Sweep Report
Mode: Full Sweep | Scope: <files or directory>
Config: .brooks-lint.yaml applied from <source> — strictness: <preset>, N risks disabled, M paths ignored   # omit if no config

## Dimension Summary
| Dimension | Scanned | Safe Applied | Extended Applied | Reverted | Residual |
|-----------|---------|--------------|------------------|----------|----------|
| Review (R1–R6) | ... | ... | ... | ... | ... |
| Test (T1–T6)   | ... | ... | ... | ... | ... |
| Debt           | ... | ... | ... | ... | ... |
| Audit          | ... | ... | ... | ... | ... |

## Iteration History
Round 1: <classification — clean / critical-only / mixed>, <N> new findings
Round 2: ...
Stopped at: no actionable findings | iteration cap | no progress | verification blocked

## Fix Log
| # | File | Lines | Risk | Outcome  | Change |
|---|------|-------|------|----------|--------|
| 1 | ...  | ...   | R2   | applied  | Extract repeated constant |
| 2 | ...  | ...   | T4   | reverted | Test regression; promoted to Residual |
...

## Final Health Dashboard
<One finalized health block, or the explicit limitation without an invented total>

## Residual Items  (<K> not applied)
<Iron Law entries with Critical / Warning / Suggestion explicitly in each finding title, sorted by severity, with "Not applied because: ..." line>

## Summary
- Total findings detected: <N>
- Fixed this sweep: <M>
- Residual (needs human review): <K>
- Unresolvable (3-retry exhausted): <U>
```

If there are zero residual items and zero unresolvable entries, end with:
**"Sweep complete — no residual findings in the assessed scope."**
State the scope, checks actually run and coverage limits. Passing checks and an
empty ledger do not establish that the entire codebase is defect-free.

**Mode line in report:** `Full Sweep`
