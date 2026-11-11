# Stopped-run evidence validation

Verdict: **PASS for preserving and publishing this stopped run**, not approval or validation of recovery execution. No model calls were made by QA. The separately authored recovery files are outside this gate.

## Automated gate

Commands ran in order from the repository root on 2026-11-11; each exited zero:

| Command | Seconds |
| --- | ---: |
| `npm run validate` | 0.471 |
| `npm test` | 151.509 |
| `npm run evals` | 0.266 |
| `npm run benchmark` | 0.276 |
| `npm run evals:codex:validate` | 0.271 |
| `git diff --check` | 0.017 |

Direct cross-document checks additionally compared package version with all four manifests, all six README badges, landing-page JSON-LD and CHANGELOG; derived the 12-book inventory against README/AGENTS/GEMINI; compared the 64 structural scenarios with AGENTS; and checked all six skill negative-trigger boundaries. All passed. Frozen execution sources remain unchanged from preparation commit `dfd1d5d`.

## Evidence and reproduction

- Raw archive SHA-256: `15b234b5d3e08fa9b6b8a84c8ac9b605c16338d70a19b3201bb21d1852900d97`. All 80 members were inspected before private extraction; no absolute/traversal paths or link entries were present.
- Offline `runner.mjs verify` accepted the extracted run. Frozen plan hash: `2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`.
- Offline `report.mjs` accepted the 11 annotations and reproduced `summary.json` byte for byte; SHA-256 `dbc852226a4701684b19ae5ca6cdfe4993a4b6ab9189aabc0d7f1309ab8f8dd5`.
- Twenty-nine artifact assertions cross-checked raw events/records against failure analysis, execution totals, model selection, token sum, cleanup, annotations and paired denominators. Twelve attempt intents and no thirteenth attempt were present: 11 completed, one failed, 120 not run from 132 planned.
- Selected/requested model `gpt-6.1-terra`, effort `low`, CLI `0.167.0` and ChatGPT login agree with recorded metadata. These are client-side identity observations, not independent provider identity attestation.
- Observed completed-turn usage sums to 251,150 tokens. Failed-turn usage remains unknown; this is not a complete billing total. Stream timeouts, HTTPS fallback and the model-capacity message are present in the failed raw record. The outer deadline elapsed at 180,003 ms; cleanup completed at 180,040 ms with no pending RPC, process group absent and private home removed. Provider/network root cause remains unverified.

## Judgment and scope checks

The assessment agrees with all 11 annotations and regenerated statistics. Review has five completed answers per arm: original/revised label agreement 4/5 versus 5/5, evidence 13/14 versus 14/14, expected-problem recall 2/2 in both; one pair improved, three tied and one remains pending. Sixty-one of 66 planned pairs are incomplete. The AS-04 original-answer floating-point witness was checked independently: `90 * .9` and its floor are both 81, supporting the unsupported-claim judgment. The AS-01 omitted-test interpretation remains pending rather than being declared a proven false positive.

The sole completed health answer has dimensions 92/40/98/100 and a weighted 79.5, rounded to 80; its headline 77 is inconsistent. Component evidence credit does not imply full-answer correctness. No health pair or sweep response exists in this stopped run, and no new-boundary responses or later repetitions completed. This evidence cannot establish effectiveness of all three revised skills. Historical sweep collector corrections are separate evidence.

The original raw execution record still says semantic review was pending at collection time; subsequent annotations and summary are separate artifacts rather than rewrites of that record. Recovery in README is a proposal only; no recovery result is asserted here.

## Privacy and logs

Extracted evidence contains no auth/config credential files. A heuristic scan found no API-key, JWT, bearer-token or email patterns. This is not proof of complete redaction or anonymization. Validation logs contain test output and verification summaries, not copied authentication state.

Logs: [validation-logs.tar.gz](validation-logs.tar.gz), SHA-256 `7a7fc87e5b99b894db57b12c886f3a27d777971ea75194cd1ee56fb16ab0fdfc`.
