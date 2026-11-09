# QA round 1 — FAIL

Automated repository gate passed in order: `npm run validate`, `npm test`,
`npm run evals`. Exact stdout/stderr and command exits are retained here.
Cross-document comparisons also passed: version 1.9.1 across four manifests,
six README badges, JSON-LD and CHANGELOG; 12 books derived from frontmatter match
README/AGENTS/GEMINI; 64 evals match AGENTS; all six skill descriptions retain
negative trigger boundaries. See `cross-doc.json`.

## Blocking finding — semantic completion timing can contradict evidence

`evals/research/runtime/prospective/docker-lease-drill.mjs:112` and `:121`:

- **Symptom:** A rehashed archive with its absolute-deadline state and completion
  event claiming completion at `issued_at + 1` is accepted, although this precedes
  the lease deadline and recorded Docker cleanup. The facts timestamp remains the
  original later value.
- **Source:** The threshold reads `result.facts.completed_at`; it is not bound to
  the final state's `completed_at`, and the complete event is not ordered after
  final Docker absence evidence. The present comparison only orders the state,
  event and top-level case end, leaving those independent lifecycle claims apart.
- **Consequence:** Saved-evidence validation can report the deadline control as
  passing despite contradictory completion timing. This weakens the claimed
  bounded-recovery/absolute-deadline evidence; the original observed container
  cleanup is not alleged to have failed.
- **Remedy:** Cross-bind facts/state/event timestamps and reason/identity, require
  finite coherent chronological ordering including final successful removal and
  confirmed absence before completion, and add rehashed mutation regressions.
  Preserve this QA record and original observation bytes.

Reproduce: `node docs/research/runtime-preparations/2026-11-09-docker-lease/qa-round1/timing-bypass.mjs`.
At QA1, `timing-bypass.json` records `accepted: true`. After repair, this exact
script should record rejection. Exact reviewed sources and hashes are retained in
`sources/` and `source-sha256.json`.

Native-seam documentation clearly distinguishes the working experimental local
handshake from unverified separate-domain tool isolation. This round found no
reason to change that conservative conclusion. No real model invocation or Docker
mutation was performed by QA. Further full evidence gates are deferred to QA2
following the author repair; no release/commit approval is granted by this round.
