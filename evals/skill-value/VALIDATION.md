# Offline validation record

Base: main `a18ac8f`. Scope: six guide repairs, value diagnosis, and the 18
development calibration cases in this directory. No historical results changed.

Independent QA stage verdict: **PASS** after correcting a historical-description
ambiguity in the debt analysis (the old rule affected prioritization, not proof of
intent). Full validation, tests and structural evals were rerun after correction.

| Command | Result | Meaning |
| --- | --- | --- |
| `npm run validate` | PASS | Repository structure and metadata consistency |
| `npm test` | PASS, including 20/20 new checks | Product regressions and fixture facts |
| `npm run evals` | PASS, 64 unchanged cases | Structural evaluation validation |
| `npm run benchmark` | PASS, 30 frozen reports | Parser fidelity, not diagnostic truth |
| `npm run evals:codex:validate` | PASS, 7 fixtures | Offline fixture validation |
| `git diff --check` | PASS | Patch whitespace |

QA cross-checked the E1/E2/E3 figures against the preserved research reports;
versions across four manifests, six README badges and landing-page JSON-LD;
twelve-book inventory; guide numbering and unchanged trigger descriptions.
The new probes expose the health finalizer's prose-evidence limitation and do not
claim that it verifies diagnosis. No real model calls, live freeze, tags or release.
These checks establish neither six-skill superiority nor independent human review.
