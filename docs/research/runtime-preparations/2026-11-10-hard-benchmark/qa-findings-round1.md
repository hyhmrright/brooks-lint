# QA round 1: FAIL

Date: 2026-11-10. Reviewer: same-workflow Codex QA agent, not independent human
review. No model evaluations launched. Source files were not edited by QA.

All automated commands passed; semantic/boundary inspection found three blockers.
Route all three to eval-curator, then run the complete QA gate again.

## F1: Batch cancellation revives a cancelled generation

- **Symptom:** In protected HB-13, `put({id:'a',deadline:60}); cancel(token); put({id:'a',deadline:80}); flush(...,25)` sends both entries. Observed output: `{"admitted":["a","a"],"sent":[{"id":"a","deadline":60},{"id":"a","deadline":80}]}`.
- **Source:** `evals/research/runtime/hard-benchmark/cases/HB-13/queue.mjs:7` derives the next generation from the active map, while line14 deletes that generation on cancel. The next put reuses generation1, so the old entry passes the filter at line18. HB-14/HB-15 contain the same supporting module. A stale cancel after a previous flush can likewise match a reused generation.
- **Consequence:** HB-13 is not protected under its visible current-generation/cancellation context; HB-15 has a definite additional fault despite its unresolved deadline policy. A valid model finding could be scored as false positive or certainty error. The current driver tests replacement-before-stale-cancel, but misses cancel-before-replacement and cross-flush reuse.
- **Remedy:** Preserve a monotonic generation identity independently of active membership in all three family variants; add cancel/reinsert and stale-token-after-flush regressions. Preserve the intended expiry difference and re-freeze observations/inventory.

## F2: Optional sinks contradict the declared fanout contract

- **Symptom:** `cases/HB-26/context.md:5` says a frame is released only after **every sink** has drained; line3 exempts optional sinks. The protected implementation at `cases/HB-26/service.mjs:12` waits only for required sinks, and the driver deliberately leaves optional bytes retained while all credits are returned.
- **Source:** The same unrestricted phrase appears in HB-27 visible contract and HB-25/HB-26/HB-27 rubrics, including protected scope and alternate judgments.
- **Consequence:** The intended protected answer is ambiguous: following the literal contract gives a supported violation. This is grading ambiguity, not useful difficulty.
- **Remedy:** Consistently say **every required sink** in the supplied contract and rubric, retain the explicit optional-sink exception, and guard that distinction in offline checks.

## F3: Import closure validator ignores side-effect imports

- **Symptom:** Append `import "./missing.mjs";` to an otherwise valid source in a temporary suite copy. `freezeData()` accepts it; after writing that freeze, `exportInputs('HB-01', copy)` exports the unclosed import successfully. Reproduction returned `{"acceptedSideEffectImport":true}`.
- **Source:** `suite.mjs:130` only recognizes `from '...'` declarations, not side-effect `import '...'` declarations. The README's import-closure/rejection claim is broader than this check.
- **Consequence:** A later authored fixture can be frozen and exported with an omitted dependency or an out-of-bound side-effect import, despite a green validation gate. Existing fixtures inspected here use closed imports; this is a validator regression gap, not evidence of a current secret leak.
- **Remedy:** Cover supported static import forms (including side-effect imports, and reject unsupported syntax rather than silently accept it), enforce the same allowlist, and add regression tests for missing/escaping side-effect imports. Do not claim this source check is a security sandbox.

## Completed checks and review scope

- `npm run validate`: exit0.
- `npm test`: exit0; recorded TAP/Node components6 +914 +59 tests, no failures/skips, plus custom validator checks.
- `npm run evals`: exit0;64 structural scenarios.
- `npm run evals:runtime:prepared`: exit0;541 +59 tests, no failures/skips.
- `npm run benchmark`: exit0; frozen parser benchmark passed.
- Cross-document checks: PASS; version1.9.1 across four manifests/six README badges/JSON-LD/CHANGELOG; derived12 books match README/AGENTS/GEMINI; actual64 evals match AGENTS; all six skill descriptions contain negative boundaries.
- Read all12 family contexts, source variants, drivers/oracles and rubric structures; checked opposing contracts and the fairness requirement allowing equivalent traces. The two contract/fixture issues above prevent semantic acceptance despite green checks.
- Corpus claims are appropriately limited: public same-workflow authorship, no independent custody, human review/book mapping pending, no measured100x difficulty, no live adapter integration or model-benefit claim.

Raw command logs and exit codes are adjacent. Initial freeze SHA256:
`5138bdcc305f54a47f7d1e26ef82e25ebe002d3153a8440a0aff6793f8f39f27`.
