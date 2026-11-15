# Capability efficacy v2: completed second recovery

The frozen 72-answer developmental comparison is complete. This continuation
collected slots 39–72, preserving the original 38 successful answers, their
annotations, and the earlier failed attempt. The former failure remains in
`../../../capability-efficacy-v2-recovery/results/2026-11-15-stopped/`.
Its cause was not established; successful continuation does not prove that the
underlying routing fault is fixed.

## Execution and provenance

- Requested and CLI-selected model: `gpt-6.1-terra`, reasoning `low`;
  Codex CLI 0.169.0, ChatGPT login. `model-info.json` lists each attempt.
  This is CLI selection evidence, not independently attested provider identity.
- Recovery: 34 attempts, 34 completed, no failures or retries detected;
  2,330,166 observed tokens, 1,141,213 ms collector time. The 120-second
  per-attempt and remaining campaign budgets were enforced by the frozen runner.
- Across both collection periods: 73 attempts including the retained failure,
  72 answers, 4,755,608 observed tokens, 2,440,520 ms collector time.
  The earlier failed attempt's provider usage and billing remain unknown;
  observed tokens are not a billing total.
- Frozen recovery SHA-256: `53fd92a406740bafde0315a78c7544644080a235c832719b63671768f002b3e3`.
  `raw.tar.gz` contains the complete new collector evidence; the SHA-256 and
  235 individual payload hashes are in `raw-manifest.json`. Historical results
  are separately retained and bound by the frozen plan.

## Results against the generic checklist

B is the generic checklist; C is the static full skill instruction bundle.
Behavioral pass requires all applicable primary axes to pass. Counts are answers,
not independent projects. Frozen assessment is in `assessment.json` and the new
answer-level judgments and quoted evidence are in `annotations-new.json`; prior
annotations remain in the previous archive.

| Mode | B behavioral pass | C behavioral pass | Expected issues found B / C | Protected-case false-claim answers B / C |
| --- | ---: | ---: | ---: | ---: |
| health | 15/18 | 10/18 | 9/9 / 9/9 | 0 / 0 |
| sweep | 15/18 | 18/18 | 6/6 / 6/6 | 0 / 0 |
| Overall | 30/36 | 28/36 | 15/15 / 15/15 | 0 / 0 |

All expected issues were found under this rubric; neither arm had a protected-case
false claim. B had three false-claim answers on insufficient-information cases;
that is included in the overall assessment and is distinct from the protected-case
metric. Both arms passed all 6 eligible post-submission repair probes. Frozen
protocol-label pass counts were B 30/36 and C 34/36; labels are separate from
semantic behavioral judgment. Stop-protocol pass counts were B 33/36 and C 34/36.

Health C's eight behavioral failures were evidence-status failures: it withheld
bounded assessments despite sufficient local evidence. Health B's three failures
were repeated deductions for one underlying ownership cause. Sweep B failed three
priority-routing insufficient-information responses; C passed those paired cases.
Those results suggest specific repair targets, not proof of broad superiority.
Family mean paired gain was -0.0556; the prespecified practical-lift criterion was
not met. The four family deltas were -3/9, -2/9, 0/9 and +3/9 respectively.

## Interpretation and limits

The result does not show an overall practical improvement for the C bundle on the
frozen criterion. Sweep shows a benefit on one authored family; health shows a
loss on the two health families. Both arms found all expected issues, so the main
observed differences concern bounded evidence, duplicate attribution, and decisions
under missing policy information rather than issue recall.

The four families are development-authored, not independent holdouts; repetitions
are clustered within cases, not 72 independent tasks. Semantic judgments were
made by the project workflow and checked against quoted evidence, not established
as independent human ground truth. Finite repair probes do not demonstrate general
autonomous repair. Static instruction bundles do not test native skill discovery,
other skills, other models, or general performance on unseen repositories. The
archive verifier depends on local historical smoke prerequisites; the archive
alone is not a standalone portable verifier.
