# Boundary between offline preparation and real model validation

Prepared on 2026-11-09 (Asia/Shanghai). This is a proposal, not a model switch,
execution authorization, completed study, or a claim that the executor is ready.
The maintainer requested all feasible offline preparation, then notification before
real model validation. No external contributor response is required.

## Proposed smallest real validation

After the native isolation and cleanup gates pass, propose `gpt-6-luna` with
`reasoning.effort=low` through the official OpenAI Responses API, Standard tier.
This economical choice is for connectivity and tool smoke tests, not evidence that
it is the best model for runtime diagnosis. Account entitlement and native CLI
compatibility must be observed; neither is established by a public model page.
If unavailable, stop and report rather than silently selecting another model.

Use three fresh smoke sessions, each with at most two upstream requests:

1. Read a harmless marker through the actual isolated native tool: validate
   authentication, tool execution, continuation and the recorded final answer.
2. Print the remote working directory and read the marker in a fresh session.
3. Read the marker in another fresh session and acknowledge that it alone does
   not establish retry policy. No semantic efficacy score is assigned.

Thus the proposed maximum is **six HTTP inference dispatches**, not three calls.
The implementation also allows at most **six input-token counting requests**,
one before each inference dispatch: at most twelve provider HTTP requests total.
Every continuation consumes the same shared budget. No automatic retries,
credential refresh, redirects, fallback models or model-based graders. Reserve
the full allowance before sending; a timeout or uncertain receipt does not refund
the request. Smoke answers never enter the 81-response comparison.

Request limits are 32,768 total input tokens and 4,096 total output tokens
(including reasoning) per dispatch. The prepared transport checks the provider's
input count and injects the output cap. Count the complete outgoing text/tool
input including native instructions and conversation history. Tool transcripts
can increase continuation size. Refuse dispatch if the count is unavailable;
character counts are not token counts. Actual production enforcement remains a
live observation; offline fixtures return authored counts.

## Price research and budget

Official pages consulted on 2026-11-09:

- [GPT-6 Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna):
  Responses supports tools and low reasoning; Standard short-context input is
  $0.10 and output $0.50 per million tokens.
- [Pricing](https://developers.openai.com/api/docs/pricing): cache writes have
  separate rates; the listed 12-hour write rate is $0.25 per million tokens.
- [Count input tokens](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count):
  the documented endpoint reports an input count. The prepared code projects the
  same model, input, tools, tool choice, parallel-tool setting and reasoning into
  this request. No counting request has been sent to the real provider.

Six fully bounded requests at ordinary uncached rates would cost at most
`6 × (32768 × 0.10 + 4096 × 0.50) / 1000000 = $0.0319488` in token charges.
Using $0.35 per million input as a conservative planning allowance for ordinary
input plus the listed 12-hour write rate gives $0.0811008. This is an intentionally
conservative arithmetic scenario, not a claim that those charges are additive.
No hosted paid tools, regional premium or accelerated tier is proposed.

Propose a **$0.10 local reservation ceiling for this smoke run**, conditional on
verified pricing, token limits and tier immediately before execution. A reservation
ledger is not a provider billing guarantee: charges for accepted requests may
arrive after local cancellation. Any unknown usage remains unknown, not zero.
ChatGPT subscription quota and third-party gateway tariffs are not represented by
these API prices. If the user chooses a different channel, prepare a new budget.
The consulted sources did not establish separate token-count endpoint billing;
this is explicitly unverified. The $0.10 ceiling is a local inference reservation,
not a verified all-in invoice cap including that endpoint or taxes.

## Required live handoff record

Before asking to run, record the final executor source digest, pinned native CLI
and image, treatment ID, passing offline QA, remaining limitations, endpoint,
requested model/effort/tier, exact limits and fresh budget. Keep credentials out
of the repository and tool domain. Do not publish raw authentication headers;
use schema-allowlisted metadata for real runs rather than the public-dummy fixture
logging policy. Real credential expiry, account authorization and provider model
metadata are precisely the remaining live observations, not offline passes.

Record requested model, client configuration, broker-observed request model,
provider-reported model and usage separately. A response's model string is provider
reported identity, not independent attestation of underlying weights. The chat's
model selector does not automatically configure the test executor. There was no
test-model selection or switch during this offline preparation.

## Subsequent study

Preserve the original 9-case, 3-arm, 3-repeat plan and its 81 `not-run` records.
Its study digest is
`bade5c6cc86db0ea02dd32d6f22adb970374db427d757a4a3535258eb912996b`.
App Server remote execution changes the launch protocol: register that treatment
separately and freeze its model, prompt assembly, tool profile, order, request
limits and scoring contract before running any study answers. Do not describe
81 answers as 81 requests; tools and retries can change the request count.

Run the same three arms under the same new executor and model. Preserve raw
answers and failed/partial attempts; grade against frozen rubrics, retaining
disputes and explicit execution/review denominators. Repeated answers are not
independent cases. These public, previously inspected candidates remain exposed
development material; autonomous agent review is not independent human review.
Budget the comparison from measured smoke usage and actual prompt sizes, then
notify the maintainer separately. Smoke approval does not authorize the full run.

## Offline material inventory

`offline-inventory.json` records all 27 distinct case/arm packets; repetitions reuse
those bytes. Serialized packets range from 2,258–2,669 bytes for A,
120,611–121,022 for B, and 130,801–131,212 for C. These are whitelisted material
packets, not actual prompts or token estimates. A file-based executor may stage
guidance and observe subsequent reads. Neither silent truncation to a transport
limit nor assuming the six-request smoke allowance covers the study is valid.

Recompute and compare without Docker, network or model access:

```sh
node docs/research/runtime-preparations/2026-11-09-live-handoff/inventory.mjs --check
```

This also validates the original plan/response template, its inventory anchor,
all 81 canonical `not-run` statuses and the proposed smoke arithmetic. It does not
validate the native executor or grant permission to run it.

## Prepared HTTPS transport and recorded local controls

`native-upstream-transport.mjs` accepts no ambient credential lookup. Default mode
allows only numeric-loopback HTTPS with a public fixture credential/model. Live
mode requires explicit registration/authorization, the official API origin,
`gpt-6-luna`, low effort and provider token counting. TLS verification stays on;
live mode forbids custom CAs, redirects, refresh and retries. The shared monotonic
deadline spans counting, inference and continuations. Whole-response buffering
permits completion, tool-profile, usage and identity validation before release to
the client; it is an explicitly new treatment, not the original streaming study.

The transport reserves 13,516,800 nanodollars before each inference dispatch,
never refunds uncertain outcomes, and caps six dispatches across the run. It
rejects unknown request fields, accelerated tiers, image inputs, dynamic config
updates and unapproved tools. Requested identity and provider-reported identity
remain distinct. It retains a safe metadata ledger; raw approved response bytes
are returned to the trusted controller for study-specific archival. Known literal,
Unicode-escaped, base64 and hex credential echoes are refused. This is not a
general detector for every possible encoding or an untrusted provider.

All 53 focused tests passed with no skips on this host, including a saved native
packet through the same parent gateway into the TLS transport. `transport/` holds
source snapshots, complete test output and 53 fixture records containing 42 actual
local HTTP request/response receipts. Empty observations document requests refused
before HTTP. Body bytes are application writes/reads, not packet captures. The
TLS cert/key is ephemeral and public-fixture-only; no real key is recorded. Default
tests create a fresh cert and never use the historical short-lived certificate.
Hosts without OpenSSL explicitly skip the TLS controls; they must not claim those
controls passed. Pure policy/parser checks still run.

The first recorder archive is retained as `transport-development-capture/`.
Its four unfinished response-close records exposed an archive race. The corrected
recorder waits at most one second for each response-close observation after server
closure; the final 42 HTTP receipts all have terminal capture and byte hashes.
Two earlier development checks also caught a stale expected authorization error
after strengthening the counter gate, and a late fixture timer writing after
capture had closed. Both were corrected before this final collection; they are
development failures, not model results or independent QA findings.

```sh
node --test evals/research/runtime/prospective/native-upstream-transport.test.mjs
node docs/research/runtime-preparations/2026-11-09-live-handoff/verify-transport.mjs
```

The [native report](../2026-11-09-native-remote/README.md) owns the actual Docker
controls, three-session smoke rehearsal and separately frozen smoke registration.
Read its QA verdict and remaining limitations before proposing any live command.
Changing the chat model is not a replacement for the registered executor model.
