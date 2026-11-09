# Docker isolation QA round 1 — FAIL

All four sequential automated gates exited zero: repository validation, full npm tests, structural evals, and Docker archive validation. Full tests: 222 helper, 6 provider and 608 main tests, including 28 new Docker tests. Exact streams/timestamps/hashes are in results.json. Cross-document comparison confirms version 1.9.1 across four manifests, six README badges, website JSON-LD and CHANGELOG; the derived twelve-book count, 64 scenarios and six negative trigger clauses agree. Final source snapshots match current files. All three observation inventories verify; no task-labelled containers remain.

## Blocking finding — route to eval-curator

**Symptom:** `docker-isolation-drill.mjs:23–39` accepts six copies of the `cli-answer` case and reports six cases / 64 commands verified, despite omitting the readonly failure, shared-port negative, detached cleanup, PID1 exit and launcher-death cases from validation.

**Source:** The validator checks only cases.length, then iterates whatever cases the run document provides. It does not require the exact unique mode sequence, a disjoint complete command partition, unique container identities or agreement with separately saved case-*.json records. The global commands count is returned without establishing that those commands were actually validated. The reproduction changes only run.json and its inventory hash; original evidence and per-case files stay unchanged.

**Consequence:** Internally contradictory records pass the advertised semantic evidence gate, so a passing archive check does not establish coverage of the six named boundaries. This is not a cryptographic-authenticity claim or an accusation of altered original evidence; it is a demonstrated missing cross-artifact consistency check.

**Remedy:** Enforce the exact six unique modes/order and unique owned container IDs; require each run case to equal its standalone case file; require the ordered case-command lists to partition the complete unique command inventory; bind each command's case ID and image/policy evidence. Add rehashed duplication/omission/mismatch tests. Preserve this QA failure and original observations; validator-only fixes do not require rerunning Docker if unchanged raw evidence satisfies the corrected checks. Re-run the complete gate in QA2.

`reproduce.mjs` and its exact stdout/stderr retain the successful bypass against QA1 sources. Source SHA-256 values are in cross-checks.json; future execution after remediation should fail rather than reproduce the old success.

## Scope review

The recorded native answer, bwrap failure, outer-only shared broker access and launcher-death survival are honestly distinguished. Docker/network-none does not establish client/tool segregation. Container lifecycle cleanup is separate from host supervisor crash cleanup, and a durable lease manager remains a documented design. No production identity, OAuth, billing, independent human review or live-study equivalence is claimed. Provisioning uses a pinned Node base and Codex 0.167.0; current probe bytes match final snapshots. The reviewer ran only offline checks and a read-only task-container status query; no native CLI/model or new container launch.
