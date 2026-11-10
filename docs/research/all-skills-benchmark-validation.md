# All-skills campaign offline validation

Date: 2026-11-10. Final status: **PASS for offline preparation**. Real model calls:
**zero**. Model and reasoning effort remain unset. No release or production skill
change is part of this work.

## Delivered scope

- Six shipped skills: 31 cases (five each, with one additional health integration
  case), two arms and three repeats, for 186 planned primary responses.
- Repository-local maintenance harness: four policy cases, two arms and three
  repeats, for 24 separately reported responses.
- Existing runtime pack study: twelve cases, three arms and three repeats, for
  108 responses; its freeze and historical artifacts are unchanged.
- Combined [campaign](benchmark-campaign.md): **318** primary responses. Optional
  smoke plans are not automatically added. No judge-model calls are included.

The [new benchmark](all-skills-benchmark.md) supplies scoped comparators, neutral
task rules for both arms, executable witnesses, separate diagnostic/task-criteria
metrics, restricted sweep artifact checks and raw-record reconstruction. It does
not certify native skill activation, unrestricted code repair, complete sweep
workflow behavior or independently validated skill efficacy.

## Two QA rounds

[Round 1](runtime-preparations/2026-11-10-all-skills/qa-round1.md) failed despite
passing automated gates. Independent agent QA identified three concrete problems:

1. The artifact interpreter accepted update operators and return-newline source
   with semantics different from JavaScript; a valid exponent form was rejected.
2. AS-24 withheld a scoring convention from the no-skill arm.
3. AS-12's exact debt priority was narrower than the supplied change history
   justified.

All three were repaired before model execution. The grammar now rejects update
operators, return-ASI forms and invalid leading-zero literals, while admitting
declared decimal/exponent and spaced-unary forms. AS-24 supplies the same neutral
score policy to both arms. AS-12 includes an explicit ten-change history that
supports the specified priority.

[Round 2](runtime-preparations/2026-11-10-all-skills/qa-round2.md) independently
reproduced the original failures and confirmed their correction, including the
public report CLI's raw-record corruption rejection. Both rounds' command logs
are preserved in [the QA archive](runtime-preparations/2026-11-10-all-skills/qa-logs.tar.gz).
Independent agent review here means a separate reviewer task, not independent
human authorship, blind gold labels or external validation.

## Final verification

| Check | Result |
| --- | --- |
| `npm run validate` | PASS |
| `npm test` | PASS, including 18 all-skill tests and 2 campaign tests |
| `npm run evals` | PASS, 64 structural cases |
| `npm run benchmark` | PASS; parser fidelity, not model accuracy |
| `npm run evals:codex:validate` | PASS, seven offline fixtures |
| New full/smoke freezes and parent campaign | PASS |
| Valid public CLI report and raw-record corruption rejection | PASS |
| Artifact grammar, baseline fairness and debt-history regressions | PASS |
| Archive inspection and version/book/eval/description consistency | PASS |

The [offline evidence](../../evals/research/all-skills/offline-evidence.json) records
fixture witnesses and simulated arithmetic controls. The
[raw fixture archive](../../evals/research/all-skills/offline-fixture.tar.gz)
contains fourteen fake CLI turns and 1,400 synthetic tokens. It is not a real
Codex/model/provider test or an account usage estimate. Unsupported or malformed
sweep artifacts count as task failures, not successful repairs or silently
excluded infrastructure failures. Generated model code is never executed by the
restricted artifact checker.

## Frozen identities and next step

| Artifact | SHA-256 |
| --- | --- |
| All-skill full, 210 calls | `3405e0e6c549f59e9ae09ca54e7a2539549e82224307506b7f0be909d467a346` |
| All-skill smoke, 14 calls | `299e5b2fa17284e198ab1c70297ef67573e8c2218f051777b4c2a5da3114e83b` |
| Unchanged runtime full, 108 calls | `16fdce3cd1696da966115924f285a87547064af20a1b935cccb23c2ca771ad29` |
| Combined campaign, 318 calls | `e3df44f4b89af069dd9ae02fa03c024477051f4a7f78a667c6f9ab1016eb68cd` |

After the maintainer selects the model and reasoning effort, verify actual CLI
and login compatibility, bind both study registrations and execute the combined
plan in its recorded order. Stop admission on any failure and preserve attempts;
no automatic retry or silent recovery is authorized. Proposed observed-token
admission limits sum to nine million (six million plus three million), not a hard
global cap or predicted spend. Each study can overshoot its stop by one turn.
All-skill and runtime results must remain separately interpretable; report each
skill's limitations, failures and costs alongside its semantic outcomes.
