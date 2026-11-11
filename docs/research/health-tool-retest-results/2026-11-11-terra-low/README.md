# Health tool retest: interrupted run

The frozen [health tool retest](../../health-tool-retest.md) began with Codex CLI
0.167.1 selecting `gpt-6.1-terra` at `low` effort. The CLI selection is recorded;
independent provider-side model identity was not verified. The freeze SHA-256 is
`e3ba494a7fdff3b1636f43b99b8e6b9f5203c1c558fe1bff292bbdce72135cf7`.

The runner stopped on the first execution failure: 17 completed responses, one
failed attempt (ordinal 18, AS-21 arm A repeat 2), and 30 scheduled turns not
run, out of 48 planned. Observed usage was 616,843 tokens for completed turns;
usage for the failed turn is unknown. Offline `runner.mjs verify` confirmed raw
evidence integrity with these counts. Semantic adjudication remains pending;
this incomplete sample does not establish a comparative result.

The failed turn started 2026-11-12 00:01:31.677 China time and recorded a
`Smoke deadline exceeded` failure at 00:10:39.412. The process group was confirmed
absent and the private login home removed. The system power log records clamshell
sleep at 00:03:12 and wake at 00:10:38, explaining why the 300-second deadline was
processed late. Sleep occurred while the turn was active; the available record
does not establish whether the provider would otherwise have completed it.
`caffeinate -is` cannot prevent lid-closure sleep on battery. No failed turn was
retried and no later turn was admitted.

`raw-run.tar.gz` preserves the registration, completed answers, raw events,
receipts, failed attempt and stop record; it contains no copied login home. A
heuristic scan found no recognizable API key or token fields, but is not a proof
that arbitrary secrets are absent. SHA-256:
`404abd30018bb73e06d8c24b5d6fd68c452e1f4225fc9fb24bfdb2eb843081e9`.
The previous study remains unchanged. A continuation needs a separately documented
recovery plan under the freeze, and a host kept awake with the lid open or a
suitable external-power setup. Do not treat the failed attempt as a model answer.
