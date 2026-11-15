# Independent final-result QA

Verdict: **PASS** for preserved evidence, reproducible statistics and explicitly bounded interpretation. No new model calls or source changes were made. This is independent agent review within the same workflow, not human ground truth.

## Automated gate

All commands exited zero, in order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, and `node --test evals/research/health-sweep-capability-recovery2/recovery.test.mjs`. Logs are `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`, and `qa-targeted.log`. The test gate reports 222 legacy checks plus 1,382 Node tests (1,604 total); 64 structural eval scenarios, the frozen parser benchmark and 15 recovery tests pass.

## Boundary comparisons

- Independently extracted `raw-run.tar.gz` into a fresh temporary directory, verified the frozen runner, then regenerated the merged assessment. Output is byte-identical to `assessment.json`.
- All 55 retained annotations compare exactly with the original 53+2 judgments. The two failure records remain separately preserved; unknown usage on original ordinal 54 is not rewritten as zero. The final run completed 41 turns, using 2,835,310 observed tokens and 1,281,913 ms; cumulative totals match 98 attempts, 96 answers, 6,379,249 observed tokens and 2,923,368 ms.
- Individually reviewed the 41 new final answers, supplied obligations, ledger evidence and annotation rationales. Exact quote/source binding is also enforced by the frozen assessor. The conservative HC-03 causal ownership, HC-05 severity and HC-06 local/global ambiguities remain unresolved, not silently converted into failures or passes.
- Independently reproduced ordinal 84's parser witness: non-multiline digit-only matching rejects final LF, CR and literal backslash-n. The delivered false diagnosis is correctly distinguished from taxonomy mistakes and supported novel findings.
- Independently inspected ordinal 83's two successful finalize receipts and assembly: the final answer exactly matches the assembly using the first receipt, while the frozen mechanical rule binds the last receipt. Semantic success and delivery failure are correctly separated; no post-assembly mutation is alleged. Discarded intermediate diagnosis remains visible in raw evidence.
- Recomputed 48 complete pairs and verified B 26/48, C 39/48 behavioral completion; health 7/24 versus 15/24 and sweep 19/24 versus 24/24. Both arms recover 30 expected causal issues and pass 9 authorized finite repair checks; delivered false claims are B 1/C 0. Delivery is B 48/C 47. Unresolved judgments are explicitly retained and not presented as calibrated model failure rates.
- Compared version 1.9.1 across package, four plugin/extension manifest surfaces, six README badges, JSON-LD softwareVersion and top CHANGELOG. Derived 12 books from source frontmatter and matched README/AGENTS/GEMINI; actual 64 evals match AGENTS; all six skill descriptions include negative trigger boundaries.
- Frozen source/history validation passed during both archive verification and the full gate; historical source files and results were not edited.

Archive hash and independently computed machine-readable evidence are in `qa-independent.json`. No blocking inconsistency was found. Limitations in REPORT.md remain material: development fixtures and dependent repeats, model-assisted adjudication, finite repair oracles, non-file evidence limitations and a one-shot proposal workflow. This PASS does not prove general skill superiority or repair correctness for arbitrary inputs.
