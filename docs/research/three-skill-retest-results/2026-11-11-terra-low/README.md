# Three-skill guide retest results

All 132 planned answers were collected and individually adjudicated. The first run completed 91 answers and stopped on the ordinal 92 timeout. The recovery completed all 41 remaining logical turns, including the replacement for ordinal 92. There were 133 total submissions, including the preserved original failure. Known observed usage was 3,489,951 tokens, of which 1,094,192 came from the recovery. Usage of the failed attempt is unknown.

Both arms used ChatGPT login through Codex CLI 0.167.1 with CLI-selected `gpt-6.1-terra / low`. The recorded identity is the client selection. Freeze `316d8d05e7f236295f56c4cbd80683bea82fbd4e27fc7af96b38cb2f6292050d` specifies 22 cases with three repeats and two arms. A is the original guidance. B is the revised guidance from `5eb4e9b`. See the [freeze plan](../../three-skill-retest.md) and [recovery record](recovery.md). The longest recovery turn took 137,001 ms including cleanup.

## Comparison

Disposition is agreement with the case's expected assessment. Expected issues and task criteria use separate denominators. Unsupported and pending counts are claims, while complete-supported is an answer-level count. Every planned A/B pair has both answers. A pending pair contains an unresolved adjudication.

| Skill | Arm | Completed / failed / unrun | Disposition | Expected issues | Task criteria | Evidence | Unsupported claims | Pending claims | Complete supported | Artifact success |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| brooks-review | A | 21 / 0 / 0 | 21/21 | 9/9 | — | 49/60 | 2 | 4 | 11 | — |
| brooks-review | B | 21 / 0 / 0 | 21/21 | 9/9 | — | 59/60 | 0 | 1 | 19 | — |
| brooks-health | A | 24 / 0 / 0 | 21/24 | 6/6 | 9/12 | 62/72 | 6 | 6 | 15 | — |
| brooks-health | B | 24 / 0 / 0 | 20/24 | 6/6 | 8/12 | 63/72 | 5 | 4 | 14 | — |
| brooks-sweep | A | 21 / 0 / 0 | 21/21 | 9/9 | — | 63/63 | 0 | 0 | 21 | 21/21 |
| brooks-sweep | B | 21 / 0 / 0 | 21/21 | 9/9 | — | 63/63 | 0 | 0 | 21 | 21/21 |

| Skill | Improved | Regressed | Tied | Pending | Incomplete |
| --- | --- | --- | --- | --- | --- |
| brooks-review | 5 | 0 | 12 | 4 | 0 |
| brooks-health | 1 | 2 | 18 | 3 | 0 |
| brooks-sweep | 0 | 0 | 21 | 0 | 0 |

- **Review:** Revised guidance improved evidence from 49/60 to 59/60 and complete-supported responses from 11/21 to 19/21. Both arms found all 9 expected issues. One original answer overclaimed in an unresolved case, compared with zero revised answers. Neither arm had an error on the three protected or three out-of-scope controls. Five pairs improved, none regressed and four remain pending. This supports keeping the revision for these cases.
- **Health:** The result is mixed. The revised arm has one more evidence credit, one fewer unsupported claim and zero unresolved-case overclaims versus one. Required task criteria fell from 9/12 to 8/12 and complete-supported responses from 15/24 to 14/24. Headline conflicts increased from 3 to 5 answers. Matching rounded restatements in prose fell from 10 to zero, and recorded intermediate arithmetic errors fell from 3 to zero. These observations overlap by response. In the strict AS-21 case, only one original answer and zero revised answers met the whole-dashboard criterion. The three revised headlines were 78, 75 and 78, against the correct 80. The offline scoring helper passes its arithmetic and consistency regressions. This live protocol measures the tool-free workflow, so it supplies no evidence about model invocation of that helper.
- **Sweep:** Both arms passed all 21 bounded artifact checks, found all 9 expected issues and satisfied all 63 evidence checks. Every pair tied, including the protected and out-of-scope controls. These cases did not distinguish the guides.

## Evidence and verification

- [Annotations](annotations.json) record exact answer excerpts, reasons, and reviewer metadata for every completed response. The review used masked packets and same-workflow model judgment.
- [Machine summary](summary.json) contains case, repeat and cohort breakdowns, paired outcomes, control errors and exact response IDs.
- [Health score observations](health-score-observations.json) retain per-response score inconsistencies and their excerpts.
- [Original archive](original-run.tar.gz), [recovery archive](recovered-run.tar.gz) and [checksums](SHA256SUMS) preserve raw events, completed answers, receipts and separate execution histories. The archives passed a heuristic scan for recognizable credential patterns.
- [Recovery validation](recovery-validation.md) records the full offline repository and recovery checks. The archive and summary were verified again for this report.

The development cases were available to the authors and reviewers. Repeats measure variation within the same case, and the outcome is descriptive for this model and task set. The sweep treatment includes revised review guidance.

Use the recovery source at `8d38b88` to verify the archives offline. Extract the original archive and place its `run` directory at the absolute parent path sealed in the recovery registration. Extract the recovery archive to a fresh directory. Run `node evals/research/skill-revision/recovery.mjs verify <recovery-dir>`, then `node evals/research/skill-revision/recovery.mjs score <recovery-dir> <annotations.json> <new-summary.json>`. A different recovery directory changes the provenance path in the output. The original 91 answers retain their original IDs and the replacement for ordinal 92 uses its planned response ID with separate attempt provenance.
