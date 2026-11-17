# Six-skill repository cases

These 12 synthetic repository slices were authored for the post-2.0.0 study at
main commit `5e2d4b9`. Application shapes are realistic, but neither the
repositories nor the operational history came from external projects. Each skill
has two distinct task families, with a supported diagnosis or action and a nearby
claim or behavior to protect. They are development cases, not independent holdouts.

| Skill | Cases | Useful outcome |
| --- | --- | --- |
| Review | Invoice boundary, webhook acknowledgement | Attribute a concrete regression to a diff while preserving improvements and inherited context |
| Audit | Cart storage, job observers | Distinguish a closed source path from an unbounded dynamic invocation, with a practical seam |
| Test | Quota, export CI gate | Choose a production mutant or intentional failure that proves the nominated property |
| Debt | Dispatch adapters, rate ownership | Prioritize evidenced propagation costs and preserve independent policy boundaries |
| Health | Complete catalog, partial billing export | Complete bounded dimensions, explain each deduction and deliver a ledger-bound artifact |
| Sweep | Access grant revocation, primary CSV export | Repair a public contract within a path allowlist and preserve adjacent behavior and work |

For each case, only `tree/`, the review-only `base/`, and the task text are model
inputs. `index.json` also holds the grading key, which must not be passed to the
model. This file, `oracle.mjs`, `reference/` and `expectations.json` are
evaluation-only. No repository file includes the grading expectations. The
health scorer schema is common environment input.

Run an oracle as `node CASE/oracle.mjs WORKSPACE final`. The only stdout is an
object with `checks` mapping tested criterion IDs to booleans. For the supplied
review bases, use `baseline` instead of `final`. `expectations.json` declares
what the unedited current workspace (`initial`), base (`base`), and the two
sweep tree/reference overlays (`patched`) should produce. The reference edit
is a discriminating positive example and is not a required patch shape.

An initial true result establishes a fact for adjudication, not a pass for the
model. The review, audit, test and debt probes confirm selected task evidence.
They cannot grade what the response inferred, omitted or invented. The Health
probe binds the bytes of report/ledger to the saved receipt and checks statuses.
The runner must independently verify the report with the actual scorer, and an
adjudicator must still review selection, prose coverage and the meaning of each
status. Sweep probes execute the public repair behavior and preservation checks
after the turn. These results are not evidence that the model ran a check
during the turn. The model's own execution claims remain part of adjudication.
