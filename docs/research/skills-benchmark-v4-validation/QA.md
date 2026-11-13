# Final consistency QA: PASS

Client date: 2026-11-13. This is offline maintenance QA, not model effectiveness validation. No real model calls or historical-answer execution occurred.

## Gate results

The full gate was repeated after the sandbox-boundary loop-back and final reseal:

| Check | Result |
|---|---|
| `npm run validate` | PASS, repository version 1.9.1 |
| `npm test` | PASS, 222 helper checks and 1,266 Node tests; zero failed/skipped Node tests |
| `npm run evals` | PASS, 64 structural scenarios |
| `npm run benchmark` | PASS, 30 frozen reports; parser counts/codes/SARIF match |
| Cross-document comparison | PASS: four manifests, six README version badges, landing-page JSON-LD and top CHANGELOG agree; 12 source-inventory books match README/AGENTS/GEMINI; AGENTS eval count is 64; all six skills retain negative trigger boundaries |
| Final prepared freeze and registration | PASS, regenerated prompts/source seals equal the committed freeze; registration validates without a model call |
| Final fake-CLI archive replay | PASS, 108 successful synthetic records and four one-turn stop controls; all frozen assessments reproduced |
| Historical preservation | PASS, 391 old source/case/result files match their recorded hashes, including original 108 answers and adjudication |
| Final Docker records | PASS, seven authored controls match current boundary policy, payloads and command records; every container cleanup is confirmed |
| Whitespace | PASS, staged/tracked diff checks and explicit new-file scan |

Final case freeze: `a3a26ce14e937ec9332968b395fb1d6648eb2fcfab124cd9188ad073ac95106f`.
Final prepared registration: `08325965b58306e2fe687b1ae23879015ca80f1cfe79b538e2984c0c1d7c1fa3`.

The mandatory npm test gate used the approved unrestricted local environment because the suite's loopback and process-inspection fixtures are blocked in the restricted environment. This did not enable or invoke real models. Default tests mock Docker; separate authored Docker runs are retained in the sandbox evidence directory.

## Retained loop-back evidence

`qa-initial-findings.md` and `inspection-limit-finding.log` preserve two concrete findings: the permitted artifact payload exceeded the original Docker inspection output cap, and an ambiguous delayed creation could be described as cleaned after one immediate missing-object response. Both source fixes and regression controls are present. Inspection is now separately bounded at 1 MiB while candidate output remains capped at 64 KiB; ambiguous creation without a found owned container remains explicitly unconfirmed. The actual near-limit container control passes and is removed.

The initial full test run passed historical blocks, then failed six v4 checks because the source was repaired during that run and its freeze had become stale. This failure is preserved rather than relabeled as a pass. The completed second full gate ran against stable resealed sources and passed.

`qa-gate-logs.tar.gz` contains both `v4-qa-logs/` (initial run/finding evidence) and `v4-qa-final-logs/` (complete successful gate, archive replay, cross-document comparisons, registration, checksums and Docker-record review). The final synthetic archive is `resealed-drill.tar.gz`; older `sealed-drill.tar.gz` remains historical preparation evidence, not the final source's archive.

## Boundaries of the verdict

The revised cases are exposed development cases, not independent holdouts. Supplied guidance is tested, not native skill discovery. Calibration admits inspectable semantic judgments but does not independently establish truth. Docker checks are bounded behavior evidence, not an adversarial-proof oracle or proof of autonomous repository repair. Image, operating-system and Docker trust remain assumptions. A valid scorer receipt does not prove diagnosis or execution. The final plan still requires user authorization/model confirmation before any live submission; backend availability and login freshness remain untested until then.

No unresolved source or repository-consistency blocker remains in the reviewed task scope. No version bump or release publication was requested or performed.
