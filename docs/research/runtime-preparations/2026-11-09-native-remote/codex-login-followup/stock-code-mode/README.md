# Stock Luna code-mode shell diagnosis (offline)

This is a synthetic, local-upstream diagnostic using the installed Codex CLI 0.167.0 and the existing network-none Docker worker. No real inference or ChatGPT credential was used. The bundled model catalog is unchanged.

The actual Luna request declares `functions.exec` as a custom tool in `input[].additional_tools`; its description includes `tools.exec_command`. The fixture responds using that declared custom tool, wrapping an `exec_command` invocation, rather than injecting an undeclared direct function call.

| Controlled setting | Observed result |
| --- | --- |
| `features.code_mode_host=false` | Custom-tool output is `code-mode host is disabled`; no command execution event. |
| `features.code_mode_host=true` | A command execution event reports exit 0 and `WORKER`; its output is returned in the second upstream request. |

Both runs confirm leased worker cleanup and absence. They make two local fixture requests each. The final assistant message is authored synthetic text and is not an evaluated model answer. The disabled run's completed turn does not imply a successful shell read.

This establishes a reproducible configuration failure in the exploratory launcher, and a working stock-catalog execution path. It does not establish the unique cause of the earlier live model's unsupported claim that no shell was available. It also does not certify real ChatGPT authentication, provider identity, strict inference-call limits, or the remaining advertised collaboration tools. The earlier restrictive validator still rejects the larger stock tool surface; it has not been weakened to approve this diagnostic.

Reproduce into a new directory (Docker required, no real model):

```sh
node evals/research/runtime/prospective/codex-login-stock-drill.mjs record /tmp/brooks-stock-code-mode-new
node --test evals/research/runtime/prospective/codex-login-stock-drill.test.mjs
```

The drill applies two checked transformations to the existing offline probe: the fixture tool-call format and code-mode-host setting. Each generated source is archived alongside its record, bound by SHA-256. Machine-address notification events are omitted; the worker capability token was redacted by the base probe. The regression test reproduces the generated sources, checks hashes and positive/negative outcomes. It is not a security attestation for live use. The reused exploratory probe still has its previously documented host-process lifecycle limitations.

During capture the first validator incorrectly assumed the custom-tool output was a string. The successful native response actually contains an array of input-text blocks. The validator was corrected to accept the observed container format; the unchanged raw observations were then validated and hashed. No fixture output was changed to make this assertion pass.
