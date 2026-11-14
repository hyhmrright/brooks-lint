# Independent offline QA

Verdict: **PASS** for offline recovery preparation. No real model calls were made. This verdict does not establish that the remote connection fault is resolved or authorize execution.

Final recovery anchor: `593c3a1f6bcd324d951ba07b1412e5135489ef88d7e8a5d1ae3eec3ed67e0f2f`.

## Gate and evidence

The final gate ran in order after the source-inventory correction, with local subprocess/loopback permissions. All commands exited zero:

| Command | Result | Raw output |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-final-validate.log` |
| `npm test` | 222 legacy checks + 1,382 Node tests in 23 groups; 1,604 total; zero failures | `qa-final-test.log` |
| `npm run evals` | 64 structural scenarios pass | `qa-final-evals.log` |
| `npm run benchmark` | 100% parser fidelity on frozen corpus | `qa-final-benchmark.log` |
| `node --test evals/research/health-sweep-cli169-recovery/recovery.test.mjs` | 12/12 pass, separately run because not integrated into `npm test` | `qa-targeted.log` |

The preceding full gate also passed, but began before the source-inventory correction and is retained as preliminary evidence in `qa-{validate,test,evals,benchmark}.log`. Final evidence hashes and counts are recorded in `qa-evidence.json`.

## Independent comparisons

- Extracted the final offline archive in a fresh temporary directory and verified the 11-row success run plus seven stop controls. Archive SHA-256: `4de362d97b7d5ecc01126b41621d2c43a332bd717844dd55517f1d8220e17d2e`.
- Independently changed cumulative tokens, terminal reason, ordinal, finish time, timeout, prompt hash and admission time in extracted records. All seven changes were rejected, with originals restored after each check. Evidence: `qa-independent-v2.log`.
- Verified all 37 prior response IDs and answer hashes against their unchanged annotations. The original failure is retained and excluded from grading; the merge accepts new annotations only for newly eligible responses. Simulation cannot enter semantic review.
- Recomputed all 321 historical hashes both during review and after the final gate; no drift. Original frozen sources and prior result/archive files remain bound by the new freeze.
- Compared package version 1.9.1 to all four manifest surfaces, six README badges, landing-page JSON-LD and top CHANGELOG entry. Derived 12 books from source frontmatter and matched README/AGENTS/GEMINI wording; 64 actual evals match AGENTS claims; all six skill descriptions end with negative-trigger boundaries. Evidence: `qa-cross-doc.json`.
- Compared frozen schedule and limits to the prior run: ordinals 38–48, 11 new attempts, at most 49 lifetime attempts, 1,620,288 remaining observed tokens and 9,519,504 ms remaining execution time, maximum 120,000 ms per turn. The original prompts, criteria, model `gpt-6.1-terra`, effort `low`, CLI `0.169.0`, toolchain and proxy binding are unchanged.
- Reviewed explicit live admission, fresh directories, intent/deadline binding, cumulative usage, unknown-usage stopping, terminal consistency, raw hashes, tool receipts, model selection and cleanup verification. No resubmission or implicit resume is introduced.

## Diagnosis and limits

The original failure ended after 27,549 ms wall time (27,547 ms monotonic), not the 120-second deadline. It followed two successful tool requests and partial answer output. The exposed error says `Reconnecting... 2/5`, `willRetry: true`, `responseStreamDisconnected`, and `Connection refused (os error 61)` with no HTTP status. Its 86,703 observed tokens are included in the prior total of 2,879,712; cleanup was confirmed.

Structured classification reads error notifications rather than arbitrary prompt/answer strings. The new tests inject a representative error at the runner boundary; they do **not** reproduce a real CLI reconnect against a remote service. The original raw event supplies the real-CLI evidence. The refusing endpoint, backend identity, hidden retry count and full billing remain unverified. Observed-token admission can overshoot on an already admitted turn.

## Findings resolved and QA notes

The initial source inventory included all Markdown under the new documentation directory, causing the required QA report itself to invalidate the freeze. The author replaced it with an explicit input inventory, added a regression, refroze and rebuilt the offline archive. The final full gate above was rerun after that correction. No unresolved blocking finding remains.

The first independent archive check used the obsolete top-level directory name and failed with ENOENT; `qa-independent.log` preserves this QA-script error. The corrected check uses the final `health-sweep-cli169-recovery-offline-v2` directory and passes. This was not an execution or product failure. Historical records were never changed.
