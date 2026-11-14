# Amended health/sweep recovery protocol

Offline preparation only. No model request is authorized by this document. Prior frozen plans, failed raw records and historical grades remain unchanged. There are zero completed prior answers; this is a protocol-amended restart of all 48 answer slots, not a same-prompt continuation or an effectiveness comparison with the failed protocol.

## Diagnosis

Symptom: first HS-01/B turn ended with `Unexpected or duplicate scoring request scope`. Source: the fifth captured tool request has a new call ID, correct tool and matching thread/turn, but the frozen collector conflated its four-call cap with scope/duplicate errors. Four earlier invalid ledgers were rejected with progressively discovered missing-field errors; the fifth also contains an invalid ledger. The public tool schema exposed dashboards as an unspecified array, while arm C could read the detailed skill ledger documentation. Consequence: B had less interface information and exhausted the inherited request cap while guessing mandatory fields. This is not evidence that its final judgment was wrong, and the model had not produced a completed answer. Remedy: both arms now receive the same full ledger shape and status constraints, syntax-only examples, an explicit bounded request allowance and separate rejection reasons. Examples are not case answers; diagnoses still require evidence.

## Frozen limits

- gpt-6.1-terra / low; Codex CLI 0.167.1; ChatGPT file login, same toolchain/proxy binding.
- 8 cases × B generic checklist / C skill guidance × 3 repeats = **48 new submitted turns**. One retained failed submission gives at most **49 lifetime submissions**.
- Original cumulative ceilings: 3,000,000 observed tokens and 10,800,000 ms. Prior usage:37,409 tokens/28,192 ms. Remaining: **2,962,591 observed tokens**, **10,771,808 ms (2h59m31.808s)**. Each turn at most120,000ms, further limited by remaining cumulative time.
- Up to **8 tool requests inside each submitted turn**, counting payload errors, finalize and assemble. This allows bounded correction plus assembly, not repeated model submissions. Duplicate IDs, invalid scope or ninth request stop the turn with specific evidence. The adapter never retries a model request. First execution/verification/identity/cleanup/retry/unknown-usage failure stops the campaign. No automatic resume or recovery.
- Observed-token admission can overshoot by one turn and is not a dollar/billing cap. Selected CLI model is recorded; backend serving identity is not independently attested.

Both arms receive identical input schema and public protocol, tool availability and limits. Only guidance differs. Tools accept data only; no shell/network or model-proposed patch execution. Host artifact success and final model response remain distinct. Strict report bytes, exactly-one-missing-terminal-LF sensitivity and semantic adjudication remain separate. No historical score is recomputed. Cases are authored calibration data, not independent holdouts; this small study does not establish general skill superiority.

## Prior binding and future execution

`prior-evidence.json` binds the original plan/anchor/archive and failed record hash. Budget counters derive from the retained failure and are explicitly frozen. Source changes require another freeze. Existing output directories are rejected. Confirm model/effort before:

```bash
node evals/research/health-sweep-recovery/runner.mjs execute _workspace/health-sweep-recovery-live --live
node evals/research/health-sweep-recovery/runner.mjs verify _workspace/health-sweep-recovery-live
node evals/research/health-sweep-recovery/review.mjs packets _workspace/health-sweep-recovery-live _workspace/health-sweep-recovery-packets.json
node evals/research/health-sweep-recovery/review.mjs assess _workspace/health-sweep-recovery-live _workspace/health-sweep-recovery-annotations.json _workspace/health-sweep-recovery-assessment.json
```

Read every completed answer against the private rubrics and CRITERIA.md; retain explicit evidence, pending judgments and reviewer identity. No keyword-based semantic grading. Report remaining denominators on failure. The first future live request is the first provider exposure to this amended schema; offline protocol tests cannot prove provider acceptance or model compliance.

## Offline evidence

`npm run evals:health-sweep:recovery` tests 48 injected turns/seven stop controls, budgets/receipts, malformed outputs, exact captured five-request replay followed by valid finalization and assembly, and cap/duplicate/wrong-tool stops with cleanup. All fixtures are in-process or auth-free fake CLI; no model/network request. The five captured payloads retain their original invalid ledgers; scope IDs are remapped only in the local fixture to its test thread. New source files are separate derivatives; old frozen sources remain unchanged. Development syntax and restricted-local-process failures are separately retained and are not readiness evidence. Full QA is required before readiness.

Frozen body SHA-256: `72993f6a81cb2be6891cfa10f34ebf138d636a317cba0004a5ae827f1cfc8baf`. Final sealed evidence is `offline/sealed-tests.log`, `offline/drill-sealed.log` and `offline/raw-simulation.tar.gz`; earlier passing logs refer to development source revisions.
