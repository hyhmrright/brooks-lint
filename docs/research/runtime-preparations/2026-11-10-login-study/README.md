# Codex login comparison executor — text treatment v1

This is a new, explicit full-context text treatment, not execution of the historical
native-tool frozen design. The original plan and results remain untouched. Each
turn supplies precisely `turnInputs` case files and arm guidance as JSON text;
all three arms use the same assembly and message role. Rubrics, provenance and
expected observations are not sent. Guidance availability is not observed skill
reading. All cases remain public, exposed and non-independent, human review pending.

The transport uses a fresh CLI process, temporary HOME/CODEX_HOME and ephemeral
thread for every turn. It disables tools, installed skills, plugins, memory,
parent instructions and web search, rejects unexpected tool items/server requests,
and confirms process-group absence with bounded Darwin `ps` observations and private-home deletion. Signal-zero liveness checks are not used; an unknown observation fails closed and retains the private home. This executor is macOS-only: unsupported hosts are rejected before authentication, filesystem setup or model process spawn. Process integration tests are skipped there; pure registration/assembly and lifecycle-injection tests still run. This is a
text-only protocol boundary, not proof of OS containment for arbitrary native tools.
The app-server thread/turn protocol is documented at
https://learn.chatgpt.com/docs/app-server .

## Prepare after selecting the model

Create a JSON config containing the unchanged frozen `plan.json` as `plan`, the
exact common `prompt.txt` as `prompt`, explicit `model`, `effort`, `cli_version`,
`authorization` (the maintainer's request reference), and `inherit_proxy` boolean.
Do not put credentials in it. These are evaluator-only files. Register before
running; retain the generated registration JSON’s `sha256` field independently:

```
node evals/research/runtime/prospective/codex-login-study.mjs register CONFIG NEW_REGISTRATION
node evals/research/runtime/prospective/codex-login-study.mjs run REGISTRATION SHA256 NEW_DIRECTORY --live
```

The anchor is the registration's `sha256` field, not a hash of formatted JSON.
Registration pins plan bytes, source hashes, prompt, arm order, model, effort,
CLI version and limits. Never change settings midway. No live requests were made
while implementing this executor. The user will select a model before registration.

## Limits and evidence

81 primary turns, sequential fresh sessions, zero primary retries, 900 seconds
per turn including startup. The first failed/mismatched/unclean turn stops the
batch, preserving remaining `not-run` rows. A new output directory is mandatory;
no resume overwrites or silently replaces failed answers. CLI version and selected
model must match. Requested effort is submitted explicitly. Provider/backend
identity remains unknown; CLI-selected metadata is not weight attestation.
Built-in provider retries are disclosed, not verified disabled; ChatGPT quota,
provider request count and money have no hard cap. Report usage when supplied.

Every turn keeps redacted request/event/response records, exact answer bytes,
usage, timing and cleanup evidence. Final response records, partial-masked review
packets and a pending-review summary are exported using the existing frozen
scoring adapter. Answers are not automatically marked correct. After execution,
review every successful answer against frozen rubrics, retain review provenance
and disagreements, and run the existing prospective summary CLI. Failed and
pending reviews remain exclusions; no invented 81-answer accuracy.

## Offline evidence

`node --test evals/research/runtime/prospective/codex-login-study.test.mjs` exercises
81 synthetic turns, whitelist arm assembly, registration/source drift, exact
answer bytes, pending reviews and model/effort/event identity mismatch fail-stop, partial timeout retention, unexpected tools, and private credential redaction. `offline-native/`
contains a real Codex CLI 0.167.0 run against a loopback fake proxy, with medium
effort and a synthetic `gpt-6.1-sol` model label. One fixture request completed; the captured upstream request had no `tools` field, zero tool names, the requested model, and medium reasoning effort (asserted by the drill);
no provider was contacted and the response is authored simulation, not quality
or model-availability evidence. Reproduce with `codex-login-study-drill.mjs`.

## Lifecycle diagnosis follow-up

The earlier intermittent failures are diagnosed and repaired in
[the resumed investigation](diagnostics/resumed/REPORT.md). The original
`diagnostics/README.md` preserves the earlier unresolved state as historical
evidence; it is superseded by that follow-up. The same Darwin signal-zero bug
was subsequently observed in the older login smoke during the full gate, so its
Darwin cleanup now delegates to the same bounded group observer. Historical
smoke records keep their original source hashes and are not rewritten.
