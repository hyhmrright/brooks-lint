# Codex login smoke: runnable entry point

## Ready scope

The next live step can be a **single text-only ChatGPT-login smoke**, after the
maintainer selects the intended model and asks to start. No live inference was
submitted while preparing this entry point. This is not the three-session shell
smoke, a runtime-quality evaluation, or the registered 81-answer study.

Run from the repository with the exact model explicitly selected:

```sh
npm run evals:runtime:login:smoke -- --live --model gpt-6-luna --out /tmp/brooks-login-live-NEW
```

Replace `NEW` with a fresh identifier. The launcher refuses existing output
folders. Changing the model in the desktop conversation does not set this
subprocess's model; the argument must match the intended test model. Reasoning is
pinned to `low`. The normal Codex login must already be a ChatGPT file login;
API-key logins are rejected. No API key is requested or used. File-login storage
is the supported profile here; keyring-only credentials are not silently copied
or extracted.

The launcher uses the actual `codex app-server` executable and stock catalog.
It verifies `account/read` reports ChatGPT, selects an ephemeral thread with no
execution environments, disables the shell feature and ambient integrations,
rejects model fallback/selection mismatch, and submits the fixed request
`Reply with exactly BROOKS_LOGIN_OK`. An unexpected activity item or interactive
request fails the smoke. A real response is still necessary to establish that the
account can use the selected model.

## Limits and evidence

The launcher submits one turn, applies a 45-second deadline and a 2 MiB captured
output bound, and confirms process-group absence and pipe closure after bounded
termination (up to 3 seconds). It does **not** enforce a provider-side request,
token, or dollar cap. Codex may retry internally; built-in provider retry overrides
are rejected by this installed CLI. The earlier API `$0.10` guard does not apply
to ChatGPT-login quota. This bounded connectivity smoke is a different, explicitly
labeled treatment. Do not report a cost of zero merely because no bill is exposed.

`record.json` captures CLI version/initialization metadata, requested model and
reasoning, CLI-selected model, redacted requests/events, answer, observed token
usage when available, exit/cleanup evidence, and limitations. `events.jsonl` and
`answer.txt` preserve the event stream and answer separately. Provider-reported
model identity remains null unless separately observed; a CLI model setting is
not backend attestation. The launcher does not claim that disabled features remove
all advertised tools: stock Luna still advertises code-mode and collaboration.
An unexpected tool item fails the run; this is not a pre-dispatch network cap.

The private temporary home contains only access/id tokens and account metadata
needed for this login. The original refresh token and API key are never copied;
the required refresh-token field is empty. This avoids rotating or losing the
normal login's refresh token. If the access token expires, the smoke fails; refresh
the normal Codex login before retrying. The original login/config is never edited.
The private home is permission-restricted and removed after process termination.
Known secrets and the private path are removed from archived records. Removal is
ordinary filesystem deletion, not a secure-erasure claim.

## Offline evidence

- `text-smoke-offline-final/` was produced by the actual Codex CLI 0.167.0 with the stock
  `gpt-6-luna` profile and one authored response served over loopback. It completed,
  returned the expected text, and confirmed process-group/private-home cleanup.
  It is explicitly simulated and proves no account entitlement or real model answer.
- The actual CLI's `login status` also accepted the access-only private auth shape.
  That command submitted no inference; no credentials or account identifiers were
  archived from this check.
- Sixteen deterministic tests cover explicit opt-in, model/route validation,
  login rejection, source-login preservation, secret exclusion, unexpected tools,
  protocol errors, timeouts, spawn failure, model mismatch, answer mismatch,
  cleanup and refusal to overwrite evidence.

The local reproduction command is:

```sh
node evals/research/runtime/prospective/codex-login-smoke-drill.mjs /tmp/brooks-login-offline-NEW
node --test evals/research/runtime/prospective/codex-login-smoke.test.mjs
```

The remote-shell code-mode reproduction is recorded separately in `stock-code-mode/`.
Passing this text smoke does not certify that remote execution, resource isolation,
or runtime diagnosis works with a real model. Progress to that stage only after
reviewing its own records; do not automatically launch the 81-answer study.

References: [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
and [Codex App Server](https://learn.chatgpt.com/docs/app-server). Installed CLI
0.167.0 help and generated experimental schema establish the local `environments: []`
contract; provider behavior still requires live observation.

## Proxy-dependent environments (2026-11-09)

The launcher starts with a deliberately narrow environment. It does not inherit
proxy configuration unless `--inherit-proxy` is explicitly selected. On this host,
ordinary HTTPS to `chatgpt.com` succeeded with the configured proxy (HTTP 200,
about 2 seconds), while a clean environment without proxy settings timed out after
10 seconds. The previous live launcher discarded those proxy settings. This is a
strong, testable explanation for the live timeout, not proof of its precise cause:
the HTTPS check was not an inference request and does not establish model access.

When the operator has chosen to use the configured proxy and explicitly authorizes
a new live smoke, add `--inherit-proxy`:

```sh
npm run evals:runtime:login:smoke -- --live --model MODEL --inherit-proxy --out /tmp/brooks-login-live-NEW
```

Only standard proxy environment variables are passed, not the remaining parent
environment. Their values, usernames and passwords are redacted from records.
The proxy is a trusted transport chosen by the operator; its security and network
reachability remain outside this test. No proxy URL is written into the report.
TLS verification is not disabled. If no proxy URL is configured, opt-in fails closed.
The preexisting 45-second total deadline still includes initialization and login,
so it does not guarantee 45 seconds of inference. The proxy can make internal
provider retries possible, but does not impose a cost or request cap.

A reproducible offline transport drill starts an actual Codex CLI with a local
synthetic HTTP proxy and synthetic upstream response; no real model is called:

```sh
node evals/research/runtime/prospective/codex-login-proxy-drill.mjs /tmp/brooks-proxy-offline-NEW
```

The retained `proxy-offline-2026-11-09/` record shows one request through that
proxy and a simulated success. It does not establish that the real proxy, TLS,
login, or provider will work for live inference.

Official reference: [Codex app-server sign-in documentation](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server).

## Proxy-enabled live follow-up

The subsequent proxy-enabled live attempt also reached the total deadline without
an assistant answer. It observed the submitted user message, moderation metadata,
and rate-limit notifications sooner than the earlier attempt, but the two individual
runs do not identify the remaining cause or prove proxy inheritance fixed inference.
See `live-2026-11-09-terra-proxy/` and `timeout-investigation-2026-11-09/`. The
previous proxy hypothesis is not a validated resolution. A fresh live attempt
requires prior disclosure and authorization; do not automatically retry or run the
formal 81-answer study.
