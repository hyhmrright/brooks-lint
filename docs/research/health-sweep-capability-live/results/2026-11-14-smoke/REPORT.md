# Real capability smoke: two completed turns

The frozen SC-01 B/C smoke completed both planned calls using Codex CLI 0.169.0 with requested and CLI-selected `gpt-6.1-terra / low`, ChatGPT login authentication. Backend model identity and complete billing remain unverified. This report archives the already completed smoke; no further model calls or formal collection were made for reporting.

## Execution and outcome

The run used 147,801 observed tokens and 62,038 ms, within the 300,000-token admission ceiling and ten-minute execution budget. B used 32,966 tokens; C used 114,835. Both completed without a recorded failure or exposed transport retry. Per-turn deadlines remained 120 seconds. These observations do not prove absence of hidden provider retries or future network stability.

| Check | Generic checklist B | Full static skill C |
| --- | --- | --- |
| Diagnosis / evidence status / authority / honesty | All four pass | All four pass |
| Expected issue recovered | zero-default | zero-default |
| False or pending diagnostic claims | None | None |
| Authorized candidate | config.mjs only | config.mjs only |
| Isolated host regression | Pass | Pass |
| Tool finalization and exact delivery | Pass | Pass |
| Stop protocol | iteration-cap, pass | iteration-cap, pass |
| Container cleanup | Confirmed | Confirmed |

Both identify that logical OR replaces a valid zero timeout with 30 and propose nullish coalescing. Both distinguish predicted behavior from execution after submission. Missing project inventories remain unassessed; no composite is fabricated. The candidate tests were run by the host after the responses, not by an autonomous model repair loop. Exact answer quotes and source excerpts support each manual axis judgment in `annotations.json`; the frozen assessor generated `assessment.json`.

The real smoke gate passes: both valid tool-delivered answers and isolated repairs satisfy the frozen gate. The gate receipt is stored in `model-info.json`. This is technical readiness evidence for this one fixture and two arms, **not** a skill efficacy estimate. There are no health cases in this smoke, and no independent holdout or human validation claim. Review was model-assisted by gpt-6-astra within the same workflow. The formal 96-call run remains unexecuted and requires separate user authorization.

## Preserved evidence and reproduction

`raw-run.tar.gz` contains the full `capability-smoke` directory: frozen plan, admission intents, execution summary, original CLI responses/events, score/delivery interactions, diagnostic records and Docker isolation/cleanup evidence. Its SHA-256 and per-answer raw hashes are recorded in `model-info.json`; no credential file is added. Authentication metadata records only its type. Historical experiments, their answers, annotations and failures are unchanged and are not merged into this new smoke.

Extract the archive into a fresh directory, then run the frozen `runner.mjs verify smoke PATH`. Call exported `smokeGate(PATH)` to reproduce the gate receipt, and use `review.mjs assess PATH annotations.json NEW_ASSESSMENT.json` to compare the regenerated assessment bytes. `review-packets.json` preserves the exact answer/input/rubric/repair packets used for adjudication. All these checks are offline; no formal runner invocation is needed. Independent QA and validation logs are saved separately alongside this report.
