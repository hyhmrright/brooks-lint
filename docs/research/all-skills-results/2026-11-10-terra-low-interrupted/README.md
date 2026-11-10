# Interrupted all-skills campaign, 2026-11-10

The maintainer authorized the 318-turn campaign and confirmed `low` effort.
The all-skills study started with Codex CLI 0.167.0 using ChatGPT login and
requested/CLI-selected `gpt-6.1-terra / low`. CLI selection is not independent
provider-side model attestation. The runtime-pack study did not start.

The first study stopped at its first failure as frozen: 46 attempted, 45 completed,
one failed, 164 not run. Semantic review has **not** been performed, so these
records do not support skill effectiveness or accuracy claims. The 45 completed
turns reported 699,838 observed tokens; the failed turn has no usage record, so
this is not the total consumption or a billing figure.

Turn 46 (AS-23, arm B, repeat 1) hit the 180-second local deadline. Its events
show repeated response-stream timeouts and reconnects, HTTPS fallback, then an
upstream message that the selected model was at capacity. These observations do
not establish the cause of every earlier timeout. The executor sent SIGTERM,
confirmed the process group absent, and removed the temporary login home. There
was no harness retry; CLI/provider reconnects are visible in the raw event log.

`raw-run.tar.gz` preserves the registration, scheduled intents, raw records and
receipts, review packets and private mapping, and execution summary. Its SHA-256
is `2aac3b90a26ae87626a64292d76c6fc00f24c9992ff225df3d5097e3f17c679e`.
The archive was scanned for common email, bearer token, JWT and API-key patterns;
this is not a proof that all possible sensitive information is absent. Raw logs
include provider status and rate-limit metadata. The source freeze and exact
registration are inside the archive; raw hashes are consistency checks, not
cryptographic proof against a complete archive rewrite.

No remaining calls were submitted and no model was switched. The frozen campaign
does not implement automatic resume or retry; a separately documented recovery
plan and authorization are needed before any additional live calls. The 45
completed answers remain unreviewed and are not a complete, balanced campaign.
