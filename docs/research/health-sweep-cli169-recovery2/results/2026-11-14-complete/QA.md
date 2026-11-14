# Independent result QA

Verdict: **PASS**. No real model calls were made during QA.

## Automated gate

All commands exited zero, in this order:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-validate.log` |
| `npm test` | 222 legacy checks and 1,382 Node tests; 1,604 total, zero failures | `qa-test.log` |
| `npm run evals` | 64 structural scenarios | `qa-evals.log` |
| `npm run benchmark` | 100% parser fidelity | `qa-benchmark.log` |
| `node --test evals/research/health-sweep-cli169-recovery2/recovery.test.mjs` | 15/15 | `qa-targeted.log` |

## Independent evidence comparisons

- Extracted the current raw archive into a fresh temporary directory. The frozen verifier accepted all eight completed records. Recomputed the merged assessment from the archive and new annotations; serialized output matches `assessment.json` byte for byte.
- Archive SHA-256 matches `model-info.json`: `d834b85505ed2a89473a7cc4cc2275c83611b51d4753231e9bd20bbc0e1456da`.
- Compared all eight annotation answer hashes and quoted criterion/issue evidence to their answer packets. Independently read each answer against the supplied contract, authorization and frozen rubric: seven pass; ordinal 45 (HS-07/B) fails the stop rule. Correct defect identification and edit restraint do not satisfy the required `no-progress` label when the answer chooses `verification-blocked`.
- The prior 40 annotations remain the exact 37+3 retained judgments. Both prior failed raw hashes are preserved separately; no failure enters semantic denominators. The frozen history binding validates 251 directly bound files; the full lifecycle regression additionally checks the older 321-file snapshot.
- Reproduced final B 21/24 versus C 24/24; health 6/6 each; sweep 15/18 versus 18/18. Both recover 9/9 expected issues with zero false diagnostic claims. All 24 pairs are complete; all three C-only passes are HS-07 repetitions, not independent scenario types. Report correctly avoids general superiority or controlled historical improvement claims.
- Selected generation model, effort, CLI and usage metadata agree with raw records: gpt-6.1-terra / low, CLI 0.169.0; 663,866 new and 3,851,751 cumulative observed tokens, 50 lifetime attempts including two preserved failures. Backend identity and full billing remain unverified.
- Independently compared package version 1.9.1 with all four manifest surfaces, all six README badges, JSON-LD `softwareVersion` and top CHANGELOG version. Derived 12 books from source frontmatter and checked README/AGENTS/GEMINI wording; actual 64 evals match AGENTS; all six skill descriptions contain negative-trigger boundaries. Machine evidence is in `qa-independent.json`.

The first independent cross-document script used the wrong JSON-LD key (`version` rather than `softwareVersion`); this QA-script assertion was corrected and all comparisons rerun successfully. No repository defect or result modification was involved.

No blocking findings remain. This is independent execution of QA within the same model-assisted workflow, not independent human adjudication. No frozen sources or historical judgments were edited.
