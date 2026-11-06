# RT-01 execution pilot

On 2026-11-06 this preliminary live pilot checked runner compatibility with one
RT-01 call per arm. All three calls executed; their answers identify the dropped
cancellation signal. This is an observation of responses, not a semantic or human
review, accuracy estimate, or evidence of benefit. The later [37-case study](../2026-11-06-terra-37/README.md)
was independently planned and executed; these three calls are not included in it.

The requested model was `gpt-6.1-terra`, reasoning `medium`, one repetition and a
240-second per-process timeout; the CLI was `codex-cli 0.166.0`. The clean source
commit was `3b1257c68380d1a22722462e3ea8c09353514397`, manifest revision 7
(SHA-256 `a022ba18ea4c0534beba1d08c047a89cc4205d203792697ba13b1d4fcade4f5b`),
and plan SHA-256 was
`eb39f290501ba941332f71a4f0e0de2369adef1a8b590df20ff9542e9dceb1f9`.
The run began 2026-11-06 07:17:32 UTC and ended 07:19:12 UTC. The A/B/C arms and
isolation contract are described in the [runner documentation](../../runtime-runner.md).

Reported usage across all three calls was 127,698 input tokens, 85,760 cached
input tokens, 2,239 output tokens and 126 reasoning output tokens. Cached and
reasoning figures are reported breakdowns rather than additional totals. The
[sanitized records](results.json) include per-call outcomes, answers and usage;
temporary local paths are replaced, and hashes refer to original unredacted data.
Raw execution artifacts remain ignored locally.
