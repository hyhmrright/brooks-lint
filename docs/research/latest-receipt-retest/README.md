# Latest-receipt protocol retest

This is a prospective six-call protocol check, not a new skill-efficacy comparison. Historical records remain immutable. Generation is frozen to gpt-6.1-terra / low, Codex CLI 0.169.0. The actual successor transport and stateful host adapter are used. B has a generic checklist; C the full static health instruction bundle. Both share identical tasks, tools and expectations.

Three instructed lifecycle scenarios each run once per arm: ordinary finalize/assemble; two successful distinct finalizations followed by latest assembly; finalize/assemble then re-finalize and rebuild assembly. Re-finalization invalidates rather than locks an old assembly. Required successful sequences, distinct drafts, every bound receipt, generation/scope and exact final output are verified. Failed tool payloads consume the inherited eight-request allowance. This tests deliberate instructed behavior, not spontaneous correction or autonomous code repair. No generated code is executed.

## Limits and admission

Six submissions maximum, 1,000,000 observed-token admission ceiling, 30 minutes execution budget, 120 seconds per turn or remaining time. Prior two-call smoke used 147,801 tokens (skill arm 114,835); six such skill-sized calls are about 689k before margin. This is not a price estimate or billing cap; admitted calls may overshoot observed limits. Backend identity and hidden provider retry counts remain unverified. Stop on first execution, exposed retry, unknown usage, source/identity/cleanup or protocol failure. No automatic retries or implicit resume.

The existing real capability smoke is reverified and hash-bound at live admission, as evidence of the unchanged login route only; it does not prove compatibility with the new stateful protocol. A fresh output directory and explicit --live are required. No model authorization is conveyed by this document. Binary/toolchain and proxy identity are frozen. Original historical hashes and explicit source inputs exclude QA outputs.

## Commands

Offline (fake app-server, no account/model/network requests):

```sh
node --test evals/research/latest-receipt-retest/protocol.test.mjs
node evals/research/latest-receipt-retest/drill.mjs FRESH_OFFLINE_DIRECTORY
```

After user model-run authorization only:

```sh
node evals/research/latest-receipt-retest/runner.mjs execute retest _workspace/latest-receipt-live --live _workspace/capability-smoke
node evals/research/latest-receipt-retest/runner.mjs verify retest _workspace/latest-receipt-live
node evals/research/latest-receipt-retest/review.mjs _workspace/latest-receipt-live
```

The offline drill drives the real successor RPC dispatch for six successful calls and stale receipt, invalidated assembly, modified final output, request cap, duplicate ID and wrong scope controls. Earlier calibration tests separately cover foreign receipts and failed-finalize state retention. Simulation cannot satisfy the real-smoke prerequisite. Protocol results do not establish diagnostic quality; all prompts deliberately supply clean bounded evidence so the measurement isolates receipt mechanics.
