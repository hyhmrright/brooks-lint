# Live Codex CLI login smoke: 2026-11-09

**Result: failed — deadline exceeded; no model answer was observed.** This was
one real text-only smoke turn, not an offline simulation or the 81-answer study.

- Model explicitly requested and reported by the CLI: `gpt-6.1-terra`; reasoning: `low`.
- CLI: `codex-cli 0.167.0`; account mode reported by CLI: ChatGPT.
- The CLI started an ephemeral thread with no execution environments and accepted
  the turn. The user-message events appeared; no assistant answer, usage record,
  provider error, or completed turn was observed before the 45-second deadline.
- The process group was absent, the pipes closed, and the private authentication
  home removed after termination. The original refresh token was not copied.
- The CLI warned that code mode was unavailable because its host was disabled.
  The request explicitly prohibited tool use; the available evidence does not
  establish that this warning caused the timeout. No cause has been confirmed.
- `record.json` and `events.jsonl` retain the sanitized raw protocol evidence.
  There is no answer file because no model answer was received. Token usage and
  cost are unknown, not zero. The CLI-selected model is not independent
  provider-side identity attestation.

This attempt does not demonstrate working live inference, shell execution,
resource isolation against a real model, or evaluation readiness. The executor
limits the submitted turns and elapsed time, but cannot impose a provider-side
request, token, or spending cap; internal retries are not independently counted.
No further live attempt was made automatically.

## Offline verification

After retaining this record, `npm run validate`, `npm test` (895 passed),
`npm run evals` (64 scenarios), `npm run evals:runtime:prepared` (537 passed),
`npm run benchmark` (parser fidelity 100% on the frozen corpus), and
`npm run evals:codex:validate` (7 fixtures) all passed. These checks validate the
repository and offline preparation; they do not turn the live timeout into a pass.
