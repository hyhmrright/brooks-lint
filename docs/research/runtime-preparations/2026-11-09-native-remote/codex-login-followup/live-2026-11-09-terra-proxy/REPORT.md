# Codex login smoke with proxy inheritance — 2026-11-09

Result: **failed — deadline exceeded**, not a successful inference. One real text-only turn was submitted using Codex CLI 0.167.0, ChatGPT login, requested model `gpt-6.1-terra`, and low reasoning effort. The CLI reported selecting that model and effort; independent provider identity was not reported. The 45-second deadline covered startup and the turn. Explicit environment proxy inheritance was enabled.

The app server accepted the thread and turn, recorded the user message, and emitted moderation and account rate-limit notifications. It emitted no assistant answer, completed turn, usage, or explicit provider error before the deadline. `events.jsonl` contains the sanitized event stream; `record.json` includes the sanitized requests, responses, and cleanup details. There is no raw assistant answer because none was received. Usage and cost are unknown; one submitted turn does not prove a single backend request or a hard spending cap.

Cleanup reported the process closed, its process group absent, and the private authentication home removed. The code-mode warning concerns a disabled host; this text-only smoke did not request code execution, and the record does not establish that the warning caused the timeout.

The proxy-enabled run progressed farther than the prior run by recording the submitted message and subsequent notifications, but neither run produced an answer. This observation does not prove the proxy was the original cause or identify the remaining cause. A successful local synthetic proxy drill remains only an offline wiring check. No formal 81-response comparison was run. Further live attempts require an explicit decision on the model and budget.
