# Health tool retest: first recovery interrupted

The first recovery of the [interrupted run](../2026-11-11-terra-low/README.md)
completed ordinal 18 and stopped before a model answer at ordinal 19. The
composite verifier confirmed 18 completed, one failed, and 29 not run. The two
recovery attempts bring total attempts to 20, including the original failure;
observed tokens total 639,873, with failed-turn usage unknown. Semantic review
remains pending and this incomplete result supports no comparative conclusion.

Ordinal 19 failed its CLI version check: the registered version was 0.167.1,
but the selected executable reported 0.167.2. The failure occurred before a
model turn, and cleanup confirmed the process group absent and the private home
removed. No automatic retry was performed. A local 0.167.1 installation was
subsequently identified for a separately frozen continuation.

`raw-recovery.tar.gz` preserves the full recovery directory and composite raw
records. Its SHA-256 is in `SHA256SUMS`; the original failure remains separately
archived. A heuristic credential scan found no recognizable API keys or token
fields; it is not proof that arbitrary secrets are absent.
