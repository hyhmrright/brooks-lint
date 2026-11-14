# Independent recovery QA

Verdict: **PASS** for offline recovery preparation. No real model calls were made. This is not a finding that workspace routing is repaired and does not authorize live execution.

## Automated gate

The stable recovery freeze `ff8c242b0ec2b35cd40dcac0e632d36ef671f45c83b32b86a88200afd8ddf5ea` was tested in order. All commands exited zero:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-validate.log` |
| `npm test` | 222 legacy checks + 1,382 Node tests, zero failures | `qa-test.log` |
| `npm run evals` | 64 structural scenarios | `qa-evals.log` |
| `npm run benchmark` | Frozen parser benchmark passes | `qa-benchmark.log` |
| Recovery targeted tests | 13/13 pass | `qa-targeted.log` |

## Independent boundary checks

- Extracted `offline-evidence.tar.gz` into a fresh directory and independently verified the 43-row success scenario and eight stop controls. Archive SHA-256: `dd5cf842e6eedda8be6ec5a8f8351e9f589272e532ba56a97e327a634712c9ef`.
- Independently altered token total, stop reason, ordinal, finish time, timeout, prompt hash and admission time; all seven changes were rejected. Originals were restored between checks.
- Loaded all 53 prior annotations through the unchanged assessor and compared the recovery combination with the original annotations. Old answers are not rerun or regraded, failed and simulated answers cannot be admitted to semantic assessment, and new annotations must bind new eligible IDs.
- Verified the 317 files directly bound by the recovery history map. Its original-plan validation also retains the original historical source bindings. The complete repository gate separately exercises the older 321-file lifecycle snapshots; these are different inventories, not conflicting counts.
- Compared package 1.9.1 with four plugin manifest surfaces, six README badges, docs JSON-LD and the top CHANGELOG. Derived twelve books from source coverage and matched README/AGENTS/GEMINI; actual 64 scenarios match AGENTS; six skill descriptions include negative trigger boundaries.
- Compared remaining ordinals 54–96 and budgets against the original run: 43 new attempts; maximum 97 lifetime attempts; 8,597,116 observed tokens and 27,233,200 ms remaining. Model, effort, CLI, original prompts, criteria, source identity, Docker policy and real-smoke gate remain unchanged.
- Reviewed explicit live admission, fresh directories, no retry or implicit resume, intent/deadline binding, raw and diagnostic hashes, usage, candidate receipts and cleanup. QA outputs are outside the input seal.

Independent result details are in `qa-independent.json` and its log. Historical results and frozen sources were not edited.

## Diagnosis and limitations

The retained failure is an `account/read` routing discovery error after successful initialization. No `thread/start` or `turn/start` request is recorded; cleanup completed at 83 ms. Account-read response bodies are deliberately omitted by the historical transport, so the new diagnostic is reconstructed from the error, timing and request metadata. It cannot identify a failing endpoint, authentication cause, proxy cause or provider cause.

The prior failed attempt has unknown usage, not zero usage. The new explicit admission policy retains this uncertainty while deducting all observed prior usage from the observed-token ceiling. Neither absent turn/start nor the observed ceiling proves zero remote work or exact billing. New unknown usage still stops collection; admitted turns may overshoot the observed ceiling.

The routing regression injects captured evidence at the transport boundary; it does not reproduce a real CLI routing fault. Docker isolation uses the unchanged, previously independently exercised implementation; this recovery QA does not claim a new Docker adversarial campaign. Original scoring ambiguities and non-file evidence limitations remain unchanged. No unresolved blocking finding was found within the offline recovery scope.
