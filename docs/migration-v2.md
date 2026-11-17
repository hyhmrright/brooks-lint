# Migrating from 1.9.1 to 2.0.0

This guide compares the 2.0.0 contracts with v1.9.1.
See [npm](https://www.npmjs.com/package/brooks-lint) and [GitHub Releases](https://github.com/hyhmrright/brooks-lint/releases) for release availability.

## Why a major version is defensible

[Semantic Versioning](https://semver.org/) ties major versions to incompatible
public API changes, which can be documented behavior. For this Agent Skills
product the documented workflow, configuration and report contracts are public
interfaces as well as the JavaScript exports. The changes below alter observable
expectations. This is a stronger rationale for 2.0.0 than file count, development
time or benchmark volume. It is not a claim of twice the model capability.

| Contract | v1.9.1 | Merged main | Upgrade action |
| --- | --- | --- | --- |
| Action score output | Missing score fell back to numeric 0 | Empty diff yields empty `score` plus `skipped=true`; comment, SARIF, thresholds and gates are skipped | Branch on `skipped` before parsing score; absence is neither a clean verdict nor zero |
| Action mode input | Described all six modes | Only `review` admitted; unsupported modes fail before a request | Move architecture/debt/test/health/sweep workflows to interactive agents; do not expect API tools or edits |
| Report admission | Previously permissive parsing paths | Invalid, truncated or ambiguous reports fail closed | Handle errors explicitly; do not map failed reports to passing scores |
| Health evidence status | A dimension without findings receives 100; only PR without a diff is omitted | A required dimension with decisive missing evidence is unassessed; numeric composite is withheld. PR without a diff alone is skipped | Consumers must accept an absent numeric composite, preserve the missing-evidence reason and not convert absence to zero or 100 |
| Health delivery | Markdown dashboard and manually derived weighted score | One capped ledger; bundled Node finalization/receipt/delivery tools when execution is available; exact supplied delivery bytes are checked | Preserve ledger and report correspondence, avoid retyping finalized text, declare non-executed fallback limits. A receipt does not prove the diagnosis |
| Sweep max_iterations | Non-critical re-scan rounds capped; Critical findings exempt from that cap | All repair rounds count, including initial and Critical-only rounds | Revisit configured budgets; expect unresolved findings at the stop boundary instead of assuming Critical work continues outside the cap |
| Sweep authorization | A separate fixed pre-flight consent interaction | Existing explicit authorization is reused; missing edit authority still requires approval | Automation must not depend on a mandatory repeated Y/n prompt; state scope and edit authority clearly |
| Sweep report | Fix log and Health Score Delta/After layout | Final health dashboard contract plus supported stop reason and residuals | Custom consumers of the old layout need updating. The shipped parser preserves legacy After-score recognition; that does not make every custom consumer compatible |

Evidence: compare the versioned health and sweep guides with their main versions;
see [health](../skills/brooks-health/health-guide.md),
[sweep](../skills/brooks-sweep/sweep-guide.md),
[ledger](../skills/brooks-health/score-ledger.md), and
[runner contracts](runner-contracts.md). Unknown input facts are not automatic
proof of a defect; complete local evidence can support a bounded assessment.

## Preserved interfaces and limits

The six skill names, twelve-book framework and R1–R6/T1–T6 vocabulary remain.
`lib/`, `bin/`, `scripts/install.sh` and `scripts/npm-platforms.mjs` are unchanged
between v1.9.1 and audited main. Existing installer targets and package exports
are therefore not a reason to require a major bump. The historical API/Action
path remains distinct from interactive Codex; report parsing/validation and
trusted base-policy behavior were tightened and malformed reports now fail
closed. Do not treat the latter as guaranteed compatibility for hand-written
report consumers.

Keep `_shared` beside all six skills and install health's nested resources.
Node is needed for the shipped deterministic tools, but tool availability and
verification claims remain explicit; this is not a promise that all hosts execute
them. No migration requires a live benchmark or model account.

Before publication, synchronize every public surface with the verified state
and run exact-release-commit gates. Version selection is not publication approval.
