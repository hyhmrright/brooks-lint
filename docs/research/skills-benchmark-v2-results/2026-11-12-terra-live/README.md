# All-skills v3 live collection

The frozen 108-turn campaign completed 108 responses, with zero failed or unrun turns. The CLI-selected model was gpt-6.1-terra / low, Codex CLI 0.167.1. Selection is client metadata rather than independent provider attestation. Observed total usage was 2,560,728 tokens, not a billing total. The campaign ran 2026-11-12 08:51:12–09:35:01 UTC. Registration SHA-256: `79a932021e273221531ce6d3a3469af7e2e902de36e0a886b47221d058e122dc`.

`raw-run.tar.gz` contains the complete sanitized records, answers, events, receipts, registration and masked review packets. The collector's `verify` command passed 108/108. A heuristic scan found no recognizable credential patterns; it does not guarantee absence of all secrets.

**Semantic adjudication is pending.** Completion and receipt verification do not establish case correctness. No per-skill accuracy, recall or false-positive rates have been calculated. The corpus consists of same-workflow development cases; the challenge cases share a repository family.

To verify, extract the archive to a fresh directory and run `node evals/research/skills-benchmark-v2/campaign-v3.mjs verify <extracted>/campaign-v3-live` using the matching source snapshot.
