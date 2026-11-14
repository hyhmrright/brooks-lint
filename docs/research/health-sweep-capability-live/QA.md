# Independent offline QA

Verdict: **PASS** for the frozen offline execution preparation. No real model calls were made. This is not model-efficacy evidence or permission to execute.

## Automated gate

The final stable sources were checked in order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, then the new protocol test file. All exited zero. Logs are `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`, and `qa-targeted.log`.

- Repository tests: 222 legacy helper checks plus 1,382 Node tests across 23 groups (1,604 checks), zero failures.
- Structural evals: 64 scenarios pass; frozen parser benchmark passes.
- New protocol tests: 9/9 pass, including source/model/budget tamper, annotation quote/hash/source provenance, balanced inputs, arbitrary path rejection, shipped scoring, simulation exclusion and fresh-directory controls.

## Independent comparisons

Both evidence archive SHA-256 values match `evidence.json`. The simulation archive was extracted into a fresh temporary directory; all 2 smoke and 96 formal successful synthetic records and seven stop scenarios per stage independently passed the frozen verifier. See `qa-independent-replay.log`. Simulated answers cannot authorize a real formal run or enter semantic grading.

The actual Docker drill was independently rerun using only the pinned local image, with zero model calls. All 21 controls passed: twelve candidate variants across three repair families and nine isolation/adversarial controls. The latter include readonly-file/symlink writes, credential environment absence, no-network behavior, timeout/output/memory exhaustion, invalid self-reported success, empty exit-zero output and independent cleanup after owner SIGKILL. Raw evidence is preserved in `qa-docker-evidence.tar.gz`; `qa-docker.log` contains its summary.

Source review compared container creation to inspection: pinned image, exact canonical readonly fixture-only bind, user 1000, readonly root, network none, dropped capabilities, no-new-privileges, resource limits, no checkout/auth/socket mounts and bounded cleanup. Host expected values remain outside the candidate container. Output must parse as the expected values object and match host values; self-reported `accepted` flags are not trusted. The independent lease checks the owned name/token/mount before removal. Docker and its host kernel remain trusted.

The collector binds prompts, CLI-selected model/effort, toolchain and proxy, token/time admission, fresh outputs, raw hashes and tool receipts. Formal live admission verifies a real current smoke with two completed exact tool-delivered answers and passing isolated repairs. It rejects simulated smoke. A semantic mistake or failing repair remains an evaluation outcome rather than an automatic retry. Exposed transport retry, unknown usage, identity/cleanup or isolation infrastructure failure stops collection.

Annotation checks bind exact answer quotes/hash/response and supplied source excerpts; manual semantic judgment is still required. Action/authority and other semantic axes are separate from stop-enum agreement. Repair success is a host post-submission measure, not proof of model-executed or interactive sweep behavior. Aggregation retains mode, family and paired case/repeat denominators.

The plan and README agree on `gpt-6.1-terra / low`, CLI `0.169.0`, smoke 2 calls/300,000 observed tokens/10 minutes and formal 96 calls/12,000,000 observed tokens/8 hours. Both have 120-second model-turn limits and no automatic resubmission. Token admission can overshoot on an already admitted turn and is not complete billing evidence.

Cross-document comparison passed: version 1.9.1 across four manifests, six README badges, JSON-LD and CHANGELOG; 12 books derived from source frontmatter agree with README/AGENTS/GEMINI; 64 actual evals match AGENTS; all six skills include negative trigger boundaries. All 7,393 historical hashes remain unchanged. See `qa-cross-doc.json`.

## Limits and QA notes

The corpus is same-workflow development material, not an independent holdout. Only three finite repair families are exercised; hardcoded or query-dependent outputs can overfit finite host tests and still need semantic review. The adversarial drill establishes the tested isolation behaviors, not universal container security. Static full-skill instruction bundles do not reproduce native skill discovery. Backend model identity, hidden provider retries and complete billing remain unverified.

The first independent replay used Node stdin (`-`), which hits the historical probe's command-path realpath guard before executing checks. Its failure is retained in `qa-independent.log`; the corrected file-based replay passed. No historical source was changed to bypass that guard. The source inventory excludes these QA outputs; anchors remain unchanged after report creation.
