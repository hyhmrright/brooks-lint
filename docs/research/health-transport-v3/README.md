# Connection-timeout investigation and prospective transport guard

Date: 2026-11-12. No real model calls occurred in this maintenance change.
The failed live record at `../health-workflow-v2/results/2026-11-12-live-probe/`
is unchanged. It remains a failed, single submitted turn, with unknown usage.

## Diagnosis

Symptom: the prior turn reached its 120-second deadline without a scorer call or
answer. Source evidence: stream errors reported `request timed out`, reconnects
2/5 through 5/5, and WebSocket-to-HTTPS fallback at roughly 117 seconds. Its
`proxy_mode` was `none`; the isolated CLI did not inherit proxy variables. Current
parent environment presence checks show `ALL_PROXY`, `http_proxy` and `https_proxy`
are set (values were not printed). Consequence: the isolated test used a different
network path from the configured environment, and repeated transport attempts
consumed nearly all the deadline. Remedy: a separately versioned adapter explicitly
inherits a frozen proxy binding and terminates on the first observed retry event.

Proxy omission is a plausible contributor, not a proven cause of the historical
network timeout. Current proxy presence does not attest the historical value, and
this change has not tested real TLS, account access or upstream availability.

## A rejected configuration is retained

The official [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
documents provider WebSocket support and HTTP/SSE retry controls. That does not
establish that the built-in `openai` provider can be overridden. An actual CLI
0.167.1 local experiment rejected the override before any HTTP request:
`model_providers contains reserved built-in provider IDs: openai`.
The failed experiment's raw record and argv are retained. The final adapter does
not ship these ineffective overrides, rename the official provider, or redirect
real credentials to a custom upstream. HTTPS-only and absolute elimination of
provider-internal retries remain unverified.

## Offline observations

The actual complete CLI 0.167.1 installation ran against an authored loopback HTTP
proxy, without login credentials or model inference:

| Control | Observed proxy requests | Outcome |
|---|---:|---|
| Successful code-mode scorer roundtrip | 2 (call + final response) | One scorer invocation; verified report |
| HTTP 401 | 1 | Failed, cleanup confirmed |
| HTTP 429 | 1 | Failed, cleanup confirmed |
| Interrupted SSE | 1 | Failed, cleanup confirmed |
| Retry notification (fixture permits one retry) | 1 | New guard stopped on first retry notification |
| Stalled response | 1 | Deadline failure, cleanup confirmed |
| Proxy deliberately omitted | 0 | Failed direct connection; no proxy request |

No WebSocket upgrades were observed. This HTTP-only observation applies to the
**fixture provider**, configured with WebSockets disabled. It does not establish
HTTPS-only behavior for the built-in live provider. Although the retry-notification
control stopped before a second request here, notification and process termination
can race with CLI activity; this is not a hard assertion of zero internal retries.

`offline-records.tar.gz` preserves the rejected override, the initial controls,
the final seven controls, and final source snapshots. All are labeled simulation.
A heuristic scan found no recognizable credential patterns; this is not proof of
absence of every possible secret. Unit regressions additionally cover proxy
fingerprint drift, missing explicit live authorization, foreign scope/model,
retry-event rejection even if followed by a completed message, and bounded cleanup.

## Next probe, not executed

`probe-plan.json` is a **new** preparation. It retains CLI-selected
`gpt-6.1-terra / low`, complete CLI 0.167.1 with both binary hashes, one submitted
turn, 120 seconds, 3-second cleanup, no client retry and no automatic continuation.
The proxy environment is bound by variable names and a SHA-256 fingerprint; proxy
URLs and credentials are not stored in the plan. Any change requires a newly
reviewed preparation. The runtime still validates supported proxy URL schemes and
redacts proxy values from records. Built-in login/provider selection is unchanged.

```sh
node evals/research/health-transport-v3/probe.mjs execute PLAN ANCHOR ABSOLUTE_CODEX NEW_OUTPUT --live
```

Explicit user authorization is still required. No 108-answer campaign is started
by this command. A successful new probe would first require prospective collector
registration/integration with this new transport and evidence schema. The existing
`skills-benchmark-v2/campaign.mjs` intentionally rejects this different probe schema;
do not weaken its old gate or pass new evidence off as the old frozen study.

```sh
npm run evals:health-transport:v3
node evals/research/health-transport-v3/drill.mjs NEW_OUTPUT ABSOLUTE_CODEX 0.167.1
```

The latter requires local process/network permissions, but contacts only the
loopback fixture. Both commands are offline. Source hashes in the new plan protect
the adapter, probe and imported scoring sources; historical plans are untouched.

Frozen anchor: `bfa61337e6c75a4c632287cdfac98da452dfcea38d47c70bf6f5e1740d3c773c`.
