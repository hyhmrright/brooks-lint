---
name: runtime-research
description: >
  Experimental runtime failure-containment guidance for an explicitly selected
  research review of request boundaries, dependency attempts, and finite resource
  admission. Apply only when the task requests runtime reliability assessment.
  Do NOT trigger for: syntax explanations, ordinary implementation help, general
  maintainability or test-quality reviews without a runtime assessment request,
  security audits, or unsolicited analysis merely because networking code appears.
metadata:
  opencode/slash: "true"
  research/revision: "2"
---

# Runtime failure containment — research prototype

Revision 2. Research guidance with unverified source mapping; no shipped risk
codes, runtime score, or integration claim. Availability in a skill catalog is not
permission to expand the user's task.

## Setup

This directory is copied only into the selected experimental arm as
`.agents/skills/runtime-research/`, alongside the unchanged core skills and their
`_shared/` directory. It is not installed by the production plugin.

Read `runtime-guide.md` in this directory. For an eligible runtime review, read
`../_shared/common.md` for the Iron Law and evidence conventions. Its core scoring
rules apply to core findings only; this prototype emits no numeric runtime or
combined Health Score. Do not read case metadata, rubrics, hidden test contexts,
or neighboring research artifacts to complete missing review evidence.

## Process

1. Check the requested task and supplied evidence boundary; stop runtime analysis
   when it is outside that task (Steps 1–2 of the guide).
2. Trace response limits, underlying work, retries, and resource admission against
   the supplied behavioral contract (Steps 3–5 of the guide).
3. Distinguish demonstrated failure, supported protection, and unresolved context;
   complete diagnosis before offering remedies (Step 6 of the guide).
4. Report evidence, calibrated severity, overlap, and limitations separately from
   core findings and scores (Step 7 of the guide).

**Mode line in an eligible research artifact:** `Runtime Research (revision 2)`.
Do not add this artifact or mode line to a syntax-only answer.
