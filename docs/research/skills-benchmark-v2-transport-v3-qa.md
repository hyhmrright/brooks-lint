# Campaign v3 transport integration QA

**PASS**. The checks used repository code, the retained live probe evidence and authored offline responses. No live model calls were submitted.

| Check | Result |
| --- | --- |
| `npm run validate` | PASS, version 1.9.1 |
| `npm test` | PASS, complete pipeline including all eight new campaign v3 tests |
| `npm run evals` | PASS, 64 structural scenarios |
| `git diff --check` | PASS |
| Version and document comparison | PASS, all four manifests, six README badges, website JSON-LD and CHANGELOG agree on 1.9.1. The source inventory contains twelve books, matching README, AGENTS and GEMINI. AGENTS and GEMINI agree on 64 eval cases. All six skill descriptions have a negative trigger clause. |

The new registration was regenerated offline from the retained v3 probe, pinned binaries, current proxy binding and unchanged 108-slot case freeze. The regenerated object matches `_workspace/campaign-v3-ready/registration.json` exactly, and its anchor and fields match the tracked registration receipt. The anchor is `79a932021e273221531ce6d3a3469af7e2e902de36e0a886b47221d058e122dc`. The prepared identity is gpt-6.1-terra / low with CLI 0.167.1. The planned limits are 108 submissions, 5,000,000 observed tokens at turn admission, eight hours overall and 120 seconds per turn. The token admission budget can overshoot by a single turn and cleanup is bounded separately.

The retained plan, raw probe record and verdict are pinned independently. Probe checks include the actual scorer invocation and report, model, effort, CLI and code-mode-host binary hashes, ChatGPT login, adapter source, proxy mode and no observed retry. Registration and live admission bind the proxy, and each live turn checks it before submission. The archive readback path checks retained evidence without requiring the current proxy. Tests cover forged or changed evidence, identity mismatch, proxy drift and explicit live admission. The registration stores proxy key names and a fingerprint. It contains no raw proxy configuration.

The 108-turn fake CLI test verifies complete collection, raw receipt checking, review packets, all six skill groups and sealed-rubric reporting. Retry notification, wrong model, unknown usage and budget controls each stop after one turn with 107 slots preserved as not-run. No model-generated patches are executed. The historical collector, case freeze and probe sources, plus prior archives, have no tracked changes. No triggers changed and no release was requested.

Command output is retained locally in `campaign-v3-validate.log`, `campaign-v3-test.log` and `campaign-v3-evals.log` under `_workspace/brooks-harness/`.
