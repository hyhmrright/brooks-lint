# Formal pilot stopped during Docker preflight

Recorded 2026-11-15 UTC. Frozen source commit: `cea4c9908df364ea59db00f0c73ffd5add0b1d63`; freeze SHA-256: `45422dd46f7b5bd11c19a688f0441fbf4f46ef594a81687a0f29d075c6003ac1`.

The user authorized 72 calls with Codex CLI, selected model `gpt-6.1-terra` / `low`, a 10,000,000 observed-token admission budget, six-hour campaign and 120-second turn limits. Offline suite validation confirmed these frozen settings. This is the requested configuration, not a backend identity observation: no model session was started.

The first execution command exited 1 at the Docker image preflight, before the output directory or model request was created. **Submitted: 0; completed: 0; observed tokens: 0; model answers and adjudications: none.** No B/C comparison or efficacy conclusion is possible. The six-hour and token figures are limits, not expenditures. The frozen fail-stop rule was followed: there was no automatic retry and no formal execution after the failure.

The error message `Pinned Docker image unavailable` alone did not distinguish missing image from denied daemon access. A subsequent read-only `docker info` in the same sandbox reported permission denied connecting to `unix:///Users/hyh/.docker/run/docker.sock`. A separate authorized read-only image inspection outside that sandbox returned the exact pinned image ID and `linux arm64`. Thus the immediate cause is sandbox socket access, not an absent image; the check did not run a model or repeat the collector. This does not prove a later full run will succeed.

The original attempt and diagnostic output are preserved in `attempt.txt`. There was no collector-created live directory or raw response to archive. The prior six-call protocol run and all historical results remain unchanged. Any subsequent formal execution needs an explicit recovery plan and authorization under the frozen stop rule, using an environment that can access the pinned Docker daemon without weakening the candidate isolation policy.
