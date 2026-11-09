# Timeout investigation and offline proxy drill

The preceding live smoke selected `gpt-6.1-terra` and submitted one turn but timed
out without an answer. Its private launcher environment contained only PATH, HOME,
and CODEX_HOME. This omitted the host's configured proxy variables.

Read-only network diagnostics on 2026-11-09 found configured proxy variables and
system proxy settings. A normal `curl` HTTPS request to `https://chatgpt.com/`
returned HTTP 200 in approximately 2 seconds. A request with `env -i`, PATH and
HOME only, timed out after 10 seconds without a connection. Neither check submitted
inference or used account credentials. Host-specific proxy values are not retained.
This isolates a plausible missing proxy path; it does not establish which exact
connection or provider behavior caused the previous live timeout.

The launcher now supports explicit `--inherit-proxy`, with a proxy-only allowlist,
URL validation and credential redaction. No proxy is inherited by default. The
local drill used the real installed Codex CLI against a synthetic loopback proxy,
which returned an authored response. Its retained record reports one proxy request,
`BROOKS_LOGIN_OK`, no execution environments and successful cleanup. This is a
simulation, not a real model answer. A new live smoke is required to verify the
hypothesis and remains pending explicit authorization.

The historical simulated record's source hash remains bound to its historical
launcher; it is not rewritten to imply that the changed launcher produced it.
The current drill record binds the current launcher hash.

Offline validation: the independent harness QA passed repository validation,
897 unit tests and 64 structural eval scenarios; see `QA.md`. The parser-fidelity
benchmark passed and all 7 Codex behavioral fixtures validated offline. The
runtime preparation suite was also rerun after the final edit.
