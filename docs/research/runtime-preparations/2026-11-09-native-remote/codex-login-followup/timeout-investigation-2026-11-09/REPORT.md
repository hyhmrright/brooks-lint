# Follow-up investigation of proxy-enabled login smoke

## Observations

This investigation did not submit a real model request. Both referenced live
records are historical, sanitized evidence and remain unchanged. Their 45-second
limits start before CLI initialization, so neither gave the model a full 45
seconds after the prompt was recorded.

| Event | Without inherited proxy | With inherited proxy |
| --- | ---: | ---: |
| Thread and turn started | 3.4 s | 3.8 s |
| User message completed | 19.5 s | 6.7 s |
| Moderation and rate-limit notifications | not observed | 7.7 s |
| Assistant response or completed turn | not observed | not observed |
| End, including cleanup | 45.0 s | 45.0 s |

Times are differences between the saved `started_at` and event `emittedAtMs`,
rounded to 0.1 seconds; end time includes cleanup. They are observations from two
single runs, not a controlled latency comparison. Receipt of rate-limit and
moderation notifications does not prove the source or completion of inference.
The code-mode warning alone does not establish a cause. The record does not
identify an upstream request, provider error, model-generated token, or actual
provider-side usage; provider retries and cost remain unknown.

The local synthetic proxy drill demonstrates that this CLI and launcher can
exchange a simulated response over a loopback HTTP proxy, not that the live
ChatGPT path, real TLS/proxy, entitlement, or selected model succeeded. Official
[Codex app-server documentation](https://learn.chatgpt.com/docs/app-server)
describes a turn as asynchronous and a completed turn as a separate event. The
absence of that event before the local deadline therefore cannot distinguish a
slow response from a stalled connection or another upstream problem. The
[Sign in with ChatGPT app-server guide](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server)
also cautions that a model catalog is not an entitlement check; that guide
covers a separate OAuth integration and does not establish the transport used in
these stock-login runs.

## Next live decision

The underlying reason remains unverified. Before any new live attempt, select
and disclose the exact model, reasoning setting, turn count, time limit and the
lack of a provider-side cost cap. Use a new output directory. A successful
text-only answer would establish only that one login smoke succeeded, not shell
isolation or the validity of the 81-answer comparison. Do not automatically run
the formal study or retry silently.

## Offline reproduction and diagnostic changes

The launcher now records monotonic timestamps for RPCs and notifications, the
last observed activity and pending RPC methods at deadline, and the actual
configured limit for shortened offline runs. These fields help locate the point
of an interruption; they do not expose upstream internal progress. No longer
claim a shortened test used the standard 45-second limit.

`synthetic-success/` and `synthetic-timeout/` retain the actual local CLI's
sanitized records using the same `gpt-6.1-terra` label and an authored loopback
proxy response. The first delayed the synthetic response by 500 ms and completed
under a 10-second total deadline. The second delayed it by 4 seconds under a
2.5-second total deadline, failed at the expected deadline, and confirmed process
and temporary-home cleanup. Each proxy observed one synthetic POST. The selected
label does not invoke or verify the named model. The 20 focused offline tests
passed. Reproduce with a fresh directory:

```sh
node evals/research/runtime/prospective/codex-login-proxy-drill.mjs /tmp/brooks-success-NEW gpt-6.1-terra 500 10000
node evals/research/runtime/prospective/codex-login-proxy-drill.mjs /tmp/brooks-timeout-NEW gpt-6.1-terra 4000 2500
node --test evals/research/runtime/prospective/codex-login-smoke.test.mjs
```

## Offline validation

Independent harness QA passed `npm run validate`, `npm test` (899 tests), and
`npm run evals` (64 structural scenarios), checked the retained synthetic records
against the launcher hash and checked release-document consistency. The runtime
preparation suite, parser-fidelity benchmark (100% on its frozen corpus), and
seven Codex behavioral fixture validations also passed offline. These checks do
not establish the live timeout's cause or verify a provider response.
