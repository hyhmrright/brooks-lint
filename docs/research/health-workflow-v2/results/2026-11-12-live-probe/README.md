# Live routing probe — 2026-11-12

One authorized turn, no client resubmission. Frozen plan `cef90975154e987c028ae3aa2c6c197fdee8a7f169881091a9fd206b80a5cf2f`; CLI-selected gpt-6.1-terra / low, Codex CLI 0.167.1, ChatGPT login. Selection is not independent provider identity attestation.

Result: **failed at the 120-second deadline**. No scorer invocation and no completed answer; observed token usage unavailable. The stream logged request timeouts, reconnect attempts 2/5 through 5/5, then a WebSocket-to-HTTPS fallback warning. These are internal transport retries despite no client-level retry; the frozen plan explicitly noted provider retries were not hard capped. The cause of the connection timeouts is not established. Cleanup confirmed process group absent and private home removed. Deadline was observed at 120004 ms; cleanup completed at 120046 ms.

The failure is not evidence that the scoring route works or that the model refused to use it. No formal 108-answer campaign was started. `record.json`, `events.jsonl`, the empty `answer.txt`, and `probe-result.json` retain the raw sanitized record. A heuristic scan found no recognizable credential patterns; this is not proof of absence of all secrets.
