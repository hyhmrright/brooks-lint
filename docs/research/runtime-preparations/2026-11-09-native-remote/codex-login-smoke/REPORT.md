# Codex ChatGPT-login exploratory smoke, 2026-11-09

## Result: incomplete; remote executor not verified

The maintainer requested a Codex-login run instead of the frozen direct-API smoke. One exploratory Codex CLI turn completed, but the model did not run the requested command. It reported that no shell was available. The requested file read and remote execution therefore failed to be observed. No additional sessions were launched after this failure.

The original API registration and 81-turn comparative study remain unchanged and unexecuted. This exploratory run is not an execution of the frozen API protocol: it used a local temporary workspace and Codex's ChatGPT login, not the isolated Docker worker, broker, official API credential, original prompts, or transport safeguards. It supplies no evidence about remote execution, credential isolation, retry limits, provider-reported model identity, or comparative skill performance.

## Procedure and evidence

- Codex CLI: `codex-cli 0.167.0`; login status reported ChatGPT authentication.
- Requested model: `gpt-6-luna`; requested reasoning effort: `low`. The captured events do not report provider-confirmed model identity or confirm effective effort.
- One ephemeral `codex exec` session with user config and rules ignored, a read-only sandbox, JSON events, and a temporary directory containing a `domain` file with `WORKER` followed by a newline. A 75-second external timeout bounded the CLI process. The prompt requested a single shell read and no writes or other commands.
- The CLI exited 0 and reported `turn.completed`, but its only completed item was an agent message: it could not read the file because it had no shell access. A completed turn is not a successful file-read test.
- CLI-reported usage: 17,928 input tokens (11,520 cached), 35 output tokens, zero reasoning output tokens. The CLI events contain no provider request count, cost, or verified model identifier; implicit retries were not independently controlled or measured. The registered API $0.10 reservation guard did not apply to this separate ChatGPT-login channel. No API key or direct API smoke launcher was used.
- `raw-result.json` preserves the CLI JSON event stream, stderr, timestamps, process exit and timeout outcome. The raw events must not be treated as proof of shell execution or provider-confirmed model identity.

Next work requires a separately designed Codex-login executor that makes its tools available while providing and validating the intended isolation, model identity, usage bounds, and cleanup. Do not present this run as a successful frozen smoke or run the 81-turn study on its basis.
