# Offline recovery QA

Verdict: **PASS for offline recovery preparation**, after a failed QA round and corrective loopback. This does not authorize live recovery or establish model effectiveness. The user chose to save the current results and run later. No real model calls or authorized live recovery registration were made during this QA.

## Exact source and preserved protocol

- Recovery source SHA-256: `90c7bebd92b19b5b1cafff1a2ef7e9aeaee64962ed42e70be20380d918d719b9`.
- Recovery test SHA-256: `ce18c5915cbe7e74f9a343856aed447bf64c95965f7f1275e7860699fe60adf1`.
- Original frozen protocol: `2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`.

The original registration validates unchanged against the frozen execution sources. Original records, annotations and statistics were not rewritten. The wrapper independently seals its source and the entire parent evidence tree. The saved-source hashes were checked again after resuming QA.

The original 11 successful responses retain their response identities. Ordinals 12–132 are selected once, in original order, while the failed original ordinal 12 remains a separate attempt: 132 intended responses and at most 133 cumulative attempts. Recorded parent duration is 1,571,817 ms. Admission carries forward 251,150 known tokens and retains the failed turn's unknown usage. Model, effort and CLI remain `gpt-6.1-terra / low`, CLI `0.167.0`; the original identity limitations remain.

## Failures found and corrected

The first QA round found that `readRecovery` allowed a forged `execution.json` claiming 132 completed responses and 133 attempts when the verified records contained only 11 completed and 12 attempts. The reproduction was entirely offline. Replay also lacked cumulative-token admission enforcement and recovery-duration validation.

The author added exact terminal-summary comparison, required terminal summaries for external verification, replay admission checks, and duration checks. Follow-up review found that the final failed or missing-usage response could still be labeled a successful stop merely because 133 attempts existed. Success now requires every response completed with known usage; budget termination cannot conceal failure or missing usage. Completed recovery records must also have finite, nonnegative durations. Failed/setup diagnostics may retain unknown duration because no further attempt is admitted.

Regressions exercise forged/missing summaries, mutated raw records with recomputed receipts, final-response failure/missing usage, token-stop admission, missing/negative completed duration, and reused-parent scoring/provenance. The independent forged-summary reproduction now fails as required. First-round failure evidence remains in the logs archive.

## Full final gate

The final gate ran sequentially on the exact source above after the user resumed work. Every command exited zero:

| Command | Seconds | Exit |
| --- | ---: | ---: |
| `npm run validate` | 0.544 | 0 |
| `npm test` | 156.626 | 0 |
| `npm run evals` | 0.262 | 0 |
| `npm run benchmark` | 0.263 | 0 |
| `npm run evals:codex:validate` | 0.26 | 0 |
| `node --test evals/research/skill-revision/recovery.test.mjs` | 50.566 | 0 |
| `git diff --check` | 0.018 | 0 |

The recovery suite passed all four tests, with zero skips. It includes a full 121-turn local fake-CLI execution yielding 132 distinct logical responses and 133 cumulative attempts, as well as failure and missing-usage stops, token overshoot accounting, immutable parent evidence, original response IDs, artifact provenance, source/selection/raw-byte tampering, and simulation/live separation. Fake responses and handwritten plumbing annotations are explicitly simulated; they provide no model-quality evidence.

Direct cross-document checks passed for the four manifests, six README version badges, landing-page JSON-LD and CHANGELOG against package version; the derived 12-book inventory against README/AGENTS/GEMINI; the 64-scenario inventory against AGENTS; and all six skill negative-trigger boundaries. README and recovery-preparation instructions match the save-only state and absolute parent-directory binding.

## Pause and limitations

An earlier exact-source validation was interrupted on the user's explicit pause request. Its process group was terminated with SIGTERM, disappearance confirmed, and session exit 143 recorded. Its logs were preserved rather than described as a pass. The resumed complete gate above supersedes that interrupted attempt. No sandbox/socket limitation blocked the resumed checks.

The eight-hour execution admission limit deducts recorded parent time; the per-turn deadline remains 180 seconds. Token admission can overshoot by one turn, and unknown failed usage, provider-internal activity and billing are not hard-capped. Client-selected model metadata does not independently attest the backend model. The amendment binds an absolute parent directory; relocation requires the documented separate handling. Offline success does not demonstrate restored provider capacity or successful real recovery.

## Logs

[recovery-validation-logs.tar.gz](recovery-validation-logs.tar.gz) preserves the first FAIL, correction checks, interrupted logs and final resumed command outputs. SHA-256: `b4624707cca40a3dfdb0a2f745ac894349d266847f9a639ad7a88bc50428b02e`.

No commits or pushes were performed by the QA agent; publication is delegated to the parent after this gate.
