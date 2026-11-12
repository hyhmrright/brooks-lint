# Adjudication validation record

Date: 2026-11-12. Stage: eval-curator. All work in this adjudication stage is offline; no model requests, native patch application, or returned-code execution occurred.

- `campaign-v3.mjs review` completed for all 108 annotations and generated `assessment.json`.
- `node docs/research/skills-benchmark-v2-results/2026-11-12-terra-live/verify-adjudication.mjs _workspace/campaign-v3-live` passed: raw run validated, 108 unique annotations, final-answer hash bindings, exact quote substrings, allowed frozen rubric IDs, complete per-skill aggregation, and authored arithmetic counterexamples.
- Completed event types were only `agentMessage`, `dynamicToolCall`, `reasoning`, and `userMessage`; no native execution event substantiates the answers that claim running JavaScript witnesses.
- `npm run evals` passed all 64 structural scenarios.
- The original `raw-run.tar.gz` is unchanged. File checksums cover new artifacts as well as the original archive.

Repository-wide gates and the subsequent harness QA outcome are recorded below. Mechanical checks validate binding and arithmetic, not independent semantic truth. The individual judgments remain same-workflow agent adjudication and include explicit disputes/sensitivity analysis.

## Harness QA gate: PASS

The sequential QA stage completed on 2026-11-12. Raw command output and the QA verdict are retained in `qa-logs.tar.gz`:

| Gate | Result | Log |
|---|---|---|
| `npm run validate` | Exit 0; repository consistency passed for 1.9.1 | `validate.log` |
| Initial restricted `npm test` | Exit 1; 140 failures, including localhost `listen EPERM` and blocked process/CLI fixtures | `test.log` |
| Full offline `npm test` outside sandbox | Exit 0; 222 helper tests and 1,225 Node tests passed, zero failed/skipped | `test-unrestricted.log` |
| `npm run evals` | Exit 0; 64 structural scenarios passed | `evals.log` |
| `npm run benchmark` | Exit 0; 30/30 parser severity counts and SARIF validity; risk precision/recall 100% | `benchmark.log` |
| Adjudication reproduction and completeness | 108 annotations; 18 unique skill/arm rows of six answers; aggregate sums agree | `artifacts.log` |
| Manual cross-document comparison | Four manifests, six badges, JSON-LD, CHANGELOG, 12-book inventory and 64-eval count agree | `cross-doc.log` |

The initial failed run is not discarded or counted as a pass. The sandbox prohibited localhost listeners and process operations required by authored offline fixtures; the full authorized unrestricted rerun passed those same checks without code changes. Neither run invokes live model evaluation.

The original raw archive remains unchanged and checksums validate all artifacts. The individual audit contains 108 response sections. Semantic spotchecks confirmed the reported numerical counterexamples, protected-case adequacy/duplication disputes, and missing challenge artifact schema. The BV2-06 strict false-positive interpretation remains judgment-sensitive, as disclosed with an alternative result in REPORT.md. No actionable cross-artifact inconsistency was found. QA is same-workflow agent review, not independent human validation or a second complete semantic adjudication.
