# Targeted health/sweep retest — independent QA, round two

Date: 2026-11-14. Verdict: **PASS**. No model request has been made.

## Design and artifact checks

- Frozen plan body SHA-256 `e9d461ebd6146e2cd183aec5c94f876288a5caa12faeb3792b2085acc7ef5a62`: eight cases, generic-checklist B and supplied-guidance C, three repetitions, 48 maximum submissions. Model `gpt-6.1-terra`, reasoning `low`, Codex CLI `0.167.1`, ChatGPT login. Limits agree across freeze and README: 3M observed tokens, 3h execution, 120s per turn, no retry/resume, fail-stop and explicit live command.
- Both arms share public input, schema, tool access and authority. The only arm-specific text is checklist versus guidance. Rubric objects and schedule IDs are not assembled into model prompts. Prompt lengths differ substantially; the authored cases are not independent holdouts or a test of native skill discovery.
- Inspected the transport derivative against its original: only the host adapter import, scope and explanatory prefix differ. The inherited authentication-home isolation, disabled shell/plugins/delegation, explicit proxy, CLI-selected identity, usage recording and bounded cleanup remain intact. Offline evidence is not proof of current login/provider availability or backend identity.
- Independently unpacked the final synthetic archive, checked every author evidence hash and replayed all eight saved scenarios: 48 successful simulated records plus failure, retry, identity, cleanup, unknown usage, token and deadline controls. Summary rows agree exactly. Saved details: `qa-archive-check.json`.
- Host finalizer output, host assembled JSON and final agent JSON are retained separately. The scorer never substitutes a host artifact for a model answer. Final semantic annotations remain explicit quote-backed judgments; candidate patches are not executed. JSON null/primitives/arrays are now assessable invalid shapes. Independent metric checks confirm both one-to-zero and two-to-one LF sensitivity, rejecting two missing LFs and content edits; strict comparison is unchanged.
- Token admission is checked before each archived row. Each intent binds admission time and exact remaining timeout; row finish times are monotonic and bounded by run elapsed, and raw timeout must match intent. Real wall-time consistency has a one-second timestamp tolerance; raw completed timing separately allows inherited bounded cleanup. Neither tolerance increases the frozen intent admission deadline. All simulations are explicitly marked and cannot become semantic model observations.
- Cross-document inspection agrees at version 1.9.1 across four manifests, six README badges, JSON-LD and CHANGELOG. Source inventory derives 12 books and matches README/AGENTS/GEMINI. AGENTS agrees with 64 structural scenarios; all six shipped skills retain negative trigger boundaries. All 321 historical file hashes match. Details: `qa-cross-docs.json`.

## Automated gate

All four commands exited 0, in order: `npm run validate`; `npm test` (222 custom-runner tests plus 1,354 Node tests, zero failures and zero skips); `npm run evals` (64 structural scenarios); `npm run benchmark` (30/30 severity inventories and valid SARIF, 100% risk-code precision/recall). The nine new targeted regressions passed within the complete test command. Raw logs use `qa-round2-*.log`. Round one findings and deliberately cancelled partial test output remain separate; no failed or cancelled run is presented as a pass.

## Limits

This validates offline plans, source binding, local protocol integration and recordkeeping, not improved model behavior, successful candidate repairs, live authentication or provider fidelity. A subsequent user confirmation is required for the 48-call live plan. Unknown failed token usage and one-turn observed-token overshoot remain explicit limitations.
