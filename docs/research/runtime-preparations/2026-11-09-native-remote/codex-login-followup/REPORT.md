# Codex-login follow-up: offline diagnosis

## Outcome and current gate

The previous live turn contained an assistant assertion that shell was unavailable, not a tool error or a captured tool declaration. Its cause is **not established**. This follow-up issued no live model requests; the 81-turn study and registered API smoke remain unrun.

A local fake upstream drove the real host Codex App Server and a separately leased, network-none Docker execution worker. The ordinary fixture exposed `exec_command` and `write_stdin`, ran an authored command in the worker, and returned `WORKER`. An adversarial synthetic command found no listed credential environment entries, host mount, Docker socket, client home, host auth sentinel, or working external network. Docker inspection and exact-ID removal/absence events were captured. These are observations under the local fixture, not proof that real ChatGPT credentials have been isolated or that every possible escape is impossible.

## Luna model catalog difference

With the bundled `gpt-6-luna` catalog entry and the same fake upstream, the client produced `additional_tools` namespaces for code execution, clock and collaboration, including `spawn_agent`, despite the tested feature settings disabling multi-agent. The synthetic upstream nevertheless injected a direct `exec_command` response. That forced response being executed does **not** show that the real model would choose or successfully call an advertised tool, nor does it establish a provider model identity. The strict offline validator rejects this default tool surface.

A separate synthetic variant copied the bundled catalog into a temporary directory and changed only the Luna entry's `tool_mode` to `direct`, `multi_agent_version` to null, `apply_patch_tool_type` to null and `experimental_supported_tools` to an empty array. The resulting fake upstream requests advertised only `functions.exec_command` and `functions.write_stdin`. Both the ordinary and hostile fixture commands completed with cleanup confirmed. This is a **protocol deviation** from the default catalog, not a verified workaround for a real provider response. The catalog hash is recorded; the full catalog is not archived. Recorded requested/CLI-selected model fields name the synthetic profile, not a model that answered.

The login-channel runner is not ready for live use. In particular, the exploratory launcher does not yet provide a verified hard limit on provider-side calls or cost, independent termination confirmation for all host processes, a tested real-login credential lifecycle, or real-provider model identity. Do not use it with real credentials or infer readiness from the fake upstream. The previous API-specific $0.10 reservation guard does not cover ChatGPT-login usage. A complete, bounded login executor and its offline failure tests are still required before another live run under the existing budget constraint.

## Evidence

- `allowed.json`, `hostile.json`: fixture-model local runs, including worker identity and lease logs.
- `luna-catalog.json`: bundled Luna tool-surface observation, deliberately rejected by the strict validator.
- `luna-direct.json`, `luna-direct-hostile.json`: local catalog override observations; no real model call.
- Records omit `remoteControl/status/changed`, which contained the local machine address, and replace the local worker control token in the environment/add request. Raw fake request bodies and remaining protocol events are preserved.
- `codex-login-validation.mjs` validates the archived simulated records and checks negative mutations. Its validation does not authenticate a live model or certify real credential isolation.

The model catalog can describe supported tools but is not an account entitlement or inference identity check; a completed inference is needed to establish access. See [OpenAI's Codex App Server documentation](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server).

## Offline verification and QA

The initial QA gate failed: the probe could exit successfully after a failed run, start the supervisor before checking the CLI binary, and leave child-process `error` events unhandled. The probe now returns a failure exit status for an error or unconfirmed worker cleanup, performs the CLI version check before starting the supervisor, and records child spawn errors; regression tests cover these paths. The two direct Luna fixture records were recaptured after those changes and bind the checked-in probe source hash. This source hash alone does not bind all imported dependencies.

The second QA gate passed for the offline work: repository validation, 864 unit tests, 64 structural evaluations, and cross-document consistency checks. The 42 focused login-record regression tests passed. The prepared runtime suite, frozen parser benchmark, and Codex behavioral-fixture validator also passed offline. These checks do not establish the missing live-login guarantees listed above.
